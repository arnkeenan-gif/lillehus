"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { List, X } from "@phosphor-icons/react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Container } from "@/components/ui/container";

type Item = { href: string; label: string };

/**
 * The hamburger below lg: a full-screen list that slides in over 240ms
 * (a plain fade under reduced motion). Its top bar repeats the header's
 * wordmark and puts the X exactly where the hamburger was, so nothing
 * jumps. Closes on a link, Escape or the X.
 */
export function MobileNav({ items, name }: { items: Item[]; name: string }) {
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
  const iconButton =
    "flex size-11 items-center justify-center rounded-md text-ink transition-colors duration-150 ease-out-quart hover:bg-paper-2";

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-expanded={open}
        aria-controls="mobil-menu"
        className={iconButton}
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
            className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-paper text-ink"
          >
            <Container className="flex h-16 shrink-0 items-center justify-between gap-4">
              <Link
                href="/"
                onClick={() => setOpen(false)}
                className="whitespace-nowrap text-[12px] font-bold uppercase tracking-[0.14em] text-ink"
              >
                {name}
              </Link>
              <button type="button" onClick={() => setOpen(false)} className={iconButton}>
                <X size={24} aria-hidden="true" />
                <span className="sr-only">Luk menu</span>
              </button>
            </Container>
            <Container className="pb-10 pt-2">
              <nav aria-label="Hovedmenu">
                <ul className="divide-y divide-line border-b border-line">
                  {items.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className="block py-4 text-2xl font-medium tracking-tight text-ink transition-colors duration-150 ease-out-quart hover:text-rust"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </Container>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
