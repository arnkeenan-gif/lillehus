import type { Metadata } from "next";
import Link from "next/link";
import { MapPin } from "@phosphor-icons/react/dist/ssr";
import { getEvents } from "@/lib/content";
import { formatDateLong, ucfirst } from "@/lib/format";
import { site } from "@/lib/site";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { cutoffText, pickupDaysText, shop } from "@/components/home/shop-facts";

/** Events and products change; refresh the static page every hour. */
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Find os",
  description:
    "Bageriet og fryseren på Torpevej 10 i Herlufmagle, Torvedag i Næstved onsdag og lørdag, og afhentning af bestilt brød i Hønsehuset. Åbningstider og kalender.",
};

const link = "font-medium text-rust underline decoration-1 underline-offset-[3px] hover:text-rust-deep";

/** The weekly rhythm, one row per opening-hours entry in content/site.json. */
const weekly = site.locations.flatMap((loc) =>
  loc.hours.map((h) => ({
    key: `${loc.id}-${h.days}`,
    days: h.days,
    where: loc.id === "bageriet" ? "Fryseren på gården" : loc.name,
    time: h.time,
  })),
);

const bageriet = site.locations.find((loc) => loc.id === "bageriet");

export default async function FindOsPage() {
  const events = await getEvents();

  return (
    <>
      <Section>
        <Container size="narrow">
          <h1 className="text-title font-semibold">Find os</h1>
          <p className="mt-4 text-lg text-ink-2">
            Bageriet ligger på gården på Torpevej ved Herlufmagle. Onsdag og lørdag holder vi på torvet i Næstved.
          </p>
        </Container>

        {/* Two-column facts list from md, stacked below. */}
        <Container className="mt-12 sm:mt-16">
          <div className="grid gap-10 md:grid-cols-2 md:gap-16">
            {site.locations.map((loc) => {
              const notes = Array.from(new Set(loc.hours.map((h) => h.note).filter(Boolean)));
              if (loc.notes) notes.push(loc.notes);
              return (
                <section key={loc.id} className="border-t border-line pt-6">
                  <h2 className="text-xl font-semibold">{loc.name}</h2>
                  <p className="mt-1 text-ink-2">{loc.subtitle}</p>
                  <a
                    href={loc.mapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-flex items-center gap-2 text-[0.95rem] text-ink hover:text-rust"
                  >
                    <MapPin size={20} aria-hidden="true" />
                    {loc.address}
                    <span className="sr-only">, vis på Google Maps (åbner i nyt vindue)</span>
                  </a>
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
                </section>
              );
            })}
          </div>
        </Container>
      </Section>

      <Section tone="tint">
        <Container size="narrow">
          <h2 className="text-title font-semibold">Sådan henter du bestilt brød</h2>
          <div className="prose mt-6">
            <p>
              Når du bestiller brød på siden, vælger du selv en afhentningsdag: {pickupDaysText()}. Du skal
              bestille senest {cutoffText()}.
            </p>
            <p>
              Brødet står klar med dit navn på i {shop.pickupPlace}, mellem kl. {shop.pickupWindow}. Tag en pose
              med.
            </p>
            {bageriet ? (
              <p>
                Har du ikke bestilt, kan du købe fra fryseren på gården,{" "}
                {bageriet.hours.map((h) => `${h.days.toLowerCase()} kl. ${h.time}`).join(" og ")}.{" "}
                {bageriet.hours[0]?.note}
              </p>
            ) : null}
            <p>
              <Link href="/levering">Læs mere om afhentning og levering</Link>
            </p>
          </div>
        </Container>
      </Section>

      <Section>
        <Container size="narrow">
          <h2 className="text-title font-semibold">Kalender</h2>
          <p className="mt-4 text-ink-2">Sådan ser en almindelig uge ud.</p>
          <table className="mt-6 w-full text-[0.95rem]">
            <caption className="sr-only">Faste ugentlige tider</caption>
            <thead>
              <tr className="text-left text-sm text-muted">
                <th scope="col" className="pb-3 pr-4 font-medium">
                  Dag
                </th>
                <th scope="col" className="pb-3 pr-4 font-medium">
                  Sted
                </th>
                <th scope="col" className="pb-3 text-right font-medium">
                  Tid
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line border-t border-line">
              {weekly.map((row) => (
                <tr key={row.key}>
                  <td className="py-3 pr-4 align-top text-ink">{row.days}</td>
                  <td className="py-3 pr-4 align-top text-ink-2">{row.where}</td>
                  <td className="tnum py-3 text-right align-top whitespace-nowrap text-ink">kl. {row.time}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h3 className="mt-12 text-xl font-semibold">Kommende datoer</h3>
          {events.length > 0 ? (
            <ul className="mt-4 divide-y divide-line border-t border-line">
              {events.map((e) => (
                <li key={e.id} className="grid gap-1 py-4 sm:grid-cols-[15rem_1fr] sm:gap-6">
                  <p className="tnum text-[0.95rem] text-ink-2">{ucfirst(formatDateLong(e.start))}</p>
                  <div>
                    <p className="font-medium text-ink">
                      <Link href="/arrangementer" className="hover:underline hover:underline-offset-[3px]">
                        {e.title}
                      </Link>
                    </p>
                    <p className="text-[0.95rem] text-ink-2">{e.place}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 max-w-[60ch] text-ink-2">
              Ingen faste datoer lige nu. Åbent hus på gården annoncerer vi på Facebook og Instagram, når vi
              kender dagen.
            </p>
          )}
          <p className="mt-6">
            <Link href="/arrangementer" className={link}>
              Se alle arrangementer
            </Link>
          </p>
        </Container>
      </Section>
    </>
  );
}
