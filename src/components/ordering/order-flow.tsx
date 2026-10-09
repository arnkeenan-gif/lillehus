"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { cn } from "@/lib/cn";
import { addToCart, removeManyFromCart, setCartPickup, useCartPickup, getCartState, type CartLine } from "@/lib/cart";
import { expiredLines, pickupTime, resolvePickup, type ClientLocation, type ResolvedPickup } from "@/lib/cart-pickup";
import type { DeadlineRule } from "@/lib/cms/ordering-types";
import { copenhagenDate, formatDayDate, formatShortDate } from "@/lib/ordering/dates";
import { deadlineShortText, deadlineText, isBeforeDeadline, shownDeadline } from "@/lib/ordering/deadline";
import { PickupDialog } from "./pickup-dialog";
import type { PickupDraft } from "./pickup-chooser";
import { currentTime, useNow } from "./use-now";

/*
  The bagværk page's order flow. The provider holds what the page's client
  pieces share: the pickup locations, the deadline rules, the clock and the
  pickup dialog. The pickup itself lives in the cart (localStorage), so it
  is the same on every page and survives a reload.

  "Bestil bagværk" opens the dialog (step one: place, step two: date). So
  does "Læg i kurv" before a pickup is chosen; the product is added once a
  date is chosen. A link to #afhentning (the cart drawer's "Skift") opens it
  too. With a pickup chosen, a compact bar under the header says where and
  when, with "Skift".
*/

export interface PendingAdd {
  line: Omit<CartLine, "qty">;
  qty: number;
}

interface OrderFlowValue {
  locations: ClientLocation[];
  rules: DeadlineRule[];
  general: DeadlineRule;
  now: number;
  /** The chosen pickup when it is still valid; null when nothing (valid) is chosen. */
  pickup: ResolvedPickup | null;
  /** A pickup is stored in the cart but its place or date cannot be used any more. */
  pickupStale: boolean;
  openChooser: (pending?: PendingAdd) => void;
  /** The id of the product the dialog just added, for a moment. */
  recentlyAdded: string | null;
}

const OrderFlowContext = createContext<OrderFlowValue | null>(null);

export function useOrderFlow(): OrderFlowValue {
  const value = useContext(OrderFlowContext);
  if (!value) throw new Error("useOrderFlow skal bruges inden i OrderFlowProvider.");
  return value;
}

type ProviderProps = {
  locations: ClientLocation[];
  /** The rules of every product that can be ordered (with repeats): a date can be chosen while one is open. */
  rules: DeadlineRule[];
  general: DeadlineRule;
  renderedAt: number;
  children: React.ReactNode;
};

export const PICKUP_HASH = "#afhentning";
const OPEN_PICKUP_EVENT = "dlh:open-pickup";

/** Asks the bagværk page's order flow to open the pickup dialog (used by the cart drawer's "Skift"). */
export function requestPickupChooser() {
  window.dispatchEvent(new CustomEvent(OPEN_PICKUP_EVENT));
}

