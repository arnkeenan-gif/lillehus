/**
 * The Sanity side of the façade: runs the GROQ in src/sanity/lib/queries.ts
 * and maps the answers to the same shapes the JSON fallback produces.
 * Every function returns null when the document does not exist, so the
 * façade can fall back to /content for that one thing.
 */
import { sanityFetch } from "@/sanity/lib/fetch";
import { MAX_IMAGE_WIDTH, urlFor } from "@/sanity/lib/image";
import {
  CAKES_QUERY,
  EVENTS_QUERY,
  FAQ_QUERY,
  HOURS_QUERY,
  INSTAGRAM_QUERY,
  PAGE_QUERY,
  PAGES_QUERY,
  PIZZA_SETTINGS_QUERY,
  PRODUCTS_QUERY,
  SHOP_SETTINGS_QUERY,
  SITE_SETTINGS_QUERY,
} from "@/sanity/lib/queries";
import { isPortableText, plainText } from "./blocks";
import { buildSections, type SectionContext } from "./sections";
import type {
  CakeType,
  CmsImage,
  EventItem,
  FaqItem,
  InstagramImage,
  Location,
  Page,
  PageSummary,
  PizzaSettings,
  Product,
  ProductCategory,
  ShopSettings,
  SiteSettings,
  Weekday,
} from "./types";

type Raw = Record<string, unknown>;

interface SanityImage {
  alt?: string | null;
  hotspot?: { x: number; y: number; width: number; height: number } | null;
  crop?: { top: number; bottom: number; left: number; right: number } | null;
  asset?: {
    _id: string;
    url: string;
    metadata?: { lqip?: string | null; dimensions?: { width: number; height: number } | null } | null;
  } | null;
}

/**
 * A Sanity image field to a CmsImage: CDN URL with Kristine's crop applied,
 * capped at MAX_IMAGE_WIDTH, auto format, plus the size and blur placeholder.
 */
export function mapImage(value: unknown, fallbackAlt = ""): CmsImage | undefined {
  const img = value as SanityImage | null | undefined;
  if (!img?.asset?._id) return undefined;

  const dims = img.asset.metadata?.dimensions ?? undefined;
  const crop = img.crop ?? undefined;
  const hasCrop = Boolean(crop && (crop.top || crop.bottom || crop.left || crop.right));

  let width = dims?.width;
  let height = dims?.height;
  let builder = urlFor(img.asset._id).auto("format").fit("max");

  if (dims && crop && hasCrop) {
    const left = Math.round(dims.width * crop.left);
    const top = Math.round(dims.height * crop.top);
    width = Math.max(1, Math.round(dims.width * (1 - crop.left - crop.right)));
    height = Math.max(1, Math.round(dims.height * (1 - crop.top - crop.bottom)));
    builder = builder.rect(left, top, width, height);
  }

  if (width && height && width > MAX_IMAGE_WIDTH) {
    height = Math.round((height * MAX_IMAGE_WIDTH) / width);
    width = MAX_IMAGE_WIDTH;
  }
  builder = builder.width(width ?? MAX_IMAGE_WIDTH);

  let hotspot: CmsImage["hotspot"];
  if (img.hotspot) {
    // Hotspot coordinates are relative to the whole picture; express them relative to the crop.
    const l = hasCrop && crop ? crop.left : 0;
    const t = hasCrop && crop ? crop.top : 0;
    const w = hasCrop && crop ? 1 - crop.left - crop.right : 1;
    const h = hasCrop && crop ? 1 - crop.top - crop.bottom : 1;
    hotspot = {
      x: clamp((img.hotspot.x - l) / (w || 1)),
      y: clamp((img.hotspot.y - t) / (h || 1)),
    };
  }

  return {
    src: builder.url(),
    alt: img.alt?.trim() || fallbackAlt,
    width,
    height,
    lqip: img.asset.metadata?.lqip ?? undefined,
    hotspot,
  };
}

function clamp(n: number): number {
  return Math.min(1, Math.max(0, Number.isFinite(n) ? n : 0.5));
}

function s(o: Raw, key: string, fallback = ""): string {
  const v = o[key];
  return typeof v === "string" ? v : fallback;
}

function opt(o: Raw, key: string): string | undefined {
  const v = o[key];
  return typeof v === "string" && v.trim() !== "" ? v : undefined;
}

