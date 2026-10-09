/**
 * Event times in Danish local time. Sanity stores datetimes in UTC and the
 * JSON fallback may carry any offset; everything the visitor sees, and every
 * "has it happened yet" check, is decided on the Copenhagen clock.
 *
 * The labels are built from parts (weekday, day, month, clock) rather than
 * from one Intl pattern, so they read the same on every ICU version:
 * "lørdag den 14. november", "kl. 10.00 til 14.00".
 */
import { formatPrice } from "@/lib/format";
import { addDays, type DayKey } from "./calendar";
import type { EventEntry } from "@/lib/cms/events-types";

export const TIME_ZONE = "Europe/Copenhagen";

/**
 * The moment a page is rendered. Server components render once per request
 * or revalidation, so the pages read the clock here and hand the same value
 * to everything below them (the calendar, the list, the sign-up state).
 */
export function renderTime(): number {
  return Date.now();
}

const partsFormat = new Intl.DateTimeFormat("en-GB", {
  timeZone: TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
});

const weekdayFormat = new Intl.DateTimeFormat("da-DK", { timeZone: TIME_ZONE, weekday: "long" });
const monthFormat = new Intl.DateTimeFormat("da-DK", { timeZone: TIME_ZONE, month: "long" });
const monthNameFormat = new Intl.DateTimeFormat("da-DK", { timeZone: "UTC", month: "long" });

interface ClockParts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
}

function toDate(value: string | number | Date): Date {
  return value instanceof Date ? value : new Date(value);
}

