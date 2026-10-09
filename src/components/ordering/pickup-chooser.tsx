"use client";

import { MapPin } from "@phosphor-icons/react";
import type { DeadlineRule } from "@/lib/cms/ordering-types";
import { locationDetails, pickupTime, type ClientLocation } from "@/lib/cart-pickup";
import { cn } from "@/lib/cn";
import { chipParts } from "@/lib/ordering/dates";
import { deadlineText, lastDeadline, shownDeadline } from "@/lib/ordering/deadline";

/*
  Step one and two of an order: where to pick up, then which of the dates
  Kristine opened for that place. Changing the place shows that place's
  dates (a place never borrows another place's dates). A date whose deadline
  has passed is shown but cannot be chosen. Under the dates: the deadline for
  the chosen date, the pickup time and Kristine's note, when she set them.
  Used in the pickup dialog on /bagvaerk and inline on the cake pages.
*/

export interface PickupDraft {
  locationId: string;
  date: string | null;
}

type Props = {
  locations: ClientLocation[];
  /** The deadline rules that matter here: a date can be chosen while one of them is still open. */
  rules: DeadlineRule[];
  /** The rule whose deadline is stated for the chosen date. */
  general: DeadlineRule;
  now: number;
  value: PickupDraft | null;
  onChange: (next: PickupDraft) => void;
  /** Unique per chooser on the page, for input ids. */
  idPrefix: string;
  /** Legends for the two steps. */
  locationLegend?: string;
  dateLegend?: string;
  /** An error from the parent, e.g. "Vælg en dato." */
  error?: string;
};

const chipBase =
  "flex min-h-[4.25rem] flex-col justify-center rounded-md border px-3 py-2 text-left transition-[background-color,border-color,color] duration-150 ease-out-quart";

export function PickupChooser({
  locations,
  rules,
  general,
  now,
  value,
  onChange,
  idPrefix,
  locationLegend = "1. Vælg afhentningssted",
  dateLegend = "2. Vælg dato",
  error,
}: Props) {
  const location = locations.find((l) => l.id === value?.locationId) ?? null;
  const dates = location?.dates ?? [];
  const chosen = dates.find((d) => d.date === value?.date) ?? null;
  const deadline = chosen ? shownDeadline(chosen.date, rules, general, now) : null;
  const time = chosen ? pickupTime(chosen) : "";
  const isOpen = (date: string) => {
    const last = lastDeadline(date, rules);
    return last !== null && now < last.getTime();
  };
  const anyClosed = dates.some((d) => !isOpen(d.date));
  // Keep the cards the same width when only some places have a map link.
  const anyMap = locations.some((l) => Boolean(l.mapsUrl));

  if (locations.length === 0) {
    return <p className="text-ink-2">Der er ikke åbent for bestilling lige nu.</p>;
  }

  return (
    <div className="flex flex-col gap-8">
      <fieldset className="min-w-0">
        <legend className="float-left mb-3 w-full font-semibold text-ink">{locationLegend}</legend>
        <div className="clear-left flex flex-col gap-2">
          {locations.map((l) => {
            const id = `${idPrefix}-sted-${l.id}`;
            const details = locationDetails(l);
            const selected = l.id === value?.locationId;
            return (
              <div key={l.id} className="flex items-stretch gap-2">
                <label
                  htmlFor={id}
                  className={cn(
                    "flex min-h-14 flex-1 cursor-pointer items-center gap-3 rounded-md border px-4 py-3 transition-colors duration-150 ease-out-quart",
                    selected ? "border-rust bg-rust-tint" : "border-line bg-white hover:border-ink",
                  )}
                >
                  <input
                    id={id}
                    type="radio"
                    name={`${idPrefix}-sted`}
                    value={l.id}
                    checked={selected}
                    onChange={() => onChange({ locationId: l.id, date: null })}
                    className="size-5 shrink-0 accent-rust"
                  />
                  <span className="min-w-0">
                    <span className="block font-medium text-ink">{l.name}</span>
                    {details ? <span className="block text-sm text-muted">{details}</span> : null}
                  </span>
                </label>
                {l.mapsUrl ? (
                  <a
                    href={l.mapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex w-12 shrink-0 items-center justify-center rounded-md text-muted transition-colors duration-150 ease-out-quart hover:bg-paper-2 hover:text-ink"
                  >
                    <MapPin size={22} aria-hidden="true" />
                    <span className="sr-only">Vis {l.name} på kort (åbner i et nyt vindue)</span>
                  </a>
                ) : anyMap ? (
                  <span aria-hidden="true" className="w-12 shrink-0" />
                ) : null}
              </div>
            );
          })}
        </div>
      </fieldset>

      {location ? (
        <fieldset className="min-w-0" aria-describedby={error ? `${idPrefix}-dato-fejl` : undefined}>
          <legend className="float-left mb-3 w-full font-semibold text-ink">{dateLegend}</legend>
          {dates.length === 0 ? (
            <p className="clear-left text-ink-2">Der er ingen åbne datoer på {location.name} lige nu.</p>
          ) : (
            <div className="clear-left grid grid-cols-3 gap-2 sm:grid-cols-4">
              {dates.map((d) => {
                const id = `${idPrefix}-dato-${d.date}`;
                const open = isOpen(d.date);
                const selected = d.date === value?.date;
                const parts = chipParts(d.date);
                return (
                  <div key={d.date} className="relative">
                    <input
                      id={id}
                      type="radio"
                      name={`${idPrefix}-dato`}
                      value={d.date}
                      checked={selected}
                      disabled={!open}
                      onChange={() => onChange({ locationId: location.id, date: d.date })}
                      className="peer sr-only"
                    />
                    <label
                      htmlFor={id}
                      className={cn(
                        chipBase,
                        "peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-rust",
                        !open
                          ? "cursor-not-allowed border-dashed border-line bg-paper-2 text-muted"
                          : selected
                            ? "cursor-pointer border-rust bg-rust-tint text-ink"
                            : "cursor-pointer border-line bg-white text-ink hover:border-ink",
                      )}
                    >
                      <span className="text-sm leading-tight">{parts.weekday}</span>
                      <span className="tnum font-semibold leading-tight">{parts.date}</span>
                      {!open ? <span className="mt-0.5 text-xs leading-tight">For sent</span> : null}
                    </label>
                  </div>
                );
              })}
            </div>
          )}
          {anyClosed ? <p className="mt-3 text-sm text-muted">For sent betyder, at fristen for at bestille til den dag er gået.</p> : null}
          {error ? (
            <p id={`${idPrefix}-dato-fejl`} role="alert" className="mt-3 text-sm text-danger">
              {error}
            </p>
          ) : null}
        </fieldset>
      ) : null}

      <div aria-live="polite" className="empty:hidden">
        {chosen && deadline ? (
          <div className="flex flex-col gap-1 text-ink">
            <p className="font-medium">Bestil senest {deadlineText(chosen.date, deadline.rule)}.</p>
            {time ? <p className="text-ink-2">Afhentning {time}.</p> : null}
            {chosen.note ? <p className="text-ink-2">{chosen.note}</p> : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