function n(o: Raw, key: string, fallback: number): number {
  const v = o[key];
  return typeof v === "number" && Number.isFinite(v) ? v : fallback;
}

function optNum(o: Raw, key: string): number | undefined {
  const v = o[key];
  return typeof v === "number" && Number.isFinite(v) ? v : undefined;
}

function b(o: Raw, key: string, fallback: boolean): boolean {
  const v = o[key];
  return typeof v === "boolean" ? v : fallback;
}

function strings(o: Raw, key: string): string[] {
  const v = o[key];
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
}

function obj(o: Raw, key: string): Raw {
  const v = o[key];
  return v && typeof v === "object" ? (v as Raw) : {};
}

/** "22 59 44 93" gives "+4522594493". */
export function phoneHref(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 8) return `+45${digits}`;
  if (digits.length > 8) return `+${digits}`;
  return phone;
}

/* ------------------------------------------------------------------ */
/* Mappers                                                             */
/* ------------------------------------------------------------------ */

function mapProduct(value: unknown): Product | undefined {
  const raw = value as Raw | null;
  if (!raw || typeof raw !== "object") return undefined;
  const slug = opt(raw, "slug");
  const name = opt(raw, "name");
  if (!slug || !name) return undefined;
  const photo = mapImage(raw.image, name);
  return {
    id: slug,
    slug,
    name,
    description: s(raw, "description"),
    priceOere: n(raw, "priceOere", 0),
    image: photo?.src,
    photo,
    category: (opt(raw, "category") ?? "andet") as ProductCategory,
    days: strings(raw, "days") as Weekday[],
    allergens: strings(raw, "allergens"),
    active: b(raw, "active", true),
    stripePriceId: opt(raw, "stripePriceId"),
    sort: optNum(raw, "sort"),
  };
}

function mapCake(value: unknown): CakeType | undefined {
  const raw = value as Raw | null;
  if (!raw || typeof raw !== "object") return undefined;
  const slug = opt(raw, "slug");
  const name = opt(raw, "name");
  if (!slug || !name) return undefined;
  const photo = mapImage(raw.image, name);
  return {
    id: slug,
    slug,
    name,
    description: s(raw, "description"),
    fromPriceOere: n(raw, "fromPriceOere", 0),
    priceNote: opt(raw, "priceNote"),
    servings: s(raw, "servings"),
    leadTimeDays: n(raw, "leadTimeDays", 5),
    image: photo?.src,
    photo,
    options: strings(raw, "options"),
    sort: optNum(raw, "sort"),
  };
}

function mapEvent(value: unknown): EventItem | undefined {
  const raw = value as Raw | null;
  if (!raw || typeof raw !== "object") return undefined;
  const slug = opt(raw, "slug");
  const title = opt(raw, "title");
  const start = opt(raw, "start");
  if (!slug || !title || !start) return undefined;
  const photo = mapImage(raw.image, title);
  return {
    id: slug,
    slug,
    title,
    start,
    end: opt(raw, "end"),
    place: s(raw, "place"),
    description: s(raw, "description"),
    priceOere: optNum(raw, "priceOere"),
    signup: b(raw, "signup", false),
    capacity: optNum(raw, "capacity"),
    image: photo?.src,
    photo,
    kind: s(raw, "kind", "arrangement"),
  };
}

function mapFaq(value: unknown): FaqItem | undefined {
  const raw = value as Raw | null;
  if (!raw || typeof raw !== "object") return undefined;
  const question = opt(raw, "question");
  const id = opt(raw, "_id");
  if (!question || !id) return undefined;
  const answer = isPortableText(raw.answer) ? raw.answer : [];
  return {
    id,
    q: question,
    a: plainText(answer),
    answer,
    group: s(raw, "group", "Andet"),
    sort: n(raw, "sort", 100),
  };
}

const sectionContext: SectionContext = {
  image: (value, fallbackAlt) => mapImage(value, fallbackAlt),
  product: mapProduct,
  faq: mapFaq,
};

/* ------------------------------------------------------------------ */
/* Loaders                                                             */
/* ------------------------------------------------------------------ */