function clockParts(value: string | number | Date): ClockParts {
  const out: Record<string, number> = {};
  for (const part of partsFormat.formatToParts(toDate(value))) {
    if (part.type !== "literal") out[part.type] = Number(part.value);
  }
  return {
    year: out.year,
    month: out.month,
    day: out.day,
    hour: out.hour === 24 ? 0 : out.hour,
    minute: out.minute,
    second: out.second,
  };
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

/** The Copenhagen calendar day of an instant: "2026-11-14". */
export function dayKey(value: string | number | Date): DayKey {
  const p = clockParts(value);
  return `${p.year}-${pad(p.month)}-${pad(p.day)}`;
}

/** Minutes Copenhagen is ahead of UTC at that instant (60 in winter, 120 in summer). */
function offsetMinutes(ms: number): number {
  const p = clockParts(ms);
  const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  return Math.round((asUtc - Math.floor(ms / 1000) * 1000) / 60_000);
}

/** Midnight at the start of a Copenhagen day, as epoch milliseconds. */
export function startOfDay(day: DayKey): number {
  const [y, m, d] = day.split("-").map(Number);
  const utcMidnight = Date.UTC(y, m - 1, d);
  return utcMidnight - offsetMinutes(utcMidnight) * 60_000;
}

/** "10.00" on the Copenhagen clock. */
export function clock(value: string | number | Date): string {
  const p = clockParts(value);
  return `${pad(p.hour)}.${pad(p.minute)}`;
}

function hasClock(value: string): boolean {
  return clock(value) !== "00.00";
}

/** "lørdag den 14. november", with the year when asked. */
export function dayLabel(value: string | number | Date, withYear = false): string {
  const date = toDate(value);
  const p = clockParts(date);
  const text = `${weekdayFormat.format(date)} den ${p.day}. ${monthFormat.format(date)}`;
  return withYear ? `${text} ${p.year}` : text;
}

/** "November 2026" for a month key. */
export function monthLabel(month: string): string {
  const [y, m] = month.split("-").map(Number);
  const name = monthNameFormat.format(new Date(Date.UTC(y, m - 1, 15)));
  return `${name.charAt(0).toUpperCase()}${name.slice(1)} ${y}`;
}

function ucfirst(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/* ------------------------------------------------------------------ */
/* An event's span                                                     */
/* ------------------------------------------------------------------ */

type Timed = Pick<EventEntry, "start" | "end">;

function ms(value: string): number {
  const t = new Date(value).getTime();
  return Number.isFinite(t) ? t : 0;
}

export function startTime(event: Timed): number {
  return ms(event.start);
}

/**
 * When the event is over. Without an end time it lasts the rest of its
 * first day, so an event entered as a date only stays in the calendar on
 * the day itself.
 */
export function endTime(event: Timed): number {
  if (event.end && ms(event.end) > ms(event.start)) return ms(event.end);
  return startOfDay(addDays(dayKey(event.start), 1));
}

export function isPast(event: Timed, now = Date.now()): boolean {
  return endTime(event) <= now;
}

/** Every Copenhagen day the event touches, first to last (at most 62). */
export function eventDays(event: Timed): DayKey[] {
  const first = dayKey(event.start);
  const end = event.end && ms(event.end) > ms(event.start) ? event.end : event.start;
  // An event that ends exactly at midnight does not touch the next day.
  const last = dayKey(ms(end) - (hasClock(end) || end === event.start ? 0 : 1));
  const days: DayKey[] = [];
  for (let d = first; d <= last && days.length < 62; d = addDays(d, 1)) days.push(d);
  return days.length > 0 ? days : [first];
}

function isMultiDay(event: Timed): boolean {
  return eventDays(event).length > 1;
}

/* ------------------------------------------------------------------ */
/* Labels                                                              */
/* ------------------------------------------------------------------ */

/** "kl. 10.00 til 14.00", "kl. 10.00", or "" for an event entered as a date only. */
export function timeLabel(event: Timed): string {
  const from = hasClock(event.start) ? clock(event.start) : "";
  const to = event.end && ms(event.end) > ms(event.start) ? clock(event.end) : "";
  if (!from && !to) return "";
  if (from && to) return `kl. ${from} til ${to}`;
  return from ? `kl. ${from}` : "";
}

/**
 * The whole date and time as one line for the event's own page:
 * "Lørdag den 14. november 2026, kl. 10.00 til 14.00", or across days
 * "Lørdag den 14. november kl. 10.00 til søndag den 15. november kl. 16.00".
 */
export function whenLong(event: Timed): string {
  if (!isMultiDay(event)) {
    const time = timeLabel(event);
    return ucfirst(`${dayLabel(event.start, true)}${time ? `, ${time}` : ""}`);
  }
  const end = event.end as string;
  const sameYear = clockParts(event.start).year === clockParts(end).year;
  const from = `${dayLabel(event.start, !sameYear)}${hasClock(event.start) ? ` kl. ${clock(event.start)}` : ""}`;
  const to = `${dayLabel(end, true)}${hasClock(end) ? ` kl. ${clock(end)}` : ""}`;
  return ucfirst(`${from} til ${to}`);
}

/**
 * Two short lines for lists: the date ("Lørdag den 14. november", with the
 * year when it is not this year) and the time ("kl. 10.00 til 14.00").
 * Across days: "14. til 15. november" and "fra kl. 10.00".
 */
export function whenShort(event: Timed, now = Date.now()): { date: string; time: string } {
  const thisYear = clockParts(now).year;
  const start = clockParts(event.start);
  if (!isMultiDay(event)) {
    return { date: ucfirst(dayLabel(event.start, start.year !== thisYear)), time: timeLabel(event) };
  }
  const end = event.end as string;
  const last = clockParts(end);
  const startMonth = monthFormat.format(toDate(event.start));
  const endMonth = monthFormat.format(toDate(end));
  const year = last.year !== thisYear ? ` ${last.year}` : "";
  const date =
    start.month === last.month && start.year === last.year
      ? `${start.day}. til ${last.day}. ${endMonth}${year}`
      : `${start.day}. ${startMonth}${start.year !== last.year ? ` ${start.year}` : ""} til ${last.day}. ${endMonth}${year}`;
  return { date, time: hasClock(event.start) ? `fra kl. ${clock(event.start)}` : "" };
}

/** "150 kr. pr. person", or "" when the event has no price. */
export function priceLabel(event: Pick<EventEntry, "priceOere">): string {
  return event.priceOere && event.priceOere > 0 ? `${formatPrice(event.priceOere)} pr. person` : "";
}

/** "Fredag den 13. november kl. 18.00" for a deadline. */
export function deadlineLabel(iso: string): string {
  return ucfirst(`${dayLabel(iso)}${hasClock(iso) ? ` kl. ${clock(iso)}` : ""}`);
}
