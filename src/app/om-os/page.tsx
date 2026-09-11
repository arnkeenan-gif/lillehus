import type { Metadata } from "next";
import Image from "next/image";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Photo, altFor } from "@/components/home/photo";
import { site } from "@/lib/site";
import om from "@content/pages/om-os.json";

export const metadata: Metadata = {
  title: "Om os",
  description:
    "Kristine, Nicolas og børnene driver Det lille hus på landet på en gård ved Herlufmagle: surdejsbageri, køkkenhave og en stenovn på hjul, alt sammen økologisk og hjemmelavet.",
};

export default function OmOsPage() {
  return (
    <>
      <Section>
        <Container size="narrow">
          <h1 className="text-title font-semibold">Historien bag Det lille hus på landet</h1>
          <p className="mt-4 text-lg text-ink-2">
            Kristine, Nicolas og børnene på en gård ved Herlufmagle. Siden 2009.
          </p>
        </Container>

        <Container className="mt-10 sm:mt-14">
          <figure>
            <Photo
              src={om.heroImage}
              ratio="3/2"
              priority
              position="object-[50%_65%]"
              sizes="(min-width: 1200px) 1136px, 100vw"
            />
            <figcaption className="mt-3 text-sm text-muted">På bænken foran den røde mur på gården.</figcaption>
          </figure>
        </Container>

        <Container size="narrow" className="mt-14 sm:mt-20">
          <div className="prose">
            <p>
              Det lille hus på landet startede i 2009. Det er en historie om personlige tilvalg og fravalg: et
              liv med fokus på familie, økologi og bæredygtighed, og lysten til at lave god mad til dem, der har
              lyst til at smage.
            </p>
            <p>
              Vi bor på gården på Torpevej uden for Herlufmagle: Kristine, Nicolas og børnene. Her er en lade
              med gamle bjælker, et hønsehus, en køkkenhave og det bageri, hvor brødet bliver til. Børnene er med
              i det meste. Vi har valgt et liv uden skole, hvor hverdagen foregår herhjemme.
            </p>
            <p>
              Alt, vi sælger, er økologisk og hjemmelavet. Surdejsbrødet får den tid, det skal have, rugbrødet
              bages med kerner, og kanelsneglene og granolaen kommer fra det samme bageri. I køkkenhaven høster
              vi grønkål, squash, rabarber, gulerødder, tomater og æbler, og det ender i det, vi laver.
            </p>
            <p>
              Stenovnen har vi selv bygget. Den står på en trailer, så vi kan køre den ud til barnedåb,
              konfirmationer, fødselsdage og firmafester og bage pizza på surdej på stedet.
            </p>
            <p>
              Onsdag og lørdag holder vi på Torvedag i Næstved, foran Løveapoteket på Axeltorv, fra klokken 9,
              til vi er udsolgt. Resten af ugen kan du købe brød i fryseren på gården, og har du bestilt, står
              det klar i Hønsehuset.
            </p>
            <p>
              Hønsehuset er også der, hvor vi gerne vil åbne en lille café på gården. Indtil da holder vi åbent
              hus i haven og huset på udvalgte dage, alt efter humør, med pizza, kager og noget at drikke. Vi
              skriver på Facebook og Instagram, når det sker.
            </p>
            <p>
              <strong>Kristine og Nicolas</strong>
            </p>
          </div>
          <Image
            src={om.logo}
            alt={altFor(om.logo, "Det lille hus på landet, håndtegnet logo")}
            width={240}
            height={202}
            className="mt-12 w-48 sm:w-60"
          />
        </Container>
      </Section>

      {/* Two columns from md: the tall barn photo fills the left column, two landscape crops stack on the right. One column below md. */}
      <Section tone="tint">
        <Container>
          <div className="grid gap-4 md:grid-cols-2 md:gap-6">
            <figure className="flex flex-col">
              <div className="relative aspect-[3/4] overflow-hidden rounded-md bg-paper-3 md:aspect-auto md:flex-1">
                <Image
                  src={om.photos.barn}
                  alt={altFor(om.photos.barn)}
                  fill
                  sizes="(min-width: 768px) 50vw, 100vw"
                  className="object-cover"
                />
              </div>
              <figcaption className="mt-3 text-sm text-muted">Laden på gården.</figcaption>
            </figure>
            <div className="flex flex-col gap-4 md:gap-6">
              <figure>
                <Photo
                  src={om.photos.family}
                  ratio="3/2"
                  position="object-[50%_20%]"
                  sizes="(min-width: 768px) 50vw, 100vw"
                />
                <figcaption className="mt-3 text-sm text-muted">Efterår i haven.</figcaption>
              </figure>
              <figure>
                <Photo src={om.photos.garden} ratio="3/2" sizes="(min-width: 768px) 50vw, 100vw" />
                <figcaption className="mt-3 text-sm text-muted">Høst fra køkkenhaven.</figcaption>
              </figure>
            </div>
          </div>
        </Container>
      </Section>

      <Section>
        <Container size="narrow">
          <h2 className="text-title font-semibold">Det går vi op i</h2>
          <div className="prose mt-6">
            <p>
              <strong>Familien.</strong> Vi arbejder hjemme, og børnene er med. Derfor holder vi arrangementer,
              når det passer ind, og ikke efter en fast kalender.
            </p>
            <p>
              <strong>Økologi.</strong> Vi bruger økologiske råvarer og laver tingene selv, fra surdej til
              granola. Det tager længere tid, og det smager man.
            </p>
            <p>
              <strong>Bæredygtighed.</strong> Vi dyrker en del af maden selv, bruger det, vi har, og holder
              tingene i en størrelse, vi selv kan overskue.
            </p>
            <p>
              <strong>Ro.</strong> Slow living kalder nogen det. Vi kalder det at have tid til at gøre tingene
              ordentligt.
            </p>
          </div>

          <h2 className="mt-16 text-title font-semibold">Kontrol fra Fødevarestyrelsen</h2>
          <p className="mt-4 max-w-[60ch] text-ink-2">
            Fødevarestyrelsen fører tilsyn med bageriet, som med alle andre der laver mad til salg. Den seneste
            kontrolrapport kan du læse på findsmiley.dk.
          </p>
          <p className="mt-4">
            <a
              href={site.smileyUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 font-medium text-rust underline decoration-1 underline-offset-[3px] hover:text-rust-deep"
            >
              Se kontrolrapporten
              <ArrowUpRight size={20} aria-hidden="true" />
              <span className="sr-only">(åbner i nyt vindue)</span>
            </a>
          </p>
        </Container>
      </Section>
    </>
  );
}
