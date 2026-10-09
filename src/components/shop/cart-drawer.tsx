"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { X } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { OrderLines, OrderTotal, PickupFacts } from "@/components/shop/order-summary";
import { requestPickupChooser } from "@/components/ordering/order-flow";
import { useModal } from "@/components/ordering/use-modal";
import { useNow } from "@/components/ordering/use-now";
import { OPEN_CART_EVENT, useCart, useCartPickup } from "@/lib/cart";
import { expiredLines, resolvePickup, type ClientLocation } from "@/lib/cart-pickup";
import { copenhagenDate } from "@/lib/ordering/dates";

/*
  Slide-in "Din bestilling". Opens on the "dlh:open-cart" event from the
  header button, 240ms from the right on ease-out-quart; reduced motion
  swaps the slide for a short fade. Escape and the backdrop close it, focus
  moves into the panel and back to the trigger afterwards, and Tab stays
  inside while it is open. Shows the pickup (place, date, time), the lines
  with their options and the total.
*/

const EASE_OUT_QUART = [0.25, 1, 0.5, 1] as const;

type Props = {
  /** Active pickup locations with their open dates, for the names and times. */
  locations: ClientLocation[];
  renderedAt: number;
};

export function CartDrawer({ locations, renderedAt }: Props) {
  const [open, setOpen] = useState(false);
  const items = useCart();
  const stored = useCartPickup();
  const now = useNow(renderedAt);
  const reduceMotion = useReducedMotion();
  const pathname = usePathname();
  const panelRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setOpen(false), []);
  useModal(open, close, panelRef);

  useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener(OPEN_CART_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_CART_EVENT, onOpen);
  }, []);

  const pickup = resolvePickup(stored, locations, copenhagenDate(now));
  const expired = new Set(pickup ? expiredLines(items, pickup.date.date, now).map((l) => l.key) : []);
  const onShopPage = pathname === "/bagvaerk";

  // On the bagværk page "Skift" opens the pickup dialog right there; elsewhere the link goes to it.
  function changePickup(event: React.MouseEvent<HTMLAnchorElement>) {
    close();
    if (onShopPage) {
      event.preventDefault();
      requestPickupChooser();
    }
  }

  const panelMotion = reduceMotion
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.15, ease: "easeOut" as const },
      }
    : {
        initial: { transform: "translateX(100%)" },
        animate: { transform: "translateX(0%)" },
        exit: { transform: "translateX(100%)" },
        transition: { duration: 0.24, ease: EASE_OUT_QUART },
      };

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          key="kurv-baggrund"
          aria-hidden="true"
          onClick={close}
          className="fixed inset-0 z-50 bg-ink/40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        />
      ) : null}
      {open ? (
        <motion.div
          key="kurv-panel"
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="kurv-titel"
          tabIndex={-1}
          className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-paper shadow-drawer outline-none"
          {...panelMotion}
        >
          <div className="flex h-16 shrink-0 items-center justify-between border-b border-line pl-5 pr-3 sm:h-[72px]">
            <h2 id="kurv-titel" className="text-xl font-semibold text-ink">
              Din bestilling
            </h2>
            <button
              type="button"
              onClick={close}
              className="flex size-11 items-center justify-center rounded-md text-ink transition-colors duration-150 ease-out-quart hover:bg-paper-2"
            >
              <X size={24} aria-hidden="true" />
              <span className="sr-only">Luk kurven</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-5">
            {items.length === 0 ? (
              <div className="py-8">
                <p className="text-lead text-ink">Din kurv er tom.</p>
                <p className="mt-2 text-ink-2">Læg noget i kurven, så står det her.</p>
              </div>
            ) : (
              <>
                <PickupFacts pickup={pickup} stale={Boolean(stored) && !pickup} onNavigate={changePickup} className="border-b border-line py-5" />
                <div className="py-6">
                  <OrderLines items={items} expired={expired} pickupDate={pickup?.date.date} editable />
                </div>
              </>
            )}
          </div>

          <div className="shrink-0 border-t border-line px-5 py-5">
            {items.length > 0 ? (
              <>
                <OrderTotal items={items} large />
                <p className="mt-2 text-sm text-muted">Du betaler med kort eller MobilePay.</p>
              </>
            ) : null}
            <div className="mt-5 flex flex-col gap-2">
              {items.length > 0 ? (
                <Button href="/bagvaerk/kasse" size="lg" onClick={close} className="w-full">
                  Gå til betaling
                </Button>
              ) : null}
              {onShopPage ? (
                <Button type="button" variant="secondary" size="lg" onClick={close} className="w-full">
                  Tilbage til bagværket
                </Button>
              ) : (
                <Button href="/bagvaerk" variant="secondary" size="lg" onClick={close} className="w-full">
                  Tilbage til bagværket
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
