/**
 * Schema types for ordering: the settings ("Bageri og bestilling"),
 * categories, products, cakes with their options, pickup locations with
 * their dates, and the deadline object they share. Owned by the ordering
 * lane; see CLAUDE.md.
 */
import { shopSettings } from "./documents/shopSettings";
import { product } from "./documents/product";
import { cake } from "./documents/cake";
import { orderDeadline } from "./ordering/deadline";
import { productCategory } from "./ordering/productCategory";
import { pickupDateEntry, pickupLocation } from "./ordering/pickupLocation";
import { cakeOptionChoice, cakeOptionGroup, cakeSection } from "./ordering/cakeOptions";

export const orderingSchemaTypes = [
  shopSettings,
  pickupLocation,
  productCategory,
  product,
  cake,
  orderDeadline,
  pickupDateEntry,
  cakeOptionGroup,
  cakeOptionChoice,
  cakeSection,
];
