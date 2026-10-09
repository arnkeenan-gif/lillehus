import { createElement } from "react";
import type Stripe from "stripe";
import { EventSignupCustomerEmail, eventSignupCustomerText } from "@/emails/event-customer";
import { EventSignupKristineEmail, eventSignupRows, type EventSignupEmailData } from "@/emails/event-kristine";
import { plainText } from "@/lib/forms";
import { EMAIL_TO, sendEmail } from "@/lib/resend";
import { siteOrigin } from "@/lib/stripe";
import { fromSessionMetadata } from "./metadata";

/*
  Called by the Stripe webhook (src/app/api/stripe/webhook/route.ts, owned by
  the ordering lane) for a Checkout Session with metadata.kind === "event":
  a paid sign-up started by startEventCheckout in
  src/app/arrangementer/actions.ts. Mails Kristine the sign-up (the guest's
  answers are in the session's metadata) and sends the guest a confirmation.
  Never throws: a failed email is logged and the payment stands in Stripe.
  Sessions already handled by this instance are skipped, so a retried
  webhook does not send the mails twice.
*/

const handled = new Set<string>();
const MAX_REMEMBERED = 500;

function remember(id: string) {
  handled.add(id);
  if (handled.size > MAX_REMEMBERED) {
    const oldest = handled.values().next().value;
    if (oldest) handled.delete(oldest);
  }
}

export async function handleEventCheckoutCompleted(session: Stripe.Checkout.Session): Promise<void> {
  const details = fromSessionMetadata(session.metadata);
  if (!details) {
    console.warn("[arrangement-betaling] sessionen er ikke en tilmelding til et arrangement", session.id);
    return;
  }
  const paid = session.payment_status === "paid" || session.payment_status === "no_payment_required";
  if (!paid) return;
  if (handled.has(session.id)) return;
  remember(session.id);

  const email = session.customer_details?.email || session.customer_email || details.email;
  const phone = details.phone || session.customer_details?.phone || "";
  const name = details.name || session.customer_details?.name || "";
  const totalOere = session.amount_total ?? details.unitOere * details.persons;
  const reference =
    typeof session.payment_intent === "string" ? session.payment_intent : (session.payment_intent?.id ?? session.id);

  const data: EventSignupEmailData = {
    eventTitle: details.eventTitle,
    eventDate: details.eventWhen || details.eventStart,
    eventPlace: details.eventPlace,
    eventUrl: `${siteOrigin()}/arrangementer/${details.eventSlug}`,
    persons: details.persons,
    name,
    email,
    phone,
    message: details.message,
    paid: { totalOere, reference },
  };

  try {
    const [toKristine, toGuest] = await Promise.all([
      sendEmail({
        to: EMAIL_TO,
        subject: `Betalt tilmelding: ${details.eventTitle}, ${name || "ukendt navn"}`,
        react: createElement(EventSignupKristineEmail, { data }),
        text: plainText(`Betalt tilmelding: ${details.eventTitle}`, eventSignupRows(data)),
        replyTo: email || undefined,
      }),
      email
        ? sendEmail({
            to: email,
            subject: `Din tilmelding til ${details.eventTitle}`,
            react: createElement(EventSignupCustomerEmail, { data }),
            text: eventSignupCustomerText(data),
            replyTo: EMAIL_TO,
          })
        : Promise.resolve({ ok: true as const, skipped: true }),
    ]);
    if (!toKristine.ok) console.error("[arrangement-betaling] mail til Kristine fejlede", session.id, toKristine.error);
    if (!toGuest.ok) console.error("[arrangement-betaling] bekræftelsen til gæsten fejlede", session.id, toGuest.error);
  } catch (err) {
    console.error("[arrangement-betaling] tilmeldingen kunne ikke behandles", session.id, err);
  }
}
