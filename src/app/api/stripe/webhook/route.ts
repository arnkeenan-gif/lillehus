import { createElement } from "react";
import { after } from "next/server";
import type Stripe from "stripe";
import { OrderCustomerEmail, orderCustomerText } from "@/emails/order-customer";
import { OrderKristineEmail, orderKristineText } from "@/emails/order-kristine";
import { orderFromSession } from "@/lib/cart-order";
import { pickupDayLabel } from "@/lib/cart-pickup";
import { EMAIL_TO, sendEmail } from "@/lib/resend";
import { site } from "@/lib/site";
import { getStripe } from "@/lib/stripe";

/*
  Stripe calls this after a Checkout Session is paid. We verify the signature,
  answer 200 straight away and send two emails afterwards: the baking list to
  Kristine and a receipt to the customer. Processed event ids are remembered
  in memory so a Stripe retry to the same instance does not send twice.
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
    const lineItems = await stripe.checkout.sessions.listLineItems(session.id, { limit: 100 });
    const order = orderFromSession(session, lineItems.data);
    const day = order.pickupDate ? pickupDayLabel(order.pickupDate) : "ukendt dag";

    const [toKristine, toCustomer] = await Promise.all([
      sendEmail({
        to: EMAIL_TO,
        subject: `Ny bestilling til ${day}: ${order.customerName || "ukendt navn"}`,
        react: createElement(OrderKristineEmail, { order }),
        text: orderKristineText(order),
        replyTo: order.email || undefined,
      }),
      order.email
        ? sendEmail({
            to: order.email,
            subject: `Din bestilling hos ${site.name}`,
            react: createElement(OrderCustomerEmail, { order }),
            text: orderCustomerText(order),
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
    if (paid) after(() => sendOrderEmails(stripe, session));
  }

  return Response.json({ received: true });
}
