/**
 * The JSON side of the façade: builds every façade shape from the files in
 * /content. Used when NEXT_PUBLIC_SANITY_PROJECT_ID is not set, and as the
 * safety net when Sanity has no document for something.
 */
import siteJson from "@content/site.json";
import pizzaJson from "@content/pizza.json";
import faqJson from "@content/faq.json";
import imagesJson from "@content/images.json";
import forsideImages from "@content/pages/forside.json";
import { plainText, toPortableText } from "./blocks";
import { FALLBACK_PAGES } from "./fallback-pages";
import { buildSections, type SectionContext } from "./sections";
import { fallbackBakeryProducts } from "./ordering-fallback";
import type {
  CmsImage,
  FaqItem,
  InstagramImage,
  Location,
  Page,
  PageSummary,
  PizzaSettings,
  Product,
  SiteSettings,
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
    logoLight: fallbackImage("/images/logo-light.png"),
    announcement: { enabled: false, text: "" },
    footerText: undefined,
    orderEmailTo: siteJson.orderEmailTo,
  };
}

export function fallbackLocations(): Location[] {
  return siteJson.locations.map((loc) => ({
    id: loc.id,
    name: loc.name,
    subtitle: loc.subtitle || undefined,
    address: loc.address,
    mapsUrl: loc.mapsUrl,
    hours: loc.hours.map((h) => ({ days: h.days, time: h.time, note: h.note || undefined })),
    pickup: loc.pickup,
    notes: loc.notes || undefined,
  }));
}

/** A pizza or dessert as content/pizza.json writes it. */
interface RawMenuItem {
  name?: string;
  description?: string;
  image?: string;
  priceOere?: number | null;
  vegetarian?: boolean;
  available?: boolean;
}

interface RawStop {
  place?: string;
  date?: string;
  from?: string;
  to?: string;
  note?: string;
}

/** The photo's own alt text from content/images.json, or the item's name when the photo is not listed there. */
function menuPhoto(path: string | undefined, name: string): CmsImage | undefined {
  const image = fallbackImage(path);
  return image && !image.alt ? { ...image, alt: name } : image;
}

function availableItems(raw: unknown): (RawMenuItem & { name: string })[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item): RawMenuItem => (typeof item === "string" ? { name: item } : ((item ?? {}) as RawMenuItem)))
    .filter((item): item is RawMenuItem & { name: string } => typeof item.name === "string" && item.name.trim() !== "" && item.available !== false);
}

export function fallbackPizzaSettings(): PizzaSettings {
  const schedule = (Array.isArray(pizzaJson.schedule) ? (pizzaJson.schedule as RawStop[]) : [])
    .filter((s): s is RawStop & { place: string; date: string } => Boolean(s.place?.trim() && s.date && /^\d{4}-\d{2}-\d{2}$/.test(s.date)))
    .map((s, i) => ({ _key: `stop-${i}`, place: s.place, date: s.date, from: s.from || undefined, to: s.to || undefined, note: s.note || undefined }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return {
    intro: pizzaJson.intro,
    packages: pizzaJson.packages.map((p) => ({ ...p, includes: [...p.includes] })),
    radiusKm: pizzaJson.radiusKm,
    areaNote: pizzaJson.areaNote,
    notes: [...pizzaJson.notes],
    prices: { ...pizzaJson.prices },
    day: [...pizzaJson.day],
    pizzas: availableItems(pizzaJson.pizzas).map((p) => ({
      name: p.name,
      description: p.description || undefined,
      image: menuPhoto(p.image, p.name),
      priceOere: typeof p.priceOere === "number" ? p.priceOere : undefined,
      vegetarian: p.vegetarian || undefined,
    })),
    desserts: availableItems(pizzaJson.desserts).map((d) => ({
      name: d.name,
      description: d.description || undefined,
      image: menuPhoto(d.image, d.name),
      priceOere: typeof d.priceOere === "number" ? d.priceOere : undefined,
    })),
    schedule,
    terms: [...pizzaJson.terms],
  };
}

/** Shown bakery products in the older Product shape, for product strips that pick products by hand. */
export function fallbackAllProducts(): Product[] {
  return fallbackBakeryProducts().map((p, i) => ({
    id: p.id,
    slug: p.id,
    name: p.name,
    description: p.description ?? "",
    priceOere: p.priceOere,
    image: p.photo?.src,
    photo: p.photo,
    category: "andet",
    days: [],
    allergens: [],
    active: true,
    sort: (i + 1) * 10,
  }));
}

export function fallbackFaq(): FaqItem[] {
  return (faqJson as { q: string; a: string; group?: string }[]).map((item, index) => {
    const answer = toPortableText(item.a, `${faqId(index)}-`);
    // Plain text, as from Sanity: the [link](/adresse) shorthand reads as its words.
    return { id: faqId(index), q: item.q, a: plainText(answer), group: item.group ?? "Andet", sort: (index + 1) * 10, answer };
  });
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
