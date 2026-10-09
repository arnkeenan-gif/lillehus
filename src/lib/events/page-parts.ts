/**
 * How the CMS page "arrangementer" is laid out around the calendar. The page
 * keeps its sections in the Studio; here they are split in three:
 *
 *   opening  every section except the two below, in Kristine's order (the
 *            heading and the open-house text)
 *   events   the "Det sker" section: its heading goes over the calendar, its
 *            "Når kalenderen er tom" text is shown when nothing is coming up
 *   course   the course interest form, always at the bottom
 */
import type { EventsSection, FormSection, Page, Section } from "@/lib/cms";

export const DEFAULT_EVENTS_HEADING = "Det sker";
export const DEFAULT_EMPTY_TEXT = "Lige nu er der ingen datoer i kalenderen.";

function isEvents(section: Section): section is EventsSection {
  return section._type === "eventsSection";
}

function isCourseForm(section: Section): section is FormSection {
  return section._type === "formSection" && section.kind === "course";
}

export function splitEventsPage(page: Page | null): { opening: Page | null; events?: EventsSection; course?: FormSection } {
  if (!page) return { opening: null };
  return {
    opening: { ...page, sections: page.sections.filter((s) => !isEvents(s) && !isCourseForm(s)) },
    events: page.sections.find(isEvents),
    course: page.sections.find(isCourseForm),
  };
}
