import { WEEKDAY_LABELS } from "@/lib/content";
import type { Location, LocationHours, ShopSettings, Weekday } from "@/lib/cms";

/*
  Danish sentences built from façade data, so the forside, find-os, levering
  and the footer all say the same thing when Kristine changes a number.
*/

/** ["a", "b", "c"] gives "a, b og c". */
export function listDa(items: string[]): string {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} og ${items[items.length - 1]}`;
}

export function dayLabel(day: Weekday | string): string {
  return WEEKDAY_LABELS[day as Weekday] ?? day;
}

export function lowerFirst(s: string): string {
  return s.charAt(0).toLowerCase() + s.slice(1);
}

export function upperFirst(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Adds a full stop when the text ends without punctuation. */
export function endSentence(s: string): string {
  const t = s.trim();
  return /[.!?:]$/.test(t) ? t : `${t}.`;
}

/** "tirsdag, onsdag, torsdag og fredag" */
export function pickupDaysText(shop: ShopSettings): string {
  return listDa(shop.pickupDays.map(dayLabel));
}

/** "dagen før kl. 18" */
export function cutoffText(shop: ShopSettings): string {
  const before = shop.cutoffDaysBefore === 1 ? "dagen før" : `${shop.cutoffDaysBefore} dage før`;
  return `${before} kl. ${shop.cutoffHour}`;
}

/** "fredag" or "onsdag og fredag" */
export function deliveryDaysText(shop: ShopSettings): string {
  return listDa(shop.delivery.days.map(dayLabel));
}

export interface HoursGroup {
  /** "onsdag og lørdag", "mandag til fredag" */
  days: string;
  /** "9 til 14" */
  time: string;
}

/**
 * Opening hours as spoken: entries with the same time are said together,
 * "onsdag og lørdag kl. 9 til 14" rather than one row per day.
 */
export function groupHours(hours: LocationHours[]): HoursGroup[] {
  const groups: { days: string[]; time: string }[] = [];
  for (const h of hours) {
    const last = groups[groups.length - 1];
    if (last && last.time === h.time) last.days.push(lowerFirst(h.days));
    else groups.push({ days: [lowerFirst(h.days)], time: h.time });
  }
  return groups.map((g) => ({ days: listDa(g.days), time: g.time }));
}

/** "onsdag og lørdag kl. 9 til 14" as plain text (the footer, meta text). */
export function hoursText(hours: LocationHours[]): string {
  return listDa(groupHours(hours).map((g) => `${g.days} kl. ${g.time}`));
}

/**
 * Notes short enough to finish the hours sentence ("Eller til vi er
 * udsolgt") versus notes that are their own sentences.
 */
export function splitNotes(hours: LocationHours[]): { inline?: string; rest: string[] } {
  const notes = Array.from(new Set(hours.map((h) => h.note?.trim()).filter((n): n is string => Boolean(n))));
  const inline = notes.find((n) => n.length <= 40 && !/[.!?]\S/.test(n) && !n.includes(". "));
  return { inline: inline ? lowerFirst(inline.replace(/[.!?]$/, "")) : undefined, rest: notes.filter((n) => n !== inline) };
}

/** "Bageriet og Hønsehuset mandag til fredag kl. 7 til 18, og Torvedag i Næstved onsdag og lørdag kl. 9 til 14." */
export function weekText(locations: Location[]): string {
  const parts = locations.filter((l) => l.hours.length > 0).map((l) => `${l.name} ${hoursText(l.hours)}`);
  if (parts.length === 0) return "";
  if (parts.length === 1) return `${parts[0]}.`;
  return `${parts.slice(0, -1).join(", ")}, og ${lowerFirst(parts[parts.length - 1])}.`;
}