export async function sanitySiteSettings(): Promise<SiteSettings | null> {
  const raw = await sanityFetch<Raw | null>({ query: SITE_SETTINGS_QUERY, tags: ["siteSettings"] });
  if (!raw) return null;
  const address = obj(raw, "address");
  const social = obj(raw, "social");
  const announcement = obj(raw, "announcement");
  const phone = s(raw, "phone");
  return {
    name: s(raw, "name"),
    shortName: s(raw, "shortName") || s(raw, "name"),
    tagline: s(raw, "tagline"),
    owner: s(raw, "owner"),
    founded: optNum(raw, "founded"),
    cvr: s(raw, "cvr"),
    address: {
      street: s(address, "street"),
      postalCode: s(address, "postalCode"),
      city: s(address, "city"),
      country: s(address, "country", "Danmark"),
    },
    phone,
    phoneHref: phoneHref(phone),
    email: s(raw, "email"),
    url: s(raw, "url"),
    social: {
      facebook: opt(social, "facebook"),
      instagram: opt(social, "instagram"),
      instagramHandle: opt(social, "instagramHandle"),
      pinterest: opt(social, "pinterest"),
      linktree: opt(social, "linktree"),
    },
    smileyUrl: opt(raw, "smileyUrl"),
    logo: mapImage(raw.logo, `${s(raw, "name")}, logo`),
    announcement: { enabled: b(announcement, "enabled", false), text: s(announcement, "text") },
    footerText: opt(raw, "footerText"),
    orderEmailTo: s(raw, "orderEmailTo") || s(raw, "email"),
  };
}

export async function sanityLocations(): Promise<Location[] | null> {
  const raw = await sanityFetch<{ locations?: Raw[] | null } | null>({ query: HOURS_QUERY, tags: ["hours"] });
  if (!raw?.locations) return null;
  const locations = raw.locations
    .map((loc): Location | null => {
      const id = opt(loc, "id");
      const name = opt(loc, "name");
      if (!id || !name) return null;
      const hours = Array.isArray(loc.hours) ? (loc.hours as Raw[]) : [];
      return {
        id,
        name,
        subtitle: opt(loc, "subtitle"),
        address: s(loc, "address"),
        mapsUrl: opt(loc, "mapsUrl"),
        hours: hours
          .filter((h) => opt(h, "days") && opt(h, "time"))
          .map((h) => ({ days: s(h, "days"), time: s(h, "time"), note: opt(h, "note") })),
        pickup: b(loc, "pickup", false),
        notes: opt(loc, "notes"),
      };
    })
    .filter((l): l is Location => l !== null);
  return locations.length > 0 ? locations : null;
}

export async function sanityShopSettings(): Promise<ShopSettings | null> {
  const raw = await sanityFetch<Raw | null>({ query: SHOP_SETTINGS_QUERY, tags: ["shopSettings"] });
  if (!raw) return null;
  const delivery = obj(raw, "delivery");
  return {
    pickupDays: strings(raw, "pickupDays") as Weekday[],
    pickupWindow: s(raw, "pickupWindow"),
    pickupPlace: s(raw, "pickupPlace"),
    cutoffHour: n(raw, "cutoffHour", 18),
    cutoffDaysBefore: n(raw, "cutoffDaysBefore", 1),
    maxDaysAhead: n(raw, "maxDaysAhead", 14),
    minOrderOere: n(raw, "minOrderOere", 0),
    delivery: {
      enabled: b(delivery, "enabled", false),
      feeOere: n(delivery, "feeOere", 0),
      freeAboveOere: n(delivery, "freeAboveOere", 0),
      radiusKm: n(delivery, "radiusKm", 0),
      days: strings(delivery, "days") as Weekday[],
      note: s(delivery, "note"),
    },
    closedDates: strings(raw, "closedDates"),
    notice: s(raw, "notice"),
  };
}

