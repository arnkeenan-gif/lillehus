import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { CheckoutForm } from "@/components/shop/checkout-form";
import { getPickupDays } from "@/lib/cart-pickup";
import { shop } from "@/lib/products";
import { isStripeConfigured } from "@/lib/stripe";
import { site } from "@/lib/site";

// The list of days depends on the clock, so this page is never prerendered.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Din bestilling",
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  const days = getPickupDays(new Date(), shop);

  return (
    <Section>
      <Container>
        <div className="max-w-[60ch]">
          <h1 className="text-title font-semibold">Din bestilling</h1>
          <p className="mt-4 text-lg text-ink-2">
            Vælg en dag, skriv hvem du er, og betal med kort eller MobilePay. Så står brødet klar i Hønsehuset.
          </p>
        </div>
        <div className="mt-10">
          <CheckoutForm
            days={days}
            stripeReady={isStripeConfigured()}
            delivery={shop.delivery}
            minOrderOere={shop.minOrderOere}
            pickupPlace={shop.pickupPlace}
            pickupWindow={shop.pickupWindow}
            phone={site.phone}
            phoneHref={site.phoneHref}
          />
        </div>
      </Container>
    </Section>
  );
}
