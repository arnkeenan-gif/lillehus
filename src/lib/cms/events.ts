/**
 * Events façade: events and their subcategories ("Arrangementer på gården",
 * "Kurser", "Øvrige arrangementer" and whatever Kristine adds). Sanity when
 * NEXT_PUBLIC_SANITY_PROJECT_ID is set, otherwise content/events.json and
 * content/events/categories.json. Hidden events never leave this file.
 * Owned by the events lane; see CLAUDE.md.
 *
 *   getEvents()                       upcoming events, soonest first (forside, find-os, /arrangementer)
 *   getEvents({ category: "kurser" }) upcoming events in one category
 *   getEvents({ upcomingOnly: false }) every visible event, past ones too
 *   getEvent(slug)                    one event, past or not (its own page)
 *   getEventCategories()              the subcategories, in menu order
 *   getEventCategory(slug)            one subcategory
 */
import { endTime, startTime } from "@/lib/events/dates";
import { fromSanity } from "./from-sanity";
import { fallbackEventCategories, fallbackEventEntries } from "./events-fallback";
import { sanityEventCategories, sanityEventEntries } from "./events-sanity";
import type { EventCategory, EventEntry } from "./events-types";

export type * from "./events-types";

async function visibleEvents(): Promise<EventEntry[]> {
  const events = await fromSanity("events", sanityEventEntries, fallbackEventEntries);
  return events.slice().sort((a, b) => startTime(a) - startTime(b) || a.title.localeCompare(b.title, "da"));
}

/** Upcoming events, soonest first. Pass { upcomingOnly: false } for past ones too, { category } for one subcategory. */
export async function getEvents({
  upcomingOnly = true,
  category,
}: { upcomingOnly?: boolean; category?: string } = {}): Promise<EventEntry[]> {
  let events = await visibleEvents();
  if (category) events = events.filter((e) => e.category?.slug === category);
  if (!upcomingOnly) return events;
  const now = Date.now();
  return events.filter((e) => endTime(e) > now);
}

/** One visible event by its address, also when it has taken place. */
export async function getEvent(slug: string): Promise<EventEntry | undefined> {
  return (await visibleEvents()).find((e) => e.slug === slug);
}

export function getEventCategories(): Promise<EventCategory[]> {
  return fromSanity("eventCategories", sanityEventCategories, fallbackEventCategories);
}

export async function getEventCategory(slug: string): Promise<EventCategory | undefined> {
  return (await getEventCategories()).find((c) => c.slug === slug);
}
