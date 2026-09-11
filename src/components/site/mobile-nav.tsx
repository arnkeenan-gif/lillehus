"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { List, X } from "@phosphor-icons/react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

type Item = { href: string; label: string };

/**
 * The hamburger below lg: a full-screen list that slides in over 240ms
 * (a plain fade under reduced motion). Closes on a link, Escape or the X.
 */
export function MobileNav({ items }: { items: Item[] }) {
  const [open, setOpen] = useState(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  const hidden = reduceMotion ? { opacity: 0 } : { opacity: 0, transform: "translateY(-16px)" };
  const shown = reduceMotion ? { opacity: 1 } : { opacity: 1, transform: "translateY(0px)" };

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-expanded={open}
        aria-controls="mobil-menu"
        className="flex size-11 items-center justify-center rounded-md text-ink transition-colors duration-150 ease-out-quart hover:bg-paper-2"
      >
        <List size={24} aria-hidden="true" />
        <span className="sr-only">Åbn menu</span>
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            id="mobil-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            initial={hidden}
            animate={shown}
            exit={hidden}
            transition={{ duration: 0.24, ease: [0.25, 1, 0.5, 1] }}
            className="fixed inset-0 z-50 flex flex-col bg-paper"
          >
            <div className="flex h-16 items-center justify-end px-5 sm:px-8">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex size-11 items-center justify-center rounded-md text-ink transition-colors duration-150 ease-out-quart hover:bg-paper-2"
              >
                <X size={24} aria-hidden="true" />
                <span className="sr-only">Luk menu</span>
              </button>
            </div>
            <nav aria-label="Hovedmenu" className="px-5 pb-10 sm:px-8">
              <ul className="divide-y divide-line">
                {items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className="block py-4 text-2xl font-medium tracking-tight text-ink"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
