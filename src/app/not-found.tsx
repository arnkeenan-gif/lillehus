import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

/** The 404: the title, one sentence and one way back, in the same opening as every other page. */
export default function NotFound() {
  return (
    <Container className="pb-32 pt-12 sm:pb-48 sm:pt-20">
      <h1 className="max-w-[18ch] text-balance text-display font-semibold tracking-tight text-ink">Siden findes ikke</h1>
      <p className="mt-5 max-w-[46ch] text-lead text-ink-2">Linket er måske gammelt, eller siden er flyttet.</p>
      <div className="mt-8">
        <Button href="/" size="lg">
          Til forsiden
        </Button>
      </div>
    </Container>
  );
}
