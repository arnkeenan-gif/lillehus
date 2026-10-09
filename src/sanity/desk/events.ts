/**
 * Studio menu items for events and (added by the events lane) event
 * categories. Owned by the events lane; see CLAUDE.md. structure.ts places
 * these items.
 */
import type { ListItemBuilder, StructureBuilder } from "sanity/structure";
import { CalendarIcon } from "../icons";

export function eventListItems(S: StructureBuilder): ListItemBuilder[] {
  return [
    S.documentTypeListItem("event")
      .title("Arrangementer og kurser")
      .icon(CalendarIcon)
      .child(S.documentTypeList("event").title("Arrangementer og kurser").defaultOrdering([{ field: "start", direction: "desc" }])),
  ];
}
