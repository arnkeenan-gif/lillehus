/**
 * Ordering types shared across lanes. The ordering lane owns this file and
 * may ADD fields; it must not rename or remove the ones below, because the
 * content lane reads them (pickup info, FAQ, front page).
 */
import type { CmsImage, RichText } from "./types";

/** One day a location is open for pickup. Dates are local Danish dates. */
export interface PickupDate {
  /** "YYYY-MM-DD" in Europe/Copenhagen. */
  date: string;
  /** Pickup window, e.g. "9.00" and "12.00". Empty until Kristine sets it. */
  from?: string;
  to?: string;
  /** Closed for holidays or changed plans; kept so the date can be reopened. */
  closed?: boolean;
  note?: string;
}

export interface PickupLocation {
  id: string;
  name: string;
  address?: string;
  note?: string;
  mapsUrl?: string;
  /** Only active locations are offered to customers. At launch only the farm is active. */
  active: boolean;
  sort: number;
  /** Open dates in the future, soonest first, closed ones removed. */
  dates: PickupDate[];
}

/** When ordering closes: `hour` o'clock, `daysBefore` days before the pickup date, Danish local time. */
export interface DeadlineRule {
  daysBefore: number;
  hour: number;
}

export interface OrderingSettings {
  /** Default for every product unless its category or the product itself overrides it. */
  defaultDeadline: DeadlineRule;
  /** Smallest order total in øre; 0 or missing means no minimum. */
  minOrderOere?: number;
  /** Kristine's own message at the top of the bagværk page, e.g. a holiday. Empty for none. */
  notice?: string;
}

/* ------------------------------------------------------------------ */
/* Added by the ordering lane, October 2026                            */
/* ------------------------------------------------------------------ */

/** A heading in the bagværk shop ("Brød", "Rugbrød", ...). Empty categories are not shown. */
export interface BakeryCategory {
  /** Stable id from the slug, e.g. "rugbroed". Used for anchors on the page. */
  id: string;
  title: string;
  description?: string;
  sort: number;
  /** Own deadline for every product in the category. Missing uses the default. */
  deadline?: DeadlineRule;
}

/** One product in the bagværk shop. Only shown (active) products come out of the façade. */
export interface BakeryProduct {
  /** Stable id from the slug; the cart, the checkout and Stripe use it. */
  id: string;
  name: string;
  description?: string;
  /** Price in øre. */
  priceOere: number;
  photo?: CmsImage;
  /** The category's id. */
  categoryId: string;
  active: boolean;
  /** Can be ordered online. When false the product is shown with its price but cannot be added. */
  orderable: boolean;
  sort: number;
  /** Own deadline. Missing uses the category's, then the default. */
  deadline?: DeadlineRule;
}

/** How a cake option is chosen: a dropdown or radio buttons (one), add-ons (several) or a text field. */
export type CakeOptionType = "dropdown" | "radio" | "addons" | "text";

export interface CakeOptionChoice {
  id: string;
  label: string;
  /** Added to the cake's price, in øre. 0 for no extra cost. */
  priceOere: number;
  /** Selected when the page opens. */
  isDefault: boolean;
}

export interface CakeOptionGroup {
  id: string;
  /** What the customer chooses, e.g. "Smag" or "Kagemand eller kagekone". */
  title: string;
  type: CakeOptionType;
  /** The customer must choose (or write) something before ordering. */
  required: boolean;
  /** A line under the field, e.g. what to write. */
  helper?: string;
  /** Empty for a text field. */
  choices: CakeOptionChoice[];
}

/** One section of the long description under a cake, e.g. "Ingredienser". */
export interface CakeDescriptionSection {
  id: string;
  heading?: string;
  body: RichText;
}

/** A cake Kristine sets up with its own options, like Emma's kagemænd. */
export interface CakeProduct {
  /** Stable id from the slug; also the address /kager/<id>. */
  id: string;
  name: string;
  /** A sentence or two under the name. */
  intro?: string;
  /** The gallery; the first photo is the one on the overview. */
  photos: CmsImage[];
  /** Price in øre before options. 0 means "Pris aftales": the page sends a request instead of adding to the cart. */
  basePriceOere: number;
  optionGroups: CakeOptionGroup[];
  minQuantity: number;
  maxQuantity: number;
  /** Own deadline, since cakes often need more notice. Missing uses the default. */
  deadline?: DeadlineRule;
  sections: CakeDescriptionSection[];
  active: boolean;
  sort: number;
}
