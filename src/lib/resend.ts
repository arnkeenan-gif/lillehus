import { Resend } from "resend";
import type { ReactElement } from "react";

/**
 * One place to send email from. Works without a key in development: the
 * message is logged instead of sent, and the caller still gets { ok: true }
 * so forms can show their success state. In production a missing key is an
 * error the caller must surface in Danish.
 */

const apiKey = process.env.RESEND_API_KEY;
export const EMAIL_FROM =
  process.env.EMAIL_FROM ?? "Det lille hus på landet <onboarding@resend.dev>";
export const EMAIL_TO = process.env.EMAIL_TO ?? "kristine.k.h@gmail.com";

let client: Resend | null = null;

export function getResend(): Resend | null {
  if (!apiKey) return null;
  if (!client) client = new Resend(apiKey);
  return client;
}

export function isEmailConfigured(): boolean {
  return Boolean(apiKey);
}

export interface SendEmailInput {
  to: string | string[];
  subject: string;
  react: ReactElement;
  /** Plain-text fallback. Keep it; some clients and spam filters want it. */
  text: string;
  replyTo?: string;
}

export type SendEmailResult = { ok: true; id?: string; skipped?: boolean } | { ok: false; error: string };

export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  const resend = getResend();
  if (!resend) {
    if (process.env.NODE_ENV === "production") {
      return { ok: false, error: "RESEND_API_KEY mangler" };
    }
    console.info("[email skipped, no RESEND_API_KEY]", {
      to: input.to,
      subject: input.subject,
      text: input.text,
    });
    return { ok: true, skipped: true };
  }
  try {
    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: input.to,
      subject: input.subject,
      react: input.react,
      text: input.text,
      replyTo: input.replyTo,
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true, id: data?.id };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Ukendt fejl" };
  }
}
