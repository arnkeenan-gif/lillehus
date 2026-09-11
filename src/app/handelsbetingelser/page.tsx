import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { formatPrice } from "@/lib/format";
import { fullAddress, site } from "@/lib/site";
import { cutoffText, deliveryDaysText, pickupDaysText, shop } from "@/components/home/shop-facts";

export const metadata: Metadata = {
  title: "Handelsbetingelser",
  description:
    "Betingelser for køb af brød i webshoppen og for forespørgsler på pizzavogn, kager og arrangementer hos Det lille hus på landet.",
};

export default function HandelsbetingelserPage() {
  const delivery = shop.delivery;

  return (
    <Section>
      <Container size="narrow">
        <h1 className="text-title font-semibold">Handelsbetingelser</h1>
        <p className="mt-4 text-lg text-ink-2">
          Gælder for køb i bageriets webshop og for forespørgsler på pizzavogn, kager og arrangementer.
        </p>

        <div className="prose mt-10">
          <h2>Virksomhedsoplysninger</h2>
          <address className="not-italic text-ink-2">
            {site.name}
            <br />
            v. {site.owner}
            <br />
            {fullAddress()}
            <br />
            CVR {site.cvr}
            <br />
            Telefon <a href={`tel:${site.phoneHref}`}>{site.phone}</a>
            <br />
            E-mail <a href={`mailto:${site.email}`}>{site.email}</a>
          </address>

          <h2>Priser</h2>
          <p>
            Alle priser er i danske kroner og inklusive moms. Den pris, der står på siden, når du bestiller, er
            den, du betaler. Vi tager forbehold for trykfejl og udsolgte varer. Sker det, får du besked og
            pengene retur for det, vi ikke kan levere.
          </p>

          <h2>Bestilling og betaling</h2>
          <p>
            Brød bestiller du i webshoppen og betaler med det samme med betalingskort eller MobilePay.
            Betalingen håndteres af Stripe, og vi ser aldrig dine kortoplysninger.
          </p>
          <p>
            Din bestilling er bindende, når betalingen er gennemført. Du får en ordrebekræftelse på mail med
            ordrenummer, afhentningsdag og det, du har bestilt. Beløbet trækkes ved bestillingen, fordi brødet
            bages til dig.
          </p>

          <h2>Afhentning og levering</h2>
          <p>
            Du henter din bestilling i {shop.pickupPlace}, på den afhentningsdag du har valgt, mellem kl.{" "}
            {shop.pickupWindow}. Du kan vælge afhentning {pickupDaysText()}, og fristen for at bestille er{" "}
            {cutoffText()}.
          </p>
          {delivery.enabled ? (
            <p>
              Vi leverer {deliveryDaysText()} inden for {delivery.radiusKm} km fra gården. Levering koster{" "}
              {formatPrice(delivery.feeOere)} og er gratis ved køb over {formatPrice(delivery.freeAboveOere)}.
              Bestillinger til levering afleveres ved døren i det tidsrum, vi bekræfter på mail.
            </p>
          ) : (
            <p>Vi leverer ikke i øjeblikket. Alle bestillinger er til afhentning.</p>
          )}
          <p>
            Bliver din bestilling ikke hentet på dagen, kan vi ikke refundere den, fordi brødet er bagt til dig.
            Kontakt os hurtigst muligt, hvis du bliver forhindret, så finder vi en løsning, hvor det er muligt.
          </p>

          <h2>Fortrydelsesret</h2>
          <p>
            Bagværk er fødevarer, der forringes hurtigt. Derfor gælder den almindelige fortrydelsesret på 14
            dage ikke for køb i webshoppen, jf. forbrugeraftalelovens § 18, stk. 2.
          </p>
          <p>
            Du kan til gengæld afbestille frit frem til bestillingsfristen, {cutoffText()} afhentning. Skriv til{" "}
            <a href={`mailto:${site.email}`}>{site.email}</a> eller ring på{" "}
            <a href={`tel:${site.phoneHref}`}>{site.phone}</a>, så refunderer vi hele beløbet til det kort
            eller den MobilePay-konto, du betalte med. Efter fristen er brødet sat i produktion, og så kan
            bestillingen ikke fortrydes.
          </p>

          <h2>Reklamation</h2>
          <p>
            Købelovens regler gælder. Er der noget galt med det, du har købt, så kontakt os samme dag, gerne med
            et billede, så finder vi en løsning: et nyt brød, en anden vare eller pengene retur. Fordi det er
            fødevarer, skal du sige til inden for rimelig tid, og det vil normalt sige samme dag.
          </p>

          <h2>Pizzavogn, kager og arrangementer</h2>
          <p>
            Pizzavognen, kager og pladser til arrangementer bestiller du via forespørgselsformularerne på siden.
            En forespørgsel er ikke en bindende aftale. Aftalen er indgået, når Kristine har bekræftet dato,
            indhold og pris på mail.
          </p>
          <p>
            For pizzavognen betaler I et depositum på en tredjedel af det aftalte beløb, når aftalen er
            bekræftet. Resten betales på dagen. Aflyser I inden for de sidste 14 dage før arrangementet,
            refunderes depositummet ikke. Aflyser I tidligere, får I depositummet retur.
          </p>
          <p>For kager og arrangementer aftaler vi betaling i bekræftelsen.</p>

          <h2>Persondata</h2>
          <p>
            Vi behandler kun de oplysninger, vi skal bruge for at ekspedere din bestilling eller svare på din
            henvendelse. Læs mere i vores <Link href="/privatlivspolitik">privatlivspolitik</Link>.
          </p>

          <h2>Klageadgang</h2>
          <p>
            Er du utilfreds med et køb, så skriv til os først. Det løser vi som regel med det samme. Kan vi ikke
            blive enige, kan du klage til Center for Klageløsning, Nævnenes Hus, Toldboden 2, 8800 Viborg, via{" "}
            <a href="https://naevneneshus.dk" target="_blank" rel="noreferrer">
              naevneneshus.dk
            </a>
            .
          </p>

          <p>Senest opdateret september 2026.</p>
        </div>
      </Container>
    </Section>
  );
}
