"use server";

import { randomInt } from "node:crypto";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import type Stripe from "stripe";
import { getSiteSettings } from "@/lib/cms";
import { formatPrice } from "@/lib/format";
import { MAX_QTY, encodeOptions, metadataValue, type CheckoutField, type CheckoutState } from "@/lib/cart-order";
import { evaluateCake } from "@/lib/ordering/cake-options";
import { copenhagenDate, formatDayDate, normalizeClock, pickupTimeText } from "@/lib/ordering/dates";
import { isBeforeDeadline } from "@/lib/ordering/deadline";
import { cakeInCart, cakeRule, getShopCatalog } from "@/lib/products";
import { getStripe, siteOrigin } from "@/lib/stripe";

/*
  The checkout. Everything the browser sends is checked again here with the
  server's clock and the CMS: the pickup location must be active, the date
  open for that location, every product and cake still for sale, the cake
  options valid, and no line past its deadline for the date (so a page left
  open cannot get around a deadline). Names, prices and options are taken
  from the CMS, never from the browser. Then a Stripe Checkout Session is
  created and the customer is sent to it; payment methods are whatever the
  Stripe dashboard has enabled, which is how MobilePay gets in.
*/

const ORDER_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const CONTACT_FIELDS = new Set<string>(["name", "phone", "email", "note"]);

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

const contactSchema = z.object({
  name: z.string().trim().min(2, "Skriv dit navn.").max(80, "Navnet er for langt."),
  phone: z.string().trim().min(1, "Skriv dit telefonnummer.").refine(isPhone, "Skriv et telefonnummer på 8 cifre."),
  email: z
    .string()
    .trim()
    .min(1, "Skriv din e-mail.")
    .max(120, "E-mailen er for lang.")
    .pipe(z.email({ error: "Skriv en e-mail, vi kan sende kvitteringen til." })),
  note: z.string().trim().max(500, "Beskeden må højst være 500 tegn."),
});

const lineSchema = z.object({
  key: z.string().min(1).max(400),
  kind: z.enum(["product", "cake"]),
  productId: z.string().min(1).max(100),
  // Products stop at MAX_QTY, cakes at their own maximum (checked below); 100 is the hard ceiling.
  qty: z.number().int().min(1).max(100),
  selections: z.record(z.string().max(100), z.union([z.string().max(400), z.array(z.string().max(100)).max(30)])).optional(),
});

const orderSchema = z.object({
  pickup: z.object({ locationId: z.string().min(1).max(100), date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/) }).nullable(),
  lines: z.array(lineSchema).max(60),
});

function text(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value : "";
}

