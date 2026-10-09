/**
 * Ordering façade: categories, products, cakes, pickup locations with their
 * dates, and the ordering settings (the default deadline). Each function
 * reads Sanity when it is configured and the JSON in content/ordering/ (and
 * content/shop.json) when it is not. Owned by the ordering lane; see
 * CLAUDE.md.
 *
 * getPickupLocations() and getOrderingSettings() are the contract the
 * content lane reads (signatures stay as they are). getProducts(),
 * getProduct() and getCakes() keep the older shapes for the product strip
 * and the generic cake form.
 */
import { copenhagenDate } from "@/lib/ordering/dates";
import { effectiveRule } from "@/lib/ordering/deadline";
import { fromSanity } from "./from-sanity";
import {
  fallbackBakeryCategories,
  fallbackBakeryProducts,
  fallbackCakeProducts,
  fallbackOrderingSettings,
  fallbackPickupLocations,
} from "./ordering-fallback";
import {
  sanityBakeryCategories,
  sanityBakeryProducts,
  sanityCakeProducts,
  sanityOrderingSettings,
  sanityPickupLocations,
} from "./ordering-sanity";
import type { CakeType, Product, ProductCategory } from "./types";
import type { BakeryCategory, BakeryProduct, CakeProduct, OrderingSettings, PickupDate, PickupLocation } from "./ordering-types";

export type * from "./ordering-types";

/* ------------------------------------------------------------------ */
/* Contract for the content lane                                       */
/* ------------------------------------------------------------------ */

/**
 * Pickup locations with their open dates: today and later, soonest first,
 * closed dates removed. Only active locations unless `includeInactive`.
 * Without Sanity, an active location without dates in the JSON gets the
 * next weeks' Wednesdays and Saturdays (without times).
 */
export async function getPickupLocations({ includeInactive = false }: { includeInactive?: boolean } = {}): Promise<PickupLocation[]> {
  const today = copenhagenDate();
  const all = await fromSanity("pickupLocations", sanityPickupLocations, () => fallbackPickupLocations(today));
  return all
    .filter((l) => includeInactive || l.active)
    .map((l) => ({ ...l, dates: openDates(l.dates, today) }))
    .sort((a, b) => a.sort - b.sort || a.name.localeCompare(b.name, "da"));
}

/** The default deadline (and the minimum order and the shop notice). */
export function getOrderingSettings(): Promise<OrderingSettings> {
  return fromSanity("orderingSettings", sanityOrderingSettings, fallbackOrderingSettings);
}

/** Open dates from today on, each date once, sorted. */
function openDates(dates: PickupDate[], today: string): PickupDate[] {
  const seen = new Set<string>();
  const out: PickupDate[] = [];
  for (const d of [...dates].sort((a, b) => a.date.localeCompare(b.date))) {
    if (d.closed || d.date < today || seen.has(d.date)) continue;
    seen.add(d.date);
    out.push({ date: d.date, from: d.from, to: d.to, note: d.note });
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* The bagværk shop and the cakes                                      */
/* ------------------------------------------------------------------ */

/** The categories in Kristine's order, empty ones included (the page leaves those out). */
export async function getBakeryCategories(): Promise<BakeryCategory[]> {
  const categories = await fromSanity("productCategories", sanityBakeryCategories, fallbackBakeryCategories);
  return [...categories].sort((a, b) => a.sort - b.sort || a.title.localeCompare(b.title, "da"));
}

/** Shown products (hidden ones are left out), sorted within their category by Kristine's order. */
export async function getBakeryProducts(): Promise<BakeryProduct[]> {
  const products = await fromSanity("products", sanityBakeryProducts, fallbackBakeryProducts);
  return products.filter((p) => p.active).sort((a, b) => a.sort - b.sort || a.name.localeCompare(b.name, "da"));
}

/** Shown cakes, in Kristine's order. */
export async function getCakeProducts(): Promise<CakeProduct[]> {
  const cakes = await fromSanity("cakes", sanityCakeProducts, fallbackCakeProducts);
  return cakes.filter((c) => c.active).sort((a, b) => a.sort - b.sort || a.name.localeCompare(b.name, "da"));
}

export async function getCakeProduct(id: string): Promise<CakeProduct | undefined> {
  return (await getCakeProducts()).find((c) => c.id === id);
}

/* ------------------------------------------------------------------ */
/* Older shapes, kept for the pages that still read them               */
/* ------------------------------------------------------------------ */

const LEGACY_CATEGORY: Record<string, ProductCategory> = {
  broed: "brød",
  rugbroed: "brød",
  boller: "boller",
  "soedt-bagvaerk": "kager",
  "croissanter-og-wienerbroed": "kager",
  "cookies-og-andet-soedt": "kager",
};

/** Shown products in the older Product shape (the product strip on content pages), in shop order. */
export async function getProducts(): Promise<Product[]> {
  const [products, categories] = await Promise.all([getBakeryProducts(), getBakeryCategories()]);
  const position = new Map(categories.map((c, i) => [c.id, i]));
  return products
    .filter((p) => position.has(p.categoryId))
    .sort((a, b) => (position.get(a.categoryId) ?? 0) - (position.get(b.categoryId) ?? 0) || a.sort - b.sort)
    .map((p, i) => ({
      id: p.id,
      slug: p.id,
      name: p.name,
      description: p.description ?? "",
      priceOere: p.priceOere,
      image: p.photo?.src,
      photo: p.photo,
      category: LEGACY_CATEGORY[p.categoryId] ?? "andet",
      days: [],
      allergens: [],
      active: true,
      sort: (i + 1) * 10,
    }));
}

export async function getProduct(slug: string): Promise<Product | undefined> {
  return (await getProducts()).find((p) => p.slug === slug);
}

/** Shown cakes in the older CakeType shape (the generic cake request form). */
export async function getCakes(): Promise<CakeType[]> {
  const [cakes, settings] = await Promise.all([getCakeProducts(), getOrderingSettings()]);
  return cakes.map((c) => ({
    id: c.id,
    slug: c.id,
    name: c.name,
    description: c.intro ?? "",
    fromPriceOere: c.basePriceOere,
    servings: "",
    leadTimeDays: effectiveRule(c.deadline, settings.defaultDeadline).daysBefore,
    image: c.photos[0]?.src,
    photo: c.photos[0],
    options: c.optionGroups.find((g) => g.type === "dropdown" || g.type === "radio")?.choices.map((ch) => ch.label) ?? [],
    sort: c.sort,
  }));
}
