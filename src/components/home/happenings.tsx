import Link from "next/link";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { getEvents } from "@/lib/content";
import { formatDateLong, ucfirst } from "@/lib/format";
import { site } from "@/lib/site";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Photo } from "@/components/home/photo";
import forside from "@content/pages/forside.json";

const positions: Record<string, string> = {
  top: "object-top",
  center: "object-center",
  bottom: "object-bottom",
};

const link = "font-medium text-rust underline decoration-1 underline-offset-[3px] hover:text-rust-deep";

/**
 * "Det sker": the next three dates from content/events.json, or one calm
 * paragraph when the calendar is empty, followed by the Instagram strip.
 * Layout families: single-column list, then photo strip (3 columns on a
 * phone, 6 from sm).
 */
export async function Happenings() {
  const events = (await getEvents()).slice(0, 3);

  return (
    <Section tone="tint">
      <Container>
        <h2 className="text-title font-semibold">Det sker</h2>

        {events.length > 0 ? (
          <ul className="mt-8 max-w-[65ch] divide-y divide-line border-t border-line">
            {events.map((e) => (
              <li key={e.id} className="grid gap-1 py-5 sm:grid-cols-[15rem_1fr] sm:gap-6">
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
            Lige nu er der ingen datoer i kalenderen. Åbent hus i haven og huset holder vi på udvalgte dage, og vi
            skriver på{" "}
            <a href={site.social.facebook} target="_blank" rel="noreferrer" className={link}>
              Facebook
            </a>{" "}
            og{" "}
            <a href={site.social.instagram} target="_blank" rel="noreferrer" className={link}>
              Instagram
            </a>
            , når vi kender dagen.
          </p>
        )}

        <p className="mt-6">
          <Link href="/arrangementer" className={link}>
            Se alle arrangementer
          </Link>
        </p>

        <ul className="mt-14 grid grid-cols-3 gap-1.5 sm:grid-cols-6">
          {forside.instagram.map((photo) => (
            <li key={photo.src}>
              <Photo
                src={photo.src}
                ratio="1/1"
                position={positions[photo.position] ?? positions.center}
                sizes="(min-width: 1200px) 190px, (min-width: 640px) 16vw, 33vw"
              />
            </li>
          ))}
        </ul>
        <p className="mt-6">
          <a
            href={site.social.instagram}
            target="_blank"
            rel="noreferrer"
            className={`inline-flex items-center gap-1 ${link}`}
          >
            Følg med på Instagram
            <ArrowUpRight size={20} aria-hidden="true" />
            <span className="sr-only">(åbner i nyt vindue)</span>
          </a>
        </p>
      </Container>
    </Section>
  );
}
