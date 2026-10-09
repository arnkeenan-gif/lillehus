import Link from "next/link";
import { MapPin } from "@phosphor-icons/react/dist/ssr";
import { Container } from "@/components/ui/container";
import { deadlineExample, deadlineText, hoursText, listDa, pickupDateText, splitNotes, stillOrderable } from "@/components/cms/text";
import {
  getLocations,
  getOrderingSettings,
  getPickupLocations,
  getSiteSettings,
  type PickupInfoSection,
  type PickupLocation,
} from "@/lib/cms";
import { cn } from "@/lib/cn";
import { SectionHeading, SectionIntro, textLink, textMeasure } from "./heading";
import type { SectionProps } from "./types";

/**
 * How ordered bagværk is collected, written from the ordering's pickup
 * locations and deadline, so the places, the open dates and the rule are
 * always the ones Kristine set: choose the place first, then one of its open
 * dates, and order by the deadline. No fixed weekdays. "kort" is the short
 * version for find-os, "udførlig" the full one for /levering, which also
 * says what to do when plans change and points to the freezer.
 */
function Place({ location, maxDates }: { location: PickupLocation; maxDates: number }) {
  const dates = location.dates.slice(0, maxDates).map(pickupDateText);
  return (
    <li className="max-w-[46ch]">
      <p className="text-lead text-ink">
        {location.name}
        {location.note ? <span className="text-ink-2">, {location.note}</span> : null}
      </p>
      <p className="mt-2 text-ink-2">
        {dates.length > 0 ? `Næste afhentningsdage: ${listDa(dates)}.` : "Der er ingen åbne afhentningsdage lige nu."}
      </p>
      {location.address ? (
        location.mapsUrl ? (
          <a
            href={location.mapsUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-flex min-h-11 items-center gap-2 text-ink transition-colors duration-150 ease-out-quart hover:text-rust"
          >
            <MapPin size={20} aria-hidden="true" />
            <span>{location.address}</span>
            <span className="sr-only">, vis på kort (åbner i nyt vindue)</span>
          </a>
        ) : (
          <p className="mt-3 text-ink-2">{location.address}</p>
        )
      ) : null}
    </li>
  );
}

export async function PickupInfo({ section, level, className }: SectionProps<PickupInfoSection>) {
  const [pickup, ordering, locations, settings] = await Promise.all([
    getPickupLocations(),
    getOrderingSettings(),
    getLocations(),
    getSiteSettings(),
  ]);
  const full = section.detail === "udførlig";
  const rule = ordering.defaultDeadline;
  // Only the days that can still be ordered: a pickup whose deadline has passed is not offered.
  const now = new Date();
  const places = pickup.map((l) => ({ ...l, dates: l.dates.filter((d) => stillOrderable(d.date, rule, now)) }));
  const firstDate = places.find((l) => l.dates.length > 0)?.dates[0]?.date;
  const freezer = locations.find((l) => l.id === "bageriet");
  const freezerNotes = freezer ? [...splitNotes(freezer.hours).rest, freezer.notes].filter(Boolean).join(" ") : "";
  const hasTop = Boolean(section.heading || section.text);
  // Inside a section that has its own heading, the two sub-headings step down a level.
  const SubHeading = section.heading ? "h3" : "h2";

  const how = (
    <p>
      Når du bestiller bagværk, vælger du først afhentningssted og derefter en af de datoer, der er åbne for netop det sted. Du
      skal bestille senest {deadlineText(rule)}.
    </p>
  );
  const placeList =
    places.length > 0 ? (
      <ul className="space-y-8">
        {places.map((location) => (
          <Place key={location.id} location={location} maxDates={full ? 6 : 3} />
        ))}
      </ul>
    ) : (
      <p>Der er ingen åbne afhentningssteder lige nu.</p>
    );
  const example = firstDate ? <p>{deadlineExample(firstDate, rule)}</p> : null;

  return (
    <section className={className}>
      <Container>
        {section.heading ? <SectionHeading as={level}>{section.heading}</SectionHeading> : null}
        {section.text ? (
          <SectionIntro level={level} afterHeading={Boolean(section.heading)}>
            {section.text}
          </SectionIntro>
        ) : null}
        <div className={cn(textMeasure, "space-y-6 text-ink-2", hasTop && "mt-6")}>
          {full ? <SubHeading className="text-title font-semibold text-ink">Afhentning</SubHeading> : null}
          {how}
          {placeList}
          {example}
          {full ? (
            <p>
              Bliver du forhindret, så ring til os på{" "}
              <a href={`tel:${settings.phoneHref}`} className={cn("tnum", textLink)}>
                {settings.phone}
              </a>
              .
            </p>
          ) : null}
          {full && freezer ? (
            <>
              <SubHeading className="pt-8 text-title font-semibold text-ink">Fryseren</SubHeading>
              <p>
                Fryseren på gården er åben {hoursText(freezer.hours)}. {freezerNotes}{" "}
                <Link href="/fryser" className={textLink}>
                  Læs mere om fryseren
                </Link>
              </p>
            </>
          ) : null}
          {section.link ? (
            <p>
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
