"use server";

import { createElement } from "react";
import { z } from "zod";
import { getEvents } from "@/lib/content";
import { EMAIL_TO, sendEmail } from "@/lib/resend";
import {
  field,
  fieldErrors,
  formatEventWhen,
  gate,
  invalid,
  MSG,
  plainText,
  readValues,
  sendFailure,
  str,
  type FormState,
} from "@/lib/forms";
import { EventSignupKristineEmail, eventSignupRows, type EventSignupEmailData } from "@/emails/event-kristine";
import { EventSignupCustomerEmail, EVENT_NEXT_STEPS } from "@/emails/event-customer";

const SUCCESS = `Tak for din tilmelding. ${EVENT_NEXT_STEPS}`;

const schema = z.object({
  eventId: z.string().trim().min(1, { error: MSG.choose }),
  persons: field.count(1, "Skriv, hvor mange I kommer."),
  name: field.name,
  email: field.email,
  phone: field.phone,
});

export async function submitEventSignup(_prev: FormState, formData: FormData): Promise<FormState> {
  const gated = await gate("arrangement", formData, SUCCESS);
  if (gated) return gated;

  const parsed = schema.safeParse({
    eventId: str(formData, "eventId"),
    persons: str(formData, "persons"),
    name: str(formData, "name"),
    email: str(formData, "email"),
    phone: str(formData, "phone"),
  });
  if (!parsed.success) return invalid(fieldErrors(parsed.error), formData);

  const v = parsed.data;
  const event = (await getEvents()).find((e) => e.id === v.eventId && e.signup);
  if (!event) {
    return {
      ok: false,
      errors: {},
      message: "Arrangementet er ikke længere åbent for tilmelding. Skriv til os, hvis du er i tvivl.",
      values: readValues(formData),
    };
  }

  const data: EventSignupEmailData = {
    eventTitle: event.title,
    eventDate: formatEventWhen(event),
    persons: v.persons,
    name: v.name,
    email: v.email,
    phone: v.phone,
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
    text: plainText(`Tak for din tilmelding. ${EVENT_NEXT_STEPS}`, eventSignupRows(data), "Kristine"),
    replyTo: EMAIL_TO,
  });
  if (!copy.ok) console.warn("[event-signup] kopi til kunden fejlede:", copy.error);

  return { ok: true, message: SUCCESS };
}
