import { Container } from "@/components/ui/container";
import type { QuoteSection } from "@/lib/cms";
import type { SectionProps } from "./types";

/** Real words from a real person, in the lead size, and who said them. */
export function Quote({ section, className }: SectionProps<QuoteSection>) {
  return (
    <section className={className}>
      <Container>
        <figure className="max-w-[40ch]">
          <blockquote className="text-lead text-ink">„{section.quote}“</blockquote>
          {section.attribution ? <figcaption className="mt-4 text-ink-2">{section.attribution}</figcaption> : null}
        </figure>
      </Container>
    </section>
  );
}
