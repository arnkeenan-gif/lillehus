/**
 * The CMS façade. Pages call these and get the same shapes whether the
 * content lives in Sanity (NEXT_PUBLIC_SANITY_PROJECT_ID set) or in the JSON
 * files in /content. Sanity answers are cached for a minute and refreshed
 * early by the webhook in src/app/api/revalidate/route.ts.
 *
 *   import { getPage, getProducts } from "@/lib/cms";
 *
 * When Sanity has no document for something (a page that was never seeded,
 * a settings document that is missing), the JSON version is used for that
 * one thing, with a warning in the server log. Lists (products, cakes,
 * events, FAQ, Instagram) are always taken from Sanity when it is configured.
 */
import { isSanityConfigured } from "@/sanity/env";
import {
  fallbackCakes,
  fallbackEvents,
  fallbackFaq,
  fallbackInstagram,
  fallbackLocations,
  fallbackPage,
  fallbackPages,
  fallbackPizzaSettings,
  fallbackProducts,
  fallbackShopSettings,
  fallbackSiteSettings,
} from "./fallback";
import {
  sanityCakes,
  sanityEvents,
  sanityFaq,
  sanityInstagram,
  sanityLocations,
  sanityPage,
  sanityPages,
  sanityPizzaSettings,
  sanityProducts,
  sanityShopSettings,
  sanitySiteSettings,
} from "./sanity";
import type {
  CakeType,
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
} from "./types";

export type * from "./types";
export { SECTION_TYPES } from "./types";
export { RichText } from "./portable-text";
export { plainText, toPortableText } from "./blocks";

/** Where the content comes from right now. */
export const cmsSource: "sanity" | "json" = isSanityConfigured ? "sanity" : "json";

async function fromSanity<T>(what: string, load: () => Promise<T | null>, fallback: () => T): Promise<T> {
  if (!isSanityConfigured) return fallback();
  try {
    const value = await load();
    if (value !== null && value !== undefined) return value;
    console.warn(`[cms] ${what}: findes ikke i Sanity endnu, bruger content/. Kør npm run seed:sanity.`);
  } catch (error) {
    console.error(`[cms] ${what}: Sanity svarede ikke, bruger content/.`, error);
  }
  return fallback();
}

export function getSiteSettings(): Promise<SiteSettings> {
  return fromSanity("siteSettings", sanitySiteSettings, fallbackSiteSettings);
}

/** The places and their opening hours ("Åbningstider og steder" in the Studio). */
export function getLocations(): Promise<Location[]> {
  return fromSanity("hours", sanityLocations, fallbackLocations);
}

export function getShopSettings(): Promise<ShopSettings> {
  return fromSanity("shopSettings", sanityShopSettings, fallbackShopSettings);
}

export function getPizzaSettings(): Promise<PizzaSettings> {
  return fromSanity("pizzaSettings", sanityPizzaSettings, fallbackPizzaSettings);
}

/** Active products, in the order Kristine set. Same contract as getProducts() in src/lib/content.ts. */
export function getProducts(): Promise<Product[]> {
  return fromSanity("products", sanityProducts, fallbackProducts);
}

export async function getProduct(slug: string): Promise<Product | undefined> {
  return (await getProducts()).find((p) => p.slug === slug);
}

export function getCakes(): Promise<CakeType[]> {
  return fromSanity("cakes", sanityCakes, fallbackCakes);
}

/** Upcoming events, soonest first. Pass { upcomingOnly: false } for the archive. */
export async function getEvents({ upcomingOnly = true }: { upcomingOnly?: boolean } = {}): Promise<EventItem[]> {
  const all = (await fromSanity("events", sanityEvents, fallbackEvents)).slice().sort((a, b) => a.start.localeCompare(b.start));
  if (!upcomingOnly) return all;
  const now = Date.now();
  return all.filter((e) => new Date(e.end ?? e.start).getTime() >= now);
}

export function getFaq(): Promise<FaqItem[]> {
  return fromSanity("faq", sanityFaq, fallbackFaq);
}

export function getInstagramImages(): Promise<InstagramImage[]> {
  return fromSanity("instagram", sanityInstagram, fallbackInstagram);
}

/** Every page with its menu settings, sorted by navOrder. */
export function getPages(): Promise<PageSummary[]> {
  return fromSanity("pages", sanityPages, fallbackPages);
}

/** One page with its sections, or null when no page has that slug. The forside has slug "forside". */
export async function getPage(slug: string): Promise<Page | null> {
  if (!isSanityConfigured) return fallbackPage(slug);
  try {
    const page = await sanityPage(slug);
    if (page) return page;
    console.warn(`[cms] page "${slug}": findes ikke i Sanity, bruger content/ hvis den findes der.`);
  } catch (error) {
    console.error(`[cms] page "${slug}": Sanity svarede ikke, bruger content/.`, error);
  }
  return fallbackPage(slug);
}

/** Menu items from the pages Kristine marked "Vis i menuen", in her order. */
export async function getNavigation(): Promise<{ href: string; label: string }[]> {
  const pages = await getPages();
  return pages
    .filter((p) => p.showInNav && !p.hidden)
    .sort((a, b) => a.navOrder - b.navOrder)
    .map((p) => ({ href: p.slug === "forside" ? "/" : `/${p.slug}`, label: p.navLabel || p.title }));
}
