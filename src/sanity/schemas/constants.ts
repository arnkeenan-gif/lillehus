/**
 * Option lists and fixed ids shared by the schemas, the structure and the seed.
 * Values are stable ids the site reads; titles are what Kristine sees.
 */

/** Document types that exist exactly once. They are pinned in the Studio and cannot be created or deleted. */
export const SINGLETON_TYPES = ["siteSettings", "hours", "shopSettings", "pizzaSettings"] as const;
export type SingletonType = (typeof SINGLETON_TYPES)[number];

export function isSingleton(type: string | undefined): type is SingletonType {
  return (SINGLETON_TYPES as readonly string[]).includes(type ?? "");
}

/** The id of the forside page document, used by the Studio structure and the seed. */
export const FORSIDE_ID = "page-forside";

export const WEEKDAY_OPTIONS = [
  { title: "mandag", value: "man" },
  { title: "tirsdag", value: "tir" },
  { title: "onsdag", value: "ons" },
  { title: "torsdag", value: "tor" },
  { title: "fredag", value: "fre" },
  { title: "lørdag", value: "lør" },
  { title: "søndag", value: "søn" },
];

/** The 14 allergens that must be declared, in the order they usually appear on a Danish label. */
export const ALLERGEN_OPTIONS = [
  { title: "Gluten", value: "gluten" },
  { title: "Mælk", value: "mælk" },
  { title: "Æg", value: "æg" },
  { title: "Nødder", value: "nødder" },
  { title: "Jordnødder", value: "jordnødder" },
  { title: "Sesam", value: "sesam" },
  { title: "Soja", value: "soja" },
  { title: "Sennep", value: "sennep" },
  { title: "Selleri", value: "selleri" },
  { title: "Lupin", value: "lupin" },
  { title: "Sulfitter", value: "sulfitter" },
  { title: "Fisk", value: "fisk" },
  { title: "Skaldyr", value: "skaldyr" },
  { title: "Bløddyr", value: "bløddyr" },
];

export const TONE_OPTIONS = [
  { title: "Lys, som resten af siden", value: "paper" },
  { title: "Tonet, lidt mørkere baggrund", value: "tint" },
];

export const FORM_KIND_OPTIONS = [
  { title: "Book pizzavognen", value: "pizza" },
  { title: "Forespørg på kage", value: "cake" },
  { title: "Skriv til os (kontakt)", value: "contact" },
  { title: "Firmaaftale", value: "company" },
  { title: "Kursus, interesse", value: "course" },
  { title: "Nyhedsbrev", value: "newsletter" },
  { title: "Tilmelding til arrangement", value: "event" },
];


export const LOCATION_FILTER_OPTIONS = [
  { title: "Alle steder", value: "alle" },
  { title: "Kun fryseren på gården", value: "bageriet" },
  { title: "Kun Torvedag i Næstved", value: "naestved" },
];
