import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { CheckoutForm } from "@/components/shop/checkout-form";
import { getSiteSettings } from "@/lib/cms";
import { toClientLocations } from "@/lib/cart-pickup";
import { getShopCatalog, renderTime } from "@/lib/products";
import { isStripeConfigured } from "@/lib/stripe";

// Open dates and deadlines depend on the clock, so this page is never prerendered.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Din bestilling",
  robots: { index: false, follow: false },
};

export default async function CheckoutPage() {
  const [catalog, settings] = await Promise.all([getShopCatalog(), getSiteSettings()]);

  return (
    <Section>
      <Container>
        <div className="max-w-[44rem]">
          <h1 className="max-w-[18ch] text-balance text-display font-semibold tracking-tight text-ink">Din bestilling</h1>
          <p className="mt-5 max-w-[46ch] text-lead text-ink-2">
            Tjek sted, dato og varer, skriv hvem du er, og betal med kort eller MobilePay.
          </p>
        </div>
        <div className="mt-12 sm:mt-16">
          <CheckoutForm
            locations={toClientLocations(catalog.locations)}
            renderedAt={renderTime()}
            stripeReady={isStripeConfigured()}
            minOrderOere={catalog.settings.minOrderOere ?? 0}
            phone={settings.phone}
            phoneHref={settings.phoneHref}
          />
        </div>
      </Container>
    </Section>
  );
}
