import { cache } from "react";
import type Stripe from "stripe";
import imagesJson from "@content/images.json";
import shopJson from "@content/shop.json";
import { getProducts, type Product, type ProductCategory, type Weekday } from "@/lib/content";
import { getStripe, isStripeConfigured } from "@/lib/stripe";
import { WEEKDAY_ORDER, type ShopConfig } from "@/lib/cart-pickup";

/*
  Server-only product access for the shop. With STRIPE_SECRET_KEY set, active
  Stripe products (with their default price) are the catalogue and the
  metadata keys slug, category, days, allergens, description, image and sort
  fill in the rest. Without a key, or if Stripe fails, content/products.json
  is used. Either way the result is the Product shape from content.ts.
*/

export interface ShopProduct extends Product {
  stripeProductId?: string;
  /** Sort order inside the category (Stripe metadata "sort"). */
  sort?: number;
}

export const shop = shopJson as ShopConfig;

export const CATEGORY_ORDER: ProductCategory[] = ["brød", "boller", "kager", "andet"];

export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  brød: "Brød",
  boller: "Boller",
  kager: "Kager",
  andet: "Andet",
};

/** ASCII ids for heading anchors. */
export const CATEGORY_SLUGS: Record<ProductCategory, string> = {
  brød: "broed",
  boller: "boller",
  kager: "kager",
  andet: "andet",
};

function isWeekday(s: string): s is Weekday {
  return (WEEKDAY_ORDER as string[]).includes(s);
}

function isCategory(s: string): s is ProductCategory {
  return (CATEGORY_ORDER as string[]).includes(s);
}

function splitList(value: string | undefined): string[] {
  return (value ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/æ/g, "ae")
    .replace(/ø/g, "oe")
    .replace(/å/g, "aa")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function fromStripe(p: Stripe.Product): ShopProduct | null {
  const price = typeof p.default_price === "object" && p.default_price ? p.default_price : null;
  if (!price || !price.active || price.unit_amount == null || price.currency !== "dkk") return null;
  const m = p.metadata ?? {};
  const category = m.category && isCategory(m.category.toLowerCase()) ? (m.category.toLowerCase() as ProductCategory) : "andet";
  const localImage = m.image && m.image.startsWith("/") ? m.image : undefined;
  const sort = m.sort ? Number(m.sort) : undefined;
  return {
    id: p.id,
    slug: m.slug || slugify(p.name),
    name: p.name,
    description: m.description || p.description || "",
    priceOere: price.unit_amount,
    image: localImage ?? p.images[0],
    category,
    days: splitList(m.days).map((d) => d.toLowerCase()).filter(isWeekday),
    allergens: splitList(m.allergens),
    active: p.active,
    stripePriceId: price.id,
    stripeProductId: p.id,
    sort: sort !== undefined && Number.isFinite(sort) ? sort : undefined,
  };
}

async function loadFromStripe(): Promise<ShopProduct[] | null> {
  const stripe = getStripe();
  if (!stripe) return null;
  const products: ShopProduct[] = [];
  for await (const p of stripe.products.list({ active: true, limit: 100, expand: ["data.default_price"] })) {
    const mapped = fromStripe(p);
    if (mapped) products.push(mapped);
  }
  return products;
}

function sortProducts(products: ShopProduct[]): ShopProduct[] {
  return products
    .filter((p) => p.active)
    .slice()
    .sort((a, b) => {
      const c = CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category);
      if (c !== 0) return c;
      return (a.sort ?? Number.MAX_SAFE_INTEGER) - (b.sort ?? Number.MAX_SAFE_INTEGER);
    });
}

/** Active products for the shop, deduplicated per request. */
export const getShopProducts = cache(async (): Promise<ShopProduct[]> => {
  if (isStripeConfigured()) {
    try {
      const fromStripeList = await loadFromStripe();
      if (fromStripeList && fromStripeList.length > 0) return sortProducts(fromStripeList);
    } catch (err) {
      console.error("[shop] Stripe products failed, falling back to content/products.json", err);
    }
  }
  return sortProducts(await getProducts());
});

export interface ProductGroup {
  category: ProductCategory;
  label: string;
  slug: string;
  products: ShopProduct[];
}

/** Non-empty categories in display order. */
export function groupByCategory(products: ShopProduct[]): ProductGroup[] {
  const groups: ProductGroup[] = [];
  for (const category of CATEGORY_ORDER) {
    const inCategory = products.filter((p) => p.category === category);
    if (inCategory.length === 0) continue;
    groups.push({ category, label: CATEGORY_LABELS[category], slug: CATEGORY_SLUGS[category], products: inCategory });
  }
  return groups;
}

const photoAlts: Record<string, { alt: string }> = imagesJson.photos;

/** Danish alt text from content/images.json, falling back to the product name. */
export function productImageAlt(product: Pick<ShopProduct, "image" | "name">): string {
  if (!product.image) return product.name;
  return photoAlts[product.image]?.alt ?? product.name;
}

/** "Indeholder gluten, sesam", or null. */
export function allergensLabel(allergens: string[] | undefined): string | null {
  if (!allergens || allergens.length === 0) return null;
  return `Indeholder ${allergens.join(", ")}`;
}
