import type { CakeProduct } from "@/lib/cms/ordering-types";
import { formatPrice } from "@/lib/format";
import { hasPricedChoices } from "@/lib/ordering/cake-options";

/** "Pris aftales" for base price 0, "fra 495 kr." when options can add to it, otherwise "495 kr.". */
export function cakePriceText(cake: Pick<CakeProduct, "basePriceOere" | "optionGroups">): string {
  if (cake.basePriceOere <= 0) return "Pris aftales";
  return hasPricedChoices(cake.optionGroups) ? `fra ${formatPrice(cake.basePriceOere)}` : formatPrice(cake.basePriceOere);
}
