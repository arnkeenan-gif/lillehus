"use server";

import { createElement } from "react";
import { z } from "zod";
import { EMAIL_TO, getResend, sendEmail } from "@/lib/resend";
import { field, fieldErrors, gate, readValues, str, type FormState } from "@/lib/forms";
import { NewsletterKristineEmail } from "@/emails/newsletter-kristine";

const SUCCESS = "Tak, du er tilmeldt.";
const FAILED = "Vi kunne ikke tilmelde dig lige nu. Prøv igen om lidt.";

const schema = z.object({ email: field.email });

function failure(formData: FormData): FormState {
  return { ok: false, errors: {}, message: FAILED, values: readValues(formData) };
}

/**
 * With RESEND_AUDIENCE_ID the address goes straight into the Resend audience.
 * Without it Kristine gets an email per sign-up and keeps the list herself.
 */
export async function subscribeNewsletter(_prev: FormState, formData: FormData): Promise<FormState> {
  const gated = await gate("nyhedsbrev", formData, SUCCESS);
  if (gated) return gated;

  const parsed = schema.safeParse({ email: str(formData, "email") });
  if (!parsed.success) {
    return { ok: false, errors: fieldErrors(parsed.error), values: readValues(formData) };
  }
  const { email } = parsed.data;

  const audienceId = process.env.RESEND_AUDIENCE_ID;
  const resend = getResend();
  if (audienceId && resend) {
    try {
      const { error } = await resend.contacts.create({ audienceId, email, unsubscribed: false });
      if (error && error.statusCode !== 409) {
        console.error("[newsletter] Resend audience:", error.message);
        return failure(formData);
      }
      return { ok: true, message: SUCCESS };
    } catch (err) {
      console.error("[newsletter] Resend audience:", err instanceof Error ? err.message : err);
      return failure(formData);
    }
  }

  const sent = await sendEmail({
    to: EMAIL_TO,
    subject: "Ny tilmelding til nyhedsbrevet",
    react: createElement(NewsletterKristineEmail, { email }),
    text: `Ny tilmelding til nyhedsbrevet: ${email}`,
  });
  if (!sent.ok) {
    console.error("[newsletter] kunne ikke sende til Kristine:", sent.error);
    return failure(formData);
  }

  return { ok: true, message: SUCCESS };
}
