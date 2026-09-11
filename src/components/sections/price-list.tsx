import { Container } from "@/components/ui/container";
import type { PriceListSection } from "@/lib/cms";
import { cn } from "@/lib/cn";
import { SectionHeading } from "./heading";
import type { SectionProps } from "./types";

/**
 * The chalkboard as typography: name, dotted leader, price on one line,
 * a short note under the name, two columns from md, one on phones. No
 * photos, no borders. Kristine edits the rows freely in the Studio.
 */
export function PriceList({ section, level, className }: SectionProps<PriceListSection>) {
  const { heading, intro, rows, footnote } = section;
  const hasTop = Boolean(heading || intro);

  return (
    <section className={className}>
      <Container>
        {heading ? <SectionHeading as={level}>{heading}</SectionHeading> : null}
        {intro ? <p className="mt-4 max-w-[62ch] text-ink-2">{intro}</p> : null}
        <ul className={cn("md:columns-2 md:gap-x-16 lg:gap-x-24", hasTop && "mt-10")}>
          {rows.map((row) => (
            <li key={row._key} className="break-inside-avoid py-3">
              <div className="flex items-baseline">
                <span className="text-lg font-medium text-ink">{row.name}</span>
                <span className="leader" aria-hidden="true" />
                <span className="tnum shrink-0 text-lg text-ink">{row.price}</span>
              </div>
              {row.note ? <p className="mt-0.5 max-w-[40ch] text-sm text-muted">{row.note}</p> : null}
            </li>
          ))}
        </ul>
        {footnote ? <p className="mt-8 max-w-[62ch] text-sm text-muted">{footnote}</p> : null}
      </Container>
    </section>
  );
}
