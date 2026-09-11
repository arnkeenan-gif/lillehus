"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Basket } from "@phosphor-icons/react";
import { openCart, useCartCount } from "@/lib/cart";

const buttonClass =
  "relative flex size-11 items-center justify-center rounded-md text-ink transition-colors duration-150 ease-out-quart hover:bg-paper-2";

/**
 * Header cart button. Inside the shop it opens the cart drawer (mounted in
 * src/app/bageri/layout.tsx); elsewhere it links to the shop. The count comes
 * from the localStorage store, which reports 0 on the server, so the HTML
 * matches on hydration and the real count arrives right after.
 */
export function CartButton() {
  const count = useCartCount();
  const pathname = usePathname();
  const inShop = pathname === "/bageri" || pathname.startsWith("/bageri/");
  const label = count === 0 ? "Kurv, tom" : count === 1 ? "Kurv, 1 vare" : `Kurv, ${count} varer`;

  const content = (
    <>
      <Basket size={24} aria-hidden="true" />
      {count > 0 ? (
        <span
          aria-hidden="true"
          className="tnum absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-md bg-rust px-1 text-[0.7rem] font-semibold leading-none text-white"
        >
          {count}
        </span>
      ) : null}
      <span className="sr-only" aria-live="polite">
        {label}
      </span>
    </>
  );

  if (inShop) {
    return (
      <button type="button" onClick={openCart} aria-haspopup="dialog" className={buttonClass}>
        {content}
      </button>
    );
  }

  return (
    <Link href="/bageri" className={buttonClass}>
      {content}
    </Link>
  );
}
