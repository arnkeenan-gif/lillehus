import type { Metadata } from "next";
import Image from "next/image";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { CourseInterestForm } from "@/components/forms/course-interest-form";
import { EventSignupForm } from "@/components/forms/event-signup-form";
import { getEvents } from "@/lib/content";
import { formatPrice, ucfirst } from "@/lib/format";
import { formatEventWhen } from "@/lib/forms";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Arrangementer og kurser",
  description:
    "Åbne døre i haven og huset på udvalgte dage, torvedag på Axeltorv i Næstved onsdag og lørdag, og surdejs- og pizzakurser efter aftale.",
};

const link = "text-rust underline decoration-1 underline-offset-[3px] transition-colors hover:text-rust-deep";

export default async function ArrangementerPage() {
  const events = await getEvents();
  const torv = site.locations.find((l) => l.id === "naestved");

  return (
    <>
      {/* Hero: text left, square photo right at lg; stacked below. */}
      <Section>
        <Container className="grid items-center gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-7">
            <h1 className="text-display font-semibold">Arrangementer og kurser</h1>
            <p className="mt-6 max-w-[48ch] text-lg text-ink-2">
              Åbne døre på gården på udvalgte dage, torvedag i Næstved hver uge, og kurser i surdej og pizza, når vi
              finder en dag sammen.
            </p>
          </div>
          <div className="lg:col-span-5 lg:col-start-8">
            <Image
              src="/images/family-at-table-in-garden.jpg"
              alt="Familien ved et lille bord i haven om efteråret"
              width={2400}
              height={2400}
              sizes="(min-width: 1024px) 480px, 100vw"
              priority
              className="aspect-square w-full rounded-md object-cover"
            />
          </div>
        </Container>
      </Section>

      {/* Open days and the market: two-column facts. */}
      <Section tone="tint">
        <Container>
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <h2 className="text-title font-semibold">Åbne døre i haven og huset</h2>
              <div className="prose mt-6">
                <p>
                  På udvalgte dage åbner vi dørene til haven og huset. Så står vi klar med pizzaer fra ovnen, kager og
                  noget at drikke, alt sammen økologisk og hjemmelavet.
                </p>
                <p>
                  Dagene ligger spredt, og vi annoncerer dem kort tid før på{" "}
                  <a href={site.social.facebook} target="_blank" rel="noreferrer">
                    Facebook
                  </a>{" "}
                  og{" "}
                  <a href={site.social.instagram} target="_blank" rel="noreferrer">
                    Instagram
                  </a>
                  . Følg med der, hvis du vil have besked.
                </p>
              </div>
            </div>
            {torv ? (
              <div>
                <h2 className="text-title font-semibold">{torv.name}</h2>
                <div className="prose mt-6">
                  <p>Vi står på {torv.subtitle}, i Næstved. Kom forbi, inden vi er udsolgt.</p>
                </div>
                <dl className="mt-6 space-y-3">
                  {torv.hours.map((h) => (
                    <div key={h.days} className="flex flex-wrap items-baseline gap-x-6 gap-y-1">
                      <dt className="w-24 font-medium text-ink">{h.days}</dt>
                      <dd className="tnum text-ink-2">
                        kl. {h.time}
                        {h.note ? <span className="text-muted">. {h.note}</span> : null}
                      </dd>
                    </div>
                  ))}
                </dl>
                <p className="mt-6">
                  <a href={torv.mapsUrl} target="_blank" rel="noreferrer" className={link}>
                    Vis {torv.address} på Google Maps
                  </a>
                </p>
              </div>
            ) : null}
          </div>
        </Container>
      </Section>

      {/* Courses on request: text with the interest form beside it at lg. */}
      <Section>
        <Container className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <h2 className="text-title font-semibold">Kurser</h2>
            <div className="prose mt-6">
              <p>
                Vi holder surdejskursus og pizzakursus for grupper efter aftale. Der er ingen faste datoer: skriv, hvad I
                har lyst til, hvor mange I er, og hvornår det kunne passe, så finder vi en dag.
              </p>
              <p>Kristine skriver tilbage inden for to hverdage med et forslag.</p>
            </div>
          </div>
          <div className="lg:col-span-7">
            <CourseInterestForm />
          </div>
        </Container>
      </Section>

      {/* Upcoming events from content/events.json, or a calm empty state. */}
      <Section className="border-t border-line">
        <Container>
          <h2 className="text-title font-semibold">Kommende arrangementer</h2>
          {events.length === 0 ? (
            <div className="prose mt-6">
              <p>
                Lige nu er der ikke sat dato på nye arrangementer. De næste åbne døre bliver annonceret på{" "}
                <a href={site.social.facebook} target="_blank" rel="noreferrer">
                  Facebook
                </a>{" "}
                og{" "}
                <a href={site.social.instagram} target="_blank" rel="noreferrer">
                  Instagram
                </a>
                , og tilmelder du dig nyhedsbrevet nederst på siden, skriver vi, når der sker noget.
              </p>
            </div>
          ) : (
            <ul className="mt-10 grid gap-8 lg:grid-cols-2">
              {events.map((event) => (
                <li
                  key={event.id}
                  className={event.signup ? "rounded-md border border-line bg-white p-6 sm:p-8" : "border-t border-line pt-6"}
                >
                  <p className="text-sm text-muted">{ucfirst(event.kind)}</p>
                  <h3 className="mt-1 text-xl font-semibold text-ink">{event.title}</h3>
                  <p className="tnum mt-2 text-ink">{formatEventWhen(event)}</p>
                  <p className="text-ink-2">{event.place}</p>
                  <p className="mt-4 max-w-[60ch] text-ink-2">{event.description}</p>
                  {event.priceOere ? (
                    <p className="tnum mt-3 font-medium text-ink">{formatPrice(event.priceOere)} pr. person</p>
                  ) : null}
                  {event.signup ? (
                    <div className="mt-6 border-t border-line pt-6">
                      <EventSignupForm eventId={event.id} eventTitle={event.title} />
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </Container>
      </Section>
    </>
  );
}
