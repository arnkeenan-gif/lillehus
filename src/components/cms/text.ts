import { WEEKDAY_LABELS } from "@/lib/content";
import type { DeadlineRule, Location, LocationHours, PickupDate, Weekday } from "@/lib/cms";

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

/* ------------------------------------------------------------------ */
/* Pickup dates and the ordering deadline                              */
/* ------------------------------------------------------------------ */

const NUMBER_WORDS = ["nul", "en", "to", "tre", "fire", "fem", "seks", "syv", "otte", "ni", "ti"];

/** 2 gives "to", 3 gives "tre"; 11 and up stay digits. */
export function numberWord(n: number): string {
  return NUMBER_WORDS[n] ?? String(n);
}

/** "kl. 18 to dage før afhentning", "kl. 18 dagen før afhentning". */
export function deadlineText(rule: DeadlineRule): string {
  const clock = `kl. ${rule.hour}`;
  if (rule.daysBefore <= 0) return `${clock} samme dag som afhentning`;
  if (rule.daysBefore === 1) return `${clock} dagen før afhentning`;
  return `${clock} ${numberWord(rule.daysBefore)} dage før afhentning`;
}

const weekdayDayMonth = new Intl.DateTimeFormat("da-DK", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" });

/** "onsdag den 14. oktober" from "2026-10-14" (a Danish calendar date, no time zone maths). */
export function dayText(iso: string): string {
  const parts = weekdayDayMonth.formatToParts(new Date(`${iso}T12:00:00Z`));
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === type)?.value ?? "";
  return `${part("weekday")} den ${part("day")}. ${part("month")}`;
}

/** "kl. 9.00 til 12.00", "fra kl. 9.00", or "" when Kristine has not set a time. */
export function timeRangeText(from?: string, to?: string): string {
  if (from && to) return `kl. ${from} til ${to}`;
  if (from) return `fra kl. ${from}`;
  if (to) return `til kl. ${to}`;
  return "";
}

/** "onsdag den 14. oktober kl. 9.00 til 12.00" */
export function pickupDateText(date: PickupDate): string {
  const time = timeRangeText(date.from, date.to);
  return time ? `${dayText(date.date)} ${time}` : dayText(date.date);
}

/** The last day to order for a pickup on `iso`, as "YYYY-MM-DD". */
export function deadlineDate(iso: string, rule: DeadlineRule): string {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() - Math.max(0, rule.daysBefore));
  return d.toISOString().slice(0, 10);
}

const copenhagenDate = new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Copenhagen" });
const copenhagenHour = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Copenhagen", hour: "2-digit", hourCycle: "h23" });

/**
 * True while a pickup on `iso` can still be ordered under `rule`, Danish
 * time: before `rule.hour` o'clock on the deadline day. The shop checks
 * each product's own rule when the order is placed; this is for the lists
 * of coming pickup days on the content pages.
 */
export function stillOrderable(iso: string, rule: DeadlineRule, now: Date = new Date()): boolean {
  const today = copenhagenDate.format(now);
  const last = deadlineDate(iso, rule);
  if (today !== last) return today < last;
  return Number(copenhagenHour.format(now)) < rule.hour;
}

/** "Henter du onsdag den 14. oktober, skal du bestille senest mandag den 12. oktober kl. 18." */
export function deadlineExample(iso: string, rule: DeadlineRule): string {
  return `Henter du ${dayText(iso)}, skal du bestille senest ${dayText(deadlineDate(iso, rule))} kl. ${rule.hour}.`;
}

/** "Bageriet og Hønsehuset mandag til fredag kl. 7 til 18, og Torvedag i Næstved onsdag og lørdag kl. 9 til 14." */
export function weekText(locations: Location[]): string {
  const parts = locations.filter((l) => l.hours.length > 0).map((l) => `${l.name} ${hoursText(l.hours)}`);
  if (parts.length === 0) return "";
  if (parts.length === 1) return `${parts[0]}.`;
  return `${parts.slice(0, -1).join(", ")}, og ${lowerFirst(parts[parts.length - 1])}.`;
}
