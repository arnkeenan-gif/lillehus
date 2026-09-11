import type { Metadata } from "next";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { CakeRequestForm } from "@/components/forms/cake-request-form";
import { getCakes } from "@/lib/content";
import { formatPrice } from "@/lib/format";
import type { CakeTypeExt } from "@/lib/forms";

export const metadata: Metadata = {
  title: "Kager på bestilling",
  description:
    "Kagemand, dåbskage, konfirmationskage, fødselsdagslagkage, kagetapas og bryllupskage bages efter ønske. Send en forespørgsel, så bekræfter Kristine dato og pris inden for to hverdage.",
};

export default async function KagerPage() {
  const cakes = (await getCakes()) as CakeTypeExt[];
  const choices = cakes.map((c) => ({ id: c.id, name: c.name, leadTimeDays: c.leadTimeDays }));

  return (
    <>
      {/* Hero: text left, the one section photo right at lg; stacked below. */}
      <Section>
        <Container className="grid items-center gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-7">
            <h1 className="text-display font-semibold">Kager på bestilling</h1>
            <p className="mt-6 max-w-[48ch] text-lg text-ink-2">
              Kagemand til børnefødselsdagen, dåbskage, konfirmationskage eller et helt kagebord. Vi bager efter ønske og
              aftaler det hele på mail.
            </p>
            <div className="mt-8">
              <Button href="#forespoerg" size="lg">
                Forespørg på kage
              </Button>
            </div>
          </div>
          <div className="lg:col-span-4 lg:col-start-9">
            <Image
              src="/images/facebook/fb-cinnamon-buns.jpg"
              alt="Kanelsnegle med sukker på bagepapir"
              width={414}
              height={414}
              sizes="(min-width: 1024px) 360px, 414px"
              priority
              className="aspect-square w-full max-w-[414px] rounded-md object-cover lg:ml-auto"
            />
          </div>
        </Container>
      </Section>

      {/* The types: two-column list, one hairline per row. */}
      <Section tone="tint">
        <Container>
          <div className="max-w-[60ch]">
            <h2 className="text-title font-semibold">Det kan du bestille</h2>
            <p className="mt-4 text-ink-2">
              Priserne er fra-priser. Den endelige pris afhænger af størrelse og pynt, og den får du sammen med
              Kristines svar.
            </p>
          </div>
          <ul className="mt-10 grid sm:grid-cols-2 sm:gap-x-12 lg:gap-x-16">
            {cakes.map((cake) => (
              <li key={cake.id} className="border-t border-line py-6">
                <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                  <h3 className="text-lg font-semibold text-ink">{cake.name}</h3>
                  <p className="tnum text-ink">
                    fra {formatPrice(cake.fromPriceOere)}
                    {cake.priceNote ? ` ${cake.priceNote}` : ""}
                  </p>
                </div>
                <p className="mt-2 max-w-[50ch] text-ink-2">{cake.description}</p>
                <p className="mt-3 text-sm text-muted">
                  {cake.servings}. Bestil senest {cake.leadTimeDays} dage før.
                </p>
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      {/* Request: form with a side summary. */}
      <Section id="forespoerg" className="scroll-mt-20">
        <Container className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <h2 className="text-title font-semibold">Forespørg på kage</h2>
            <p className="mt-4 max-w-[60ch] text-ink-2">
              Skriv, hvad du har brug for, og hvornår. Det er en forespørgsel, ikke en bestilling: Kristine svarer
              inden for to hverdage.
            </p>
            <div className="mt-10">
              <CakeRequestForm cakes={choices} />
            </div>
          </div>
          <aside className="lg:col-span-4 lg:col-start-9">
            <div className="lg:sticky lg:top-24">
              <h3 className="text-lg font-semibold text-ink">Sådan går det videre</h3>
              <ol className="mt-4 list-decimal space-y-3 pl-5 text-[0.95rem] text-ink-2 marker:text-muted">
                <li>Du sender forespørgslen her på siden.</li>
                <li>Kristine bekræfter inden for to hverdage, om vi kan bage kagen til datoen, og hvad den koster.</li>
                <li>Kagen hentes i Hønsehuset på gården, eller vi aftaler levering.</li>
              </ol>
            </div>
          </aside>
        </Container>
      </Section>
    </>
  );
}
