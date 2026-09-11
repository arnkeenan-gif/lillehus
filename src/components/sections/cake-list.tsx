import { Container } from "@/components/ui/container";
import { getCakes, type CakeListSection } from "@/lib/cms";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/cn";
import { SectionHeading } from "./heading";
import type { SectionProps } from "./types";

/** The cakes with from-prices: name, leader, price; what it is; how many it feeds and the notice. */
export async function CakeList({ section, level, className }: SectionProps<CakeListSection>) {
  const cakes = await getCakes();
  if (cakes.length === 0) return null;
  const hasTop = Boolean(section.heading || section.text);

  return (
    <section className={className}>
      <Container>
        {section.heading ? <SectionHeading as={level}>{section.heading}</SectionHeading> : null}
        {section.text ? <p className="mt-4 max-w-[62ch] text-ink-2">{section.text}</p> : null}
        <ul className={cn("grid gap-x-16 gap-y-8 md:grid-cols-2 lg:gap-x-24", hasTop && "mt-10")}>
          {cakes.map((cake) => (
            <li key={cake.id}>
              <div className="flex items-baseline">
                <h3 className="text-lg font-medium text-ink">{cake.name}</h3>
                <span className="leader" aria-hidden="true" />
                <p className="tnum shrink-0 text-lg text-ink">
                  fra {formatPrice(cake.fromPriceOere)}
                  {cake.priceNote ? ` ${cake.priceNote}` : ""}
                </p>
              </div>
              <p className="mt-2 max-w-[50ch] text-ink-2">{cake.description}</p>
              <p className="mt-1 text-sm text-muted">
                {cake.servings}. Bestil senest {cake.leadTimeDays} dage før.
              </p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
