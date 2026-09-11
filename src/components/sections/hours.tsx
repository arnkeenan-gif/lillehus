import { Fragment } from "react";
import Link from "next/link";
import { MapPin } from "@phosphor-icons/react/dist/ssr";
import { Container } from "@/components/ui/container";
import { endSentence, groupHours, splitNotes } from "@/components/cms/text";
import { getLocations, type HoursSection, type Location } from "@/lib/cms";
import { cn } from "@/lib/cn";
import { SectionHeading, textLink } from "./heading";
import type { SectionProps } from "./types";

/**
 * Where and when, as sentences a person would say rather than a table:
 * "Torvedag i Næstved, onsdag og lørdag kl. 9 til 14, eller til vi er
 * udsolgt." with the times in bold, the practical notes in body size and a
 * map link for each place.
 */
function Place({ location }: { location: Location }) {
  const groups = groupHours(location.hours);
  const { inline, rest } = splitNotes(location.hours);
  const details = [location.subtitle, ...rest, location.notes]
    .filter((s): s is string => Boolean(s && s.trim()))
    .map(endSentence)
    .join(" ");

  return (
    <div className="max-w-[40ch]">
      <p className="text-lead text-ink">
        {location.name}
        {groups.map((group, index) => (
          <Fragment key={group.days}>
            {index === 0 ? ", " : " og "}
            {group.days} kl. <strong className="font-semibold">{group.time}</strong>
          </Fragment>
        ))}
        {inline ? `, ${inline}` : ""}.
      </p>
      {details ? <p className="mt-3 text-ink-2">{details}</p> : null}
      {location.mapsUrl ? (
        <a
          href={location.mapsUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-flex items-center gap-2 text-ink transition-colors duration-150 ease-out-quart hover:text-rust"
        >
          <MapPin size={20} aria-hidden="true" />
          <span>{location.address}</span>
          <span className="sr-only">, vis på kort (åbner i nyt vindue)</span>
        </a>
      ) : (
        <p className="mt-4 text-ink-2">{location.address}</p>
      )}
    </div>
  );
}

export async function Hours({ section, level, className }: SectionProps<HoursSection>) {
  const all = await getLocations();
  const locations = section.only ? all.filter((l) => l.id === section.only) : all;
  if (locations.length === 0) return null;
  const hasTop = Boolean(section.heading || section.text);

  return (
    <section className={className}>
      <Container>
        {section.heading ? <SectionHeading as={level}>{section.heading}</SectionHeading> : null}
        {section.text ? <p className="mt-4 max-w-[62ch] text-ink-2">{section.text}</p> : null}
        <div className={cn("grid gap-12 lg:gap-16", locations.length > 1 && "lg:grid-cols-2", hasTop && "mt-10")}>
          {locations.map((location) => (
            <Place key={location.id} location={location} />
          ))}
        </div>
        {section.link ? (
          <p className="mt-10">
            <Link href={section.link.href} className={textLink}>
              {section.link.label}
            </Link>
          </p>
        ) : null}
      </Container>
    </section>
  );
}
