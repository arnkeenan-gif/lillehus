"use server";

import { redirect } from "next/navigation";
import type Stripe from "stripe";
import { z } from "zod";
import { getEvent, getSiteSettings } from "@/lib/cms";
import { whenLong } from "@/lib/events/dates";
import { toSessionMetadata } from "@/lib/events/metadata";
import { maxPersons, signupState } from "@/lib/events/status";
import { field, fieldErrors, gate, invalid, isHoneypotFilled, readValues, str, type FormState } from "@/lib/forms";
import { getStripe, siteOrigin } from "@/lib/stripe";

/*
  A paid sign-up. Validates the form, reads the event again on the server
  (the price in the browser is never trusted), checks that sign-up is still
  open and sends the guest to Stripe Checkout for the price per person times
  the number of people. Card and MobilePay are whatever the Stripe dashboard
  has turned on. When the payment completes, the Stripe webhook calls
  handleEventCheckoutCompleted (src/lib/events/stripe.ts), which mails
  Kristine and the guest; the guest lands on /arrangementer/tak.
*/

function fail(formData: FormData, message: string): FormState {
  return { ok: false, errors: {}, message, values: readValues(formData) };
}

function lowerFirst(s: string): string {
  return s.charAt(0).toLowerCase() + s.slice(1);
}

export async function startEventCheckout(_prev: FormState, formData: FormData): Promise<FormState> {
  if (isHoneypotFilled(formData)) return fail(formData, "Noget gik galt. Prøv igen.");
  const gated = await gate("arrangement-betaling", formData, "");
  if (gated) return gated;

  const [event, settings] = await Promise.all([getEvent(str(formData, "eventId")), getSiteSettings()]);
  if (!event) return fail(formData, `Vi kan ikke finde arrangementet længere. Ring til os på ${settings.phone}, hvis du er i tvivl.`);

  const stripe = getStripe();
  const state = signupState(event, { stripe: Boolean(stripe) });
  if (state.kind === "past") return fail(formData, "Arrangementet har fundet sted, så der er ikke længere tilmelding.");
  if (state.kind === "pay-unavailable" || !stripe) {
    return fail(formData, `Betaling på siden er ikke sat op endnu. Ring til os på ${settings.phone}, så tilmelder vi dig.`);
  }
  if (state.kind !== "pay") return fail(formData, `Tilmeldingen er lukket. Ring til os på ${settings.phone}, hvis du har spørgsmål.`);

  const most = maxPersons(event);
  const schema = z.object({
    persons: field
      .count(1, "Skriv, hvor mange I kommer.")
      .refine((n) => n <= most, { error: `Én tilmelding kan højst være til ${most} personer. Ring, hvis I er flere.` }),
    name: field.name,
    email: field.email,
    phone: field.phone,
    message: field.text(500),
  });
  const parsed = schema.safeParse({
    persons: str(formData, "persons"),
    name: str(formData, "name"),
    email: str(formData, "email"),
    phone: str(formData, "phone"),
    message: str(formData, "message"),
  });
  if (!parsed.success) return invalid(fieldErrors(parsed.error), formData);
  const v = parsed.data;

  const origin = siteOrigin();
  const when = whenLong(event);
  const image = event.photo?.src ? (event.photo.src.startsWith("http") ? event.photo.src : `${origin}${event.photo.src}`) : undefined;
  const publicImage = image?.startsWith("https://") ? image : undefined;
  const who = v.persons === 1 ? "dig" : `${v.persons} personer`;

  const params: Stripe.Checkout.SessionCreateParams = {
    mode: "payment",
    currency: "dkk",
    locale: "da",
    customer_email: v.email,
    line_items: [
      {
        quantity: v.persons,
        price_data: {
          currency: "dkk",
          unit_amount: state.unitOere,
          product_data: {
            name: event.title,
            description: `${when}. ${event.place}`.slice(0, 500),
            ...(publicImage ? { images: [publicImage] } : {}),
          },
        },
      },
    ],
    metadata: toSessionMetadata({
      eventSlug: event.slug,
      eventTitle: event.title,
      eventStart: event.start,
      eventEnd: event.end ?? "",
      eventPlace: event.place,
      eventWhen: when,
      persons: v.persons,
      unitOere: state.unitOere,
      name: v.name,
      phone: v.phone,
      email: v.email,
      message: v.message,
    }),
    payment_intent_data: {
      description: `Tilmelding: ${event.title}, ${lowerFirst(when)}`.slice(0, 1000),
      metadata: { kind: "event", eventSlug: event.slug },
    },
    custom_text: {
      submit: { message: `Du tilmelder ${who} til ${event.title}, ${lowerFirst(when)}. ${event.place}.`.slice(0, 1200) },
    },
    success_url: `${origin}/arrangementer/tak?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/arrangementer/${event.slug}#tilmeld`,
  };

  let url: string | null = null;
  try {
    const session = await stripe.checkout.sessions.create(params);
    url = session.url;
  } catch (err) {
    console.error("[arrangement-betaling] kunne ikke oprette Stripe-session", err);
  }
  if (!url) return fail(formData, `Vi kunne ikke starte betalingen. Prøv igen om lidt, eller ring til os på ${settings.phone}.`);

  redirect(url);
}
