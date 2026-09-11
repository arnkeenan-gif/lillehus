import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { ContactForm } from "@/components/forms/contact-form";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Kontakt",
  description:
    "Ring, skriv en mail eller brug formularen. Find bageriet på Torpevej 10 i Herlufmagle og torvedagen på Axeltorv i Næstved.",
};

const link = "text-rust underline decoration-1 underline-offset-[3px] transition-colors hover:text-rust-deep";

export default function KontaktPage() {
  return (
    <>
      <Section>
        <Container size="narrow">
          <h1 className="text-display font-semibold">Kontakt</h1>
          <p className="mt-6 max-w-[48ch] text-lg text-ink-2">
            Ring, skriv en mail eller brug formularen nederst på siden. Kristine svarer normalt inden for to hverdage.
          </p>
          <dl className="mt-8 flex flex-col gap-4 sm:flex-row sm:gap-12">
            <div>
              <dt className="text-sm text-muted">Telefon</dt>
              <dd className="tnum mt-1 text-lg">
                <a href={`tel:${site.phoneHref}`} className={link}>
                  {site.phone}
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-sm text-muted">E-mail</dt>
              <dd className="mt-1 text-lg">
                <a href={`mailto:${site.email}`} className={link}>
                  {site.email}
                </a>
              </dd>
            </div>
          </dl>
        </Container>
      </Section>

      {/* The two places: two-column facts list. */}
      <Section tone="tint">
        <Container>
          <h2 className="text-title font-semibold">Her finder du os</h2>
          <div className="mt-10 grid gap-12 sm:grid-cols-2 sm:gap-16">
            {site.locations.map((loc) => (
              <div key={loc.id}>
                <h3 className="text-xl font-semibold text-ink">{loc.name}</h3>
                <p className="mt-1 text-ink-2">{loc.subtitle}</p>
                <p className="mt-3 text-ink-2">{loc.address}</p>
                <dl className="mt-5 space-y-3">
                  {loc.hours.map((h) => (
                    <div key={h.days}>
                      <div className="flex items-baseline justify-between gap-6">
                        <dt className="text-ink">{h.days}</dt>
                        <dd className="tnum text-ink">kl. {h.time}</dd>
                      </div>
                      {h.note ? <dd className="mt-1 text-sm text-muted">{h.note}</dd> : null}
                    </div>
                  ))}
                </dl>
                {loc.notes ? <p className="mt-4 text-sm text-muted">{loc.notes}</p> : null}
                <p className="mt-5">
                  <a href={loc.mapsUrl} target="_blank" rel="noreferrer" className={link}>
                    Vis på Google Maps
                  </a>
                </p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      <Section id="skriv" className="scroll-mt-20">
        <Container size="narrow">
          <h2 className="text-title font-semibold">Skriv til os</h2>
          <p className="mt-4 max-w-[60ch] text-ink-2">
            Spørgsmål om en bestilling, pizzavognen, en kage eller noget helt fjerde. Skriv, så svarer Kristine.
          </p>
          <div className="mt-10">
            <ContactForm />
          </div>
        </Container>
      </Section>
    </>
  );
}
