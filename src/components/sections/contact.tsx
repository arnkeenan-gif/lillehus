import { Container } from "@/components/ui/container";
import { getSiteSettings, type ContactSection } from "@/lib/cms";
import { SectionHeading } from "./heading";
import type { SectionProps } from "./types";

const bigLink =
  "text-ink underline decoration-1 underline-offset-[5px] transition-colors duration-150 ease-out-quart hover:text-rust";

/** Heading, one sentence, then the phone and the e-mail large enough to tap. */
export async function Contact({ section, level, className }: SectionProps<ContactSection>) {
  const s = await getSiteSettings();
  const a = s.address;

  return (
    <section className={className}>
      <Container>
        {section.heading ? (
          <SectionHeading as={level} className="max-w-[18ch] text-balance">
            {section.heading}
          </SectionHeading>
        ) : null}
        <div className="max-w-[62ch]">
          {section.text ? <p className="mt-5 text-lead text-ink-2">{section.text}</p> : null}
          <div className="mt-10 space-y-3 text-lead">
            <p>
              <a href={`tel:${s.phoneHref}`} className={`tnum ${bigLink}`}>
                {s.phone}
              </a>
            </p>
            <p>
              <a href={`mailto:${s.email}`} className={`break-all ${bigLink}`}>
                {s.email}
              </a>
            </p>
          </div>
          <p className="mt-8 text-ink-2">
            {s.name}, {a.street}, {a.postalCode} {a.city}. CVR {s.cvr}.
          </p>
        </div>
      </Container>
    </section>
  );
}