function parseJson(value: FormDataEntryValue | null): unknown {
  if (typeof value !== "string" || !value) return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function joinNames(names: string[]): string {
  if (names.length <= 1) return names.join("");
  return `${names.slice(0, -1).join(", ")} og ${names[names.length - 1]}`;
}

interface PricedLine {
  key: string;
  kind: "product" | "cake";
  productId: string;
  name: string;
  qty: number;
  unitOere: number;
  options: string[];
  image?: string;
}

export async function createCheckoutSession(_prev: CheckoutState, formData: FormData): Promise<CheckoutState> {
  if (formData.get("website")) return { message: "Noget gik galt. Prøv igen." };

  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() || "ukendt";
  if (isRateLimited(ip)) return { message: "Du har prøvet mange gange på kort tid. Vent lidt, og prøv igen." };

  const contact = contactSchema.safeParse({
    name: text(formData.get("name")),
    phone: text(formData.get("phone")),
    email: text(formData.get("email")),
    note: text(formData.get("note")),
  });
  const errors: NonNullable<CheckoutState["errors"]> = {};
  if (!contact.success) {
    for (const issue of contact.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string" && CONTACT_FIELDS.has(key) && !errors[key as CheckoutField]) errors[key as CheckoutField] = issue.message;
    }
  }

  const order = orderSchema.safeParse(parseJson(formData.get("order")));
  if (!order.success) return { errors, message: "Vi kunne ikke læse din kurv. Opdater siden, og prøv igen." };
  if (order.data.lines.length === 0) return { errors: { ...errors, order: "Din kurv er tom." }, message: "Din kurv er tom." };
  if (!order.data.pickup) {
    return { errors, pickupInvalid: true, message: "Vælg afhentningssted og dato, før du går til betaling." };
  }

  const pickup = order.data.pickup;
  const now = Date.now();
  const today = copenhagenDate(now);
  const catalog = await getShopCatalog();

  const location = catalog.locations.find((l) => l.id === pickup.locationId);
  if (!location) {
    return { errors, pickupInvalid: true, message: "Afhentningsstedet kan ikke vælges længere. Vælg et andet sted." };
  }
  const date = location.dates.find((d) => d.date === pickup.date);
  if (!date || date.date < today) {
    return { errors, pickupInvalid: true, message: `${location.name} har ikke åbent for afhentning den dag længere. Vælg en anden dato.` };
  }

  const lines: PricedLine[] = [];
  const removed: { key: string; name: string }[] = [];
  const expired: { key: string; name: string }[] = [];
  for (const raw of order.data.lines) {
    if (raw.kind === "product") {
      const product = catalog.products.find((p) => p.id === raw.productId);
      if (!product || !product.canOrder) {
        removed.push({ key: raw.key, name: product?.name ?? "En vare" });
        continue;
      }
      if (!isBeforeDeadline(date.date, product.rule, now)) expired.push({ key: raw.key, name: product.name });
      lines.push({
        key: raw.key,
        kind: "product",
        productId: product.id,
        name: product.name,
        qty: Math.min(raw.qty, MAX_QTY),
        unitOere: product.priceOere,
        options: [],
        image: product.photo?.src,
      });
    } else {
      const cake = catalog.cakes.find((c) => c.id === raw.productId);
      const evaluation = cake ? evaluateCake(cake, raw.selections ?? {}) : null;
      if (!cake || !evaluation || !cakeInCart(cake) || Object.keys(evaluation.errors).length > 0) {
        removed.push({ key: raw.key, name: cake?.name ?? "En kage" });
        continue;
      }
      if (!isBeforeDeadline(date.date, cakeRule(cake, catalog.settings), now)) expired.push({ key: raw.key, name: cake.name });
      lines.push({
        key: raw.key,
        kind: "cake",
        productId: cake.id,
        name: cake.name,
        qty: Math.min(Math.max(raw.qty, cake.minQuantity), cake.maxQuantity),
        unitOere: evaluation.unitOere,
        options: evaluation.lines,
        image: cake.photos[0]?.src,
      });
    }
  }

  if (removed.length > 0) {
    return {
      errors,
      removedKeys: removed.map((r) => r.key),
      message:
        lines.length > 0
          ? `${joinNames(removed.map((r) => r.name))} kan ikke bestilles længere, eller valgene er ændret. Vi har taget det ud af kurven, så tjek kurven og prøv igen.`
          : "Varerne i kurven kan ikke bestilles længere, så vi har tømt kurven.",
    };
  }
  if (expired.length > 0) {
    return {
      errors,
      expiredKeys: expired.map((e) => e.key),
      message: `Fristen er gået for ${joinNames(expired.map((e) => e.name))} til ${formatDayDate(date.date)}. Tag ${expired.length === 1 ? "den" : "dem"} ud af kurven, eller vælg en senere dato.`,
    };
  }
  if (Object.keys(errors).length > 0 || !contact.success) return { errors };

  const total = lines.reduce((sum, l) => sum + l.unitOere * l.qty, 0);
  const minOrder = catalog.settings.minOrderOere ?? 0;
  if (minOrder > 0 && total < minOrder) return { message: `Mindste bestilling er ${formatPrice(minOrder)}.` };

  const settings = await getSiteSettings();
  const stripe = getStripe();
  if (!stripe) {
    return {
      paymentUnavailable: true,
      message: `Betaling er ikke sat op endnu. Ring eller skriv til os på ${settings.phone}, så tager vi bestillingen manuelt.`,
    };
  }

  const data = contact.data;
  const origin = siteOrigin();
  const publicImages = origin.startsWith("https://");
  const orderNo = makeOrderNo();
  const dayLabel = formatDayDate(date.date);
  const from = normalizeClock(date.from);
  const to = normalizeClock(date.to);
  const time = pickupTimeText(from, to);

  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = lines.map((line) => {
    const image = line.image ? (line.image.startsWith("http") ? line.image : `${origin}${line.image}`) : undefined;
    return {
      quantity: line.qty,
      price_data: {
        currency: "dkk",
        unit_amount: line.unitOere,
        product_data: {
          name: line.name,
          ...(line.options.length > 0 ? { description: metadataValue(line.options.join(". ")) } : {}),
          metadata: { kind: line.kind, productId: line.productId, options: encodeOptions(line.options) },
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
      kind: "bakery",
      orderNo,
      locationId: location.id,
      location: location.name,
      pickupDate: date.date,
      pickupFrom: from,
      pickupTo: to,
      customerName: data.name,
      phone: data.phone,
      note: data.note,
      lines: metadataValue(
        lines.map((l) => `${l.qty} x ${l.name}${l.options.length > 0 ? ` (${l.options.join("; ")})` : ""}`).join(", "),
      ),
    },
    custom_text: {
      submit: { message: `Du henter din bestilling: ${location.name}, ${dayLabel}${time ? `, ${time}` : ""}.` },
    },
    payment_intent_data: {
      description: `${orderNo}, afhentning ${dayLabel}, ${location.name}`,
    },
    success_url: `${origin}/bagvaerk/tak?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/bagvaerk/kasse`,
  };

  let url: string | null = null;
  try {
    const session = await stripe.checkout.sessions.create(params);
    url = session.url;
  } catch (err) {
    console.error("[checkout] kunne ikke oprette Stripe-session", err);
  }
  if (!url) {
    return { message: `Vi kunne ikke starte betalingen. Prøv igen om lidt, eller ring til os på ${settings.phone}.` };
  }

  redirect(url);
}