export async function sanityPizzaSettings(): Promise<PizzaSettings | null> {
  const raw = await sanityFetch<Raw | null>({ query: PIZZA_SETTINGS_QUERY, tags: ["pizzaSettings"] });
  if (!raw) return null;
  const prices = obj(raw, "prices");
  const packages = (Array.isArray(raw.packages) ? (raw.packages as Raw[]) : []).map((p) => ({
    id: s(p, "id") || s(p, "_key"),
    name: s(p, "name"),
    description: s(p, "description"),
    pricePerPersonOere: optNum(p, "pricePerPersonOere"),
    minGuests: n(p, "minGuests", 40),
    includes: strings(p, "includes"),
  }));
  const pizzas = (Array.isArray(raw.pizzas) ? (raw.pizzas as Raw[]) : [])
    .filter((p) => opt(p, "name"))
    .map((p) => ({ name: s(p, "name"), vegetarian: b(p, "vegetarian", false) || undefined }));
  return {
    intro: s(raw, "intro"),
    packages,
    radiusKm: n(raw, "radiusKm", 40),
    areaNote: s(raw, "areaNote"),
    notes: strings(raw, "notes"),
    prices: {
      childOere: n(prices, "childOere", 0),
      childAges: s(prices, "childAges"),
      specialDietExtraOere: n(prices, "specialDietExtraOere", 0),
      dessertOere: n(prices, "dessertOere", 0),
      dessertMinCovers: n(prices, "dessertMinCovers", 12),
      mileagePerKmOere: n(prices, "mileagePerKmOere", 0),
      mileageNote: s(prices, "mileageNote"),
    },
    day: strings(raw, "day"),
    pizzas,
    desserts: strings(raw, "desserts"),
    terms: strings(raw, "terms"),
  };
}

export async function sanityProducts(): Promise<Product[]> {
  const raw = await sanityFetch<unknown[] | null>({ query: PRODUCTS_QUERY, tags: ["product"] });
  return (raw ?? []).map(mapProduct).filter((p): p is Product => Boolean(p));
}

export async function sanityCakes(): Promise<CakeType[]> {
  const raw = await sanityFetch<unknown[] | null>({ query: CAKES_QUERY, tags: ["cake"] });
  return (raw ?? []).map(mapCake).filter((c): c is CakeType => Boolean(c));
}

export async function sanityEvents(): Promise<EventItem[]> {
  const raw = await sanityFetch<unknown[] | null>({ query: EVENTS_QUERY, tags: ["event"] });
  return (raw ?? []).map(mapEvent).filter((e): e is EventItem => Boolean(e));
}

export async function sanityFaq(): Promise<FaqItem[]> {
  const raw = await sanityFetch<unknown[] | null>({ query: FAQ_QUERY, tags: ["faqItem"] });
  return (raw ?? []).map(mapFaq).filter((f): f is FaqItem => Boolean(f));
}

export async function sanityInstagram(): Promise<InstagramImage[]> {
  const raw = await sanityFetch<Raw[] | null>({ query: INSTAGRAM_QUERY, tags: ["instagramPost"] });
  return (raw ?? [])
    .map((post): InstagramImage | null => {
      const image = mapImage(post.image, "Fra Instagram");
      const id = opt(post, "_id");
      if (!image || !id) return null;
      return { id, image, url: opt(post, "url"), sort: n(post, "sort", 100) };
    })
    .filter((p): p is InstagramImage => p !== null);
}

export async function sanityPages(): Promise<PageSummary[]> {
  const raw = await sanityFetch<Raw[] | null>({ query: PAGES_QUERY, tags: ["page"] });
  return (raw ?? [])
    .map((p): PageSummary | null => {
      const slug = opt(p, "slug");
      const id = opt(p, "_id");
      if (!slug || !id) return null;
      return {
        id,
        title: s(p, "title", slug),
        slug,
        showInNav: b(p, "showInNav", false),
        navLabel: opt(p, "navLabel"),
        navOrder: n(p, "navOrder", 100),
        hidden: b(p, "hidden", false),
      };
    })
    .filter((p): p is PageSummary => p !== null);
}

export async function sanityPage(slug: string): Promise<Page | null> {
  // A page pulls in products and FAQ entries through references, so it is tagged with those types too.
  const raw = await sanityFetch<Raw | null>({ query: PAGE_QUERY, params: { slug }, tags: ["page", "product", "faqItem"] });
  if (!raw) return null;
  const seo = obj(raw, "seo");
  return {
    id: s(raw, "_id", `page-${slug}`),
    title: s(raw, "title", slug),
    slug,
    showInNav: b(raw, "showInNav", false),
    navLabel: opt(raw, "navLabel"),
    navOrder: n(raw, "navOrder", 100),
    hidden: b(raw, "hidden", false),
    seo: {
      title: opt(seo, "title"),
      description: opt(seo, "description"),
      image: mapImage(seo.image),
    },
    sections: buildSections(raw.sections, sectionContext),
  };
}
