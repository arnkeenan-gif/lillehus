import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { CheckoutForm } from "@/components/shop/checkout-form";
import { getSiteSettings } from "@/lib/cms";
import { getPickupDays, pickupPlaceShort } from "@/lib/cart-pickup";
import { getShop } from "@/lib/products";
import { isStripeConfigured } from "@/lib/stripe";

// The list of days depends on the clock, so this page is never prerendered.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Din bestilling",
  robots: { index: false, follow: false },
};

export default async function CheckoutPage() {
  const [shop, settings] = await Promise.all([getShop(), getSiteSettings()]);
  const days = getPickupDays(new Date(), shop);

  return (
    <Section>
      <Container>
        <div className="max-w-[44rem]">
          <h1 className="max-w-[18ch] text-balance text-display font-semibold tracking-tight text-ink">Din bestilling</h1>
          <p className="mt-5 max-w-[46ch] text-lead text-ink-2">
            Vælg en dag, skriv hvem du er, og betal med kort eller MobilePay. Så står brødet klar i{" "}
            {pickupPlaceShort(shop.pickupPlace)}.
          </p>
        </div>
        <div className="mt-12 sm:mt-16">
          <CheckoutForm
            days={days}
            stripeReady={isStripeConfigured()}
            delivery={shop.delivery}
            minOrderOere={shop.minOrderOere}
            pickupPlace={shop.pickupPlace}
            pickupWindow={shop.pickupWindow}
            phone={settings.phone}
            phoneHref={settings.phoneHref}
          />
        </div>
      </Container>
    </Section>
  );
}
