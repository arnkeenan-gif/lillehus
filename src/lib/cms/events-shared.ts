/**
 * Small pieces both event sources share: the slug rules and the step from a
 * raw record to an EventEntry, so Sanity and the JSON fallback produce the
 * same thing. Owned by the events lane; see CLAUDE.md.
 */
import { plainText } from "./blocks";
import type { CmsImage, RichText } from "./types";
import type { EventCategory, EventEntry } from "./events-types";

/**
 * /arrangementer/kategori and /arrangementer/tak are pages of their own, so
 * no event may use those words as its address.
 */
export const RESERVED_EVENT_SLUGS = ["kategori", "tak"] as const;

export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

export function isUsableEventSlug(slug: string): boolean {
  return isValidSlug(slug) && !(RESERVED_EVENT_SLUGS as readonly string[]).includes(slug);
}

function validIso(value: string | undefined): string | undefined {
  if (!value) return undefined;
  return Number.isFinite(new Date(value).getTime()) ? value : undefined;
}

export interface EventFields {
  slug: string;
  title: string;
  start: string;
  end?: string;
  place: string;
  summary: string;
  body: RichText;
  priceOere?: number;
  signup: boolean;
  payment: boolean;
  capacity?: number;
  signupDeadline?: string;
  photo?: CmsImage;
  category?: EventCategory;
}

/** The checks and defaults every event gets, whichever source it came from. Null when it cannot be shown. */
export function toEventEntry(f: EventFields): EventEntry | null {
  if (!isUsableEventSlug(f.slug) || !f.title.trim()) return null;
  const start = validIso(f.start);
  if (!start) return null;
  const endIso = validIso(f.end);
  const end = endIso && new Date(endIso).getTime() > new Date(start).getTime() ? endIso : undefined;
  const priceOere = typeof f.priceOere === "number" && f.priceOere > 0 ? Math.round(f.priceOere) : undefined;
  const capacity = typeof f.capacity === "number" && f.capacity >= 1 ? Math.floor(f.capacity) : undefined;
  const summary = f.summary.trim();
  const firstParagraph = plainText(f.body.slice(0, 1));

  return {
    id: f.slug,
    slug: f.slug,
    title: f.title.trim(),
    start,
    end,
    place: f.place.trim(),
    description: summary || firstParagraph,
    summary,
    body: f.body,
    priceOere,
    signup: f.signup,
    payment: f.payment && priceOere !== undefined,
    capacity,
    signupDeadline: validIso(f.signupDeadline),
    image: f.photo?.src,
    photo: f.photo,
    kind: f.category?.title ?? "",
    category: f.category,
  };
}

/** Categories in menu order: `sort`, then the name. */
export function sortCategories(categories: EventCategory[]): EventCategory[] {
  return categories.slice().sort((a, b) => a.sort - b.sort || a.title.localeCompare(b.title, "da"));
}
