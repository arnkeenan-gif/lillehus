/**
 * The JSON side of the façade: builds every façade shape from the files in
 * /content. Used when NEXT_PUBLIC_SANITY_PROJECT_ID is not set, and as the
 * safety net when Sanity has no document for something.
 */
import siteJson from "@content/site.json";
import shopJson from "@content/shop.json";
import pizzaJson from "@content/pizza.json";
import productsJson from "@content/products.json";
import cakesJson from "@content/cakes.json";
import eventsJson from "@content/events.json";
import faqJson from "@content/faq.json";
import imagesJson from "@content/images.json";
import forsideImages from "@content/pages/forside.json";
import type { Product as BaseProduct, CakeType as BaseCakeType, EventItem as BaseEventItem } from "@/lib/content";
import { toPortableText } from "./blocks";
import { FALLBACK_PAGES } from "./fallback-pages";
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
  ShopSettings,
  SiteSettings,
  Weekday,
} from "./types";

type PhotoMeta = { alt: string; w: number; h: number };
const photos = imagesJson.photos as Record<string, PhotoMeta | undefined>;

/** A picture under /public with the alt text and size from content/images.json. */
export function fallbackImage(path: string | null | undefined, alt?: string): CmsImage | undefined {
  if (typeof path !== "string" || path.trim() === "") return undefined;
  const meta = photos[path];
  return {
    src: path,
    alt: alt ?? meta?.alt ?? "",
    width: meta?.w,
    height: meta?.h,
  };
}

/** Image values in the fallback JSON: a path, or { src, alt } to override the alt text. */
function imageFromRaw(value: unknown, fallbackAlt?: string): CmsImage | undefined {
  if (typeof value === "string") return fallbackImage(value, fallbackAlt);
  if (value && typeof value === "object" && "src" in value) {
    const v = value as { src?: unknown; alt?: unknown; hotspot?: { x?: unknown; y?: unknown } };
    const image = fallbackImage(typeof v.src === "string" ? v.src : undefined, typeof v.alt === "string" ? v.alt : fallbackAlt);
    if (image && v.hotspot && typeof v.hotspot.x === "number" && typeof v.hotspot.y === "number") {
      return { ...image, hotspot: { x: v.hotspot.x, y: v.hotspot.y } };
    }
    return image;
  }
  return undefined;
}

/** FAQ ids are positional: faq-01, faq-02, ... in the order of content/faq.json. */
export function faqId(index: number): string {
  return `faq-${String(index + 1).padStart(2, "0")}`;
}

export function fallbackSiteSettings(): SiteSettings {
  return {
    name: siteJson.name,
    shortName: siteJson.shortName,
    tagline: siteJson.tagline,
    owner: siteJson.owner,
    founded: siteJson.founded,
    cvr: siteJson.cvr,
    address: { ...siteJson.address },
    phone: siteJson.phone,
    phoneHref: siteJson.phoneHref,
    email: siteJson.email,
    url: siteJson.url,
    social: { ...siteJson.social },
    smileyUrl: siteJson.smileyUrl,
    logo: fallbackImage("/images/logo.png"),
    announcement: { enabled: false, text: "" },
    footerText: undefined,
    orderEmailTo: siteJson.orderEmailTo,
  };
}

export function fallbackLocations(): Location[] {
  return siteJson.locations.map((loc) => ({
    id: loc.id,
    name: loc.name,
    subtitle: loc.subtitle,
    address: loc.address,
    mapsUrl: loc.mapsUrl,
    hours: loc.hours.map((h) => ({ days: h.days, time: h.time, note: h.note || undefined })),
    pickup: loc.pickup,
    notes: loc.notes || undefined,
  }));
}

export function fallbackShopSettings(): ShopSettings {
  return {
    pickupDays: shopJson.pickupDays as Weekday[],
    pickupWindow: shopJson.pickupWindow,
    pickupPlace: shopJson.pickupPlace,
    cutoffHour: shopJson.cutoffHour,
    cutoffDaysBefore: shopJson.cutoffDaysBefore,
    maxDaysAhead: shopJson.maxDaysAhead,
    minOrderOere: shopJson.minOrderOere,
    delivery: { ...shopJson.delivery, days: shopJson.delivery.days as Weekday[] },
    closedDates: shopJson.closedDates as string[],
    notice: shopJson.notice,
  };
}

