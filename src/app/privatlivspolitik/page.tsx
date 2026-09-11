import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { fullAddress, site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privatlivspolitik",
  description:
    "Hvilke oplysninger Det lille hus på landet gemmer, når du bestiller brød eller skriver til os, hvor længe, hvem vi deler dem med, og hvilke rettigheder du har.",
};

export default function PrivatlivspolitikPage() {
  return (
    <Section>
      <Container size="narrow">
        <h1 className="text-title font-semibold">Privatlivspolitik</h1>
        <p className="mt-4 text-lg text-ink-2">
          Kort fortalt: vi gemmer kun det, vi skal bruge for at bage dit brød og svare dig, og vi giver ikke
          oplysninger videre til andre end dem, der hjælper os med det.
        </p>

        <div className="prose mt-10">
          <h2>Dataansvarlig</h2>
          <address className="not-italic text-ink-2">
            {site.owner}
            <br />
            {site.name}
            <br />
            {fullAddress()}
            <br />
            CVR {site.cvr}
            <br />
            E-mail <a href={`mailto:${site.email}`}>{site.email}</a>
            <br />
            Telefon <a href={`tel:${site.phoneHref}`}>{site.phone}</a>
          </address>

          <h2>Hvad vi gemmer, og hvorfor</h2>
          <h3>Når du bestiller brød</h3>
          <p>
            Når du bestiller i webshoppen, gemmer vi navn, e-mail, telefonnummer, afhentningsdag, det du har
            bestilt og en eventuel besked til os. Det bruger vi til at bage og pakke din ordre, sende
            ordrebekræftelsen og kontakte dig, hvis der er spørgsmål. Betalingen sker hos Stripe, som håndterer
            dine kortoplysninger. Vi ser dem aldrig. Grundlaget er aftalen med dig
            (databeskyttelsesforordningens artikel 6, stk. 1, litra b).
          </p>
          <h3>Når du skriver til os</h3>
          <p>
            Forespørgsler på pizzavognen, kager, arrangementer og firmaaftaler samt beskeder fra kontaktsiden
            sendes som e-mail til Kristine gennem tjenesten Resend. Vi gemmer det, du skriver, indtil vi har
            svaret, og aftalen er afsluttet. Grundlaget er vores interesse i at besvare din henvendelse og en
            eventuel aftale med dig.
          </p>
          <h3>Nyhedsbrev</h3>
          <p>
            Tilmelder du dig nyhedsbrevet, gemmer vi din e-mailadresse hos Resend, indtil du afmelder dig. Der
            er et afmeld-link i hvert nyhedsbrev. Grundlaget er dit samtykke.
          </p>
          <h3>Kurven i din browser</h3>
          <p>
            Det, du lægger i kurven, gemmes kun i din egen browser (localStorage), så det stadig ligger der, hvis
            du kommer tilbage senere. Det sendes ikke til os, før du går til betaling.
          </p>
          <h3>Cookies og statistik</h3>
          <p>
            Vi bruger ingen analyseværktøjer og ingen marketingcookies. Betalingssiden hos Stripe kan sætte de
            cookies, Stripe skal bruge for at gennemføre betalingen sikkert.
          </p>

          <h2>Hvor længe vi gemmer</h2>
          <p>
            Ordrer gemmer vi i fem år efter udgangen af det regnskabsår, de hører til, fordi bogføringsloven
            kræver det. Henvendelser sletter vi, når sagen er afsluttet. Nyhedsbrevets adresseliste beholder vi,
            til du afmelder dig.
          </p>

          <h2>Hvem vi deler oplysninger med</h2>
          <ul>
            <li>Stripe, som håndterer betalingen i webshoppen.</li>
            <li>Resend, som sender ordrebekræftelser, forespørgsler og nyhedsbrevet.</li>
            <li>Vercel, som hoster siden.</li>
          </ul>
          <p>
            De tre er databehandlere for os og må kun bruge oplysningerne til at levere deres tjeneste. De er
            amerikanske virksomheder, og overførsel af oplysninger til dem sker efter EU-Kommissionens regler for
            overførsel til tredjelande. Vi sælger aldrig oplysninger videre.
          </p>

          <h2>Dine rettigheder</h2>
          <p>
            Du kan altid bede om at få at vide, hvad vi har gemt om dig (indsigt), få det rettet, få det slettet,
            når vi ikke længere skal gemme det efter loven, og gøre indsigelse mod vores behandling. Skriv til{" "}
            <a href={`mailto:${site.email}`}>{site.email}</a>, så svarer vi hurtigst muligt.
          </p>
          <p>
            Er du utilfreds med, hvordan vi behandler dine oplysninger, kan du klage til Datatilsynet, Carl
            Jacobsens Vej 35, 2500 Valby,{" "}
            <a href="https://www.datatilsynet.dk" target="_blank" rel="noreferrer">
              datatilsynet.dk
            </a>
            .
          </p>

          <h2>Kontakt</h2>
          <p>
            Spørgsmål om persondata: skriv til <a href={`mailto:${site.email}`}>{site.email}</a> eller ring på{" "}
            <a href={`tel:${site.phoneHref}`}>{site.phone}</a>.
          </p>

          <p>Senest opdateret september 2026.</p>
        </div>
      </Container>
    </Section>
  );
}
