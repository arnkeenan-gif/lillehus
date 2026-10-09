import Link from "next/link";
import type { EventEntry } from "@/lib/cms";
import { priceLabel, whenShort } from "@/lib/events/dates";
import { cn } from "@/lib/cn";

/**
 * The coming events as rows with a hairline between them: the date and time
 * in tabular figures on the left (above the title on phones), then the
 * title, the place, the short description, the category and the price. The
 * whole row is the link to the event's page. Each row carries an id the
 * calendar can point to when a day holds more than one event.
 */
export function EventList({
  events,
  heading: Heading = "h3",
  showCategory = true,
  now,
  className,
}: {
  events: EventEntry[];
  /** h3 under a section heading, h2 when the list sits right under the page's h1. */
  heading?: "h2" | "h3";
  showCategory?: boolean;
  /** The moment the page was rendered: decides whether the year is written. */
  now: number;
  className?: string;
}) {
  return (
    <ol className={cn("divide-y divide-line border-y border-line", className)}>
      {events.map((event) => {
        const when = whenShort(event, now);
        const meta = [showCategory ? event.category?.title : undefined, priceLabel(event)].filter(Boolean);
        return (
          <li
            key={event.id}
            id={`arrangement-${event.slug}`}
            className="group relative grid scroll-mt-28 gap-1.5 py-5 sm:grid-cols-[11.5rem_1fr] sm:gap-6"
          >
            <p className="tnum leading-snug text-ink-2">
              <time dateTime={event.start} className="block font-medium text-ink">
                {when.date}
              </time>
              {when.time ? <span className="block">{when.time}</span> : null}
            </p>
            <div className="min-w-0">
              <Heading className="text-lg font-semibold leading-snug text-ink">
                <Link
                  href={`/arrangementer/${event.slug}`}
                  className="transition-colors duration-150 ease-out-quart after:absolute after:inset-0 group-hover:text-rust"
                >
                  {event.title}
                </Link>
              </Heading>
              {event.place ? <p className="mt-0.5 text-ink-2">{event.place}</p> : null}
              {event.summary ? <p className="mt-2 line-clamp-2 max-w-[60ch] text-ink-2">{event.summary}</p> : null}
              {meta.length > 0 ? <p className="tnum mt-2 text-sm text-muted">{meta.join(" · ")}</p> : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
