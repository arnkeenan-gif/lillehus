import { useSyncExternalStore } from "react";
import type { DeadlineRule } from "@/lib/cms/ordering-types";
import { MAX_QTY } from "@/lib/cart-order";

/*
  The cart lives in localStorage under "dlh-kurv" and is exposed as a tiny
  external store. Any client component can read it with useCart() and
  useCartPickup() without a provider, which matters because the header's
  cart button renders on every page. The server snapshot is always the empty
  cart, so server HTML and the first client render agree; the real contents
  arrive right after hydration.

  One order has one pickup (a location and a date) and any number of lines.
  A line is a product, or a cake with the options chosen for it: the same
  cake with other options is a separate line. Names, prices and option
  labels are what the customer saw when adding; the checkout re-checks all
  of it against the CMS with the server's clock.
*/

export const CART_KEY = "dlh-kurv";
export const OPEN_CART_EVENT = "dlh:open-cart";
export { MAX_QTY };

const CHANGE_EVENT = "dlh:cart";
const VERSION = 2;

export interface CartPickup {
  /** The pickup location's id, e.g. "gaarden". */
  locationId: string;
  /** "YYYY-MM-DD", a Danish calendar date. */
  date: string;
}

export interface CartLine {
  /** Unique per product and options: "product:surdejsbroed", "cake:kagemand:figur=kagekone". */
  key: string;
  kind: "product" | "cake";
  /** The product's or cake's id (its slug). */
  productId: string;
  name: string;
  /** Price of one, options included, in øre, as shown when added. */
  priceOere: number;
  qty: number;
  image?: string;
  /** object-position for the small cart photo, from the CMS hotspot ("40% 60%"). */
  imagePosition?: string;
  /** The chosen options as the customer reads them: "Kagemand eller kagekone: Kagekone". */
  options: string[];
  /** A cake's raw choices (group id to choice ids or text), sent to the server, which re-prices them. */
  selections?: Record<string, string | string[]>;
  /** The deadline rule that applied when added, for warnings in the cart. The server uses its own. */
  rule: DeadlineRule;
  /** Quantity limits (cakes can have their own). */
  minQty?: number;
  maxQty?: number;
  /** Link back to the product, e.g. "/kager/kagemand". */
  href?: string;
}

export interface CartState {
  pickup: CartPickup | null;
  items: CartLine[];
}

const EMPTY_ITEMS: CartLine[] = [];
const EMPTY: CartState = { pickup: null, items: EMPTY_ITEMS };
const DEFAULT_RULE: DeadlineRule = { daysBefore: 2, hour: 18 };

let snapshot: CartState | null = null;

export function lineKey(kind: CartLine["kind"], productId: string, optionsKey = ""): string {
  return optionsKey ? `${kind}:${productId}:${optionsKey}` : `${kind}:${productId}`;
}

function clamp(n: unknown, min: number, max: number): number {
  const q = Math.floor(Number(n));
  if (!Number.isFinite(q) || q < min) return min;
  return Math.min(q, max);
}

export function clampQty(n: unknown, line?: Pick<CartLine, "minQty" | "maxQty">): number {
  return clamp(n, line?.minQty ?? 1, line?.maxQty ?? MAX_QTY);
}

function isRule(x: unknown): x is DeadlineRule {
  if (!x || typeof x !== "object") return false;
  const r = x as Record<string, unknown>;
  return typeof r.daysBefore === "number" && typeof r.hour === "number";
}

function str(o: Record<string, unknown>, key: string): string | undefined {
  const v = o[key];
  return typeof v === "string" && v ? v : undefined;
}

/** Reads one stored line, from this version or from the first cart (which had productId and no kind). */
function readLine(x: unknown): CartLine | null {
  if (!x || typeof x !== "object") return null;
  const o = x as Record<string, unknown>;
  const productId = str(o, "productId");
  const name = str(o, "name");
  const price = o.priceOere;
  if (!productId || !name || typeof price !== "number" || !Number.isInteger(price) || price < 0) return null;
  const kind = o.kind === "cake" ? "cake" : "product";
  const options = Array.isArray(o.options) ? o.options.filter((v): v is string => typeof v === "string") : [];
  const selections =
    o.selections && typeof o.selections === "object" && !Array.isArray(o.selections)
      ? (o.selections as Record<string, string | string[]>)
      : undefined;
  const minQty = typeof o.minQty === "number" ? o.minQty : undefined;
  const maxQty = typeof o.maxQty === "number" ? o.maxQty : undefined;
  return {
    key: str(o, "key") ?? lineKey(kind, productId),
    kind,
    productId,
    name,
    priceOere: price,
    qty: clamp(o.qty, minQty ?? 1, maxQty ?? MAX_QTY),
    image: str(o, "image"),
    imagePosition: str(o, "imagePosition"),
    options,
    selections,
    rule: isRule(o.rule) ? o.rule : DEFAULT_RULE,
    minQty,
    maxQty,
    href: str(o, "href"),
  };
}

