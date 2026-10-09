/**
 * Every schema type the Studio knows. Singletons first, then the documents
 * Kristine adds to, then the objects the sections are built from.
 */
import { objectTypes } from "./objects";
import { sectionTypes } from "./sections";
import { siteSettings } from "./documents/siteSettings";
import { hours } from "./documents/hours";
import { pizzaSettings } from "./documents/pizzaSettings";
import { page } from "./documents/page";
import { faqItem } from "./documents/faqItem";
import { orderingSchemaTypes } from "./ordering";
import { eventSchemaTypes } from "./events";
import { instagramPost } from "./documents/instagramPost";

export const schemaTypes = [
  siteSettings,
  hours,
  pizzaSettings,
  page,
  ...orderingSchemaTypes,
  ...eventSchemaTypes,
  faqItem,
  instagramPost,
  ...objectTypes,
  ...sectionTypes,
];
