/**
 * Schema types for events: the events themselves and their subcategories.
 * Owned by the events lane; see CLAUDE.md. Registered in ./index.ts.
 */
import { eventCategory } from "./events/category";
import { event } from "./events/event";

export const eventSchemaTypes = [event, eventCategory];
