import Link from "next/link";
import { Basket } from "@phosphor-icons/react/dist/ssr";

/**
 * Placeholder. The bakery shop replaces this file with a live cart button
 * that shows the item count and opens the cart drawer.
 */
export function CartButton() {
  return (
    <Link
      href="/bageri"
      className="flex size-11 items-center justify-center rounded-md text-ink hover:bg-paper-2"
    >
      <Basket size={24} aria-hidden="true" />
      <span className="sr-only">Kurv</span>
    </Link>
  );
}