export function OrderFlowProvider({ locations, rules, general, renderedAt, children }: ProviderProps) {
  const now = useNow(renderedAt);
  const stored = useCartPickup();
  const today = copenhagenDate(now);
  const pickup = useMemo(() => resolvePickup(stored, locations, today), [stored, locations, today]);
  const [open, setOpen] = useState(false);
  const [session, setSession] = useState(0);
  const [pending, setPending] = useState<PendingAdd | null>(null);
  const [recentlyAdded, setRecentlyAdded] = useState<string | null>(null);
  const addedTimer = useRef<number | undefined>(undefined);

  const openChooser = useCallback((next?: PendingAdd) => {
    setPending(next ?? null);
    setSession((n) => n + 1);
    setOpen(true);
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    setPending(null);
  }, []);

  // "Skift" in the cart drawer: an event on this page, a link to /bagvaerk#afhentning from the others.
  useEffect(() => {
    const check = () => {
      if (window.location.hash !== PICKUP_HASH) return;
      window.history.replaceState(window.history.state, "", window.location.pathname + window.location.search);
      openChooser();
    };
    const onRequest = () => openChooser();
    check();
    window.addEventListener("hashchange", check);
    window.addEventListener(OPEN_PICKUP_EVENT, onRequest);
    return () => {
      window.removeEventListener("hashchange", check);
      window.removeEventListener(OPEN_PICKUP_EVENT, onRequest);
    };
  }, [openChooser]);

  useEffect(() => () => window.clearTimeout(addedTimer.current), []);

  const confirm = useCallback(
    (draft: PickupDraft) => {
      if (!draft.date) return;
      const date = draft.date;
      const time = currentTime();
      const { items } = getCartState();
      const gone = expiredLines(items, date, time).map((l) => l.key);
      if (gone.length > 0) removeManyFromCart(gone);
      setCartPickup({ locationId: draft.locationId, date });
      if (pending && isBeforeDeadline(date, pending.line.rule, time)) {
        addToCart(pending.line, pending.qty);
        setRecentlyAdded(pending.line.productId);
        window.clearTimeout(addedTimer.current);
        addedTimer.current = window.setTimeout(() => setRecentlyAdded(null), 1800);
      }
      close();
    },
    [pending, close],
  );

  const value = useMemo<OrderFlowValue>(
    () => ({ locations, rules, general, now, pickup, pickupStale: Boolean(stored) && !pickup, openChooser, recentlyAdded }),
    [locations, rules, general, now, pickup, stored, openChooser, recentlyAdded],
  );

  return (
    <OrderFlowContext.Provider value={value}>
      {children}
      <PickupDialog
        key={session}
        open={open}
        onClose={close}
        onConfirm={confirm}
        locations={locations}
        rules={rules}
        general={general}
        now={now}
        initial={initialDraft(pickup, stored, locations)}
        pending={pending}
      />
    </OrderFlowContext.Provider>
  );
}

/** What the dialog starts with: the current pickup, else the only place (preselected, still visible). */
function initialDraft(pickup: ResolvedPickup | null, stored: { locationId: string } | null, locations: ClientLocation[]): PickupDraft | null {
  if (pickup) return { locationId: pickup.location.id, date: pickup.date.date };
  if (stored && locations.some((l) => l.id === stored.locationId)) return { locationId: stored.locationId, date: null };
  if (locations.length === 1) return { locationId: locations[0].id, date: null };
  return null;
}

/** The big button under the page title. */
export function StartOrderButton() {
  const { openChooser } = useOrderFlow();
  return (
    <Button type="button" size="lg" onClick={() => openChooser()} aria-haspopup="dialog" className="w-full sm:w-auto sm:min-w-56">
      Bestil bagværk
    </Button>
  );
}

/** The compact summary under the header once a pickup is chosen, with "Skift". */
export function PickupBar({ className }: { className?: string }) {
  const { pickup, pickupStale, rules, general, now, openChooser } = useOrderFlow();
  if (!pickup && !pickupStale) return null;

  let line: React.ReactNode;
  let sub: React.ReactNode = null;
  if (pickup) {
    const date = pickup.date.date;
    const deadline = shownDeadline(date, rules, general, now);
    const time = pickupTime(pickup.date);
    line = (
      <>
        <span className="font-semibold">{pickup.location.name}</span>, <span className="sm:hidden">{formatShortDate(date)}</span>
        <span className="hidden sm:inline">
          {formatDayDate(date)}
          {time ? `, ${time}` : ""}
        </span>
      </>
    );
    sub = deadline ? (
      <>
        Bestil senest <span className="sm:hidden">{deadlineShortText(date, deadline.rule)}</span>
        <span className="hidden sm:inline">{deadlineText(date, deadline.rule)}</span>.
      </>
    ) : (
      `Fristen for ${formatDayDate(date)} er gået. Vælg en anden dato.`
    );
  } else {
    line = <span className="font-semibold">Den valgte dato kan ikke bruges længere.</span>;
    sub = "Vælg en ny dato for afhentning.";
  }

  return (
    <div className={cn("no-print sticky top-16 z-30 border-y border-line bg-paper lg:top-[72px]", className)}>
      <Container className="flex items-center justify-between gap-4 py-2.5">
        <div className="min-w-0 text-[0.95rem] leading-snug text-ink">
          <p>{line}</p>
          {sub ? <p className="text-sm text-muted">{sub}</p> : null}
        </div>
        <Button type="button" variant="secondary" onClick={() => openChooser()} aria-haspopup="dialog" className="shrink-0">
          Skift
        </Button>
      </Container>
    </div>
  );
}
