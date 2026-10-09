import { cache } from "react";
import {
  getBakeryCategories,
  getBakeryProducts,
  getCakeProducts,
  getOrderingSettings,
  getPickupLocations,
  type BakeryCategory,
  type BakeryProduct,
  type CakeProduct,
  type DeadlineRule,
  type OrderingSettings,
  type PickupLocation,
} from "@/lib/cms";
import { effectiveRule } from "@/lib/ordering/deadline";

/*
  Server-only catalogue for the shop: categories, products, cakes, pickup
  locations and the ordering settings from the CMS façade (Sanity when it is
  configured, otherwise the JSON in content/ordering/), with the deadline
  rule that applies to each product worked out once. The CMS is the only
  catalogue; Stripe just takes the payment, with the prices computed here.
*/

export interface ShopProduct extends BakeryProduct {
  /** The rule that applies: the product's own, else the category's, else the default. */
  rule: DeadlineRule;
  /** Orderable online and has a price. */
  canOrder: boolean;
}

export interface ProductGroup {
  category: BakeryCategory;
  products: ShopProduct[];
}

export interface ShopCatalog {
  settings: OrderingSettings;
  /** Categories with at least one shown product, in Kristine's order. */
  groups: ProductGroup[];
  /** Every shown product that has a category, in page order. */
  products: ShopProduct[];
  cakes: CakeProduct[];
  /** Active locations with their open dates. */
  locations: PickupLocation[];
}

export function productRule(product: BakeryProduct, category: BakeryCategory | undefined, settings: OrderingSettings): DeadlineRule {
  return effectiveRule(product.deadline, category?.deadline, settings.defaultDeadline);
}

export function cakeRule(cake: CakeProduct, settings: OrderingSettings): DeadlineRule {
  return effectiveRule(cake.deadline, settings.defaultDeadline);
}

/** A cake with a price goes in the cart; with base price 0 ("Pris aftales") the page sends a request. */
export function cakeInCart(cake: CakeProduct): boolean {
  return cake.basePriceOere > 0;
}

/** Everything the shop needs, deduplicated per request. */
export const getShopCatalog = cache(async (): Promise<ShopCatalog> => {
  const [settings, categories, products, cakes, locations] = await Promise.all([
    getOrderingSettings(),
    getBakeryCategories(),
    getBakeryProducts(),
    getCakeProducts(),
    getPickupLocations(),
  ]);

  const groups: ProductGroup[] = [];
  for (const category of categories) {
    const inCategory = products
      .filter((p) => p.categoryId === category.id)
      .map((p) => ({ ...p, rule: productRule(p, category, settings), canOrder: p.orderable && p.priceOere > 0 }));
    if (inCategory.length > 0) groups.push({ category, products: inCategory });
  }

  return {
    settings,
    groups,
    products: groups.flatMap((g) => g.products),
    cakes,
    locations,
  };
});

/** The server's clock when a page renders: the shop's client pieces start from it and then follow the browser's. */
export function renderTime(): number {
  return Date.now();
}
