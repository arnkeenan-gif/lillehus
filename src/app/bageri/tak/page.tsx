import type { Metadata } from "next";
import type Stripe from "stripe";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { ClearCart } from "@/components/shop/clear-cart";
import { PrintButton } from "@/components/shop/print-button";
import { cn } from "@/lib/cn";
import { getSiteSettings, type ShopSettings, type SiteSettings } from "@/lib/cms";
import { orderFromSession, type OrderDetails } from "@/lib/cart-order";
import { noonUtc, pickupDaysLabel, pickupHours } from "@/lib/cart-pickup";
import { formatDateLong, formatPrice } from "@/lib/format";
import { getShop } from "@/lib/products";
import { getStripe } from "@/lib/stripe";

export const metadata: Metadata = {
  title: "Tak for din bestilling",
  robots: { index: false, follow: false },
};

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function ThanksPage({ searchParams }: Props) {
  const params = await searchParams;
  const sessionId = typeof params.session_id === "string" ? params.session_id : "";
  const stripe = getStripe();
  const [shop, settings] = await Promise.all([getShop(), getSiteSettings()]);

  if (!stripe || !sessionId) {
    return (
      <Calm
        title="Vi kan ikke finde bestillingen"
        text="Linket mangler et ordrenummer, eller betaling er ikke sat op endnu. Har du betalt, så ring til os, så finder vi den."
        phone={settings.phone}
      />
    );
  }

  let session: Stripe.Checkout.Session | null = null;
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId, { expand: ["line_items", "payment_intent"] });
  } catch (err) {
    console.error("[tak] kunne ikke hente Stripe-session", err);
  }

  if (!session) {
    return (
      <Calm
        title="Vi kan ikke finde bestillingen"
        text="Ordren findes ikke, eller linket er gammelt. Har du betalt, så ring til os, så finder vi den."
        phone={settings.phone}
      />
    );
  }

  const paid = session.payment_status === "paid" || session.payment_status === "no_payment_required";
  if (!paid) {
    return (
      <Calm
        title="Betalingen er ikke gået igennem endnu"
        text="Vi har ikke fået besked om betalingen. Gå tilbage til kassen og prøv igen, eller ring til os."
        phone={settings.phone}
        backHref="/bageri/kasse"
        backLabel="Tilbage til kassen"
      />
    );
  }

  return <Receipt order={orderFromSession(session, session.line_items?.data ?? [])} shop={shop} settings={settings} />;
}

function Calm({
  title,
  text,
  phone,
  backHref = "/bageri",
  backLabel = "Tilbage til bageriet",
}: {
  title: string;
  text: string;
  phone: string;
  backHref?: string;
  backLabel?: string;
}) {
  return (
    <Section>
      <Container size="narrow">
        <h1 className="text-title font-semibold">{title}</h1>
        <p className="mt-5 max-w-[55ch] text-lead text-ink">{text}</p>
        <p className="mt-3 text-ink-2">
          Telefon <span className="tnum">{phone}</span>.
        </p>
        <div className="mt-8">
          <Button href={backHref}>{backLabel}</Button>
        </div>
      </Container>
    </Section>
  );
}

function Fact({ label, value, tnum = false }: { label: string; value: string; tnum?: boolean }) {
  return (
    <div>
      <dt className="text-sm text-muted print:text-[#000]">{label}</dt>
      <dd className={cn("mt-0.5 text-ink print:text-[#000]", tnum && "tnum")}>{value}</dd>
    </div>
  );
}

