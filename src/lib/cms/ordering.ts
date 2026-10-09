/**
 * Ordering façade: products, cakes, shop settings, and (added by the
 * ordering lane) categories, pickup locations, dates and deadlines.
 * Owned by the ordering lane; see CLAUDE.md.
 */
import { fromSanity } from "./from-sanity";
import { fallbackCakes, fallbackProducts, fallbackShopSettings } from "./fallback";
import { sanityCakes, sanityProducts, sanityShopSettings } from "./sanity";
import type { CakeType, Product, ShopSettings } from "./types";
import type { OrderingSettings, PickupDate, PickupLocation } from "./ordering-types";
import pickupJson from "@content/ordering/pickup-locations.json";

export type * from "./ordering-types";

export function getShopSettings(): Promise<ShopSettings> {
  return fromSanity("shopSettings", sanityShopSettings, fallbackShopSettings);
}

/** Active products, in the order Kristine set. */
export function getProducts(): Promise<Product[]> {
  return fromSanity("products", sanityProducts, fallbackProducts);
}

export async function getProduct(slug: string): Promise<Product | undefined> {
  return (await getProducts()).find((p) => p.slug === slug);
}

export function getCakes(): Promise<CakeType[]> {
  return fromSanity("cakes", sanityCakes, fallbackCakes);
}

/**
 * Contract for the content lane (stable signature; the ordering lane fills
 * in Sanity, closed dates and the Studio action behind it). Without Sanity:
 * the locations in content/ordering/pickup-locations.json, and on active
 * locations the next weeks' Wednesdays and Saturdays as open dates.
 */
export async function getPickupLocations({ includeInactive = false }: { includeInactive?: boolean } = {}): Promise<PickupLocation[]> {
  const today = copenhagenToday();
  const generated = generateDates(today, pickupJson.fallbackWeekdays, pickupJson.fallbackWeeksAhead);
  return pickupJson.locations
    .filter((l) => includeInactive || l.active)
    .map((l) => ({
      ...l,
      dates: (l.dates.length ? (l.dates as PickupDate[]) : l.active ? generated : [])
        .filter((d) => !d.closed && d.date >= today)
        .sort((a, b) => a.date.localeCompare(b.date)),
    }))
    .sort((a, b) => a.sort - b.sort);
}

export async function getOrderingSettings(): Promise<OrderingSettings> {
  return { defaultDeadline: pickupJson.defaultDeadline };
}

/** Today's date in Denmark as "YYYY-MM-DD". */
function copenhagenToday(): string {
  return new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Copenhagen" }).format(new Date());
}

/** The given weekdays (0 = Sunday) from today on, for `weeks` weeks. */
function generateDates(today: string, weekdays: number[], weeks: number): PickupDate[] {
  const out: PickupDate[] = [];
  const start = new Date(`${today}T12:00:00Z`);
  for (let i = 0; i < weeks * 7; i++) {
    const d = new Date(start.getTime() + i * 86_400_000);
    if (weekdays.includes(d.getUTCDay())) out.push({ date: d.toISOString().slice(0, 10) });
  }
  return out;
}
