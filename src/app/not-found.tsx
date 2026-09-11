import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

export default function NotFound() {
  return (
    <Container className="pb-24 pt-12 sm:pb-32 sm:pt-20">
      <h1 className="max-w-[18ch] text-balance text-display font-bold tracking-tight text-ink">Siden findes ikke</h1>
      <p className="mt-5 max-w-[46ch] text-lead text-ink-2">
        Linket er måske gammelt, eller siden er flyttet. Prøv forsiden, eller skriv til os, hvis du ledte efter noget
        bestemt.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Button href="/" size="lg">
          Til forsiden
        </Button>
        <Button href="/kontakt" size="lg" variant="secondary">
          Skriv til os
        </Button>
      </div>
    </Container>
  );
}
