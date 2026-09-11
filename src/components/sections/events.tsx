import { Fragment } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { groupHours, lowerFirst } from "@/components/cms/text";
import { getEvents, getLocations, getSiteSettings, type EventsSection, type Location } from "@/lib/cms";
import { formatDateLong, formatPrice, formatTime, ucfirst } from "@/lib/format";
import { cn } from "@/lib/cn";
import { SectionHeading, textLink } from "./heading";
import type { SectionProps } from "./types";

/**
 * Coming dates as rows (date, title, place) with a hairline between them.
 * `showWeek` first says how an ordinary week goes, built from the locations.
 * With nothing in the calendar, one paragraph and the two places we post.
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

  return (
    <section className={className}>
      <Container>
        {section.heading ? (
          <SectionHeading as={level} className="max-w-[20ch] text-balance">
            {section.heading}
          </SectionHeading>
        ) : null}
        <div className="max-w-[72ch]">
          {section.text ? <p className="mt-4 max-w-[62ch] text-ink-2">{section.text}</p> : null}
          {section.showWeek ? (
            <div className={cn("max-w-[48ch]", hasTop && "mt-6")}>
              <WeekSentence locations={locations} />
            </div>
          ) : null}

          {list.length > 0 ? (
            <ul className={cn("divide-y divide-line border-t border-line", hasTop || section.showWeek ? "mt-8" : undefined)}>
              {list.map((event) => {
                const clock = formatTime(event.start);
                return (
                  <li key={event.id} className="grid gap-1 py-5 sm:grid-cols-[14rem_1fr] sm:gap-8">
                    <p className="tnum text-ink-2">
                      {ucfirst(formatDateLong(event.start))}
                      {clock !== "00.00" ? `, kl. ${clock}` : ""}
                    </p>
                    <div>
                      <p className="font-medium text-ink">{event.title}</p>
                      <p className="text-ink-2">{event.place}</p>
                      {event.description ? <p className="mt-2 max-w-[60ch] text-ink-2">{event.description}</p> : null}
                      {event.priceOere ? <p className="tnum mt-1 text-ink-2">{formatPrice(event.priceOere)} pr. person</p> : null}
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className={cn("max-w-[62ch]", hasTop || section.showWeek ? "mt-6" : undefined)}>
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
        </div>
      </Container>
    </section>
  );
}
