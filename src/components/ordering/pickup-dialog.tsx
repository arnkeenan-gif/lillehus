"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { X } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { expiredLines, type ClientLocation } from "@/lib/cart-pickup";
import type { DeadlineRule } from "@/lib/cms/ordering-types";
import { formatDayDate } from "@/lib/ordering/dates";
import { isBeforeDeadline, lastDeadline } from "@/lib/ordering/deadline";
import type { PendingAdd } from "./order-flow";
import { PickupChooser, type PickupDraft } from "./pickup-chooser";
import { useModal } from "./use-modal";

/*
  The pop-up for step one and two: a sheet from the bottom on phones, a
  panel in the middle from sm. Choosing a place shows that place's dates;
  "Fortsæt" saves the pickup in the cart. When the cart already holds
  something that cannot be made for the new date, the dialog says so before
  the customer confirms, and those lines leave the cart on "Fortsæt".
*/

const EASE_OUT_QUART = [0.25, 1, 0.5, 1] as const;

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: (draft: PickupDraft) => void;
  locations: ClientLocation[];
  rules: DeadlineRule[];
  general: DeadlineRule;
  now: number;
  initial: PickupDraft | null;
  pending: PendingAdd | null;
};

function joinNames(names: string[]): string {
  if (names.length <= 1) return names.join("");
  return `${names.slice(0, -1).join(", ")} og ${names[names.length - 1]}`;
}

export function PickupDialog({ open, onClose, onConfirm, locations, rules, general, now, initial, pending }: Props) {
  const [draft, setDraft] = useState<PickupDraft | null>(initial);
  const [error, setError] = useState<string | undefined>(undefined);
  const panelRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const items = useCart();
  useModal(open, onClose, panelRef);

  const date = draft?.date ?? null;
  const dateIsOpen = date ? (lastDeadline(date, rules)?.getTime() ?? 0) > now : false;
  const leaving = date ? expiredLines(items, date, now) : [];
  const pendingTooLate = Boolean(pending && date && !isBeforeDeadline(date, pending.line.rule, now));

  function submit() {
    if (!draft || !draft.date || !dateIsOpen) {
      setError(draft ? "Vælg en dato." : "Vælg et afhentningssted og en dato.");
      return;
    }
    onConfirm(draft);
  }

  const panelMotion = reduceMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0.15 } }
    : {
        initial: { opacity: 0, y: 40 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: 40 },
        transition: { duration: 0.24, ease: EASE_OUT_QUART },
      };

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          key="afhentning-baggrund"
          aria-hidden="true"
          onClick={onClose}
          className="fixed inset-0 z-50 bg-ink/40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        />
      ) : null}
      {open ? (
        <div key="afhentning-ramme" className="pointer-events-none fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="afhentning-titel"
            tabIndex={-1}
            className="pointer-events-auto flex max-h-[92dvh] w-full flex-col rounded-t-lg bg-paper shadow-soft outline-none sm:max-h-[86dvh] sm:max-w-xl sm:rounded-lg"
            {...panelMotion}
          >
            <div className="flex shrink-0 items-start justify-between gap-4 border-b border-line py-3 pl-5 pr-3 sm:pl-6">
              <h2 id="afhentning-titel" className="pt-2 text-xl font-semibold text-ink">
                Hvor og hvornår vil du hente?
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="flex size-11 shrink-0 items-center justify-center rounded-md text-ink transition-colors duration-150 ease-out-quart hover:bg-paper-2"
              >
                <X size={24} aria-hidden="true" />
                <span className="sr-only">Luk</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-6 sm:px-6">
              <PickupChooser
                locations={locations}
                rules={rules}
                general={general}
                now={now}
                value={draft}
                onChange={(next) => {
                  setDraft(next);
                  setError(undefined);
                }}
                idPrefix="afhentning"
                error={error}
              />

              {leaving.length > 0 && date ? (
                <p className="mt-6 rounded-md bg-rust-tint px-4 py-3 text-[0.95rem] text-ink">
                  {joinNames(leaving.map((l) => l.name))} i kurven kan ikke nås til {formatDayDate(date)}. Vælger du den dato,
                  bliver {leaving.length === 1 ? "den" : "de"} taget ud af kurven.
                </p>
              ) : null}
              {pending && pendingTooLate && date ? (
                <p className="mt-6 rounded-md bg-rust-tint px-4 py-3 text-[0.95rem] text-ink">
                  {pending.line.name} kan ikke nås til {formatDayDate(date)}. Vælg en senere dato, hvis du vil have den med.
                </p>
              ) : null}
            </div>

            {locations.length > 0 ? (
              <div className="shrink-0 border-t border-line px-5 py-4 sm:px-6">
                <Button type="button" size="lg" onClick={submit} className="w-full">
                  Fortsæt
                </Button>
              </div>
            ) : null}
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
