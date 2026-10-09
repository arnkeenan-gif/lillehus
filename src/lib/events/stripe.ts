import type Stripe from "stripe";

/**
 * Called by the Stripe webhook (src/app/api/stripe/webhook/route.ts) when a
 * Checkout Session with metadata.kind === "event" completes: a paid sign-up
 * for an event. Owned by the events lane, which implements it (emails to
 * Kristine and the guest). The ordering lane owns the webhook and only
 * dispatches here.
 */
export async function handleEventCheckoutCompleted(session: Stripe.Checkout.Session): Promise<void> {
  void session;
}
