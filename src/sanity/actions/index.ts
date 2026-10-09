/**
 * Document actions for ordering, added to the Studio in sanity.config.ts.
 * Owned by the ordering lane; see CLAUDE.md.
 */
import type { DocumentActionComponent, DocumentActionsContext } from "sanity";
import { OpenDatesAction } from "./open-dates";

/** "Åbn datoer" on pickup locations, right after Udgiv. Other documents keep their actions. */
export function orderingDocumentActions(prev: DocumentActionComponent[], context: DocumentActionsContext): DocumentActionComponent[] {
  if (context.schemaType !== "pickupLocation") return prev;
  const publishIndex = prev.findIndex((action) => action.action === "publish");
  const at = publishIndex >= 0 ? publishIndex + 1 : prev.length;
  return [...prev.slice(0, at), OpenDatesAction, ...prev.slice(at)];
}
