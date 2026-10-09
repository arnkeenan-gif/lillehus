import { Container } from "@/components/ui/container";
import { CakeTiles } from "@/components/ordering/cake-tiles";
import { getCakeProducts, type CakeListSection } from "@/lib/cms";
import { cn } from "@/lib/cn";
import { SectionHeading, SectionIntro, afterIntro } from "./heading";
import type { SectionProps } from "./types";

/**
 * The cakes Kristine set up under Kager in the Studio, each linking to its
 * own page (/kager/<id>): photo, name and price ("Pris aftales" until a price
 * is set). Cakes without a photo are set like the chalkboard instead of
 * standing in empty boxes.
 */
export async function CakeList({ section, level, className }: SectionProps<CakeListSection>) {
  const cakes = await getCakeProducts();
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
        <CakeTiles cakes={cakes} className={cn(hasTop && afterIntro)} />
      </Container>
    </section>
  );
}
