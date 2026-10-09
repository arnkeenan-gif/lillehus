/**
 * Event types: what the events façade (src/lib/cms/events.ts) hands the
 * pages, whether the data comes from Sanity or from content/events.json and
 * content/events/categories.json. Owned by the events lane; see CLAUDE.md.
 */
import type { EventItem, RichText } from "./types";

/** A subcategory of Arrangementer, such as "Kurser". Kristine adds more in the Studio. */
export interface EventCategory {
  /** Same as the slug; stable while the category exists. */
  id: string;
  /** The category's address: /arrangementer/kategori/<slug>. */
  slug: string;
  title: string;
  /** A few sentences at the top of the category's page. */
  intro?: string;
  /** Lowest first in the menu over the calendar. */
  sort: number;
}

/**
 * One event as the pages see it. Hidden events never get this far.
 *
 * It extends EventItem, which the forside and find-os have always read:
 * `description` carries the short summary as plain text, `kind` the
 * category's name, `priceOere` is undefined when the event has no price.
 */
export interface EventEntry extends EventItem {
  category?: EventCategory;
  /** One or two lines for lists and for sharing. May be empty. */
  summary: string;
  /** The full description as Portable Text. Render it with <RichText>. */
  body: RichText;
  /** The guest pays on the site when signing up. Only ever true together with a price. */
  payment: boolean;
  /** ISO 8601. Sign-up closes at this moment. */
  signupDeadline?: string;
}
