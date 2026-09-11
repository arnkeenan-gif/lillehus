import Link from "next/link";
import { Container } from "@/components/ui/container";
import { cutoffText, deliveryDaysText, hoursText, pickupDaysText, splitNotes } from "@/components/cms/text";
import { getLocations, getShopSettings, getSiteSettings, type PickupInfoSection } from "@/lib/cms";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/cn";
import { SectionHeading, textLink } from "./heading";
import type { SectionProps } from "./types";

/**
 * How ordered bread is collected, written from the shop settings and the
 * pickup location so the numbers are always the ones Kristine set. "kort"
 * is three sentences for find-os, "udførlig" the full page for /levering.
 */
export async function PickupInfo({ section, level, className }: SectionProps<PickupInfoSection>) {
  const [shop, locations, settings] = await Promise.all([getShopSettings(), getLocations(), getSiteSettings()]);
  const farm = locations.find((l) => l.pickup) ?? locations[0];
  const farmNotes = farm ? splitNotes(farm.hours).rest.join(" ") : "";
  const delivery = shop.delivery;
  const hasTop = Boolean(section.heading || section.text);

  return (
    <section className={className}>
      <Container>
        {section.heading ? <SectionHeading as={level}>{section.heading}</SectionHeading> : null}
        {section.text ? <p className="mt-4 max-w-[62ch] text-lead text-ink-2">{section.text}</p> : null}
        <div className={cn("prose", hasTop && "mt-8")}>
          {section.detail === "kort" ? (
            <>
              <p>
                Når du bestiller brød på siden, vælger du selv en afhentningsdag: {pickupDaysText(shop)}. Du skal bestille
                senest {cutoffText(shop)}.
              </p>
              <p>
                Brødet står klar med dit navn på i {shop.pickupPlace}, mellem kl. {shop.pickupWindow}. Tag en pose med.
              </p>
              {farm ? (
                <p>
                  Har du ikke bestilt, kan du købe fra fryseren på gården, {hoursText(farm.hours)}. {farmNotes}
                </p>
              ) : null}
              {shop.notice ? <p>{shop.notice}</p> : null}
            </>
          ) : (
            <>
              <h2>Afhentning i Hønsehuset</h2>
              <p>
                Når du bestiller på siden, vælger du selv en afhentningsdag. Du kan vælge {pickupDaysText(shop)}, og du skal
                bestille senest {cutoffText(shop)}.
              </p>
              <p>
                Brødet står klar i {shop.pickupPlace}, mellem kl. {shop.pickupWindow} på den dag, du har valgt. Det står med
                dit navn på, så tag det, der er dit, og lad resten stå til de andre.
              </p>
              <p>
                Tag en pose eller en kurv med. Du behøver ikke vise ordrebekræftelsen, men hav den ved hånden på telefonen,
                hvis der er tvivl om navnet.
              </p>
              <p>
                Bliver du forhindret, så ring til os på <a href={`tel:${settings.phoneHref}`}>{settings.phone}</a> samme dag,
                så finder vi en løsning. Brød, der ikke bliver hentet, kan vi ikke tage retur.
              </p>
              {shop.notice ? <p>{shop.notice}</p> : null}

              {farm ? (
                <>
                  <h2>Fryseren</h2>
                  <p>
                    Har du ikke bestilt, kan du altid købe fra fryseren på gården. Den er åben {hoursText(farm.hours)}.{" "}
                    {farmNotes}
                  </p>
                </>
              ) : null}

              <h2>Levering</h2>
              {delivery.enabled ? (
                <>
                  <p>
                    Vi leverer {deliveryDaysText(shop)} inden for {delivery.radiusKm} km fra gården. Levering koster{" "}
                    {formatPrice(delivery.feeOere)}, og den er gratis, når du køber for over {formatPrice(delivery.freeAboveOere)}.
                  </p>
                  {delivery.note ? <p>{delivery.note}</p> : null}
                </>
              ) : (
                <>
                  <p>Vi leverer ikke endnu. {delivery.note}</p>
                  <p>
                    Indtil da henter du i Hønsehuset, eller du finder os på Torvedag i Næstved. Vi skriver på Facebook og
                    Instagram, når vi begynder at køre.
                  </p>
                </>
              )}
            </>
          )}
          {section.link ? (
            <p>
              <Link href={section.link.href} className={textLink}>
                {section.link.label}
              </Link>
            </p>
          ) : null}
        </div>
      </Container>
    </section>
  );
}
