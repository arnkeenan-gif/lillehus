"use server";

import { createElement } from "react";
import { z } from "zod";
import { EMAIL_TO, sendEmail } from "@/lib/resend";
import { field, fieldErrors, gate, invalid, MSG, plainText, sendFailure, str, type FormState } from "@/lib/forms";
import { CONTACT_SUBJECTS, optionLabel, optionValues } from "@/components/forms/options";
import { ContactKristineEmail, contactRows, type ContactEmailData } from "@/emails/contact-kristine";

const SUCCESS = "Tak for din besked. Kristine svarer, når hun har set den.";

const schema = z.object({
  name: field.name,
  email: field.email,
  phone: field.phoneOptional,
  subject: z.enum(optionValues(CONTACT_SUBJECTS), { error: MSG.choose }),
  message: field.requiredText(),
});

export async function submitContact(_prev: FormState, formData: FormData): Promise<FormState> {
  const gated = await gate("kontakt", formData, SUCCESS);
  if (gated) return gated;

  const parsed = schema.safeParse({
    name: str(formData, "name"),
    email: str(formData, "email"),
    phone: str(formData, "phone"),
    subject: str(formData, "subject"),
    message: str(formData, "message"),
  });
  if (!parsed.success) return invalid(fieldErrors(parsed.error), formData);

  const v = parsed.data;
  const data: ContactEmailData = {
    subject: optionLabel(CONTACT_SUBJECTS, v.subject),
    name: v.name,
    email: v.email,
    phone: v.phone,
    message: v.message,
  };

  const sent = await sendEmail({
    to: EMAIL_TO,
    subject: `Besked fra hjemmesiden: ${data.subject}, ${v.name}`,
    react: createElement(ContactKristineEmail, { data }),
    text: plainText("Besked fra hjemmesiden", contactRows(data)),
    replyTo: v.email,
  });
  if (!sent.ok) {
    console.error("[contact] kunne ikke sende til Kristine:", sent.error);
    return sendFailure(formData);
  }

  return { ok: true, message: SUCCESS };
}
