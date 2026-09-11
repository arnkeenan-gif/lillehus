/**
 * The menu on the left in the Studio. The four singletons and the forside
 * are pinned at the top and open straight into their document; the rest are
 * lists Kristine adds to.
 */
import type { StructureResolver } from "sanity/structure";
import {
  BasketIcon,
  CalendarIcon,
  ClockIcon,
  CogIcon,
  DocumentsIcon,
  HelpCircleIcon,
  HomeIcon,
  IceCreamIcon,
  ImagesIcon,
  PackageIcon,
  TrolleyIcon,
} from "./icons";
import { FORSIDE_ID } from "./schemas/constants";

export const structure: StructureResolver = (S) =>
  S.list()
    .title("Indhold")
    .items([
      S.listItem()
        .id("forside")
        .title("Forside")
        .icon(HomeIcon)
        .child(S.document().schemaType("page").documentId(FORSIDE_ID)),
      S.listItem()
        .id("siteSettings")
        .title("Indstillinger")
        .icon(CogIcon)
        .child(S.document().schemaType("siteSettings").documentId("siteSettings")),
      S.listItem()
        .id("hours")
        .title("Åbningstider og steder")
        .icon(ClockIcon)
        .child(S.document().schemaType("hours").documentId("hours")),
      S.listItem()
        .id("shopSettings")
        .title("Bageri, afhentning og levering")
        .icon(PackageIcon)
        .child(S.document().schemaType("shopSettings").documentId("shopSettings")),
      S.listItem()
        .id("pizzaSettings")
        .title("Pizzavogn")
        .icon(TrolleyIcon)
        .child(S.document().schemaType("pizzaSettings").documentId("pizzaSettings")),
      S.divider(),
      S.documentTypeListItem("page")
        .title("Sider")
        .icon(DocumentsIcon)
        .child(
          S.documentTypeList("page")
            .title("Sider")
            .defaultOrdering([
              { field: "navOrder", direction: "asc" },
              { field: "title", direction: "asc" },
            ]),
        ),
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
      S.documentTypeListItem("event")
        .title("Arrangementer og kurser")
        .icon(CalendarIcon)
        .child(S.documentTypeList("event").title("Arrangementer og kurser").defaultOrdering([{ field: "start", direction: "desc" }])),
      S.documentTypeListItem("faqItem")
        .title("Spørgsmål og svar")
        .icon(HelpCircleIcon)
        .child(
          S.documentTypeList("faqItem")
            .title("Spørgsmål og svar")
            .defaultOrdering([
              { field: "group", direction: "asc" },
              { field: "sort", direction: "asc" },
            ]),
        ),
      S.documentTypeListItem("instagramPost")
        .title("Instagram-billeder")
        .icon(ImagesIcon)
        .child(S.documentTypeList("instagramPost").title("Instagram-billeder").defaultOrdering([{ field: "sort", direction: "asc" }])),
    ]);
