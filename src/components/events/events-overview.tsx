import { Container } from "@/components/ui/container";
import type { EventCategory, EventEntry, SiteSettings } from "@/lib/cms";
import { calendarData } from "@/lib/events/calendar-data";
import { cn } from "@/lib/cn";
import { CategoryNav } from "./category-nav";
import { EventCalendar } from "./event-calendar";
import { EventList } from "./event-list";
import { EventsEmpty } from "./events-empty";

/**
 * The heart of /arrangementer and of each category page: the category
 * menu, the month calendar and the list of coming events side by side from
 * lg (calendar first on phones), or Kristine's empty-calendar text.
 */
export function EventsOverview({
  events,
  categories,
  active,
  heading,
  intro,
  emptyText,
  allHref,
  social,
  now,
  className,
}: {
  /** The coming events to show, already filtered to the category. */
  events: EventEntry[];
  categories: EventCategory[];
  active: string | null;
  /** The section heading (an h2); left out on a category page, whose h1 says it all. */
  heading?: string;
  intro?: string;
  emptyText: string;
  /** Shown in the empty state when other categories have events. */
  allHref?: string;
  social: SiteSettings["social"];
  now: number;
  className?: string;
}) {
  const calendar = calendarData(events, now);
  const hasTop = Boolean(heading || intro);

  return (
    <section id="kalender" aria-labelledby={heading ? "kalender-titel" : undefined} className={cn("scroll-mt-24", className)}>
      <Container>
        {heading ? (
          <h2 id="kalender-titel" className="max-w-[20ch] text-balance text-title font-semibold text-ink">
            {heading}
          </h2>
        ) : null}
        {intro ? <p className={cn("max-w-[62ch] text-ink-2", heading && "mt-4")}>{intro}</p> : null}
        <CategoryNav categories={categories} active={active} className={hasTop ? "mt-6" : undefined} />

        <div className="mt-10 grid gap-x-12 gap-y-14 lg:grid-cols-12">
          <div className="lg:col-span-5 xl:col-span-4">
            <EventCalendar data={calendar} id={active ? `kalender-${active}` : "kalender-alle"} />
          </div>
          <div className="lg:col-span-7 xl:col-span-8">
            {events.length > 0 ? (
              <EventList events={events} heading={heading ? "h3" : "h2"} showCategory={active === null} now={now} />
            ) : (
              <EventsEmpty text={emptyText} social={social} allHref={allHref} className="lg:pt-1.5" />
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}
