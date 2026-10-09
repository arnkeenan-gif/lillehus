/**
 * The JSON side of the ordering façade: categories, products, cakes and
 * pickup locations from content/ordering/, the default deadline from
 * content/shop.json. Read defensively, because Kristine (or a developer)
 * edits these files by hand. Owned by the ordering lane.
 */
import categoriesJson from "@content/ordering/categories.json";
import productsJson from "@content/ordering/products.json";
import cakesJson from "@content/ordering/cakes.json";
import pickupJson from "@content/ordering/pickup-locations.json";
import shopJson from "@content/shop.json";
import { toPortableText, type RichTextInput } from "./blocks";
import { fallbackImage } from "./fallback";
import { mapDeadlineValue } from "./ordering-values";
import type { CmsImage } from "./types";
import type {
  BakeryCategory,
  BakeryProduct,
  CakeOptionGroup,
  CakeOptionType,
  CakeProduct,
  OrderingSettings,
  PickupDate,
  PickupLocation,
} from "./ordering-types";

type Raw = Record<string, unknown>;

function rows(value: unknown): Raw[] {
  return Array.isArray(value) ? value.filter((x): x is Raw => Boolean(x) && typeof x === "object") : [];
}

function str(o: Raw, key: string): string | undefined {
  const v = o[key];
  return typeof v === "string" && v.trim() !== "" ? v.trim() : undefined;
}

function num(o: Raw, key: string, fallback: number): number {
  const v = o[key];
  return typeof v === "number" && Number.isFinite(v) ? v : fallback;
}

function bool(o: Raw, key: string, fallback: boolean): boolean {
  const v = o[key];
  return typeof v === "boolean" ? v : fallback;
}

const OPTION_TYPES: CakeOptionType[] = ["dropdown", "radio", "addons", "text"];

export function fallbackBakeryCategories(): BakeryCategory[] {
  return rows((categoriesJson as Raw).categories)
    .map((c): BakeryCategory | null => {
      const id = str(c, "id");
      const title = str(c, "title");
      if (!id || !title) return null;
      return { id, title, description: str(c, "description"), sort: num(c, "sort", 100), deadline: mapDeadlineValue(c.deadline) };
    })
    .filter((c): c is BakeryCategory => c !== null)
    .sort((a, b) => a.sort - b.sort);
}

/** Shown products only (active), in file order within their sort value. */
export function fallbackBakeryProducts(): BakeryProduct[] {
  return rows((productsJson as Raw).products)
    .map((p): BakeryProduct | null => {
      const id = str(p, "id");
      const name = str(p, "name");
      const categoryId = str(p, "category");
      if (!id || !name || !categoryId) return null;
      return {
        id,
        name,
        categoryId,
        description: str(p, "description"),
        priceOere: Math.max(0, Math.round(num(p, "priceOere", 0))),
        photo: fallbackImage(str(p, "image")),
        active: bool(p, "active", true),
        orderable: bool(p, "orderable", true),
        sort: num(p, "sort", 100),
        deadline: mapDeadlineValue(p.deadline),
      };
    })
    .filter((p): p is BakeryProduct => p !== null && p.active)
    .sort((a, b) => a.sort - b.sort);
}

function optionGroup(g: Raw, index: number): CakeOptionGroup | null {
  const title = str(g, "title");
  const type = str(g, "type") as CakeOptionType | undefined;
  if (!title || !type || !OPTION_TYPES.includes(type)) return null;
  const id = str(g, "id") ?? `valg-${index + 1}`;
  const choices =
    type === "text"
      ? []
      : rows(g.choices)
          .map((c, i) => {
            const label = str(c, "label");
            if (!label) return null;
            return {
              id: str(c, "id") ?? `${id}-${i + 1}`,
              label,
              priceOere: Math.max(0, Math.round(num(c, "priceOere", 0))),
              isDefault: bool(c, "default", false),
            };
          })
          .filter((c): c is NonNullable<typeof c> => c !== null);
  if (type !== "text" && choices.length === 0) return null;
  return { id, title, type, required: bool(g, "required", false), helper: str(g, "helper"), choices };
}

