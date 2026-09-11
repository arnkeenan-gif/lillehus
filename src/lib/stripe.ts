import Stripe from "stripe";

/*
  Lazy Stripe client. Nothing here touches the network at import time, so the
  shop still renders from content/products.json when STRIPE_SECRET_KEY is
  missing. The API version is left to the SDK's pinned default.
*/

let client: Stripe | null = null;

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  if (!client) {
    client = new Stripe(key, {
      typescript: true,
      appInfo: { name: "lillehus", url: "https://www.detlillehuspaalandet.net" },
    });
  }
  return client;
}

/** Absolute site origin without a trailing slash, for Stripe success/cancel URLs and images. */
export function siteOrigin(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/+$/, "");
}
