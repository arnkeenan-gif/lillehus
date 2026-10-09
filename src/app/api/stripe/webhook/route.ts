import { createElement } from "react";
import { after } from "next/server";
import type Stripe from "stripe";
import { OrderCustomerEmail, orderCustomerText } from "@/emails/order-customer";
import { OrderKristineEmail, orderKristineText } from "@/emails/order-kristine";
import { getPickupLocations } from "@/lib/cms";
import { orderFromSession } from "@/lib/cart-order";
import { locationDetails } from "@/lib/cart-pickup";
import { handleEventCheckoutCompleted } from "@/lib/events/stripe";
import { formatDayDate } from "@/lib/ordering/dates";
import { EMAIL_TO, sendEmail } from "@/lib/resend";
import { site } from "@/lib/site";
import { getStripe } from "@/lib/stripe";

/*
  Stripe calls this after a Checkout Session is paid. We verify the signature,
  answer 200 straight away and do the work afterwards. Sessions with
  metadata.kind "event" are paid event sign-ups and go to the events lane
  (handleEventCheckoutCompleted); every other session is a bagværk order:
  the baking list to Kristine and a receipt to the customer. Processed event
  ids are remembered in memory so a Stripe retry to the same instance does
  not send twice.
*/

export const runtime = "nodejs";

const processed = new Set<string>();
const MAX_REMEMBERED = 1000;

function remember(id: string) {
  processed.add(id);
  if (processed.size > MAX_REMEMBERED) {
    const oldest = processed.values().next().value;
    if (oldest) processed.delete(oldest);
  }
}

async function sendOrderEmails(stripe: Stripe, session: Stripe.Checkout.Session) {
  try {
    const [lineItems, locations] = await Promise.all([
      stripe.checkout.sessions.listLineItems(session.id, { limit: 100, expand: ["data.price.product"] }),
      getPickupLocations({ includeInactive: true }),
    ]);
    const order = orderFromSession(session, lineItems.data);
    const location = locations.find((l) => l.id === order.locationId);
    const address = location ? locationDetails(location) : "";
    const day = order.pickupDate ? formatDayDate(order.pickupDate) : "ukendt dag";

    const [toKristine, toCustomer] = await Promise.all([
      sendEmail({
        to: EMAIL_TO,
        subject: `Ny bestilling til ${day}${order.locationName ? `, ${order.locationName}` : ""}: ${order.customerName || "ukendt navn"}`,
        react: createElement(OrderKristineEmail, { order, address }),
        text: orderKristineText(order, address),
        replyTo: order.email || undefined,
      }),
      order.email
        ? sendEmail({
            to: order.email,
            subject: `Din bestilling hos ${site.name}`,
            react: createElement(OrderCustomerEmail, { order, address }),
            text: orderCustomerText(order, address),
            replyTo: site.email,
          })
        : Promise.resolve({ ok: true as const, skipped: true }),
    ]);

    if (!toKristine.ok) console.error("[webhook] bagesedlen kunne ikke sendes", order.orderNo, toKristine.error);
    if (!toCustomer.ok) console.error("[webhook] kvitteringen kunne ikke sendes", order.orderNo, toCustomer.error);
  } catch (err) {
    console.error("[webhook] ordren kunne ikke behandles", session.id, err);
  }
}

async function handleEvent(session: Stripe.Checkout.Session) {
  try {
    await handleEventCheckoutCompleted(session);
  } catch (err) {
    console.error("[webhook] tilmeldingen kunne ikke behandles", session.id, err);
  }
}

export async function POST(req: Request) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret) return new Response("Stripe er ikke sat op", { status: 503 });

  const signature = req.headers.get("stripe-signature");
  if (!signature) return new Response("Signatur mangler", { status: 400 });

  const body = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, secret);
  } catch (err) {
    console.warn("[webhook] ugyldig signatur", err instanceof Error ? err.message : err);
    return new Response("Ugyldig signatur", { status: 400 });
  }

  if (processed.has(event.id)) return Response.json({ received: true, duplicate: true });
  remember(event.id);

  if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
    const session = event.data.object;
    const paid = session.payment_status === "paid" || session.payment_status === "no_payment_required";
    if (paid) {
      if (session.metadata?.kind === "event") after(() => handleEvent(session));
      else after(() => sendOrderEmails(stripe, session));
    }
  }

  return Response.json({ received: true });
}
