import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import { site } from "@/lib/site";

/** Placeholder forside. The content lane replaces this file entirely. */
export default function HomePage() {
  return (
    <Section>
      <Container size="narrow">
        <h1 className="text-display font-semibold">{site.name}</h1>
        <p className="mt-6 max-w-[48ch] text-lg text-ink-2">{site.tagline}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button href="/bageri" size="lg">
            Bestil brød
          </Button>
          <Button href="/pizza" size="lg" variant="secondary">
            Book pizzavognen
          </Button>
        </div>
      </Container>
    </Section>
  );
}
