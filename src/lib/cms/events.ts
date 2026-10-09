/**
 * Events façade: events and (added by the events lane) event categories.
 * Owned by the events lane; see CLAUDE.md.
 */
import { fromSanity } from "./from-sanity";
import { fallbackEvents } from "./fallback";
import { sanityEvents } from "./sanity";
import type { EventItem } from "./types";

/** Upcoming events, soonest first. Pass { upcomingOnly: false } for the archive. */
export async function getEvents({ upcomingOnly = true }: { upcomingOnly?: boolean } = {}): Promise<EventItem[]> {
  const all = (await fromSanity("events", sanityEvents, fallbackEvents)).slice().sort((a, b) => a.start.localeCompare(b.start));
  if (!upcomingOnly) return all;
  const now = Date.now();
  return all.filter((e) => new Date(e.end ?? e.start).getTime() >= now);
}
