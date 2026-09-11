"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { List, X } from "@phosphor-icons/react";
import { NAV } from "@/lib/site";

/** Hamburger menu below the lg breakpoint. Closes on link click and Escape. */
export function MobileNav() {
  const [open, setOpen] = useState(false);

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

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-expanded={open}
        aria-controls="mobil-menu"
        className="flex size-11 items-center justify-center rounded-md text-ink hover:bg-paper-2"
      >
        <List size={24} aria-hidden="true" />
        <span className="sr-only">Åbn menu</span>
      </button>

      {open ? (
        <div
          id="mobil-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          className="fixed inset-0 z-50 flex flex-col bg-paper"
        >
          <div className="flex h-16 items-center justify-end px-5 sm:h-[72px] sm:px-8">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex size-11 items-center justify-center rounded-md text-ink hover:bg-paper-2"
            >
              <X size={24} aria-hidden="true" />
              <span className="sr-only">Luk menu</span>
            </button>
          </div>
          <nav aria-label="Hovedmenu" className="px-5 pb-10 sm:px-8">
            <ul className="divide-y divide-line">
              {NAV.map((item) => (
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
        </div>
      ) : null}
    </div>
  );
}
