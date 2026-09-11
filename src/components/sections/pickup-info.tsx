import Link from "next/link";
import { Container } from "@/components/ui/container";
import { cutoffText, deliveryDaysText, hoursText, pickupDaysText, splitNotes } from "@/components/cms/text";
import { getLocations, getShopSettings, getSiteSettings, type PickupInfoSection } from "@/lib/cms";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/cn";
import { SectionHeading, SectionIntro, textLink } from "./heading";
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
        {section.text ? (
          <SectionIntro level={level} afterHeading={Boolean(section.heading)}>
            {section.text}
          </SectionIntro>
        ) : null}
        <div className={cn("prose", hasTop && "mt-6")}>
          {section.detail === "kort" ? (
            <>
              <p>
                Når du bestiller brød på siden, vælger du selv en afhentningsdag: {pickupDaysText(shop)}. Du skal bestille
                senest {cutoffText(shop)}.
              </p>
              <p>
                Det, du har bestilt, henter du i {shop.pickupPlace}, kl. {shop.pickupWindow}.
              </p>
              {farm ? (
                <p>
                  Fryseren på gården er åben {hoursText(farm.hours)}. {farmNotes}
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
                Det, du har bestilt, henter du i {shop.pickupPlace}, kl. {shop.pickupWindow} på den dag, du har valgt.
              </p>
              <p>
                Bliver du forhindret, så ring til os på <a href={`tel:${settings.phoneHref}`}>{settings.phone}</a>.
              </p>
              {shop.notice ? <p>{shop.notice}</p> : null}

              {farm ? (
                <>
                  <h2>Fryseren</h2>
                  <p>
                    Fryseren på gården er åben {hoursText(farm.hours)}. {farmNotes}
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
                  <p>Bestillinger her på siden er til afhentning. {delivery.note}</p>
                  <p>
                    <Link href="/kontakt" className={textLink}>
                      Skriv til os
                    </Link>
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
