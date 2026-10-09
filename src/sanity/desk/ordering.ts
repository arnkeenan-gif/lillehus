/**
 * Studio menu items for ordering: shop settings, products and cakes, plus
 * (added by the ordering lane) categories and pickup locations. Owned by the
 * ordering lane; see CLAUDE.md. structure.ts places these items.
 */
import type { ListItemBuilder, StructureBuilder } from "sanity/structure";
import { BasketIcon, IceCreamIcon, PackageIcon } from "../icons";

/** Pinned singletons at the top of the menu. */
export function orderingSettingsItems(S: StructureBuilder): ListItemBuilder[] {
  return [
    S.listItem()
      .id("shopSettings")
      .title("Bageri, afhentning og levering")
      .icon(PackageIcon)
      .child(S.document().schemaType("shopSettings").documentId("shopSettings")),
  ];
}

/** Lists Kristine adds to. */
export function orderingListItems(S: StructureBuilder): ListItemBuilder[] {
  return [
    S.documentTypeListItem("product")
      .title("Brød og varer")
      .icon(BasketIcon)
      .child(
        S.documentTypeList("product")
          .title("Brød og varer")
          .defaultOrdering([
            { field: "sort", direction: "asc" },
            { field: "name", direction: "asc" },
          ]),
      ),
    S.documentTypeListItem("cake")
      .title("Kager på bestilling")
      .icon(IceCreamIcon)
      .child(
        S.documentTypeList("cake")
          .title("Kager på bestilling")
          .defaultOrdering([
            { field: "sort", direction: "asc" },
            { field: "name", direction: "asc" },
          ]),
      ),
  ];
}
