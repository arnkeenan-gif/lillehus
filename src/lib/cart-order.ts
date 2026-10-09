import type Stripe from "stripe";

/*
  The order shape shared by the thank-you page, the webhook and the two order
  emails, built from a paid Checkout Session and its line items, plus the
  checkout form's state. The session's metadata carries the order number and
  the pickup (location, date, time window); each line item's product carries
  the chosen options.
*/

/** Most pieces of one product in a single order. Shared by the cart store and the server action. */
export const MAX_QTY = 20;

export interface OrderLine {
  name: string;
  qty: number;
  unitOere: number;
  totalOere: number;
  /** The chosen options as read by people: "Kagemand eller kagekone: Kagekone". */
  options: string[];
}

export interface OrderDetails {
  orderNo: string;
  /** The pickup location's id and name, "gaarden" and "Gården". */
  locationId: string;
  locationName: string;
  /** ISO date, "2026-10-17". Empty when the session carries no pickup date. */
  pickupDate: string;
  /** The pickup window, "9.00" and "12.00", when Kristine set one for that date. */
  pickupFrom: string;
  pickupTo: string;
  customerName: string;
  phone: string;
  email: string;
  note: string;
  lines: OrderLine[];
  subtotalOere: number;
  totalOere: number;
}

export type CheckoutField = "name" | "phone" | "email" | "note" | "order";

export interface CheckoutState {
  errors?: Partial<Record<CheckoutField, string>>;
  /** A general message shown above the submit button. */
  message?: string;
  /** Cart lines the server no longer sells; the form removes them from the cart. */
  removedKeys?: string[];
  /** Cart lines whose deadline has passed for the chosen date; the form marks them. */
  expiredKeys?: string[];
  /** The chosen location or date cannot be used any more; the customer must choose again. */
  pickupInvalid?: boolean;
  /** Everything checked out, but online payment is not set up (no Stripe key): the page's calm notice says what to do. */
  paymentUnavailable?: boolean;
}

export const INITIAL_CHECKOUT_STATE: CheckoutState = {};

/** Stripe metadata values are at most 500 characters. */
export function metadataValue(value: string, max = 500): string {
  return value.length <= max ? value : `${value.slice(0, max - 1)}…`;
}

/** Option lines stored on a Stripe product's metadata, one per line. */
export function encodeOptions(options: string[]): string {
  return metadataValue(options.join("\n"));
}

export function decodeOptions(value: string | undefined | null): string[] {
  if (!value) return [];
  return value
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}

function productOf(li: Stripe.LineItem): Stripe.Product | null {
  const product = li.price?.product;
  return product && typeof product === "object" && !("deleted" in product && product.deleted) ? (product as Stripe.Product) : null;
}

/**
 * The order from a paid session. Expand `line_items.data.price.product` (or
 * pass line items listed with that expansion) to get the options; without
 * it the lines still have names, quantities and prices.
 */
export function orderFromSession(session: Stripe.Checkout.Session, lineItems: Stripe.LineItem[]): OrderDetails {
  const meta = session.metadata ?? {};
  const lines: OrderLine[] = lineItems.map((li) => {
    const qty = li.quantity ?? 1;
    const unit = li.price?.unit_amount ?? Math.round(li.amount_total / Math.max(qty, 1));
    const product = productOf(li);
    return {
      name: product?.name ?? li.description ?? "Vare",
      qty,
      unitOere: unit,
      totalOere: li.amount_total,
      options: decodeOptions(product?.metadata?.options),
    };
  });
  const subtotalOere = lines.reduce((sum, l) => sum + l.totalOere, 0);
  return {
    orderNo: meta.orderNo || session.id.slice(-8).toUpperCase(),
    locationId: meta.locationId ?? "",
    locationName: meta.location ?? "",
    pickupDate: meta.pickupDate ?? "",
    pickupFrom: meta.pickupFrom ?? "",
    pickupTo: meta.pickupTo ?? "",
    customerName: meta.customerName || session.customer_details?.name || "",
    phone: session.customer_details?.phone || meta.phone || "",
    email: session.customer_details?.email || session.customer_email || "",
    note: meta.note ?? "",
    lines,
    subtotalOere,
    totalOere: session.amount_total ?? subtotalOere,
  };
}
