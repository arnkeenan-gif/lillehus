import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Photo } from "@/components/home/photo";
import forside from "@content/pages/forside.json";

/**
 * Layout family: photo band with the caption below, then a single column
 * of text. The photo is 1266px wide, so it stays inside the default
 * container at 3/2 rather than being stretched into a wide 16/9 band.
 */
export function PizzaBand() {
  return (
    <Section>
      <Container>
        <figure>
          <Photo
            src={forside.pizzaImage}
            ratio="3/2"
            rounded="lg"
            sizes="(min-width: 1200px) 1136px, 100vw"
          />
          <figcaption className="mt-3 text-sm text-muted">Pizza med rucola og parmaskinke, lige ud af stenovnen.</figcaption>
        </figure>
      </Container>
      <Container className="mt-12 sm:mt-16">
        <div className="max-w-[60ch]">
          <h2 className="text-title font-semibold">Pizzavognen kommer ud til jer</h2>
          <p className="mt-4 text-ink-2">
            Vi kommer med ovnen på traileren og bager pizza på surdej, til alle er mætte. Det passer til
            barnedåb, konfirmation, fødselsdag og firmafest, og I skal være mindst 40 voksne.
          </p>
          <div className="mt-8">
            <Button href="/pizza">Book pizzavognen</Button>
          </div>
        </div>
      </Container>
    </Section>
  );
}