function readPickup(x: unknown): CartPickup | null {
  if (!x || typeof x !== "object") return null;
  const o = x as Record<string, unknown>;
  const locationId = str(o, "locationId");
  const date = str(o, "date");
  if (!locationId || !date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  return { locationId, date };
}

function load(): CartState {
  try {
    const raw = window.localStorage.getItem(CART_KEY);
    if (!raw) return EMPTY;
    const parsed: unknown = JSON.parse(raw);
    const list = Array.isArray(parsed) ? parsed : (parsed as { items?: unknown } | null)?.items;
    const items = Array.isArray(list) ? list.map(readLine).filter((l): l is CartLine => l !== null) : [];
    const pickup = Array.isArray(parsed) ? null : readPickup((parsed as { pickup?: unknown } | null)?.pickup);
    if (items.length === 0 && !pickup) return EMPTY;
    return { pickup, items: items.length > 0 ? items : EMPTY_ITEMS };
  } catch {
    return EMPTY;
  }
}

function save(next: CartState) {
  const items = next.items.length > 0 ? next.items : EMPTY_ITEMS;
  snapshot = items === EMPTY_ITEMS && !next.pickup ? EMPTY : { pickup: next.pickup, items };
  try {
    if (snapshot === EMPTY) window.localStorage.removeItem(CART_KEY);
    else window.localStorage.setItem(CART_KEY, JSON.stringify({ v: VERSION, pickup: snapshot.pickup, items: snapshot.items }));
  } catch {
    // Private mode or full storage: the in-memory snapshot still works for this page.
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

function getSnapshot(): CartState {
  if (snapshot === null) snapshot = load();
  return snapshot;
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

export function countItems(items: CartLine[]): number {
  let n = 0;
  for (const i of items) n += i.qty;
  return n;
}

export function cartSubtotal(items: CartLine[]): number {
  let sum = 0;
  for (const i of items) sum += i.priceOere * i.qty;
  return sum;
}

/** The cart lines. Empty on the server and during hydration. */
export function useCart(): CartLine[] {
  return useSyncExternalStore(
    subscribe,
    () => getSnapshot().items,
    () => EMPTY_ITEMS,
  );
}

/** The chosen pickup (location and date), or null. Null on the server and during hydration. */
export function useCartPickup(): CartPickup | null {
  return useSyncExternalStore(
    subscribe,
    () => getSnapshot().pickup,
    () => null,
  );
}

/** Total number of pieces, for the header badge. */
export function useCartCount(): number {
  return useSyncExternalStore(subscribe, () => countItems(getSnapshot().items), () => 0);
}

/** False during server render and hydration, true afterwards: the cart has been read. */
export function useCartReady(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}

export function getCartState(): CartState {
  return getSnapshot();
}

export function addToCart(line: Omit<CartLine, "qty">, qty = 1) {
  const current = getSnapshot();
  const existing = current.items.find((i) => i.key === line.key);
  if (existing) {
    save({
      ...current,
      items: current.items.map((i) => (i.key === line.key ? { ...i, ...line, qty: clampQty(i.qty + qty, line) } : i)),
    });
  } else {
    save({ ...current, items: [...current.items, { ...line, qty: clampQty(qty, line) }] });
  }
}

export function setCartQty(key: string, qty: number) {
  const current = getSnapshot();
  if (qty < 1) {
    save({ ...current, items: current.items.filter((i) => i.key !== key) });
    return;
  }
  save({ ...current, items: current.items.map((i) => (i.key === key ? { ...i, qty: clampQty(qty, i) } : i)) });
}

export function removeFromCart(key: string) {
  const current = getSnapshot();
  save({ ...current, items: current.items.filter((i) => i.key !== key) });
}

export function removeManyFromCart(keys: string[]) {
  const gone = new Set(keys);
  const current = getSnapshot();
  save({ ...current, items: current.items.filter((i) => !gone.has(i.key)) });
}

/** Sets the order's pickup. Lines are kept; use dropLines() for the ones that cannot make it. */
export function setCartPickup(pickup: CartPickup | null) {
  const current = getSnapshot();
  save({ ...current, pickup });
}

export function clearCart() {
  save(EMPTY);
}

/** Asks the cart drawer (mounted in the bagværk and kager layouts) to open. */
export function openCart() {
  window.dispatchEvent(new CustomEvent(OPEN_CART_EVENT));
}
