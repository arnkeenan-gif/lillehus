import type Stripe from "stripe";

/*
  The order shape shared by the thank-you page, the webhook and the two order
  emails. Built from a paid Checkout Session and its line items.
*/

/** Most pieces of one product in a single order. Shared by the cart store and the server action. */
export const MAX_QTY = 20;

export type Fulfilment = "pickup" | "delivery";

export interface OrderLine {
  name: string;
  qty: number;
  unitOere: number;
  totalOere: number;
}

export interface OrderDetails {
  orderNo: string;
  /** ISO date, "2026-10-03". Empty when the session carries no pickup date. */
  pickupDate: string;
  fulfilment: Fulfilment;
  customerName: string;
  phone: string;
  email: string;
  note: string;
  lines: OrderLine[];
  subtotalOere: number;
  /** null when no delivery was chosen. */
  deliveryOere: number | null;
  totalOere: number;
}

export type CheckoutField = "pickupDate" | "name" | "phone" | "email" | "note" | "fulfilment" | "items";

export interface CheckoutState {
  errors?: Partial<Record<CheckoutField, string>>;
  /** A general message shown above the submit button. */
  message?: string;
  /** Cart lines the server no longer knows; the form removes them from the cart. */
  removedProductIds?: string[];
}

export const INITIAL_CHECKOUT_STATE: CheckoutState = {};

export function orderFromSession(session: Stripe.Checkout.Session, lineItems: Stripe.LineItem[]): OrderDetails {
  const meta = session.metadata ?? {};
  const lines: OrderLine[] = lineItems.map((li) => {
    const qty = li.quantity ?? 1;
    const unit = li.price?.unit_amount ?? Math.round(li.amount_total / Math.max(qty, 1));
    return { name: li.description ?? "Vare", qty, unitOere: unit, totalOere: li.amount_total };
  });
  const subtotalOere = lines.reduce((sum, l) => sum + l.totalOere, 0);
  const deliveryOere = session.shipping_cost ? session.shipping_cost.amount_total : null;
  return {
    orderNo: meta.orderNo || session.id.slice(-8).toUpperCase(),
    pickupDate: meta.pickupDate ?? "",
    fulfilment: meta.fulfilment === "delivery" ? "delivery" : "pickup",
    customerName: meta.customerName || session.customer_details?.name || "",
    phone: session.customer_details?.phone || meta.phone || "",
    email: session.customer_details?.email || session.customer_email || "",
    note: meta.note ?? "",
    lines,
    subtotalOere,
    deliveryOere,
    totalOere: session.amount_total ?? subtotalOere + (deliveryOere ?? 0),
  };
}
