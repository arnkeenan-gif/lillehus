/**
 * The JSON side of the events façade: content/events.json (the events, a
 * list, empty until Kristine has something on) and
 * content/events/categories.json (the subcategories). Used when Sanity is
 * not configured. Records with a missing title, address or start, and
 * hidden ones, are left out rather than breaking the page.
 * Owned by the events lane; see CLAUDE.md.
 */
import eventsJson from "@content/events.json";
import categoriesJson from "@content/events/categories.json";
import { toPortableText } from "./blocks";
import { fallbackImage } from "./fallback";
import { isValidSlug, sortCategories, toEventEntry } from "./events-shared";
import type { EventCategory, EventEntry } from "./events-types";

type Raw = Record<string, unknown>;

function isRaw(value: unknown): value is Raw {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function str(o: Raw, key: string): string {
  const v = o[key];
  return typeof v === "string" ? v.trim() : "";
}

function num(o: Raw, key: string): number | undefined {
  const v = o[key];
  return typeof v === "number" && Number.isFinite(v) ? v : undefined;
}

function bool(o: Raw, key: string): boolean {
  return o[key] === true;
}

export function fallbackEventCategories(): EventCategory[] {
  const list = (categoriesJson as { categories?: unknown }).categories;
  const out: EventCategory[] = [];
  for (const entry of Array.isArray(list) ? list : []) {
    if (!isRaw(entry)) continue;
    const slug = str(entry, "slug");
    const title = str(entry, "title");
    if (!isValidSlug(slug) || !title) continue;
    out.push({ id: slug, slug, title, intro: str(entry, "intro") || undefined, sort: num(entry, "sort") ?? 100 });
  }
  return sortCategories(out);
}

/** A description in the JSON is plain text; a blank line starts a new paragraph. */
function paragraphs(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

/** Every visible event in content/events.json, past ones included, in file order. */
export function fallbackEventEntries(): EventEntry[] {
  const categories = new Map(fallbackEventCategories().map((c) => [c.slug, c]));
  const out: EventEntry[] = [];
  for (const raw of eventsJson as unknown[]) {
    if (!isRaw(raw) || bool(raw, "hidden")) continue;
    const slug = str(raw, "slug");
    const title = str(raw, "title");
    const imagePath = str(raw, "image");
    const photo = imagePath ? fallbackImage(imagePath) : undefined;
    const entry = toEventEntry({
      slug,
      title,
      start: str(raw, "start"),
      end: str(raw, "end") || undefined,
      place: str(raw, "place"),
      summary: str(raw, "summary"),
      body: toPortableText(paragraphs(str(raw, "description")), `${slug}-`),
      priceOere: num(raw, "priceOere"),
      signup: bool(raw, "signup"),
      payment: bool(raw, "payment"),
      capacity: num(raw, "capacity"),
      signupDeadline: str(raw, "signupDeadline") || undefined,
      photo: photo ? { ...photo, alt: photo.alt || title } : undefined,
      category: categories.get(str(raw, "category")),
    });
    if (entry) out.push(entry);
  }
  return out;
}
