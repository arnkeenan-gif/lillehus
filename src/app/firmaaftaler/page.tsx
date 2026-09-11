import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { CompanyRequestForm } from "@/components/forms/company-request-form";

export const metadata: Metadata = {
  title: "Firmaaftaler",
  description:
    "Fast brød til kontoret, morgenbrød til møder og pizzavognen til firmaarrangementet. Skriv, hvad I har brug for, så vender Kristine tilbage med et forslag og en pris.",
};

export default function FirmaaftalerPage() {
  return (
    <>
      {/* Hero: text left, photo right at lg; stacked below. */}
      <Section>
        <Container className="grid items-center gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-6">
            <h1 className="text-display font-semibold">Firmaaftaler</h1>
            <p className="mt-6 max-w-[48ch] text-lg text-ink-2">
              Fast brød til kontoret, morgenbrød til møderne og pizzavognen til sommerfesten. Vi aftaler det, der passer
              til jer.
            </p>
            <div className="mt-8">
              <Button href="#forespoerg" size="lg">
                Send forespørgsel
              </Button>
            </div>
          </div>
          <div className="lg:col-span-6">
            <Image
              src="/images/rustic-bread-loaves-and-flatbread.jpg"
              alt="Brød, boller og fladbrød drysset med mel"
              width={1080}
              height={1080}
              sizes="(min-width: 1024px) 580px, 100vw"
              priority
              className="aspect-[3/2] w-full rounded-md object-cover"
            />
          </div>
        </Container>
      </Section>

      {/* What we can do: single-column prose. */}
      <Section tone="tint">
        <Container size="narrow">
          <h2 className="text-title font-semibold">Det kan vi hjælpe med</h2>
          <div className="prose mt-6">
            <h3>Fast brød til kontoret</h3>
            <p>
              En fast bestilling af surdejsbrød, boller eller rugbrød på de ugedage, der passer jer. Så er der altid
              godt brød til frokosten, uden at nogen skal huske at bestille.
            </p>
            <h3>Morgenbrød til møder</h3>
            <p>
              Boller, kanelsnegle og brød til morgenmødet, kursusdagen eller receptionen. Bestil til en enkelt dag,
              eller lav en fast aftale.
            </p>
            <h3>Pizzavognen til firmaarrangementet</h3>
            <p>
              Sommerfest, fredagsbar eller kundedag: vi kommer med den hjemmebyggede stenovn og bager pizzaer på
              stedet i to timer. Priser og praktisk står på siden om{" "}
              <Link href="/pizza">pizzavognen</Link>.
            </p>
            <hr />
            <p>
              Brødet hentes i Hønsehuset på gården, eller vi aftaler levering. Skriv, hvad I har brug for, hvor ofte
              og cirka hvor mange I er, så vender Kristine tilbage inden for to hverdage med et forslag og en pris.
            </p>
          </div>
        </Container>
      </Section>

      <Section id="forespoerg" className="scroll-mt-20">
        <Container size="narrow">
          <h2 className="text-title font-semibold">Fortæl os, hvad I har brug for</h2>
          <p className="mt-4 max-w-[60ch] text-ink-2">
            Ingen forpligtelse. I får et forslag og en pris, og så tager vi den derfra.
          </p>
          <div className="mt-10">
            <CompanyRequestForm />
          </div>
        </Container>
      </Section>
    </>
  );
}
