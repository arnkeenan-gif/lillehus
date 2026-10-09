/**
 * Base content types shared by the CMS façade (src/lib/cms). The data itself
 * lives in Sanity, or in the JSON in /content when Sanity is not configured;
 * pages always read it through @/lib/cms, never from here.
 */

/** Danish weekday abbreviations used for pickup availability. */
export type Weekday = "man" | "tir" | "ons" | "tor" | "fre" | "lør" | "søn";

export const WEEKDAY_LABELS: Record<Weekday, string> = {
  man: "mandag",
  tir: "tirsdag",
  ons: "onsdag",
  tor: "torsdag",
  fre: "fredag",
  lør: "lørdag",
  søn: "søndag",
};

export type ProductCategory = "brød" | "boller" | "kager" | "andet";

export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  /** Price in øre (integer). 4500 = 45 kr. */
  priceOere: number;
  /** Path under /public, e.g. "/images/surdejsbroed.jpg". */
  image?: string;
  category: ProductCategory;
  /** Weekdays the item can be ordered for pickup. Empty = every pickup day. */
  days: Weekday[];
  allergens?: string[];
  active: boolean;
  /** Set once the product exists in Stripe; the shop prefers this over priceOere. */
  stripePriceId?: string;
}

export interface CakeType {
  id: string;
  slug: string;
  name: string;
  description: string;
  /** Starting price in øre, shown as "fra 350 kr." */
  fromPriceOere: number;
  /** Free text, e.g. "8 til 30 personer". */
  servings: string;
  /** Minimum notice in days. */
  leadTimeDays: number;
  image?: string;
  /** Selectable flavour/variant options for the request form. */
  options?: string[];
}

export interface EventItem {
  id: string;
  slug: string;
  title: string;
  /** ISO 8601 with offset, e.g. "2026-10-03T10:00:00+02:00". */
  start: string;
  end?: string;
  place: string;
  description: string;
  /** Price per person in øre, if any. */
  priceOere?: number;
  /** Whether the site should show a sign-up form for this event. */
  signup: boolean;
  capacity?: number;
  image?: string;
  /** "kursus" | "marked" | "arrangement" etc. Free text, shown as a label. */
  kind: string;
}

export interface FaqItem {
  q: string;
  a: string;
}

export interface PizzaPackage {
  id: string;
  name: string;
  description: string;
  /** Per-person price in øre, if fixed. Otherwise leave undefined and describe in text. */
  pricePerPersonOere?: number;
  minGuests: number;
  includes: string[];
}

export interface PizzaContent {
  intro: string;
  packages: PizzaPackage[];
  /** Radius in km the wagon normally drives, for the booking form copy. */
  radiusKm: number;
  notes: string[];
}
