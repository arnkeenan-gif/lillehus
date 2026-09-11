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
  Weekday,
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
  /** A path on the site ("/bageri", "#book") or a full https:, mailto: or tel: URL. */
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
  logo?: CmsImage;
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
  /** Whether ordered bread is picked up here. */
  pickup: boolean;
  notes?: string;
}

export interface ShopSettings {
  pickupDays: Weekday[];
  pickupWindow: string;
  pickupPlace: string;
  cutoffHour: number;
  cutoffDaysBefore: number;
  maxDaysAhead: number;
  minOrderOere: number;
  delivery: {
    enabled: boolean;
    feeOere: number;
    freeAboveOere: number;
    radiusKm: number;
    days: Weekday[];
    note: string;
  };
  /** ISO dates ("2026-12-24") with no pickup. */
  closedDates: string[];
  notice: string;
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

export interface PizzaSettings {
  intro: string;
  packages: PizzaPackage[];
  radiusKm: number;
  areaNote: string;
  notes: string[];
  prices: PizzaPrices;
  /** Paragraphs under "Sådan foregår det". */
  day: string[];
  pizzas: { name: string; vegetarian?: boolean }[];
  desserts: string[];
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
}

export interface ProductStripSection extends SectionBase {
  _type: "productStripSection";
  heading?: string;
  /** When empty, show the pickup facts from ShopSettings (cutoff and pickup days). */
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

/** One part of the pizza wagon page, rendered from getPizzaSettings(). */
export interface PizzaSection extends SectionBase {
  _type: "pizzaSection";
  part: "day" | "prices" | "menu" | "terms";
  heading?: string;
  text?: string;
}

/** How pickup and delivery work, written from getShopSettings() and the locations. */
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
