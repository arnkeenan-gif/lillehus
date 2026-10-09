/**
 * Calendar helpers for ordering. A pickup date is a Danish calendar date
 * written "YYYY-MM-DD"; an instant is a Date or epoch milliseconds. Nothing
 * here depends on the machine's own time zone, so the server (UTC on Vercel)
 * and every browser give the same answers. Weekday and month names are
 * written out instead of asking Intl, because ICU versions disagree about
 * "den" ("lørdag 17. oktober" or "lørdag den 17. oktober"). Client-safe.
 */

export const TIME_ZONE = "Europe/Copenhagen";

const WEEKDAYS = ["søndag", "mandag", "tirsdag", "onsdag", "torsdag", "fredag", "lørdag"] as const;
const MONTHS = [
  "januar",
  "februar",
  "marts",
  "april",
  "maj",
  "juni",
  "juli",
  "august",
  "september",
  "oktober",
  "november",
  "december",
] as const;
const MONTHS_SHORT = ["jan.", "feb.", "mar.", "apr.", "maj", "jun.", "jul.", "aug.", "sep.", "okt.", "nov.", "dec."] as const;

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** True for a real calendar date written "YYYY-MM-DD". */
export function isIsoDate(value: unknown): value is string {
  if (typeof value !== "string" || !ISO_DATE.test(value)) return false;
  const d = new Date(`${value}T12:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
}

const cphParts = new Intl.DateTimeFormat("en-GB", {
  timeZone: TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** The calendar date in Denmark at an instant, e.g. "2026-10-17". */
export function copenhagenDate(instant: Date | number = Date.now()): string {
  const parts = cphParts.formatToParts(typeof instant === "number" ? new Date(instant) : instant);
  const get = (type: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

/** "2026-10-17" plus `days` (negative goes back). */
export function addDays(iso: string, days: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
}

/** 0 for sunday to 6 for saturday, like Date#getDay. */
export function weekdayOf(iso: string): number {
  return new Date(`${iso}T12:00:00Z`).getUTCDay();
}

export function weekdayName(dayIndex: number): string {
  return WEEKDAYS[((dayIndex % 7) + 7) % 7];
}

/** "lørdag den 17. oktober", or "lørdag den 17. oktober 2026" with `year`. */
export function formatDayDate(iso: string, options: { year?: boolean } = {}): string {
  const [y, m, d] = iso.split("-").map(Number);
  const text = `${WEEKDAYS[weekdayOf(iso)]} den ${d}. ${MONTHS[m - 1]}`;
  return options.year ? `${text} ${y}` : text;
}

const WEEKDAYS_SHORT = ["søn.", "man.", "tirs.", "ons.", "tors.", "fre.", "lør."] as const;

/** "lør. 17. okt.", for tight places like the pickup bar on a phone. */
export function formatShortDate(iso: string): string {
  const [, m, d] = iso.split("-").map(Number);
  return `${WEEKDAYS_SHORT[weekdayOf(iso)]} ${d}. ${MONTHS_SHORT[m - 1]}`;
}

/** The two lines of a date chip: { weekday: "lørdag", date: "17. okt." }. */
export function chipParts(iso: string): { weekday: string; date: string } {
  const [, m, d] = iso.split("-").map(Number);
  return { weekday: WEEKDAYS[weekdayOf(iso)], date: `${d}. ${MONTHS_SHORT[m - 1]}` };
}

/**
 * A clock time as Danes write it: "9.00" from "9", "09:00", "9.00" or
 * "9:30" gives "9.30". Returns "" for anything that is not a time.
 */
export function normalizeClock(value: string | null | undefined): string {
  if (!value) return "";
  const match = /^\s*([01]?\d|2[0-3])(?:[.:]([0-5]\d))?\s*$/.exec(value);
  if (!match) return "";
  return `${Number(match[1])}.${match[2] ?? "00"}`;
}

/** "kl. 9.00 til 12.00", "fra kl. 9.00", "senest kl. 12.00", or "" when no time is set. */
export function pickupTimeText(from?: string | null, to?: string | null): string {
  const f = normalizeClock(from);
  const t = normalizeClock(to);
  if (f && t) return `kl. ${f} til ${t}`;
  if (f) return `fra kl. ${f}`;
  if (t) return `senest kl. ${t}`;
  return "";
}

/** Capitalises the first letter: weekday names are lowercase in Danish. */
export function upperFirst(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** Lowercases the first letter, for "Vælg smag" from the title "Smag". */
export function lowerFirst(text: string): string {
  return text.charAt(0).toLowerCase() + text.slice(1);
}