export function fallbackPizzaSettings(): PizzaSettings {
  return {
    intro: pizzaJson.intro,
    packages: pizzaJson.packages.map((p) => ({ ...p, includes: [...p.includes] })),
    radiusKm: pizzaJson.radiusKm,
    areaNote: pizzaJson.areaNote,
    notes: [...pizzaJson.notes],
    prices: { ...pizzaJson.prices },
    day: [...pizzaJson.day],
    pizzas: pizzaJson.pizzas.map((p) => ({ name: p.name, vegetarian: "vegetarian" in p ? Boolean(p.vegetarian) : undefined })),
    desserts: [...pizzaJson.desserts],
    terms: [...pizzaJson.terms],
  };
}

function toProduct(p: BaseProduct, index: number): Product {
  return {
    ...p,
    image: p.image || undefined,
    photo: fallbackImage(p.image, p.name),
    sort: (index + 1) * 10,
  };
}

/** Every product in content/products.json, active or not, in file order. */
export function fallbackAllProducts(): Product[] {
  return (productsJson as BaseProduct[]).map(toProduct);
}

export function fallbackProducts(): Product[] {
  return fallbackAllProducts().filter((p) => p.active);
}

export function fallbackCakes(): CakeType[] {
  return (cakesJson as (BaseCakeType & { priceNote?: string })[]).map((c, index) => ({
    ...c,
    image: c.image || undefined,
    photo: fallbackImage(c.image, c.name),
    sort: (index + 1) * 10,
  }));
}

/** All events, oldest first. The façade filters out past ones. */
export function fallbackEvents(): EventItem[] {
  return (eventsJson as BaseEventItem[])
    .map((e) => ({ ...e, image: e.image || undefined, photo: fallbackImage(e.image, e.title) }))
    .sort((a, b) => a.start.localeCompare(b.start));
}

export function fallbackFaq(): FaqItem[] {
  return (faqJson as { q: string; a: string; group?: string }[]).map((item, index) => ({
    id: faqId(index),
    q: item.q,
    a: item.a,
    group: item.group ?? "Andet",
    sort: (index + 1) * 10,
    answer: toPortableText(item.a, `${faqId(index)}-`),
  }));
}

export function fallbackInstagram(): InstagramImage[] {
  return forsideImages.instagram
    .map((entry, index): InstagramImage | null => {
      const image = fallbackImage(entry.src);
      if (!image) return null;
      const y = entry.position === "top" ? 0.25 : entry.position === "bottom" ? 0.75 : 0.5;
      return {
        id: `instagram-${entry.src.split("/").pop()?.replace(/\.[a-z0-9]+$/i, "") ?? index}`,
        image: { ...image, hotspot: { x: 0.5, y } },
        url: siteJson.social.instagram,
        sort: (index + 1) * 10,
      };
    })
    .filter((i): i is InstagramImage => i !== null);
}

const sectionContext: SectionContext = {
  image: imageFromRaw,
  product: (value) => (typeof value === "string" ? fallbackAllProducts().find((p) => p.slug === value) : undefined),
  faq: (value) => (typeof value === "string" ? fallbackFaq().find((f) => f.id === value) : undefined),
};

function summary(slug: string): PageSummary {
  const raw = FALLBACK_PAGES[slug];
  return {
    id: `page-${slug}`,
    title: raw.title,
    slug,
    showInNav: raw.showInNav ?? false,
    navLabel: raw.navLabel || undefined,
    navOrder: raw.navOrder ?? 100,
    hidden: raw.hidden ?? false,
  };
}

export function fallbackPages(): PageSummary[] {
  return Object.keys(FALLBACK_PAGES)
    .map(summary)
    .sort((a, b) => a.navOrder - b.navOrder || a.title.localeCompare(b.title, "da"));
}

export function fallbackPage(slug: string): Page | null {
  const raw = FALLBACK_PAGES[slug];
  if (!raw) return null;
  return {
    ...summary(slug),
    seo: {
      title: raw.seo?.title,
      description: raw.seo?.description,
      image: fallbackImage(raw.seo?.image),
    },
    sections: buildSections(raw.sections, sectionContext),
  };
}