/** The confirmation. Prints on one A4 page: header, footer and buttons are hidden by no-print. */
function Receipt({ order, shop, settings }: { order: OrderDetails; shop: ShopSettings; settings: SiteSettings }) {
  const day = order.pickupDate ? formatDateLong(noonUtc(order.pickupDate)) : "";
  const hours = pickupHours(shop.pickupWindow);
  const isDelivery = order.fulfilment === "delivery";

  return (
    <Section className="print:py-0">
      <Container size="narrow" className="print:max-w-none print:px-0">
        <ClearCart />
        <h1 className="text-title font-semibold print:text-2xl">Tak for din bestilling</h1>
        <p className="mt-5 max-w-[60ch] text-lead text-ink print:mt-3 print:text-base print:text-[#000]">
          {isDelivery
            ? `Vi leverer ${day || "den aftalte dag"}.`
            : `Du henter i ${shop.pickupPlace}, ${day || "den valgte dag"} mellem kl. ${hours}.`}
        </p>
        {order.email ? (
          <p className="mt-3 max-w-[60ch] text-ink-2 print:text-[#000]">Vi har sendt en kvittering til {order.email}.</p>
        ) : null}

        <dl className="mt-10 grid grid-cols-2 gap-x-6 gap-y-5 text-[0.95rem] sm:grid-cols-4 print:mt-6 print:grid-cols-4">
          <Fact label="Ordrenummer" value={order.orderNo} tnum />
          <Fact label={isDelivery ? "Levering" : "Afhentning"} value={day || "Ukendt dag"} />
          <Fact label="Navn" value={order.customerName || "Ikke oplyst"} />
          <Fact label="Telefon" value={order.phone || "Ikke oplyst"} tnum />
        </dl>

        <table className="mt-10 w-full text-[0.95rem] print:mt-6">
          <caption className="sr-only">Dine varer</caption>
          <thead>
            <tr className="border-b border-line text-left text-sm text-muted print:border-[#000] print:text-[#000]">
              <th scope="col" className="w-14 py-2 pr-3 font-medium">
                Antal
              </th>
              <th scope="col" className="py-2 pr-3 font-medium">
                Vare
              </th>
              <th scope="col" className="py-2 text-right font-medium">
                Pris
              </th>
            </tr>
          </thead>
          <tbody className="print:divide-y print:divide-[#000]">
            {order.lines.map((line, i) => (
              <tr key={i}>
                <td className="tnum py-2.5 pr-3 align-top text-lg font-semibold text-ink print:text-[#000]">{line.qty}</td>
                <td className="py-2.5 pr-3 align-top text-ink print:text-[#000]">{line.name}</td>
                <td className="tnum py-2.5 text-right align-top text-ink print:text-[#000]">{formatPrice(line.totalOere)}</td>
              </tr>
            ))}
            {order.deliveryOere !== null ? (
              <tr>
                <td className="py-2.5 pr-3" />
                <td className="py-2.5 pr-3 text-ink print:text-[#000]">Levering</td>
                <td className="tnum py-2.5 text-right text-ink print:text-[#000]">{formatPrice(order.deliveryOere)}</td>
              </tr>
            ) : null}
          </tbody>
          <tfoot>
            <tr className="border-t border-line font-semibold text-ink print:border-[#000] print:text-[#000]">
              <td className="py-3 pr-3" />
              <td className="py-3 pr-3">I alt, betalt</td>
              <td className="tnum py-3 text-right">{formatPrice(order.totalOere)}</td>
            </tr>
          </tfoot>
        </table>

        {order.note ? (
          <div className="mt-8">
            <p className="text-sm text-muted print:text-[#000]">Besked til bageriet</p>
            <p className="mt-1 max-w-[60ch] text-ink print:text-[#000]">{order.note}</p>
          </div>
        ) : null}

        <p className="mt-8 max-w-[60ch] text-ink-2 print:text-[#000]">
          {isDelivery
            ? shop.delivery.note
            : `Bestilte varer hentes i ${shop.pickupPlace}, ${pickupDaysLabel(shop.pickupDays)} kl. ${shop.pickupWindow}.`}{" "}
          Spørgsmål? Ring på <span className="tnum">{settings.phone}</span>.
        </p>

        <div className="no-print mt-10 flex flex-wrap gap-3">
          <PrintButton />
          <Button href="/bageri" variant="secondary">
            Tilbage til bageriet
          </Button>
        </div>
      </Container>
    </Section>
  );
}
