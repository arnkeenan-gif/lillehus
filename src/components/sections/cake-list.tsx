import { Container } from "@/components/ui/container";
import { getCakes, type CakeListSection } from "@/lib/cms";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/cn";
import { SectionHeading, SectionIntro, afterIntro } from "./heading";
import type { SectionProps } from "./types";

/**
 * The cakes set like the price list: name, leader, price on one line (or
 * "Pris efter aftale" when Kristine has not set one), what it is under it,
 * how many it feeds in small text. Nothing is printed that is not filled in.
 * Two columns from md, one on phones.
 */
export async function CakeList({ section, level, className }: SectionProps<CakeListSection>) {
  const cakes = await getCakes();
  if (cakes.length === 0) return null;
  const hasTop = Boolean(section.heading || section.text);

  return (
    <section className={className}>
      <Container>
        {section.heading ? <SectionHeading as={level}>{section.heading}</SectionHeading> : null}
        {section.text ? (
          <SectionIntro level={level} afterHeading={Boolean(section.heading)}>
            {section.text}
          </SectionIntro>
        ) : null}
        <ul className={cn("grid gap-x-16 gap-y-8 md:grid-cols-2 lg:gap-x-24", hasTop && afterIntro)}>
          {cakes.map((cake) => (
            <li key={cake.id}>
              <div className="flex items-baseline">
                <h3 className="min-w-0 text-lg font-medium text-ink">{cake.name}</h3>
                <span className="leader" aria-hidden="true" />
                <p className="tnum shrink-0 text-lg text-ink">
                  {cake.fromPriceOere > 0
                    ? `fra ${formatPrice(cake.fromPriceOere)}${cake.priceNote ? ` ${cake.priceNote}` : ""}`
                    : "Pris efter aftale"}
                </p>
              </div>
              {cake.description ? <p className="mt-2 max-w-[50ch] text-ink-2">{cake.description}</p> : null}
              {cake.servings ? <p className="mt-1 text-sm text-muted">{cake.servings}</p> : null}
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
