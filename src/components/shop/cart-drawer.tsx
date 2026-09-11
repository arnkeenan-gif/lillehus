"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Trash, X } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { QuantityStepper } from "@/components/shop/quantity-stepper";
import { OPEN_CART_EVENT, cartSubtotal, removeFromCart, setCartQty, useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/format";

/*
  Slide-in cart. Opens on the "dlh:open-cart" event from the header button,
  240ms from the right on ease-out-quart; reduced motion swaps the slide for a
  short fade. Escape and the backdrop close it, focus moves into the panel and
  back to the trigger afterwards, and Tab stays inside while it is open.
*/

const EASE_OUT_QUART = [0.25, 1, 0.5, 1] as const;
const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function trapTab(e: KeyboardEvent, root: HTMLElement | null) {
  if (!root) return;
  const focusable = root.querySelectorAll<HTMLElement>(FOCUSABLE);
  if (focusable.length === 0) {
    e.preventDefault();
    return;
  }
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  const active = document.activeElement;
  if (e.shiftKey && (active === first || active === root)) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && active === last) {
    e.preventDefault();
    first.focus();
  }
}

export function CartDrawer() {
  const [open, setOpen] = useState(false);
  const items = useCart();
  const reduceMotion = useReducedMotion();
  const pathname = usePathname();
  const panelRef = useRef<HTMLDivElement>(null);
  const returnFocusTo = useRef<HTMLElement | null>(null);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    const onOpen = () => {
      returnFocusTo.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      setOpen(true);
    };
    window.addEventListener(OPEN_CART_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_CART_EVENT, onOpen);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
      } else if (e.key === "Tab") {
        trapTab(e, panelRef.current);
      }
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      returnFocusTo.current?.focus();
    };
  }, [open, close]);

  const subtotal = cartSubtotal(items);
  const inShopRoot = pathname === "/bageri";

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
          className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-paper shadow-drawer outline-none sm:rounded-l-lg"
          {...panelMotion}
        >
          <div className="flex h-16 shrink-0 items-center justify-between border-b border-line px-5 sm:h-[72px]">
            <h2 id="kurv-titel" className="text-lg font-semibold text-ink">
              Kurv
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
                <p className="text-ink">Din kurv er tom.</p>
                <p className="mt-1 text-sm text-muted">Læg noget i kurven, så står det her.</p>
              </div>
            ) : (
              <ul className="divide-y divide-line">
                {items.map((item) => (
                  <li key={item.productId} className="flex gap-4 py-4">
                    <div className="relative size-16 shrink-0 overflow-hidden rounded-md bg-paper-2">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt=""
                          fill
                          sizes="64px"
                          className="object-cover"
                          unoptimized={item.image.startsWith("http")}
                        />
                      ) : null}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-3">
                        <p className="font-medium leading-snug text-ink">{item.name}</p>
                        <p className="tnum shrink-0 font-medium text-ink">{formatPrice(item.priceOere * item.qty)}</p>
                      </div>
                      <p className="tnum mt-0.5 text-sm text-muted">{formatPrice(item.priceOere)} pr. stk.</p>
                      <div className="mt-2 flex items-center justify-between gap-3">
                        <QuantityStepper
                          value={item.qty}
                          onChange={(q) => setCartQty(item.productId, q)}
                          label={item.name}
                        />
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.productId)}
                          className="flex size-11 items-center justify-center rounded-md text-muted transition-colors duration-150 ease-out-quart hover:bg-paper-2 hover:text-ink"
                        >
                          <Trash size={20} aria-hidden="true" />
                          <span className="sr-only">Fjern {item.name}</span>
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="shrink-0 border-t border-line px-5 py-4">
            <div className="flex items-baseline justify-between">
              <span className="text-ink-2">I alt</span>
              <span className="tnum text-lg font-semibold text-ink">{formatPrice(subtotal)}</span>
            </div>
            <p className="mt-1 text-sm text-muted">Afhentning i Hønsehuset. Betal med kort eller MobilePay.</p>
            <div className="mt-4 flex flex-col gap-2">
              {items.length > 0 ? (
                <Button href="/bageri/kasse" onClick={close} className="w-full">
                  Gå til betaling
                </Button>
              ) : null}
              {inShopRoot ? (
                <Button type="button" variant="secondary" onClick={close} className="w-full">
                  Tilbage til bageriet
                </Button>
              ) : (
                <Button href="/bageri" variant="secondary" onClick={close} className="w-full">
                  Tilbage til bageriet
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
