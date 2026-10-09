import type { Metadata } from "next";
import type Stripe from "stripe";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { getSiteSettings } from "@/lib/cms";
import { fromSessionMetadata, type EventSessionDetails } from "@/lib/events/metadata";
import { formatPrice } from "@/lib/format";
import { getStripe } from "@/lib/stripe";
import { cn } from "@/lib/cn";

export const metadata: Metadata = {
  title: "Tak for din tilmelding",
  robots: { index: false, follow: false },
};

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

/**
 * Where Stripe sends the guest after paying for an event. The session is
 * read back from Stripe, so the page shows what was actually paid. The
 * emails are sent by the webhook (src/lib/events/stripe.ts), not from here.
 */
export default async function EventThanksPage({ searchParams }: Props) {
  const params = await searchParams;
  const sessionId = typeof params.session_id === "string" ? params.session_id : "";
  const stripe = getStripe();
  const settings = await getSiteSettings();

  if (!stripe || !sessionId) {
    return (
      <Calm
        title="Vi kan ikke finde tilmeldingen"
        text="Linket mangler en reference, eller betaling er ikke sat op endnu. Har du betalt, så ring til os, så finder vi den."
        phone={settings.phone}
      />
    );
  }

  let session: Stripe.Checkout.Session | null = null;
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId);
  } catch (err) {
    console.error("[arrangementer/tak] kunne ikke hente Stripe-session", err);
  }
  const details = session ? fromSessionMetadata(session.metadata) : null;

  if (!session || !details) {
    return (
      <Calm
        title="Vi kan ikke finde tilmeldingen"
        text="Tilmeldingen findes ikke, eller linket er gammelt. Har du betalt, så ring til os, så finder vi den."
        phone={settings.phone}
      />
    );
  }

  const paid = session.payment_status === "paid" || session.payment_status === "no_payment_required";
  if (!paid) {
    return (
      <Calm
        title="Betalingen er ikke gået igennem endnu"
        text="Vi har ikke fået besked om betalingen. Gå tilbage til arrangementet og prøv igen, eller ring til os."
        phone={settings.phone}
        backHref={`/arrangementer/${details.eventSlug}#tilmeld`}
        backLabel="Tilbage til arrangementet"
      />
    );
  }

  const email = session.customer_details?.email || session.customer_email || details.email;
  return (
    <Receipt
      details={details}
      email={email}
      totalOere={session.amount_total ?? details.unitOere * details.persons}
      phone={settings.phone}
    />
  );
}

function Calm({
  title,
  text,
  phone,
  backHref = "/arrangementer",
  backLabel = "Se alle arrangementer",
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
        <h1 className="max-w-[18ch] text-balance text-display font-semibold tracking-tight text-ink">{title}</h1>
        <p className="mt-5 max-w-[46ch] text-lead text-ink-2">{text}</p>
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

function Fact({ label, value, tnum = false, wide = false }: { label: string; value: string; tnum?: boolean; wide?: boolean }) {
  return (
    <div className={cn("min-w-0", wide && "col-span-2")}>
      <dt className="text-sm text-muted">{label}</dt>
      <dd className={cn("mt-0.5 text-ink", tnum && "tnum")}>{value}</dd>
    </div>
  );
}

function Receipt({
  details,
  email,
  totalOere,
  phone,
}: {
  details: EventSessionDetails;
  email: string;
  totalOere: number;
  phone: string;
}) {
  const when = details.eventWhen ? `${details.eventWhen.charAt(0).toLowerCase()}${details.eventWhen.slice(1)}` : "";
  return (
    <Section>
      <Container size="narrow">
        <h1 className="max-w-[18ch] text-balance text-display font-semibold tracking-tight text-ink">Tak for din tilmelding</h1>
        <p className="mt-5 max-w-[46ch] text-lead text-ink-2">
          Du er tilmeldt {details.eventTitle}
          {when ? `, ${when}` : ""}.
        </p>
        {email ? <p className="mt-3 max-w-[60ch] text-ink-2">Vi har sendt en bekræftelse til {email}.</p> : null}

        <dl className="mt-10 grid grid-cols-2 gap-x-6 gap-y-5 text-[0.95rem] sm:grid-cols-4">
          <Fact label="Arrangement" value={details.eventTitle} wide />
          {details.eventPlace ? <Fact label="Sted" value={details.eventPlace} wide /> : null}
          <Fact label="Antal personer" value={String(details.persons)} tnum />
          <Fact label="Betalt" value={formatPrice(totalOere)} tnum />
          <Fact label="Navn" value={details.name || "Ikke oplyst"} />
          <Fact label="Telefon" value={details.phone || "Ikke oplyst"} tnum />
        </dl>

        <p className="mt-8 max-w-[60ch] text-ink-2">
          Spørgsmål? Ring på <span className="tnum">{phone}</span>, eller svar på mailen.
        </p>

        <div className="mt-10 flex flex-wrap gap-3">
          <Button href={`/arrangementer/${details.eventSlug}`}>Se arrangementet</Button>
          <Button href="/arrangementer" variant="secondary">
            Se alle arrangementer
          </Button>
        </div>
      </Container>
    </Section>
  );
}
