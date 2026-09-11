/**
 * Select and checkbox options shared by the server actions (validation) and
 * the client forms (rendering). Values are stable ids; labels are what people see.
 * Client-safe: no server imports.
 */

export interface Option {
  value: string;
  label: string;
}

export const PIZZA_EVENT_TYPES: readonly Option[] = [
  { value: "barnedaab", label: "Barnedåb" },
  { value: "konfirmation", label: "Konfirmation" },
  { value: "foedselsdag", label: "Fødselsdag" },
  { value: "firmaarrangement", label: "Firmaarrangement" },
  { value: "marked", label: "Marked" },
  { value: "andet", label: "Andet" },
];

export const SOURCES: readonly Option[] = [
  { value: "facebook", label: "Facebook" },
  { value: "instagram", label: "Instagram" },
  { value: "anbefaling", label: "Anbefaling" },
  { value: "marked", label: "Markedet i Næstved" },
  { value: "andet", label: "Andet" },
];

/** Value of the "no dessert" choice; the real desserts come from content/pizza.json. */
export const DESSERT_NONE = "ingen";

export const CAKE_DELIVERY: readonly Option[] = [
  { value: "afhentning", label: "Afhentning i Hønsehuset på gården" },
  { value: "levering", label: "Levering efter aftale" },
];

export const CONTACT_SUBJECTS: readonly Option[] = [
  { value: "bestilling", label: "Bestilling af brød" },
  { value: "pizzavogn", label: "Pizzavognen" },
  { value: "kage", label: "Kage" },
  { value: "firmaaftale", label: "Firmaaftale" },
  { value: "andet", label: "Andet" },
];

export const COURSES: readonly Option[] = [
  { value: "surdej", label: "Surdejskursus" },
  { value: "pizza", label: "Pizzakursus for grupper" },
  { value: "andet", label: "Noget andet" },
];

export const COMPANY_WANTS: readonly Option[] = [
  { value: "broed", label: "Fast brød til kontoret" },
  { value: "morgenbroed", label: "Morgenbrød til møder" },
  { value: "pizzavogn", label: "Pizzavognen til et arrangement" },
  { value: "andet", label: "Noget andet" },
];

export const COMPANY_FREQUENCY: readonly Option[] = [
  { value: "hver-uge", label: "Hver uge" },
  { value: "hver-anden-uge", label: "Hver anden uge" },
  { value: "hver-maaned", label: "Hver måned" },
  { value: "en-gang", label: "En enkelt gang" },
  { value: "ved-ikke", label: "Ved ikke endnu" },
];

export function optionValues(options: readonly Option[]): [string, ...string[]] {
  const [first, ...rest] = options.map((o) => o.value);
  return [first, ...rest];
}

export function optionLabel(options: readonly Option[], value: string): string {
  return options.find((o) => o.value === value)?.label ?? value;
}
