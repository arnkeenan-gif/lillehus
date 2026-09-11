import { CaretDown } from "@phosphor-icons/react/dist/ssr";
import { Container } from "@/components/ui/container";
import { RichText, getFaq, type FaqItem, type FaqSection } from "@/lib/cms";
import { cn } from "@/lib/cn";
import { SectionHeading, afterIntro, listMeasure } from "./heading";
import type { SectionProps } from "./types";

/** Questions under their group, in the order Kristine set. */
function groupItems(items: FaqItem[]): { name: string; items: FaqItem[] }[] {
  const groups: { name: string; items: FaqItem[] }[] = [];
  for (const item of items) {
    const name = item.group || "Andet";
    let group = groups.find((g) => g.name === name);
    if (!group) {
      group = { name, items: [] };
      groups.push(group);
    }
    group.items.push(item);
  }
  return groups;
}

/**
 * Native details/summary rows with a hairline between them, no JavaScript.
 * Every summary is at least 44px tall and carries a caret that turns when
 * the row opens; the answer is prose in the same measure as the question.
 */
export async function Faq({ section, level, className }: SectionProps<FaqSection>) {
  const items = section.mode === "selected" && section.items.length > 0 ? section.items : await getFaq();
  if (items.length === 0) return null;
  const groups = groupItems(items);
  const GroupTag = section.heading ? "h3" : "h2";

  return (
    <section className={className}>
      <Container>
        {section.heading ? <SectionHeading as={level}>{section.heading}</SectionHeading> : null}
        <div className={cn(listMeasure, section.heading && afterIntro)}>
          {groups.map((group, index) => (
            <div key={group.name} className={index > 0 ? "mt-14" : undefined}>
              {groups.length > 1 || group.name !== "Andet" ? (
                <GroupTag className="text-xl font-semibold text-ink">{group.name}</GroupTag>
              ) : null}
              <div className="mt-4 border-t border-line">
                {group.items.map((item) => (
                  <details key={item.id} className="group border-b border-line">
                    <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-6 py-4 text-left font-medium text-ink transition-colors duration-150 ease-out-quart hover:text-rust [&::-webkit-details-marker]:hidden">
                      <span>{item.q}</span>
                      <CaretDown
                        size={20}
                        aria-hidden="true"
                        className="shrink-0 text-muted transition-transform duration-150 ease-out-quart group-open:rotate-180"
                      />
                    </summary>
                    <RichText value={item.answer} className="pb-6 pr-11" />
                  </details>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
