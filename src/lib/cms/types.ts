/**
 * The shapes every page gets from the CMS façade (src/lib/cms), whether the
 * data comes from Sanity or from the JSON files in /content. Products, cakes,
 * events and FAQ extend the contract in src/lib/content.ts so existing
 * components keep working; the additions carry what Sanity knows on top.
 */
import type { PortableTextBlock } from "@portabletext/react";
import type {
  CakeType as BaseCakeType,
  EventItem as BaseEventItem,
  FaqItem as BaseFaqItem,
  Product as BaseProduct,
} from "@/lib/content";

export type { ProductCategory, Weekday } from "@/lib/content";

/** Rich text as Portable Text. Render it with <RichText> from src/lib/cms/portable-text.tsx. */
export type RichText = PortableTextBlock[];

/** One photo. `src` is a Sanity CDN URL or a path under /public such as "/images/logo.png". */
export interface CmsImage {
  src: string;
  /** Plain Danish description of what is in the picture. */
  alt: string;
  width?: number;
  height?: number;
  /** Tiny base64 preview from Sanity, for next/image `placeholder="blur"`. */
  lqip?: string;
  /** The point Kristine marked as important, 0 to 1 from the top left. Use for object-position. */
  hotspot?: { x: number; y: number };
}

export interface CmsLink {
  label: string;
  /** A path on the site ("/bagvaerk", "#book") or a full https:, mailto: or tel: URL. */
  href: string;
}

/* ------------------------------------------------------------------ */
/* Singletons                                                          */
/* ------------------------------------------------------------------ */

export interface SiteSettings {
  name: string;
  shortName: string;
  tagline: string;
  owner: string;
  founded?: number;
  cvr: string;
  address: { street: string; postalCode: string; city: string; country: string };
  phone: string;
  /** For tel: links, e.g. "+4522594493". */
  phoneHref: string;
  email: string;
  url: string;
  social: {
    facebook?: string;
    instagram?: string;
    instagramHandle?: string;
    pinterest?: string;
    linktree?: string;
  };
  smileyUrl?: string;
  /** Kristine's logo, dark on transparent: the header on paper and the footer. */
  logo?: CmsImage;
  /** The same logo in white, for the transparent header over a full-image hero. */
  logoLight?: CmsImage;
  /** An optional bar under the header, e.g. "Lukket i uge 42". */
  announcement: { enabled: boolean; text: string };
  footerText?: string;
  orderEmailTo: string;
}

export interface LocationHours {
  days: string;
  time: string;
  note?: string;
}

export interface Location {
  /** Stable id used by the pages: "bageriet" or "naestved". */
  id: string;
  name: string;
  subtitle?: string;
  address: string;
  mapsUrl?: string;
  hours: LocationHours[];
  /**
   * No longer read by the site: where orders are collected now comes from
   * getPickupLocations() (the ordering lane). Kept so old data still maps.
   */
  pickup: boolean;
  notes?: string;
}

export interface PizzaPackage {
  id: string;
  name: string;
  description: string;
  pricePerPersonOere?: number;
  minGuests: number;
  includes: string[];
}

export interface PizzaPrices {
  childOere: number;
  childAges: string;
  specialDietExtraOere: number;
  dessertOere: number;
  dessertMinCovers: number;
  mileagePerKmOere: number;
  mileageNote: string;
}

/** One pizza on the wagon's menu. The façade only returns the ones Kristine marked available. */
export interface PizzaMenuItem {
  /** The toppings, e.g. "Tomat, mozzarella og basilikum". */
  name: string;
  description?: string;
  image?: CmsImage;
  /** Price of one pizza in øre, when it has one. The wagon itself is priced per cover (`prices`). */
  priceOere?: number;
  vegetarian?: boolean;
}

/** One dessert for the wagon. Only available ones reach the site. */
export interface PizzaDessert {
  name: string;
  description?: string;
  image?: CmsImage;
  /** Price per cover in øre. Empty means the general dessert price in `prices.dessertOere`. */
  priceOere?: number;
}

/** A day the wagon stands somewhere the public can come, e.g. a market. */
export interface PizzaStop {
  _key: string;
  place: string;
  /** "YYYY-MM-DD", Danish date. */
  date: string;
  /** Opening hours as written, e.g. "11.00" and "15.00". */
  from?: string;
  to?: string;
  note?: string;
}

