import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { formatPrice } from "@/lib/format";
import { site } from "@/lib/site";
import { cutoffText, deliveryDaysText, pickupDaysText, shop } from "@/components/home/shop-facts";

export const metadata: Metadata = {
  title: "Afhentning og levering",
  description:
    "Bestilt brød hentes i Hønsehuset på Torpevej 10 i Herlufmagle. Her står, hvilke dage du kan hente, hvornår du skal bestille, og hvad planen er for levering.",
};

const bageriet = site.locations.find((loc) => loc.id === "bageriet");

export default function LeveringPage() {
  const delivery = shop.delivery;

  return (
    <Section>
      <Container size="narrow">
        <h1 className="text-title font-semibold">Afhentning og levering</h1>
        <p className="mt-4 text-lg text-ink-2">
          Det meste af vores brød bliver hentet på gården. Her er, hvordan det foregår, og hvad vi har af planer
          om levering.
        </p>

        <div className="prose mt-10">
          <h2>Afhentning i Hønsehuset</h2>
          <p>
            Når du bestiller på siden, vælger du selv en afhentningsdag. Du kan vælge {pickupDaysText()}, og du
            skal bestille senest {cutoffText()}.
          </p>
          <p>
            Brødet står klar i {shop.pickupPlace}, mellem kl. {shop.pickupWindow} på den dag, du har valgt. Det
            står med dit navn på, så tag det, der er dit, og lad resten stå til de andre.
          </p>
          <p>
            Tag en pose eller en kurv med. Du behøver ikke vise ordrebekræftelsen, men hav den ved hånden på
            telefonen, hvis der er tvivl om navnet.
          </p>
          <p>
            Bliver du forhindret, så ring til os på{" "}
            <a href={`tel:${site.phoneHref}`}>{site.phone}</a> samme dag, så finder vi en løsning. Brød, der
            ikke bliver hentet, kan vi ikke tage retur.
          </p>

          {bageriet ? (
            <>
              <h2>Fryseren</h2>
              <p>
                Har du ikke bestilt, kan du altid købe fra fryseren på gården. Den er åben{" "}
                {bageriet.hours.map((h) => `${h.days.toLowerCase()} kl. ${h.time}`).join(" og ")}.{" "}
                {bageriet.hours[0]?.note}
              </p>
            </>
          ) : null}

          <h2>Levering</h2>
          {delivery.enabled ? (
            <>
              <p>
                Vi leverer {deliveryDaysText()} inden for {delivery.radiusKm} km fra gården. Levering koster{" "}
                {formatPrice(delivery.feeOere)}, og den er gratis, når du køber for over{" "}
                {formatPrice(delivery.freeAboveOere)}.
              </p>
              {delivery.note ? <p>{delivery.note}</p> : null}
            </>
          ) : (
            <>
              <p>Vi leverer ikke endnu. {delivery.note}</p>
              <p>
                Indtil da henter du i Hønsehuset, eller du finder os på Torvedag i Næstved. Vi skriver på
                Facebook og Instagram, når vi begynder at køre.
              </p>
            </>
          )}

          <h2>Pizzavognen kører ud</h2>
          <p>Pizzavognen kører derimod gerne ud til jer med stenovnen på traileren.</p>
        </div>
        <div className="mt-8">
          <Button href="/pizza" variant="secondary">
            Book pizzavognen
          </Button>
        </div>
      </Container>
    </Section>
  );
}
