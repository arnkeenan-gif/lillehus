import { Container } from "@/components/ui/container";
import type { PriceListSection } from "@/lib/cms";
import { cn } from "@/lib/cn";
import { SectionHeading, SectionIntro, afterIntro, textMeasure } from "./heading";
import type { SectionProps } from "./types";

/**
 * The chalkboard as typography: name, dotted leader, price on one line,
 * a short note under the name, two columns from md, one on phones. No
 * photos, no borders. The leader sits on the baseline (see globals.css) and
 * a long name wraps under itself while the price stays on its first line.
 * Kristine edits the rows freely in the Studio.
 */
export function PriceList({ section, level, className }: SectionProps<PriceListSection>) {
  const { heading, intro, rows, footnote } = section;
  const hasTop = Boolean(heading || intro);

  return (
    <section className={className}>
      <Container>
        {heading ? <SectionHeading as={level}>{heading}</SectionHeading> : null}
        {intro ? (
          <SectionIntro level={level} afterHeading={Boolean(heading)}>
            {intro}
          </SectionIntro>
        ) : null}
        <ul className={cn("md:columns-2 md:gap-x-16 lg:gap-x-24", hasTop && afterIntro)}>
          {rows.map((row) => (
            <li key={row._key} className="break-inside-avoid py-3">
              <div className="flex items-baseline">
                <span className="min-w-0 text-lg font-medium text-ink">{row.name}</span>
                <span className="leader" aria-hidden="true" />
                <span className="tnum shrink-0 text-lg text-ink">{row.price}</span>
              </div>
              {row.note ? <p className="mt-1 max-w-[40ch] text-sm text-muted">{row.note}</p> : null}
            </li>
          ))}
        </ul>
        {footnote ? <p className={cn("mt-8 text-sm text-muted", textMeasure)}>{footnote}</p> : null}
      </Container>
    </section>
  );
}
