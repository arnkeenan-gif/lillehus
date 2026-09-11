/**
 * Every schema type the Studio knows. Singletons first, then the documents
 * Kristine adds to, then the objects the sections are built from.
 */
import { objectTypes } from "./objects";
import { sectionTypes } from "./sections";
import { siteSettings } from "./documents/siteSettings";
import { hours } from "./documents/hours";
import { shopSettings } from "./documents/shopSettings";
import { pizzaSettings } from "./documents/pizzaSettings";
import { page } from "./documents/page";
import { product } from "./documents/product";
import { cake } from "./documents/cake";
import { event } from "./documents/event";
import { faqItem } from "./documents/faqItem";
import { instagramPost } from "./documents/instagramPost";

export const schemaTypes = [
  siteSettings,
  hours,
  shopSettings,
  pizzaSettings,
  page,
  product,
  cake,
  event,
  faqItem,
  instagramPost,
  ...objectTypes,
  ...sectionTypes,
];