/** Shown cakes only (active), sorted. */
export function fallbackCakeProducts(): CakeProduct[] {
  return rows((cakesJson as Raw).cakes)
    .map((c): CakeProduct | null => {
      const id = str(c, "id");
      const name = str(c, "name");
      if (!id || !name) return null;
      const photos = (Array.isArray(c.images) ? c.images : [])
        .map((src) => (typeof src === "string" ? fallbackImage(src, undefined) : undefined))
        .filter((p): p is CmsImage => Boolean(p));
      const min = Math.max(1, Math.round(num(c, "minQuantity", 1)));
      const max = Math.max(min, Math.round(num(c, "maxQuantity", 10)));
      return {
        id,
        name,
        intro: str(c, "intro"),
        photos,
        basePriceOere: Math.max(0, Math.round(num(c, "basePriceOere", 0))),
        optionGroups: rows(c.optionGroups)
          .map(optionGroup)
          .filter((g): g is CakeOptionGroup => g !== null),
        minQuantity: min,
        maxQuantity: max,
        deadline: mapDeadlineValue(c.deadline),
        sections: rows(c.sections)
          .map((s, i) => ({
            id: `${id}-afsnit-${i + 1}`,
            heading: str(s, "heading"),
            body: toPortableText(s.body as RichTextInput, `${id}-${i}-`),
          }))
          .filter((s) => s.heading || s.body.length > 0),
        active: bool(c, "active", true),
        sort: num(c, "sort", 100),
      };
    })
    .filter((c): c is CakeProduct => c !== null && c.active)
    .sort((a, b) => a.sort - b.sort);
}

/** The given weekdays (0 = sunday) from `today` on, for `weeks` weeks, without times. */
function generateDates(today: string, weekdays: number[], weeks: number): PickupDate[] {
  const out: PickupDate[] = [];
  const start = new Date(`${today}T12:00:00Z`);
  for (let i = 0; i < weeks * 7; i++) {
    const d = new Date(start.getTime() + i * 86_400_000);
    if (weekdays.includes(d.getUTCDay())) out.push({ date: d.toISOString().slice(0, 10) });
  }
  return out;
}

/**
 * Every location with every date. An active location without dates gets the
 * fallback weekdays (onsdag and lørdag) for the next weeks, so the shop works
 * before Sanity is set up; Kristine opens the real dates in the Studio.
 */
export function fallbackPickupLocations(today: string): PickupLocation[] {
  const json = pickupJson as Raw;
  const weekdays = Array.isArray(json.fallbackWeekdays) ? json.fallbackWeekdays.filter((d): d is number => typeof d === "number") : [];
  const weeks = num(json, "fallbackWeeksAhead", 4);
  return rows(json.locations)
    .map((l): PickupLocation | null => {
      const id = str(l, "id");
      const name = str(l, "name");
      if (!id || !name) return null;
      const active = bool(l, "active", false);
      const listed = rows(l.dates)
        .map((d): PickupDate | null => {
          const date = str(d, "date");
          if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
          return { date, from: str(d, "from"), to: str(d, "to"), closed: d.closed === true, note: str(d, "note") };
        })
        .filter((d): d is PickupDate => d !== null);
      return {
        id,
        name,
        address: str(l, "address"),
        note: str(l, "note"),
        mapsUrl: str(l, "mapsUrl"),
        active,
        sort: num(l, "sort", 100),
        dates: listed.length > 0 ? listed : active ? generateDates(today, weekdays, weeks) : [],
      };
    })
    .filter((l): l is PickupLocation => l !== null);
}

export function fallbackOrderingSettings(): OrderingSettings {
  const shop = shopJson as Raw;
  return {
    defaultDeadline: mapDeadlineValue(shop.defaultDeadline) ?? { daysBefore: 2, hour: 18 },
    minOrderOere: Math.max(0, Math.round(num(shop, "minOrderOere", 0))),
    notice: str(shop, "notice") ?? "",
  };
}
