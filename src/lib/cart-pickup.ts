import type { Weekday } from "@/lib/content";

/*
  Pure pickup-day arithmetic. No JSON imports and no server-only code, so both
  the checkout form (client) and the server action can use it. All calendar
  maths happens on Copenhagen dates represented as "YYYY-MM-DD" strings.
*/

export const WEEKDAY_ORDER: Weekday[] = ["man", "tir", "ons", "tor", "fre", "lør", "søn"];

/** Local copy of the weekday names so client bundles do not pull in content.ts and its JSON. */
export const WEEKDAY_NAMES: Record<Weekday, string> = {
  man: "mandag",
  tir: "tirsdag",
  ons: "onsdag",
  tor: "torsdag",
  fre: "fredag",
  lør: "lørdag",
  søn: "søndag",
};

export interface PickupConfig {
  pickupDays: Weekday[];
  /** Orders placed at or after this hour (Copenhagen time) lose one day of lead time. */
  cutoffHour: number;
  /** Minimum whole days between ordering and pickup. 1 = earliest tomorrow. */
  cutoffDaysBefore: number;
  maxDaysAhead: number;
  /** ISO dates the bakery is closed. */
  closedDates: string[];
}

export interface DeliveryConfig {
  enabled: boolean;
  feeOere: number;
  freeAboveOere: number;
  radiusKm: number;
  days: Weekday[];
  note: string;
}

export interface ShopConfig extends PickupConfig {
  pickupWindow: string;
  pickupPlace: string;
  minOrderOere: number;
  delivery: DeliveryConfig;
  notice: string;
}

export interface PickupDay {
  /** "2026-09-15" */
  iso: string;
  weekday: Weekday;
  /** "tirsdag den 15. september" */
  label: string;
}

export interface DayConstraint {
  name: string;
  days: Weekday[];
}

const TZ = "Europe/Copenhagen";

const cphParts = new Intl.DateTimeFormat("en-GB", {
  timeZone: TZ,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  hourCycle: "h23",
});

const dayLabel = new Intl.DateTimeFormat("da-DK", {
  weekday: "long",
  day: "numeric",
  month: "long",
  timeZone: TZ,
});

/** Calendar date and hour in Copenhagen for an instant. */
function copenhagenNow(now: Date): { y: number; m: number; d: number; hour: number } {
  const parts = cphParts.formatToParts(now);
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? 0);
  return { y: get("year"), m: get("month"), d: get("day"), hour: get("hour") % 24 };
}

/** A Date at 12:00 UTC on the given ISO day; the same calendar day in Copenhagen. */
export function noonUtc(iso: string): Date {
  return new Date(`${iso}T12:00:00Z`);
}

export function weekdayOf(iso: string): Weekday {
  return WEEKDAY_ORDER[(noonUtc(iso).getUTCDay() + 6) % 7];
}

/** "tirsdag den 15. september", no year. For selects, subjects and the baking list. */
export function pickupDayLabel(iso: string): string {
  return dayLabel.format(noonUtc(iso)).replace(/^(\p{L}+) /u, "$1 den ");
}

export function getPickupDays(now: Date, config: PickupConfig): PickupDay[] {
  const { y, m, d, hour } = copenhagenNow(now);
  const today = Date.UTC(y, m - 1, d, 12);
  const allowed = new Set(config.pickupDays);
  const closed = new Set(config.closedDates);
  const firstOffset = Math.max(0, config.cutoffDaysBefore) + (hour >= config.cutoffHour ? 1 : 0);
  const days: PickupDay[] = [];
  for (let offset = firstOffset; offset <= config.maxDaysAhead; offset++) {
    const iso = new Date(today + offset * 86_400_000).toISOString().slice(0, 10);
    const weekday = weekdayOf(iso);
    if (!allowed.has(weekday) || closed.has(iso)) continue;
    days.push({ iso, weekday, label: pickupDayLabel(iso) });
  }
  return days;
}

/** Keep only the days on which every item in the cart can be baked. */
export function filterDaysForItems(days: PickupDay[], items: DayConstraint[]): PickupDay[] {
  const constrained = items.filter((i) => i.days.length > 0);
  if (constrained.length === 0) return days;
  return days.filter((day) => constrained.every((i) => i.days.includes(day.weekday)));
}

/** Danish list: ["a"] → "a", ["a","b"] → "a og b", ["a","b","c"] → "a, b og c". */
export function joinDa(parts: string[]): string {
  if (parts.length <= 1) return parts.join("");
  return `${parts.slice(0, -1).join(", ")} og ${parts[parts.length - 1]}`;
}

export function sortWeekdays(days: Weekday[]): Weekday[] {
  return [...new Set(days)].sort((a, b) => WEEKDAY_ORDER.indexOf(a) - WEEKDAY_ORDER.indexOf(b));
}

/** "Bages tirsdag og fredag", or null when the item is baked every pickup day. */
export function bakedDaysLabel(days: Weekday[]): string | null {
  if (days.length === 0) return null;
  return `Bages ${joinDa(sortWeekdays(days).map((d) => WEEKDAY_NAMES[d]))}`;
}

/** Explains why the day list is shorter than usual, or null when nothing constrains it. */
export function constraintHelper(items: DayConstraint[]): string | null {
  const constrained = items.filter((i) => i.days.length > 0);
  if (constrained.length === 0) return null;
  const sentences = constrained.map(
    (i) => `${i.name} bages kun ${joinDa(sortWeekdays(i.days).map((d) => WEEKDAY_NAMES[d]))}.`,
  );
  return `${sentences.join(" ")} Derfor kan du kun vælge de dage.`;
}
