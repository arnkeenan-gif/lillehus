/**
 * Helpers for the event schemas. Relative imports only: the Sanity CLI reads
 * these files too and does not know the "@/" alias.
 */
import type { SlugRule, SlugValue } from "sanity";
import { RESERVED_EVENT_SLUGS, isValidSlug } from "../../../lib/cms/events-shared";

/** "Arrangementer på gården" gives "arrangementer-paa-gaarden": Danish letters spelt out, the way the site's own addresses are. */
export function danishSlugify(input: string, maxLength = 60): string {
  return input
    .toLowerCase()
    .replace(/æ/g, "ae")
    .replace(/ø/g, "oe")
    .replace(/å/g, "aa")
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, maxLength)
    .replace(/-+$/g, "");
}

/** A required address made of small letters, digits and hyphens; `reserved` lists words other pages use. */
export function slugValidation(rule: SlugRule, reserved: readonly string[] = []) {
  return rule
    .required()
    .error("Tryk på Generer for at lave en adresse.")
    .custom((value: SlugValue | undefined) => {
      const current = value?.current;
      if (!current) return true;
      if (!isValidSlug(current)) return "Brug kun små bogstaver (uden æ, ø og å), tal og bindestreger. Tryk på Generer.";
      if (reserved.includes(current)) return `Adressen "${current}" bruges af en anden side. Vælg en anden.`;
      return true;
    });
}

export const EVENT_SLUG_RESERVED = RESERVED_EVENT_SLUGS;
