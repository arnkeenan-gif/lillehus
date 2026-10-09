"use server";

import { createElement } from "react";
import { z } from "zod";
import { getEvent } from "@/lib/cms";
import { whenLong, priceLabel } from "@/lib/events/dates";
import { maxPersons, signupState } from "@/lib/events/status";
import { EMAIL_TO, sendEmail } from "@/lib/resend";
import { isStripeConfigured, siteOrigin } from "@/lib/stripe";
import { site } from "@/lib/site";
import { field, fieldErrors, gate, invalid, plainText, readValues, sendFailure, str, type FormState } from "@/lib/forms";
import { EventSignupKristineEmail, eventSignupRows, type EventSignupEmailData } from "@/emails/event-kristine";
import { EventSignupCustomerEmail, eventSignupCustomerText } from "@/emails/event-customer";
import { EVENT_NEXT_STEPS } from "@/lib/events/copy";

/*
  The free sign-up: validates the form, checks again that the event is still
  open (a page can stand open past the deadline), then mails Kristine and
  sends the guest a copy. Paid events go through startEventCheckout in
  src/app/arrangementer/actions.ts instead.
*/

/* The event page already says what happens next (CONFIRM_SENTENCE), so the thanks stays short. */
const SUCCESS = "Tak for din tilmelding.";

function notOpen(formData: FormData, message: string): FormState {
  return { ok: false, errors: {}, message, values: readValues(formData) };
}

export async function submitEventSignup(_prev: FormState, formData: FormData): Promise<FormState> {
  const gated = await gate("arrangement", formData, SUCCESS);
  if (gated) return gated;

  const event = await getEvent(str(formData, "eventId"));
  if (!event) {
    return notOpen(formData, `Vi kan ikke finde arrangementet længere. Ring til os på ${site.phone}, hvis du er i tvivl.`);
  }

  const state = signupState(event, { stripe: isStripeConfigured() });
  if (state.kind === "past") return notOpen(formData, "Arrangementet har fundet sted, så der er ikke længere tilmelding.");
  if (state.kind === "closed" || state.kind === "none") {
    return notOpen(formData, `Tilmeldingen er lukket. Ring til os på ${site.phone}, hvis du har spørgsmål.`);
  }
  if (state.kind === "pay") return notOpen(formData, "Tilmeldingen til dette arrangement betales, når du tilmelder dig på arrangementets side.");
  if (state.kind === "pay-unavailable") {
    return notOpen(formData, `Betaling på siden er ikke sat op endnu. Ring til os på ${site.phone}, så tilmelder vi dig.`);
  }

  const most = maxPersons(event);
  const schema = z.object({
    persons: field
      .count(1, "Skriv, hvor mange I kommer.")
      .refine((n) => n <= most, { error: `Én tilmelding kan højst være til ${most} personer. Ring, hvis I er flere.` }),
    name: field.name,
    email: field.email,
    phone: field.phone,
    message: field.text(1000),
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
  const data: EventSignupEmailData = {
    eventTitle: event.title,
    eventDate: whenLong(event),
    eventPlace: event.place,
    eventUrl: `${siteOrigin()}/arrangementer/${event.slug}`,
    persons: v.persons,
    name: v.name,
    email: v.email,
    phone: v.phone,
    message: v.message,
    priceNote: priceLabel(event) || undefined,
  };

  const toKristine = await sendEmail({
    to: EMAIL_TO,
    subject: `Tilmelding: ${event.title}, ${v.name}`,
    react: createElement(EventSignupKristineEmail, { data }),
    text: plainText(`Tilmelding: ${event.title}`, eventSignupRows(data)),
    replyTo: v.email,
  });
  if (!toKristine.ok) {
    console.error("[event-signup] kunne ikke sende til Kristine:", toKristine.error);
    return sendFailure(formData);
  }

  const copy = await sendEmail({
    to: v.email,
    subject: `Din tilmelding til ${event.title}`,
    react: createElement(EventSignupCustomerEmail, { data }),
    text: eventSignupCustomerText(data),
    replyTo: EMAIL_TO,
  });
  if (!copy.ok) console.warn("[event-signup] kopi til gæsten fejlede:", copy.error);

  return { ok: true, message: copy.ok ? `${SUCCESS} Vi har sendt en kopi til ${v.email}.` : `${SUCCESS} ${EVENT_NEXT_STEPS}` };
}
