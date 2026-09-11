import Link from "next/link";
import { MapPin } from "@phosphor-icons/react/dist/ssr";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { site } from "@/lib/site";

/**
 * Layout family: two-column facts list, one column per place in
 * content/site.json. Below md the columns stack, each with its own hairline.
 */
export function Locations() {
  return (
    <Section tone="tint">
      <Container>
        <h2 className="text-title font-semibold">Her får du fat i brødet</h2>
        <div className="mt-10 grid gap-10 md:grid-cols-2 md:gap-16">
          {site.locations.map((loc) => {
            const notes = Array.from(new Set(loc.hours.map((h) => h.note).filter(Boolean)));
            if (loc.notes) notes.push(loc.notes);
            return (
              <div key={loc.id} className="border-t border-line pt-6">
                <h3 className="text-xl font-semibold">{loc.name}</h3>
                <p className="mt-1 text-ink-2">{loc.subtitle}</p>
                <dl className="mt-5 divide-y divide-line">
                  {loc.hours.map((h) => (
                    <div key={h.days} className="flex justify-between gap-6 py-2.5 text-[0.95rem]">
                      <dt className="text-ink-2">{h.days}</dt>
                      <dd className="tnum font-medium text-ink">kl. {h.time}</dd>
                    </div>
                  ))}
                </dl>
                {notes.map((note) => (
                  <p key={note} className="mt-3 text-sm text-muted">
                    {note}
                  </p>
                ))}
                <a
                  href={loc.mapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-5 inline-flex items-center gap-2 text-[0.95rem] text-ink hover:text-rust"
                >
                  <MapPin size={20} aria-hidden="true" />
                  {loc.address}
                  <span className="sr-only">, vis på kort (åbner i nyt vindue)</span>
                </a>
              </div>
            );
          })}
        </div>
        <p className="mt-10">
          <Link
            href="/find-os"
            className="font-medium text-rust underline decoration-1 underline-offset-[3px] hover:text-rust-deep"
          >
            Se kort, kalender og hvordan du henter
          </Link>
        </p>
      </Container>
    </Section>
  );
}
