import { formatPrice } from "@/lib/format";
import type { PizzaSettings } from "@/lib/cms";

/*
  The rough price a visitor sees while filling in the pizza booking form,
  and the same sum in the emails. Pure: no React and no server imports, so
  the client form and the server action share one calculation. Every rate
  comes from the pizza settings (content/pizza.json, or the Pizzavogn
  document in Sanity); nothing is hardcoded here.
*/

export interface PizzaRates {
  adultOere: number;
  childOere: number;
  specialDietExtraOere: number;
  dessertOere: number;
  mileagePerKmOere: number;
}

export interface PizzaCounts {
  adults: number;
  children: number;
  specialDiet: number;
  dessertCovers: number;
}

export interface PizzaEstimateRow {
  label: string;
  oere: number;
}

export interface PizzaEstimate {
  rows: PizzaEstimateRow[];
  totalOere: number;
  /** A third of the total, rounded to whole kroner. */
  depositOere: number;
}

/** The rates the estimate needs, read from the pizza settings. `packages[0]` is the ad libitum offer. */
export function pizzaRates(pizza: PizzaSettings): PizzaRates {
  return {
    adultOere: pizza.packages[0]?.pricePerPersonOere ?? 0,
    childOere: pizza.prices.childOere,
    specialDietExtraOere: pizza.prices.specialDietExtraOere,
    dessertOere: pizza.prices.dessertOere,
    mileagePerKmOere: pizza.prices.mileagePerKmOere,
  };
}

/** "45" from an input reads as 45; blanks, negatives and nonsense read as 0. */
export function toCount(raw: string | number | undefined | null): number {
  const n = typeof raw === "number" ? raw : Number(String(raw ?? "").trim());
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
}

function plural(n: number, one: string, many: string): string {
  return n === 1 ? one : many;
}

export function estimatePizza(rates: PizzaRates, counts: PizzaCounts): PizzaEstimate {
  const rows: PizzaEstimateRow[] = [];
  if (counts.adults > 0) {
    rows.push({
      label: `${counts.adults} ${plural(counts.adults, "voksen", "voksne")} à ${formatPrice(rates.adultOere)}`,
      oere: counts.adults * rates.adultOere,
    });
  }
  if (counts.children > 0) {
    rows.push({
      label: `${counts.children} ${plural(counts.children, "barn", "børn")} à ${formatPrice(rates.childOere)}`,
      oere: counts.children * rates.childOere,
    });
  }
  /* The two add-ons name the count only; their per-cover price stands in the price list above the form. */
  if (counts.specialDiet > 0 && rates.specialDietExtraOere > 0) {
    rows.push({
      label: `${counts.specialDiet} ${plural(counts.specialDiet, "vegansk eller glutenfri", "veganske eller glutenfri")}`,
      oere: counts.specialDiet * rates.specialDietExtraOere,
    });
  }
  if (counts.dessertCovers > 0 && rates.dessertOere > 0) {
    rows.push({
      label: `Dessert, ${counts.dessertCovers} ${plural(counts.dessertCovers, "kuvert", "kuverter")}`,
      oere: counts.dessertCovers * rates.dessertOere,
    });
  }
  const totalOere = rows.reduce((sum, row) => sum + row.oere, 0);
  const depositOere = Math.round(totalOere / 300) * 100;
  return { rows, totalOere, depositOere };
}

/** "Cirka 12.100 kr. plus kørsel 4 kr. pr. km" */
export function estimateLine(estimate: PizzaEstimate, rates: PizzaRates): string {
  return `Cirka ${formatPrice(estimate.totalOere)} ${mileageLine(rates)}`;
}

/** "plus kørsel 4 kr. pr. km" */
export function mileageLine(rates: PizzaRates): string {
  return `plus kørsel ${formatPrice(rates.mileagePerKmOere)} pr. km`;
}

/** "Depositum en tredjedel: cirka 4.033 kr." */
export function depositLine(estimate: PizzaEstimate): string {
  return `Depositum en tredjedel: cirka ${formatPrice(estimate.depositOere)}`;
}

/** "Voksen 275 kr., barn 175 kr.", the line before anyone has typed a number. */
export function ratesLine(rates: PizzaRates): string {
  return `Voksen ${formatPrice(rates.adultOere)}, barn ${formatPrice(rates.childOere)}`;
}
