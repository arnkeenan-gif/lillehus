"use server";

import { randomInt } from "node:crypto";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import type Stripe from "stripe";
import { site } from "@/lib/site";
import { formatPrice } from "@/lib/format";
import { MAX_QTY, type CheckoutField, type CheckoutState } from "@/lib/cart-order";
import { filterDaysForItems, getPickupDays, pickupDayLabel } from "@/lib/cart-pickup";
import { getShopProducts, shop, type ShopProduct } from "@/lib/products";
import { getStripe, siteOrigin } from "@/lib/stripe";

/*
  Validates the checkout form, re-prices every line from the server-side
  catalogue (client prices are never trusted), builds a Stripe Checkout Session
  and sends the customer to it. Payment methods are whatever the Stripe
  dashboard has enabled, which is how MobilePay gets in.
*/

const FIELDS = new Set<string>(["pickupDate", "name", "phone", "email", "note", "fulfilment", "items"]);
const ORDER_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function isField(key: string): key is CheckoutField {
  return FIELDS.has(key);
}

function makeOrderNo(): string {
  let s = "DLH-";
  for (let i = 0; i < 6; i++) s += ORDER_ALPHABET[randomInt(ORDER_ALPHABET.length)];
  return s;
}

function isPhone(value: string): boolean {
  const digits = value.replace(/[\s().-]/g, "");
  return /^(\+45|0045)?\d{8}$/.test(digits) || /^\+\d{9,15}$/.test(digits);
}

// Small in-memory limiter per IP: enough to stop a runaway script, resets on deploy.
const WINDOW_MS = 10 * 60_000;
const MAX_ATTEMPTS = 12;
const attempts = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  if (attempts.size > 500) {
    for (const [key, entry] of attempts) if (entry.resetAt < now) attempts.delete(key);
  }
  const entry = attempts.get(ip);
  if (!entry || entry.resetAt < now) {
    attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_ATTEMPTS;
}

const itemSchema = z.object({
  productId: z.string().min(1),
  qty: z.coerce.number().int().min(1).max(MAX_QTY),
});

const schema = z.object({
  pickupDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Vælg en dag."),
  name: z.string().trim().min(2, "Skriv dit navn.").max(80, "Navnet er for langt."),
  phone: z.string().trim().min(1, "Skriv dit telefonnummer.").refine(isPhone, "Skriv et telefonnummer på 8 cifre."),
  email: z
    .string()
    .trim()
    .min(1, "Skriv din e-mail.")
    .max(120, "E-mailen er for lang.")
    .pipe(z.email({ error: "Skriv en e-mail, vi kan sende kvitteringen til." })),
  note: z.string().trim().max(500, "Beskeden må højst være 500 tegn."),
  fulfilment: z.enum(["pickup", "delivery"]),
  items: z.array(itemSchema).min(1, "Din kurv er tom."),
});

function text(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value : "";
}

function parseItems(value: FormDataEntryValue | null): unknown {
  if (typeof value !== "string" || !value) return [];
  try {
    return JSON.parse(value);
  } catch {
    return [];
  }
}

