/**
 * Cake options: what the customer picked, what it costs and how it reads.
 * The cake page uses it for the live price, the cart for the option lines,
 * and the checkout and the request action for re-checking everything
 * against the CMS (the browser's prices and labels are never trusted).
 * Client-safe.
 */
import type { CakeOptionGroup, CakeProduct } from "@/lib/cms/ordering-types";
import { lowerFirst } from "./dates";

/** Group id to choice id (dropdown, radio), choice ids (add-ons) or text (text field). */
export type CakeSelections = Record<string, string | string[]>;

export const MAX_OPTION_TEXT = 200;

export interface CakeEvaluation {
  /** Price of one cake in øre: the base price plus the chosen options. */
  unitOere: number;
  /** "Smag: Brownie", "Tilvalg: Flag, Lys", in the order of the groups. */
  lines: string[];
  /** Group id to a message, for groups that still need an answer. */
  errors: Record<string, string>;
  /** The selections with unknown ids and empty answers removed. */
  clean: CakeSelections;
  /** True when the extras may change the price ("fra 495 kr."). */
  hasPricedChoices: boolean;
}

/** What the page selects before the customer touches anything: the default choices. */
export function defaultSelections(groups: CakeOptionGroup[]): CakeSelections {
  const out: CakeSelections = {};
  for (const group of groups) {
    if (group.type === "text") continue;
    const defaults = group.choices.filter((c) => c.isDefault).map((c) => c.id);
    if (group.type === "addons") {
      if (defaults.length > 0) out[group.id] = defaults;
    } else if (defaults[0]) {
      out[group.id] = defaults[0];
    }
  }
  return out;
}

function asList(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((v): v is string => typeof v === "string");
  return typeof value === "string" && value ? [value] : [];
}

/** True when any choice costs extra. */
export function hasPricedChoices(groups: CakeOptionGroup[]): boolean {
  return groups.some((g) => g.choices.some((c) => c.priceOere > 0));
}

/**
 * Checks the selections against the cake's option groups and prices them.
 * Unknown groups and choices are dropped; required groups without an answer
 * get a Danish message in `errors`.
 */
export function evaluateCake(cake: Pick<CakeProduct, "basePriceOere" | "optionGroups">, selections: unknown): CakeEvaluation {
  const input = selections && typeof selections === "object" && !Array.isArray(selections) ? (selections as Record<string, unknown>) : {};
  let unitOere = cake.basePriceOere;
  const lines: string[] = [];
  const errors: Record<string, string> = {};
  const clean: CakeSelections = {};

  for (const group of cake.optionGroups) {
    const raw = input[group.id];
    if (group.type === "text") {
      const text = (typeof raw === "string" ? raw : "").replace(/\s+/g, " ").trim().slice(0, MAX_OPTION_TEXT);
      if (text) {
        clean[group.id] = text;
        lines.push(`${group.title}: ${text}`);
      } else if (group.required) {
        errors[group.id] = `Skriv ${lowerFirst(group.title)}.`;
      }
      continue;
    }

    const wanted = new Set(asList(raw));
    const chosen = group.choices.filter((c) => wanted.has(c.id));
    if (group.type === "addons") {
      if (chosen.length > 0) {
        clean[group.id] = chosen.map((c) => c.id);
        unitOere += chosen.reduce((sum, c) => sum + c.priceOere, 0);
        lines.push(`${group.title}: ${chosen.map((c) => c.label).join(", ")}`);
      } else if (group.required) {
        errors[group.id] = "Vælg mindst én.";
      }
      continue;
    }

    // dropdown and radio: exactly one.
    const one = chosen[0];
    if (one) {
      clean[group.id] = one.id;
      unitOere += one.priceOere;
      lines.push(`${group.title}: ${one.label}`);
    } else if (group.required) {
      errors[group.id] = `Vælg ${lowerFirst(group.title)}.`;
    }
  }

  return { unitOere, lines, errors, clean, hasPricedChoices: hasPricedChoices(cake.optionGroups) };
}

/** A stable string for a set of selections, so the same cake with the same choices is one cart line. */
export function selectionsKey(clean: CakeSelections): string {
  return Object.keys(clean)
    .sort()
    .map((key) => {
      const value = clean[key];
      return `${key}=${Array.isArray(value) ? [...value].sort().join("+") : value}`;
    })
    .join("&");
}
