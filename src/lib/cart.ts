import { useSyncExternalStore } from "react";
import type { Weekday } from "@/lib/content";
import { MAX_QTY } from "@/lib/cart-order";

/*
  The cart lives in localStorage under "dlh-kurv" and is exposed as a tiny
  external store. Any client component can read it with useCart() without a
  provider, which matters because the header's cart button renders on every
  page. The server snapshot is always the empty cart, so server HTML and the
  first client render agree; the real contents arrive right after hydration.
*/

export const CART_KEY = "dlh-kurv";
export const OPEN_CART_EVENT = "dlh:open-cart";
export { MAX_QTY };

const CHANGE_EVENT = "dlh:cart";
const VERSION = 1;

export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  /** Unit price in øre as shown when added. The server re-prices at checkout. */
  priceOere: number;
  qty: number;
  image?: string;
  /** Weekdays the item can be baked. Empty = every pickup day. */
  days: Weekday[];
}

const EMPTY: CartItem[] = [];
let snapshot: CartItem[] | null = null;

export function clampQty(n: unknown): number {
  const q = Math.floor(Number(n));
  if (!Number.isFinite(q) || q < 1) return 1;
  return Math.min(q, MAX_QTY);
}

function isItem(x: unknown): x is CartItem {
  if (!x || typeof x !== "object") return false;
  const o = x as Record<string, unknown>;
  return (
    typeof o.productId === "string" &&
    o.productId.length > 0 &&
    typeof o.name === "string" &&
    typeof o.priceOere === "number" &&
    Number.isInteger(o.priceOere) &&
    o.priceOere >= 0 &&
    typeof o.qty === "number"
  );
}

function load(): CartItem[] {
  try {
    const raw = window.localStorage.getItem(CART_KEY);
    if (!raw) return EMPTY;
    const parsed: unknown = JSON.parse(raw);
    const list = Array.isArray(parsed) ? parsed : (parsed as { items?: unknown } | null)?.items;
    if (!Array.isArray(list)) return EMPTY;
    const items = list.filter(isItem).map((i) => ({
      productId: i.productId,
      slug: typeof i.slug === "string" ? i.slug : i.productId,
      name: i.name,
      priceOere: i.priceOere,
      qty: clampQty(i.qty),
      image: typeof i.image === "string" && i.image ? i.image : undefined,
      days: Array.isArray(i.days) ? (i.days as Weekday[]) : [],
    }));
    return items.length > 0 ? items : EMPTY;
  } catch {
    return EMPTY;
  }
}

function save(items: CartItem[]) {
  snapshot = items.length > 0 ? items : EMPTY;
  try {
    if (items.length === 0) window.localStorage.removeItem(CART_KEY);
    else window.localStorage.setItem(CART_KEY, JSON.stringify({ v: VERSION, items }));
  } catch {
    // Private mode or full storage: the in-memory snapshot still works for this page.
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

function getSnapshot(): CartItem[] {
  if (snapshot === null) snapshot = load();
  return snapshot;
}

function getServerSnapshot(): CartItem[] {
  return EMPTY;
}

function subscribe(onChange: () => void): () => void {
  const onStorage = (e: StorageEvent) => {
    if (e.key === null || e.key === CART_KEY) {
      snapshot = null;
      onChange();
    }
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

export function countItems(items: CartItem[]): number {
  let n = 0;
  for (const i of items) n += i.qty;
  return n;
}

export function cartSubtotal(items: CartItem[]): number {
  let sum = 0;
  for (const i of items) sum += i.priceOere * i.qty;
  return sum;
}

/** The cart lines. Empty on the server and during hydration. */
export function useCart(): CartItem[] {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/** Total number of pieces, for the header badge. */
export function useCartCount(): number {
  return useSyncExternalStore(subscribe, () => countItems(getSnapshot()), () => 0);
}

export function addToCart(item: Omit<CartItem, "qty">, qty = 1) {
  const current = getSnapshot();
  const add = clampQty(qty);
  const existing = current.find((i) => i.productId === item.productId);
  if (existing) {
    save(current.map((i) => (i.productId === item.productId ? { ...i, ...item, qty: clampQty(i.qty + add) } : i)));
  } else {
    save([...current, { ...item, qty: add }]);
  }
}

export function setCartQty(productId: string, qty: number) {
  const current = getSnapshot();
  if (qty < 1) {
    save(current.filter((i) => i.productId !== productId));
    return;
  }
  save(current.map((i) => (i.productId === productId ? { ...i, qty: clampQty(qty) } : i)));
}

export function removeFromCart(productId: string) {
  save(getSnapshot().filter((i) => i.productId !== productId));
}

export function removeManyFromCart(productIds: string[]) {
  const gone = new Set(productIds);
  save(getSnapshot().filter((i) => !gone.has(i.productId)));
}

export function clearCart() {
  save(EMPTY);
}

/** Asks the cart drawer (mounted in the bageri layout) to open. */
export function openCart() {
  window.dispatchEvent(new CustomEvent(OPEN_CART_EVENT));
}