export interface PizzaSettings {
  intro: string;
  packages: PizzaPackage[];
  radiusKm: number;
  areaNote: string;
  notes: string[];
  prices: PizzaPrices;
  /** Paragraphs under "Sådan foregår det". */
  day: string[];
  /** Available pizzas, in Kristine's order. */
  pizzas: PizzaMenuItem[];
  /** Available desserts, in Kristine's order. */
  desserts: PizzaDessert[];
  /** Places, dates and opening hours, soonest first. Past ones are left out when rendered. */
  schedule: PizzaStop[];
  /** Paragraphs under "Praktisk". */
  terms: string[];
}

/* ------------------------------------------------------------------ */
/* Documents                                                           */
/* ------------------------------------------------------------------ */

export interface Product extends BaseProduct {
  /** The same picture as `image`, with alt text and size. */
  photo?: CmsImage;
  sort?: number;
}

export interface CakeType extends BaseCakeType {
  /** Unit for the price, e.g. "pr. person". */
  priceNote?: string;
  photo?: CmsImage;
  sort?: number;
}

export interface EventItem extends BaseEventItem {
  photo?: CmsImage;
}

export interface FaqItem extends BaseFaqItem {
  id: string;
  group: string;
  sort: number;
  /** The answer as rich text; `a` holds the same answer as plain text. */
  answer: RichText;
}

export interface InstagramImage {
  id: string;
  image: CmsImage;
  /** Link to the post, if Kristine added one. */
  url?: string;
  sort: number;
}

/* ------------------------------------------------------------------ */
/* Pages and sections                                                  */
/* ------------------------------------------------------------------ */

export interface PageSeo {
  title?: string;
  description?: string;
  image?: CmsImage;
}

export interface PageSummary {
  id: string;
  title: string;
  slug: string;
  showInNav: boolean;
  navLabel?: string;
  navOrder: number;
  hidden: boolean;
}

export interface Page extends PageSummary {
  seo: PageSeo;
  sections: Section[];
}

interface SectionBase {
  _key: string;
}

export interface HeroSection extends SectionBase {
  _type: "heroSection";
  heading: string;
  text?: string;
  image?: CmsImage;
  /** "cover": the photo fills the first screen with the text on it. "stacked": photo first, text below. */
  variant?: "cover" | "stacked";
  /** Extra photos for the cover variant; the hero crossfades through them. */
  slides?: CmsImage[];
  /** Seconds each slide stays, 3 to 15. */
  interval?: number;
  primaryLink?: CmsLink;
  secondaryLink?: CmsLink;
}

/** One of the forside's main entries: a large photo with a title, and smaller links under it. */
export interface EntryItem {
  _key: string;
  title: string;
  text?: string;
  image?: CmsImage;
  /** Where the photo and the title lead, e.g. "/bagvaerk". */
  href: string;
  /** E.g. "Bestil bagværk", "Fryser", "Kager og specialbestillinger". */
  links: CmsLink[];
}

/** "Tre indgange": large photo tiles that lead to the main parts of the site. */
export interface EntriesSection extends SectionBase {
  _type: "entriesSection";
  heading?: string;
  entries: EntryItem[];
}

export interface RichTextSection extends SectionBase {
  _type: "richTextSection";
  heading?: string;
  body: RichText;
  image?: CmsImage;
  imagePosition: "left" | "right";
  tone: "paper" | "tint";
}

export interface PhotoBandSection extends SectionBase {
  _type: "photoBandSection";
  image: CmsImage;
  caption?: string;
  ratio: "3/2" | "16/9" | "4/5";
}

export interface GallerySection extends SectionBase {
  _type: "gallerySection";
  heading?: string;
  images: { _key: string; image: CmsImage; caption?: string }[];
  columns: 2 | 3 | 4;
  /**
   * "grid": the mixed grid, first photo large, captions as one line under it.
   * "steps": photos in order with each caption under its photo, e.g. how to find the freezer.
   */
  layout: "grid" | "steps";
}

