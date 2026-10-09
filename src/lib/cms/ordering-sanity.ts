/**
 * The Sanity side of the ordering façade: runs the GROQ in
 * src/sanity/lib/queries-ordering.ts and maps the answers to the same shapes
 * as src/lib/cms/ordering-fallback.ts. Lists come back empty (not null) when
 * Kristine has none, so an empty Studio really means "nothing to order";
 * the settings come back null when the document is missing, so the façade
 * can use the JSON instead. Owned by the ordering lane.
 */
import { getClient } from "@/sanity/lib/client";
import { REVALIDATE_SECONDS } from "@/sanity/lib/fetch";
import {
  ORDERING_CAKES_QUERY,
  ORDERING_CATEGORIES_QUERY,
  ORDERING_LOCATIONS_QUERY,
  ORDERING_PRODUCTS_QUERY,
  ORDERING_SETTINGS_QUERY,
} from "@/sanity/lib/queries-ordering";
import { isPortableText } from "./blocks";
import { mapDeadlineValue as mapDeadline } from "./ordering-values";
import { mapImage } from "./sanity";
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

/** Cache tags are the document types, so the webhook in /api/revalidate clears exactly these. */
type OrderingTag = "productCategory" | "product" | "cake" | "pickupLocation" | "shopSettings";

async function orderingFetch<T>(query: string, tags: OrderingTag[]): Promise<T> {
  return getClient().fetch<T>(query, {}, { next: { revalidate: REVALIDATE_SECONDS, tags } });
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

function list(o: Raw, key: string): Raw[] {
  const v = o[key];
  return Array.isArray(v) ? v.filter((x): x is Raw => Boolean(x) && typeof x === "object") : [];
}

const OPTION_TYPES: CakeOptionType[] = ["dropdown", "radio", "addons", "text"];

export async function sanityBakeryCategories(): Promise<BakeryCategory[]> {
  const raw = await orderingFetch<Raw[] | null>(ORDERING_CATEGORIES_QUERY, ["productCategory"]);
  return (raw ?? [])
    .map((c): BakeryCategory | null => {
      const id = str(c, "slug");
      const title = str(c, "title");
      if (!id || !title) return null;
      return { id, title, description: str(c, "description"), sort: num(c, "sort", 100), deadline: mapDeadline(c.deadline) };
    })
    .filter((c): c is BakeryCategory => c !== null);
}

export async function sanityBakeryProducts(): Promise<BakeryProduct[]> {
  const raw = await orderingFetch<Raw[] | null>(ORDERING_PRODUCTS_QUERY, ["product", "productCategory"]);
  return (raw ?? [])
    .map((p): BakeryProduct | null => {
      const id = str(p, "slug");
      const name = str(p, "name");
      const categoryId = str(p, "categoryId");
      if (!id || !name) return null;
      if (!categoryId) {
        console.warn(`[cms] varen "${name}" har ingen kategori og vises ikke.`);
        return null;
      }
      return {
        id,
        name,
        categoryId,
        description: str(p, "description"),
        priceOere: Math.max(0, Math.round(num(p, "priceOere", 0))),
        photo: mapImage(p.image, name),
        active: bool(p, "active", true),
        orderable: bool(p, "orderable", true),
        sort: num(p, "sort", 100),
        deadline: mapDeadline(p.deadline),
      };
    })
    .filter((p): p is BakeryProduct => p !== null);
}

function mapOptionGroup(g: Raw): CakeOptionGroup | null {
  const id = str(g, "_key");
  const title = str(g, "title");
  const type = str(g, "type") as CakeOptionType | undefined;
  if (!id || !title || !type || !OPTION_TYPES.includes(type)) return null;
  const choices =
    type === "text"
      ? []
      : list(g, "choices")
          .map((c) => {
            const choiceId = str(c, "_key");
            const label = str(c, "label");
            if (!choiceId || !label) return null;
            return { id: choiceId, label, priceOere: Math.max(0, Math.round(num(c, "priceOere", 0))), isDefault: bool(c, "isDefault", false) };
          })
          .filter((c): c is NonNullable<typeof c> => c !== null);
  if (type !== "text" && choices.length === 0) return null;
  return { id, title, type, required: bool(g, "required", false), helper: str(g, "helper"), choices };
}

export async function sanityCakeProducts(): Promise<CakeProduct[]> {
  const raw = await orderingFetch<Raw[] | null>(ORDERING_CAKES_QUERY, ["cake"]);
  return (raw ?? [])
    .map((c): CakeProduct | null => {
      const id = str(c, "slug");
      const name = str(c, "name");
      if (!id || !name) return null;
      const photos = (Array.isArray(c.images) ? c.images : [])
        .map((image) => mapImage(image, name))
        .filter((p): p is CmsImage => Boolean(p));
      const min = Math.max(1, Math.round(num(c, "minQuantity", 1)));
      const max = Math.max(min, Math.round(num(c, "maxQuantity", 10)));
      return {
        id,
        name,
        intro: str(c, "intro"),
        photos,
        basePriceOere: Math.max(0, Math.round(num(c, "basePriceOere", 0))),
        optionGroups: list(c, "optionGroups")
          .map(mapOptionGroup)
          .filter((g): g is CakeOptionGroup => g !== null),
        minQuantity: min,
        maxQuantity: max,
        deadline: mapDeadline(c.deadline),
        sections: list(c, "sections")
          .map((s) => ({ id: str(s, "_key") ?? "", heading: str(s, "heading"), body: isPortableText(s.body) ? s.body : [] }))
          .filter((s) => s.id && (s.heading || s.body.length > 0)),
        active: bool(c, "active", true),
        sort: num(c, "sort", 100),
      };
    })
    .filter((c): c is CakeProduct => c !== null);
}

/** Every location with every date, closed ones included (`open: false` in the Studio becomes `closed: true`). */
export async function sanityPickupLocations(): Promise<PickupLocation[]> {
  const raw = await orderingFetch<Raw[] | null>(ORDERING_LOCATIONS_QUERY, ["pickupLocation"]);
  return (raw ?? [])
    .map((l): PickupLocation | null => {
      const id = str(l, "slug");
      const name = str(l, "name");
      if (!id || !name) return null;
      const dates: PickupDate[] = list(l, "dates")
        .map((d): PickupDate | null => {
          const date = str(d, "date");
          if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
          return { date, from: str(d, "from"), to: str(d, "to"), closed: d.open === false, note: str(d, "note") };
        })
        .filter((d): d is PickupDate => d !== null);
      return {
        id,
        name,
        address: str(l, "address"),
        note: str(l, "note"),
        mapsUrl: str(l, "mapsUrl"),
        active: bool(l, "active", false),
        sort: num(l, "sort", 100),
        dates,
      };
    })
    .filter((l): l is PickupLocation => l !== null);
}

export async function sanityOrderingSettings(): Promise<OrderingSettings | null> {
  const raw = await orderingFetch<Raw | null>(ORDERING_SETTINGS_QUERY, ["shopSettings"]);
  if (!raw) return null;
  return {
    defaultDeadline: mapDeadline(raw.defaultDeadline) ?? { daysBefore: 2, hour: 18 },
    minOrderOere: Math.max(0, Math.round(num(raw, "minOrderOere", 0))),
    notice: str(raw, "notice") ?? "",
  };
}
