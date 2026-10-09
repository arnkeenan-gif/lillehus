/**
 * Calendar arithmetic on plain day keys ("2026-11-14") and month keys
 * ("2026-11"). No time zones and no Intl here: the keys are already
 * Copenhagen calendar days (see dates.ts), so this file is safe to ship to
 * the browser and gives the same answer on the server and the client.
 * Weeks start on Monday, week numbers follow ISO 8601 as Danish calendars do.
 */

export type DayKey = string;
export type MonthKey = string;

function split(key: string): number[] {
  return key.split("-").map(Number);
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function keyOfUtc(date: Date): DayKey {
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
}

export function monthOf(day: DayKey): MonthKey {
  return day.slice(0, 7);
}

export function addDays(day: DayKey, days: number): DayKey {
  const [y, m, d] = split(day);
  return keyOfUtc(new Date(Date.UTC(y, m - 1, d + days)));
}

export function addMonths(month: MonthKey, months: number): MonthKey {
  const [y, m] = split(month);
  const date = new Date(Date.UTC(y, m - 1 + months, 1));
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}`;
}

/** Every month from `from` to `to`, both included. */
export function monthRange(from: MonthKey, to: MonthKey): MonthKey[] {
  const out: MonthKey[] = [];
  for (let m = from; m <= to && out.length < 120; m = addMonths(m, 1)) out.push(m);
  return out;
}

/** ISO 8601 week number: the week with the year's first Thursday is week 1. */
export function isoWeek(day: DayKey): number {
  const [y, m, d] = split(day);
  const date = new Date(Date.UTC(y, m - 1, d));
  const weekday = (date.getUTCDay() + 6) % 7; // Monday 0 ... Sunday 6
  date.setUTCDate(date.getUTCDate() - weekday + 3); // Thursday of this week
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.floor((date.getTime() - yearStart.getTime()) / 86_400_000 / 7) + 1;
}

export interface CalendarWeek {
  week: number;
  /** Seven days, Monday first; null where the day belongs to another month. */
  days: (DayKey | null)[];
}

/** The weeks of a month as rows of seven days, Monday first. */
export function monthWeeks(month: MonthKey): CalendarWeek[] {
  const [y, m] = split(month);
  const first = new Date(Date.UTC(y, m - 1, 1));
  const lead = (first.getUTCDay() + 6) % 7;
  const length = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const cells: (DayKey | null)[] = Array.from({ length: lead }, () => null);
  for (let d = 1; d <= length; d++) cells.push(`${month}-${pad(d)}`);
  while (cells.length % 7 !== 0) cells.push(null);

  const weeks: CalendarWeek[] = [];
  for (let i = 0; i < cells.length; i += 7) {
    const days = cells.slice(i, i + 7);
    const anyDay = days.find((d): d is DayKey => d !== null) ?? `${month}-01`;
    weeks.push({ week: isoWeek(anyDay), days });
  }
  return weeks;
}

/** The day of the month, "14" from "2026-11-14". */
export function dayNumber(day: DayKey): number {
  return Number(day.slice(8, 10));
}
