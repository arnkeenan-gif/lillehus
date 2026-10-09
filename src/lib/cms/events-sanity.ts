/**
 * The Sanity side of the events façade: runs the GROQ in
 * src/sanity/lib/queries-events.ts and maps the answers to the same shapes
 * the JSON fallback produces. Answers are cached like every other Sanity
 * read and tagged with both document types, so publishing an event or a
 * category refreshes every page that lists them.
 * Owned by the events lane; see CLAUDE.md.
 */
import type { QueryParams } from "@sanity/client";
import { getClient } from "@/sanity/lib/client";
import { REVALIDATE_SECONDS } from "@/sanity/lib/fetch";
import { EVENT_CATEGORY_LIST_QUERY, EVENT_LIST_QUERY } from "@/sanity/lib/queries-events";
import { isPortableText, toPortableText } from "./blocks";
import { mapImage } from "./sanity";
import { isValidSlug, sortCategories, toEventEntry } from "./events-shared";
import type { EventCategory, EventEntry } from "./events-types";

type Raw = Record<string, unknown>;

/** The webhook in /api/revalidate clears the tag named after the document type that changed. */
const TAGS = ["event", "eventCategory"];

function eventsFetch<T>(query: string, params: QueryParams = {}): Promise<T> {
  return getClient().fetch<T>(query, params, { next: { revalidate: REVALIDATE_SECONDS, tags: TAGS } });
}

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

function mapCategory(value: unknown): EventCategory | undefined {
  if (!isRaw(value)) return undefined;
  const slug = str(value, "slug");
  const title = str(value, "title");
  if (!isValidSlug(slug) || !title) return undefined;
  return { id: slug, slug, title, intro: str(value, "intro") || undefined, sort: num(value, "sort") ?? 100 };
}

function mapEvent(value: unknown): EventEntry | null {
  if (!isRaw(value)) return null;
  const slug = str(value, "slug");
  const title = str(value, "title");
  // Rich text from the Studio; a plain string is accepted too (documents from before the change).
  const description = value.description;
  const body = isPortableText(description)
    ? description
    : typeof description === "string"
      ? toPortableText(description, `${slug}-`)
      : [];
  return toEventEntry({
    slug,
    title,
    start: str(value, "start"),
    end: str(value, "end") || undefined,
    place: str(value, "place"),
    summary: str(value, "summary"),
    body,
    priceOere: num(value, "priceOere"),
    signup: value.signup === true,
    payment: value.payment === true,
    capacity: num(value, "capacity"),
    signupDeadline: str(value, "signupDeadline") || undefined,
    photo: mapImage(value.image, title),
    category: mapCategory(value.category),
  });
}

export async function sanityEventCategories(): Promise<EventCategory[]> {
  const raw = await eventsFetch<unknown[] | null>(EVENT_CATEGORY_LIST_QUERY);
  return sortCategories((raw ?? []).map(mapCategory).filter((c): c is EventCategory => Boolean(c)));
}

export async function sanityEventEntries(): Promise<EventEntry[]> {
  const raw = await eventsFetch<unknown[] | null>(EVENT_LIST_QUERY);
  return (raw ?? []).map(mapEvent).filter((e): e is EventEntry => e !== null);
}
