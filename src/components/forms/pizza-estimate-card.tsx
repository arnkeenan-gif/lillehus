"use client";

import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/cn";
import { depositLine, mileageLine, ratesLine, type PizzaEstimate, type PizzaRates } from "@/components/forms/pizza-estimate";

interface Props {
  estimate: PizzaEstimate;
  rates: PizzaRates;
  className?: string;
}

/**
 * The one bordered box on the pizza page: the running estimate beside the
 * form, recomputed as the visitor types. Before any number is typed it
 * states the two per-cover prices instead.
 */
export function PizzaEstimateCard({ estimate, rates, className }: Props) {
  return (
    <div className={cn("rounded-lg border border-line p-6", className)}>
      {estimate.totalOere > 0 ? (
        <>
          <p className="text-ink">
            <span className="tnum block text-[1.75rem] font-semibold leading-tight tracking-tight">
              Cirka {formatPrice(estimate.totalOere)}
            </span>
            <span className="mt-1 block text-ink-2">{mileageLine(rates)}</span>
          </p>
          <ul className="mt-5 space-y-2 text-sm">
            {estimate.rows.map((row) => (
              <li key={row.label} className="flex items-baseline">
                <span className="min-w-0 text-ink-2">{row.label}</span>
                <span className="leader" aria-hidden="true" />
                <span className="tnum shrink-0 text-ink">{formatPrice(row.oere)}</span>
              </li>
            ))}
          </ul>
          <p className="tnum mt-5 font-medium text-ink">{depositLine(estimate)}</p>
        </>
      ) : (
        <p className="text-ink">
          <span className="tnum block text-lg font-semibold">{ratesLine(rates)}</span>
          <span className="mt-1 block text-ink-2">pr. kuvert, {mileageLine(rates)}</span>
        </p>
      )}
      <p className="mt-5 text-sm text-muted">Det er en forespørgsel, ikke en bindende bestilling. Kristine bekræfter pris og dato.</p>
    </div>
  );
}