export interface ProductStripSection extends SectionBase {
  _type: "productStripSection";
  heading?: string;
  /** When empty, the section states the deadline rule from the ordering settings. */
  text?: string;
  /** "auto" shows the first `limit` active products; "manual" shows `products`. */
  mode: "auto" | "manual";
  products: Product[];
  limit: number;
  link?: CmsLink;
}

export interface PriceListRow {
  _key: string;
  name: string;
  /** Free text, e.g. "275 kr. pr. kuvert". */
  price: string;
  note?: string;
}

export interface PriceListSection extends SectionBase {
  _type: "priceListSection";
  heading?: string;
  intro?: string;
  rows: PriceListRow[];
  footnote?: string;
}

export interface HoursSection extends SectionBase {
  _type: "hoursSection";
  heading?: string;
  text?: string;
  /** Show only the location with this id ("bageriet" or "naestved"); empty shows all. */
  only?: string;
  link?: CmsLink;
}

export interface EventsSection extends SectionBase {
  _type: "eventsSection";
  heading?: string;
  text?: string;
  /** Show the fixed weekly hours (from the locations) as a table before the dates. */
  showWeek: boolean;
  emptyText?: string;
  limit: number;
  link?: CmsLink;
}

export interface FaqSection extends SectionBase {
  _type: "faqSection";
  heading?: string;
  mode: "all" | "selected";
  items: FaqItem[];
}

export interface InstagramSection extends SectionBase {
  _type: "instagramSection";
  heading?: string;
  linkLabel?: string;
  limit: number;
}

export interface CtaSection extends SectionBase {
  _type: "ctaSection";
  heading?: string;
  text?: string;
  link: CmsLink;
  image?: CmsImage;
  tone: "paper" | "tint";
}

export type FormKind = "pizza" | "cake" | "contact" | "company" | "course" | "newsletter" | "event";

export interface FormSection extends SectionBase {
  _type: "formSection";
  kind: FormKind;
  heading?: string;
  text?: string;
  /** "Sådan går det videre", shown beside the form. */
  steps: string[];
}

export interface QuoteSection extends SectionBase {
  _type: "quoteSection";
  quote: string;
  attribution?: string;
}

/** The list of cakes (from getCakes()) with from-prices. */
export interface CakeListSection extends SectionBase {
  _type: "cakeListSection";
  heading?: string;
  text?: string;
}

export type PizzaSectionPart = "intro" | "day" | "schedule" | "prices" | "menu" | "terms";

/** One part of the pizza wagon page, rendered from getPizzaSettings(). */
export interface PizzaSection extends SectionBase {
  _type: "pizzaSection";
  part: PizzaSectionPart;
  heading?: string;
  text?: string;
}

/** How pickup works, written from the pickup locations, their dates and the deadline rule. */
export interface PickupInfoSection extends SectionBase {
  _type: "pickupInfoSection";
  heading?: string;
  /** "kort" is the short version (find-os), "udførlig" the full one (levering). */
  detail: "kort" | "udførlig";
  text?: string;
  link?: CmsLink;
}

/** Heading, text and the phone and email from SiteSettings. */
export interface ContactSection extends SectionBase {
  _type: "contactSection";
  heading?: string;
  text?: string;
}

export type Section =
  | HeroSection
  | EntriesSection
  | RichTextSection
  | PhotoBandSection
  | GallerySection
  | ProductStripSection
  | PriceListSection
  | HoursSection
  | EventsSection
  | FaqSection
  | InstagramSection
  | CtaSection
  | FormSection
  | QuoteSection
  | CakeListSection
  | PizzaSection
  | PickupInfoSection
  | ContactSection;

export type SectionType = Section["_type"];

/** Every section `_type`, in the order they appear in the Studio. */
export const SECTION_TYPES = [
  "heroSection",
  "entriesSection",
  "richTextSection",
  "photoBandSection",
  "gallerySection",
  "productStripSection",
  "priceListSection",
  "hoursSection",
  "eventsSection",
  "faqSection",
  "instagramSection",
  "ctaSection",
  "formSection",
  "quoteSection",
  "cakeListSection",
  "pizzaSection",
  "pickupInfoSection",
  "contactSection",
] as const satisfies readonly SectionType[];
