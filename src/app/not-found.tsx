import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <Section>
      <Container size="narrow">
        <h1 className="text-title font-semibold">Siden findes ikke</h1>
        <p className="mt-4 max-w-[48ch] text-ink-2">
          Linket er måske gammelt, eller siden er flyttet. Prøv forsiden, eller skriv til os hvis du ledte efter noget bestemt.
        </p>
        <div className="mt-8">
          <Button href="/">Til forsiden</Button>
        </div>
      </Container>
    </Section>
  );
}
