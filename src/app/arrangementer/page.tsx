import type { Metadata } from "next";
import { pageMetadata } from "@/components/cms/metadata";
import { EventsOverview } from "@/components/events/events-overview";
import { FormBlock } from "@/components/sections/form";
import { Sections } from "@/components/sections/render";
import { Container } from "@/components/ui/container";
import { getEventCategories, getEvents, getPage, getSiteSettings } from "@/lib/cms";
import { renderTime } from "@/lib/events/dates";
import { DEFAULT_EMPTY_TEXT, DEFAULT_EVENTS_HEADING, splitEventsPage } from "@/lib/events/page-parts";

const SLUG = "arrangementer";

/** Events come and go by the clock; render the page again at least every ten minutes. */
export const revalidate = 600;

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata(await getPage(SLUG), "Arrangementer");
}

/**
 * The page "arrangementer" from the CMS opens (the heading and the open-house
 * text Kristine edits in the Studio), then the category menu, the calendar
 * and the list of coming events, and the course interest form at the bottom.
 * The "Det sker" section of the CMS page gives the calendar its heading and
 * the text for an empty calendar.
 */
export default async function ArrangementerPage() {
  const [page, events, categories, settings] = await Promise.all([
    getPage(SLUG),
    getEvents(),
    getEventCategories(),
    getSiteSettings(),
  ]);
  const { opening, events: eventsSection, course } = splitEventsPage(page);

  return (
    <>
      {opening ? (
        <Sections page={opening} />
      ) : (
        <Container className="pb-24 pt-12 sm:pb-32 sm:pt-20">
          <h1 className="max-w-[18ch] text-balance text-display font-semibold tracking-tight text-ink">Arrangementer</h1>
        </Container>
      )}
      <div className="pb-24 sm:pb-32">
        <EventsOverview
          events={events}
          categories={categories}
          active={null}
          heading={eventsSection ? eventsSection.heading : DEFAULT_EVENTS_HEADING}
          intro={eventsSection?.text}
          emptyText={eventsSection?.emptyText ?? DEFAULT_EMPTY_TEXT}
          social={settings.social}
          now={renderTime()}
        />
        {course ? <FormBlock section={course} level="h2" className="mt-20 sm:mt-24 lg:mt-32" /> : null}
      </div>
    </>
  );
}
