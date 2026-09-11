import { cache } from "react";
import type Stripe from "stripe";
import imagesJson from "@content/images.json";
import {
  getProducts,
  getShopSettings,
  type CmsImage,
  type Product,
  type ProductCategory,
  type ShopSettings,
  type Weekday,
} from "@/lib/cms";
import { getStripe, isStripeConfigured } from "@/lib/stripe";
import { WEEKDAY_ORDER } from "@/lib/cart-pickup";

/*
  Server-only product access for the shop. With STRIPE_SECRET_KEY set, active
  Stripe products (with their default price) are the catalogue and the
  metadata keys slug, category, days, allergens, description, image and sort
  fill in the rest; a product that also exists in the CMS lends its photo
  (with Kristine's hotspot and blur preview) and its description. Without a
  key, or if Stripe fails, the catalogue is getProducts() from the CMS façade:
  Sanity when it is configured, otherwise content/products.json. Either way
  the result is the Product shape from src/lib/cms.

  The shop settings (pickup days, window, cutoff, delivery, notice) come from
  getShopSettings() through the same façade; use getShop() here.
*/

export interface ShopProduct extends Product {
  stripeProductId?: string;
}

/** Pickup and delivery settings, deduplicated per request. */
export const getShop = cache((): Promise<ShopSettings> => getShopSettings());

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

type PhotoMeta = { alt: string; w: number; h: number };
const photos = imagesJson.photos as Record<string, PhotoMeta | undefined>;

/** A CmsImage for a Stripe product picture; alt text and size come from content/images.json when the path is local. */
function photoFor(src: string | undefined, name: string): CmsImage | undefined {
  if (!src) return undefined;
  const meta = photos[src];
  return { src, alt: meta?.alt ?? name, width: meta?.w, height: meta?.h };
}

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
  const image = localImage ?? p.images[0];
  const sort = m.sort ? Number(m.sort) : undefined;
  return {
    id: p.id,
    slug: m.slug || slugify(p.name),
    name: p.name,
    description: m.description || p.description || "",
    priceOere: price.unit_amount,
    image,
    photo: photoFor(image, p.name),
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

/** Stripe carries the prices; the CMS carries the pictures and the words. Same slug = same product. */
function withCmsDetails(stripeProducts: ShopProduct[], cms: Product[]): ShopProduct[] {
  const bySlug = new Map(cms.map((p) => [p.slug, p]));
  return stripeProducts.map((p) => {
    const c = bySlug.get(p.slug);
    if (!c) return p;
    return {
      ...p,
      photo: c.photo ?? p.photo,
      image: c.photo?.src ?? p.image,
      description: p.description || c.description,
      sort: p.sort ?? c.sort,
    };
  });
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
      const stripeProducts = await loadFromStripe();
      if (stripeProducts && stripeProducts.length > 0) {
        return sortProducts(withCmsDetails(stripeProducts, await getProducts()));
      }
    } catch (err) {
      console.error("[shop] Stripe products failed, falling back to the CMS catalogue", err);
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

/** "Indeholder gluten, sesam", or null. */
export function allergensLabel(allergens: string[] | undefined): string | null {
  if (!allergens || allergens.length === 0) return null;
  return `Indeholder ${allergens.join(", ")}`;
}
