/**
 * Studio menu items for events. One entry, "Arrangementer", opens to the
 * coming and past events, all events, the events of one category at a time,
 * and the categories themselves. Owned by the events lane; see CLAUDE.md.
 * structure.ts places these items. Relative imports only: the Sanity CLI
 * reads this file too.
 */
import type { ListItemBuilder, StructureBuilder } from "sanity/structure";
import { CalendarIcon } from "@sanity/icons/Calendar";
import { ClockIcon } from "@sanity/icons/Clock";
import { FolderIcon } from "@sanity/icons/Folder";
import { TagIcon } from "@sanity/icons/Tag";
import { ThListIcon } from "@sanity/icons/ThList";
import { apiVersion } from "../env";

/** An event is coming up until it ends; without an end time, until it starts. */
const UPCOMING = 'dateTime(coalesce(end, start)) >= dateTime(now())';

function eventList(S: StructureBuilder, id: string, title: string, filter: string, direction: "asc" | "desc") {
  return S.documentList()
    .id(id)
    .title(title)
    .schemaType("event")
    .apiVersion(apiVersion)
    .filter(`_type == "event" && ${filter}`)
    .defaultOrdering([{ field: "start", direction }]);
}

export function eventListItems(S: StructureBuilder): ListItemBuilder[] {
  return [
    S.listItem()
      .id("arrangementer")
      .title("Arrangementer")
      .icon(CalendarIcon)
      .child(
        S.list()
          .id("arrangementer-menu")
          .title("Arrangementer")
          .items([
            S.listItem()
              .id("kommende-arrangementer")
              .title("Kommende arrangementer")
              .icon(CalendarIcon)
              .child(eventList(S, "kommende-arrangementer-liste", "Kommende arrangementer", UPCOMING, "asc")),
            S.listItem()
              .id("tidligere-arrangementer")
              .title("Tidligere arrangementer")
              .icon(ClockIcon)
              .child(eventList(S, "tidligere-arrangementer-liste", "Tidligere arrangementer", `!(${UPCOMING})`, "desc")),
            S.listItem()
              .id("alle-arrangementer")
              .title("Alle arrangementer")
              .icon(ThListIcon)
              .child(S.documentTypeList("event").title("Alle arrangementer").defaultOrdering([{ field: "start", direction: "desc" }])),
            S.divider(),
            S.listItem()
              .id("arrangementer-efter-kategori")
              .title("Efter kategori")
              .icon(FolderIcon)
              .child(
                S.documentTypeList("eventCategory")
                  .title("Efter kategori")
                  .defaultOrdering([
                    { field: "sort", direction: "asc" },
                    { field: "title", direction: "asc" },
                  ])
                  .child((categoryId) =>
                    S.documentList()
                      .id(`kategori-${categoryId}`)
                      .title("Arrangementer i kategorien")
                      .schemaType("event")
                      .apiVersion(apiVersion)
                      .filter('_type == "event" && category._ref == $categoryId')
                      .params({ categoryId: categoryId.replace(/^drafts\./, "") })
                      .defaultOrdering([{ field: "start", direction: "desc" }]),
                  ),
              ),
            S.documentTypeListItem("eventCategory")
              .title("Kategorier")
              .icon(TagIcon)
              .child(
                S.documentTypeList("eventCategory")
                  .title("Kategorier")
                  .defaultOrdering([
                    { field: "sort", direction: "asc" },
                    { field: "title", direction: "asc" },
                  ]),
              ),
          ]),
      ),
  ];
}
