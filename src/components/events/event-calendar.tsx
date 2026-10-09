"use client";

import Link from "next/link";
import { useState } from "react";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import { dayNumber, monthWeeks, type DayKey } from "@/lib/events/calendar";
import type { CalendarData, CalendarDayLink } from "@/lib/events/calendar-data";
import { cn } from "@/lib/cn";

/*
  A month calendar of the coming events: a real table (weeks as rows with
  the week number as the row header, Monday first), the month name read out
  when it changes, and the previous and next month as buttons. Days with an
  event are rust circles that link to the event; today has a ring. Every
  label comes from the server (calendar-data.ts), so nothing here depends on
  the browser's locale.
*/

const WEEKDAYS: [short: string, long: string][] = [
  ["man", "mandag"],
  ["tir", "tirsdag"],
  ["ons", "onsdag"],
  ["tor", "torsdag"],
  ["fre", "fredag"],
  ["lør", "lørdag"],
  ["søn", "søndag"],
];

function Day({ day, today, link }: { day: DayKey; today: DayKey; link?: CalendarDayLink }) {
  const isToday = day === today;
  const n = dayNumber(day);

  if (link) {
    return (
      <Link
        href={link.href}
        aria-label={link.label}
        aria-current={isToday ? "date" : undefined}
        className="group flex h-11 w-full items-center justify-center rounded-md"
      >
        <span
          className={cn(
            "flex size-9 items-center justify-center rounded-full bg-rust font-semibold text-white transition-colors duration-150 ease-out-quart group-hover:bg-rust-deep",
            isToday && "ring-2 ring-ink ring-offset-2 ring-offset-paper",
          )}
        >
          {n}
        </span>
      </Link>
    );
  }

  return (
    <span aria-current={isToday ? "date" : undefined} className="flex h-11 w-full items-center justify-center">
      <span
        className={cn(
          "flex size-9 items-center justify-center rounded-full",
          day < today ? "text-muted" : "text-ink-2",
          isToday && "font-semibold text-ink ring-1 ring-ink",
        )}
      >
        {n}
      </span>
    </span>
  );
}

function NavButton({
  direction,
  target,
  onClick,
  controls,
}: {
  direction: "prev" | "next";
  target?: string;
  onClick: () => void;
  controls: string;
}) {
  const label = direction === "prev" ? "Forrige måned" : "Næste måned";
  const Icon = direction === "prev" ? CaretLeft : CaretRight;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-disabled={!target}
      aria-controls={controls}
      aria-label={target ? `${label}, ${target}` : label}
      className={cn(
        "inline-flex size-11 items-center justify-center rounded-md text-ink transition-colors duration-150 ease-out-quart",
        target ? "hover:bg-paper-2" : "cursor-default opacity-30",
      )}
    >
      <Icon size={20} aria-hidden="true" />
    </button>
  );
}

export function EventCalendar({ data, id }: { data: CalendarData; id: string }) {
  const { months, today, days } = data;
  const [index, setIndex] = useState(Math.min(data.initialIndex, months.length - 1));
  const month = months[index];
  if (!month) return null;
  const weeks = monthWeeks(month.key);
  const labelId = `${id}-maaned`;
  const tableId = `${id}-tabel`;
  const prev = months[index - 1];
  const next = months[index + 1];

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <p id={labelId} aria-live="polite" className="text-xl font-semibold text-ink">
          {month.label}
        </p>
        <div className="-mr-2 flex">
          <NavButton direction="prev" target={prev?.label} controls={tableId} onClick={() => prev && setIndex(index - 1)} />
          <NavButton direction="next" target={next?.label} controls={tableId} onClick={() => next && setIndex(index + 1)} />
        </div>
      </div>

      <table id={tableId} aria-labelledby={labelId} className="tnum mt-3 w-full table-fixed border-collapse text-center text-[0.95rem]">
        <thead>
          <tr>
            <th scope="col" className="w-[11%] pb-2 text-xs font-normal text-muted">
              <span aria-hidden="true">uge</span>
              <span className="sr-only">Uge</span>
            </th>
            {WEEKDAYS.map(([short, long]) => (
              <th key={short} scope="col" className="pb-2 text-sm font-medium text-muted">
                <span aria-hidden="true">{short}</span>
                <span className="sr-only">{long}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {weeks.map((week) => (
            <tr key={`${month.key}-${week.week}`}>
              <th scope="row" className="text-xs font-normal text-muted">
                <span className="sr-only">Uge </span>
                {week.week}
              </th>
              {week.days.map((day, i) => (
                <td key={day ?? `${month.key}-tom-${week.week}-${i}`} className="p-0">
                  {day ? <Day day={day} today={today} link={days[day]} /> : null}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <p className="mt-3 flex items-center gap-2 text-sm text-muted">
        <span aria-hidden="true" className="inline-block size-3 rounded-full bg-rust" />
        Dag med arrangement
      </p>
    </div>
  );
}
