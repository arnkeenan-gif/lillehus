import { Fragment } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { groupHours, lowerFirst } from "@/components/cms/text";
import { getEvents, getLocations, getSiteSettings, type EventsSection, type Location } from "@/lib/cms";
import { priceLabel, whenShort } from "@/lib/events/dates";
import { cn } from "@/lib/cn";
import { SectionHeading, SectionIntro, afterIntro, listMeasure, textLink, textMeasure } from "./heading";
import type { SectionProps } from "./types";

/**
 * "Det sker" on the forside and find-os: the next dates as rows with a
 * hairline between them, the date and time in a fixed tabular column from
 * sm (above the title on phones), then the title, the place, the category
 * and the price. Each row links to the event's own page.
 * `showWeek` first says how an ordinary week goes, built from the locations.
 * With nothing in the calendar, one paragraph and the two places we post.
 * The full calendar lives on /arrangementer.
 */
function WeekSentence({ locations }: { locations: Location[] }) {
  const places = locations.filter((l) => l.hours.length > 0);
  if (places.length === 0) return null;
  return (
    <p className="text-lead text-ink">
      {places.map((place, index) => (
        <Fragment key={place.id}>
          {index > 0 ? (index === places.length - 1 ? ", og " : ", ") : ""}
          {index > 0 ? lowerFirst(place.name) : place.name}
          {groupHours(place.hours).map((group, i) => (
            <Fragment key={group.days}>
              {i > 0 ? " og " : " "}
              {group.days} kl. <strong className="font-semibold">{group.time}</strong>
            </Fragment>
          ))}
        </Fragment>
      ))}
      .
    </p>
  );
}

export async function Events({ section, level, className }: SectionProps<EventsSection>) {
  const [events, locations, settings] = await Promise.all([
    getEvents(),
    section.showWeek ? getLocations() : Promise.resolve([] as Location[]),
    getSiteSettings(),
  ]);
  const list = events.slice(0, section.limit);
  const hasTop = Boolean(section.heading || section.text);
  const hasLead = hasTop || section.showWeek;
  // Under the section's heading each title is one level down; without a heading the rows carry none.
  const ItemHeading = section.heading ? (level === "h1" ? "h2" : "h3") : "p";

  return (
    <section className={className}>
      <Container>
        {section.heading ? <SectionHeading as={level}>{section.heading}</SectionHeading> : null}
        {section.text ? (
          <SectionIntro level={level} afterHeading={Boolean(section.heading)}>
            {section.text}
          </SectionIntro>
        ) : null}
        {section.showWeek ? (
          <div className={cn("max-w-[48ch]", hasTop && "mt-6")}>
            <WeekSentence locations={locations} />
          </div>
        ) : null}

        {list.length > 0 ? (
          <ul className={cn("divide-y divide-line border-y border-line", listMeasure, hasLead && afterIntro)}>
            {list.map((event) => {
              const when = whenShort(event);
              const meta = [event.category?.title, priceLabel(event)].filter(Boolean);
              return (
                <li key={event.id} className="group relative grid gap-1 py-5 sm:grid-cols-[13rem_1fr] sm:gap-8">
                  <p className="tnum text-ink-2">
                    <time dateTime={event.start}>{when.date}</time>
                    {when.time ? <span className="block text-muted">{when.time}</span> : null}
                  </p>
                  <div className="min-w-0">
                    <ItemHeading className="font-semibold text-ink">
                      <Link
                        href={`/arrangementer/${event.slug}`}
                        className="transition-colors duration-150 ease-out-quart after:absolute after:inset-0 group-hover:text-rust"
                      >
                        {event.title}
                      </Link>
                    </ItemHeading>
                    {event.place ? <p className="text-ink-2">{event.place}</p> : null}
                    {meta.length > 0 ? <p className="tnum mt-1 text-sm text-muted">{meta.join(" · ")}</p> : null}
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className={cn(textMeasure, hasLead && "mt-6")}>
            <p className="text-ink-2">{section.emptyText ?? "Lige nu er der ingen datoer i kalenderen."}</p>
            {settings.social.facebook || settings.social.instagram ? (
              <p className="mt-3 text-ink-2">
                Følg med på{" "}
                {settings.social.facebook ? (
                  <a href={settings.social.facebook} target="_blank" rel="noreferrer" className={textLink}>
                    Facebook
                  </a>
                ) : null}
                {settings.social.facebook && settings.social.instagram ? " og " : ""}
                {settings.social.instagram ? (
                  <a href={settings.social.instagram} target="_blank" rel="noreferrer" className={textLink}>
                    Instagram
                  </a>
                ) : null}
                .
              </p>
            ) : null}
          </div>
        )}

        {section.link ? (
          <p className="mt-8">
            <Link href={section.link.href} className={textLink}>
              {section.link.label}
            </Link>
          </p>
        ) : null}
      </Container>
    </section>
  );
}
