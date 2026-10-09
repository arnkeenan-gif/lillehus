/**
 * Studio menu items for ordering. Owned by the ordering lane; see CLAUDE.md.
 * structure.ts places these items: the settings at the top with the other
 * singletons, the lists further down.
 *
 *   Bageri og bestilling   the default deadline, minimum order, message
 *   Afhentningssteder      places, each with its own dates ("Åbn datoer")
 *   Bagværk                all products, products by category, categories
 *   Kager                  the cakes with their options
 */
import type { ListItemBuilder, StructureBuilder } from "sanity/structure";
import { BasketIcon } from "@sanity/icons/Basket";
import { IceCreamIcon } from "@sanity/icons/IceCream";
import { PackageIcon } from "@sanity/icons/Package";
import { PinIcon } from "@sanity/icons/Pin";
import { TagIcon } from "@sanity/icons/Tag";
import { TagsIcon } from "@sanity/icons/Tags";

/** Pinned singletons at the top of the menu. */
export function orderingSettingsItems(S: StructureBuilder): ListItemBuilder[] {
  return [
    S.listItem()
      .id("shopSettings")
      .title("Bageri og bestilling")
      .icon(PackageIcon)
      .child(S.document().schemaType("shopSettings").documentId("shopSettings").title("Bageri og bestilling")),
  ];
}

const BY_SORT = [
  { field: "sort", direction: "asc" as const },
  { field: "name", direction: "asc" as const },
];

/** Lists Kristine adds to. */
export function orderingListItems(S: StructureBuilder): ListItemBuilder[] {
  return [
    S.documentTypeListItem("pickupLocation")
      .title("Afhentningssteder")
      .icon(PinIcon)
      .child(S.documentTypeList("pickupLocation").title("Afhentningssteder").defaultOrdering(BY_SORT)),
    S.listItem()
      .id("bagvaerk")
      .title("Bagværk")
      .icon(BasketIcon)
      .child(
        S.list()
          .title("Bagværk")
          .items([
            S.listItem()
              .id("alle-varer")
              .title("Alle varer")
              .icon(BasketIcon)
              .child(S.documentTypeList("product").title("Alle varer").defaultOrdering(BY_SORT)),
            S.listItem()
              .id("varer-efter-kategori")
              .title("Varer efter kategori")
              .icon(TagsIcon)
              .child(
                S.documentTypeList("productCategory")
                  .title("Varer efter kategori")
                  .defaultOrdering([{ field: "sort", direction: "asc" }])
                  .child((categoryId) =>
                    S.documentList()
                      .title("Varer")
                      .schemaType("product")
                      .filter('_type == "product" && category._ref == $categoryId')
                      .params({ categoryId })
                      .defaultOrdering(BY_SORT),
                  ),
              ),
            S.divider(),
            S.documentTypeListItem("productCategory")
              .title("Kategorier")
              .icon(TagIcon)
              .child(
                S.documentTypeList("productCategory")
                  .title("Kategorier")
                  .defaultOrdering([
                    { field: "sort", direction: "asc" },
                    { field: "title", direction: "asc" },
                  ]),
              ),
          ]),
      ),
    S.documentTypeListItem("cake")
      .title("Kager")
      .icon(IceCreamIcon)
      .child(S.documentTypeList("cake").title("Kager").defaultOrdering(BY_SORT)),
  ];
}
