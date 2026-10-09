/**
 * Schema types for ordering: products, cakes, shop settings, and (added by
 * the ordering lane) categories, pickup locations and anything else the
 * order flow needs. Owned by the ordering lane; see CLAUDE.md.
 */
import { shopSettings } from "./documents/shopSettings";
import { product } from "./documents/product";
import { cake } from "./documents/cake";

export const orderingSchemaTypes = [shopSettings, product, cake];
