/**
 * Everything the month calendar needs, worked out on the server: which
 * months can be browsed, which days carry an event, and every label in
 * Danish. The calendar component in the browser then only does arithmetic,
 * so the server and the browser always render the same markup.
 */
import type { EventEntry } from "@/lib/cms/events-types";
import { monthOf, monthRange, type DayKey, type MonthKey } from "./calendar";
import { dayKey, dayLabel, eventDays, monthLabel, startOfDay } from "./dates";

export interface CalendarDayLink {
  href: string;
  /** "Lørdag den 14. november: Åbent hus" for screen readers. */
  label: string;
}

export interface CalendarData {
  months: { key: MonthKey; label: string }[];
  initialIndex: number;
  today: DayKey;
  days: Record<DayKey, CalendarDayLink>;
}

function listDa(items: string[]): string {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} og ${items[items.length - 1]}`;
}

/**
 * From this month to the month of the last upcoming event. The calendar
 * opens on the month of the next event. A day with one event links to its
 * page; a day with several links to the first of them in the list.
 */
export function calendarData(events: EventEntry[], now = Date.now()): CalendarData {
  const today = dayKey(now);
  const byDay = new Map<DayKey, EventEntry[]>();
  for (const event of events) {
    for (const day of eventDays(event)) {
      if (day < today) continue;
      const list = byDay.get(day) ?? [];
      list.push(event);
      byDay.set(day, list);
    }
  }

  const keys = [...byDay.keys()].sort();
  const thisMonth = monthOf(today);
  const lastMonth = keys.length > 0 ? monthOf(keys[keys.length - 1]) : thisMonth;
  const months = monthRange(thisMonth, lastMonth > thisMonth ? lastMonth : thisMonth);
  const firstMonth = keys.length > 0 ? monthOf(keys[0]) : thisMonth;

  const days: Record<DayKey, CalendarDayLink> = {};
  for (const day of keys) {
    const list = byDay.get(day) ?? [];
    const noon = startOfDay(day) + 12 * 3_600_000;
    const date = dayLabel(noon);
    days[day] = {
      href: list.length === 1 ? `/arrangementer/${list[0].slug}` : `#arrangement-${list[0].slug}`,
      label: `${date.charAt(0).toUpperCase()}${date.slice(1)}: ${listDa(list.map((e) => e.title))}`,
    };
  }

  return {
    months: months.map((key) => ({ key, label: monthLabel(key) })),
    initialIndex: Math.max(0, months.indexOf(firstMonth)),
    today,
    days,
  };
}