export async function createCheckoutSession(_prev: CheckoutState, formData: FormData): Promise<CheckoutState> {
  if (formData.get("website")) return { message: "Noget gik galt. Prøv igen." };

  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() || "ukendt";
  if (isRateLimited(ip)) return { message: "Du har prøvet mange gange på kort tid. Vent lidt, og prøv igen." };

  const parsed = schema.safeParse({
    pickupDate: text(formData.get("pickupDate")),
    name: text(formData.get("name")),
    phone: text(formData.get("phone")),
    email: text(formData.get("email")),
    note: text(formData.get("note")),
    fulfilment: text(formData.get("fulfilment")) || "pickup",
    items: parseItems(formData.get("items")),
  });

  if (!parsed.success) {
    const errors: NonNullable<CheckoutState["errors"]> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string" && isField(key) && !errors[key]) errors[key] = issue.message;
    }
    return { errors, message: errors.items };
  }
  const data = parsed.data;

  const stripe = getStripe();
  if (!stripe) {
    return {
      message: `Betaling er ikke sat op endnu. Ring eller skriv til os på ${site.phone}, så tager vi bestillingen manuelt.`,
    };
  }

  const products = await getShopProducts();
  const byId = new Map(products.map((p) => [p.id, p]));
  const lines: { product: ShopProduct; qty: number }[] = [];
  const removed: string[] = [];
  for (const item of data.items) {
    const product = byId.get(item.productId);
    if (product) lines.push({ product, qty: item.qty });
    else removed.push(item.productId);
  }
  if (removed.length > 0) {
    return {
      removedProductIds: removed,
      message:
        lines.length > 0
          ? "En vare i kurven kan ikke bestilles længere. Vi har fjernet den, så tjek kurven og prøv igen."
          : "Varerne i kurven kan ikke bestilles længere, så vi har tømt kurven.",
    };
  }

  const isDelivery = shop.delivery.enabled && data.fulfilment === "delivery";
  const daysForItems = filterDaysForItems(
    getPickupDays(new Date(), shop),
    lines.map((l) => ({ name: l.product.name, days: l.product.days })),
  );
  const days = isDelivery ? daysForItems.filter((d) => shop.delivery.days.includes(d.weekday)) : daysForItems;
  const day = days.find((d) => d.iso === data.pickupDate);
  if (!day) return { errors: { pickupDate: "Den dag kan vi ikke nå længere. Vælg en anden dag." } };

  const subtotal = lines.reduce((sum, l) => sum + l.product.priceOere * l.qty, 0);
  if (shop.minOrderOere > 0 && subtotal < shop.minOrderOere) {
    return { message: `Mindste bestilling er ${formatPrice(shop.minOrderOere)}.` };
  }
  const deliveryFee = isDelivery ? (subtotal >= shop.delivery.freeAboveOere ? 0 : shop.delivery.feeOere) : null;

  const origin = siteOrigin();
  const publicImages = origin.startsWith("https://");
  const orderNo = makeOrderNo();
  const dayLabel = pickupDayLabel(day.iso);
  const hours = shop.pickupWindow.replace(" til ", " og ");

  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = lines.map(({ product, qty }) => {
    if (product.stripePriceId) return { price: product.stripePriceId, quantity: qty };
    const image = product.image ? (product.image.startsWith("http") ? product.image : `${origin}${product.image}`) : undefined;
    return {
      quantity: qty,
      price_data: {
        currency: "dkk",
        unit_amount: product.priceOere,
        product_data: {
          name: product.name,
          ...(publicImages && image ? { images: [image] } : {}),
        },
      },
    };
  });

  const params: Stripe.Checkout.SessionCreateParams = {
    mode: "payment",
    currency: "dkk",
    locale: "da",
    line_items: lineItems,
    customer_email: data.email,
    phone_number_collection: { enabled: true },
    metadata: {
      orderNo,
      pickupDate: day.iso,
      customerName: data.name,
      phone: data.phone,
      note: data.note,
      fulfilment: isDelivery ? "delivery" : "pickup",
    },
    custom_text: {
      submit: {
        message: isDelivery
          ? `Vi leverer ${dayLabel}. ${shop.delivery.note}`
          : `Du henter dine varer i Hønsehuset, ${site.address.street}, ${dayLabel} mellem kl. ${hours}.`,
      },
    },
    payment_intent_data: {
      description: `${orderNo}, ${isDelivery ? "levering" : "afhentning"} ${dayLabel}`,
    },
    success_url: `${origin}/bageri/tak?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/bageri/kasse`,
  };

  if (isDelivery && deliveryFee !== null) {
    params.shipping_address_collection = { allowed_countries: ["DK"] };
    params.shipping_options = [
      {
        shipping_rate_data: {
          type: "fixed_amount",
          display_name: deliveryFee === 0 ? "Levering, gratis" : "Levering",
          fixed_amount: { amount: deliveryFee, currency: "dkk" },
        },
      },
    ];
  }

  let url: string | null = null;
  try {
    const session = await stripe.checkout.sessions.create(params);
    url = session.url;
  } catch (err) {
    console.error("[checkout] kunne ikke oprette Stripe-session", err);
  }
  if (!url) {
    return { message: `Vi kunne ikke starte betalingen. Prøv igen om lidt, eller ring til os på ${site.phone}.` };
  }

  redirect(url);
}
