"use server";

import { createElement } from "react";
import { z } from "zod";
import { EMAIL_TO, sendEmail } from "@/lib/resend";
import { field, fieldErrors, gate, invalid, list, MSG, plainText, sendFailure, str, type FormState } from "@/lib/forms";
import { COMPANY_FREQUENCY, COMPANY_WANTS, optionLabel, optionValues } from "@/components/forms/options";
import { CompanyKristineEmail, companyRows, type CompanyEmailData } from "@/emails/firma-kristine";

const SUCCESS = "Tak for din henvendelse. Kristine vender tilbage inden for to hverdage med et forslag og en pris.";

const wantValues = new Set(COMPANY_WANTS.map((o) => o.value));

const schema = z.object({
  company: field.requiredText(160),
  cvr: z
    .string()
    .trim()
    .refine((v) => v === "" || /^\d{8}$/.test(v.replace(/\s/g, "")), { error: "Et CVR-nummer har otte cifre." }),
  contact: field.name,
  email: field.email,
  phone: field.phone,
  wants: z
    .array(z.string())
    .min(1, { error: "Vælg mindst en ting." })
    .refine((ws) => ws.every((w) => wantValues.has(w)), { error: MSG.choose }),
  frequency: z.enum(optionValues(COMPANY_FREQUENCY), { error: MSG.choose }),
  people: field.requiredText(40),
  message: field.text(),
});

export async function submitCompanyRequest(_prev: FormState, formData: FormData): Promise<FormState> {
  const gated = await gate("firma", formData, SUCCESS);
  if (gated) return gated;

  const parsed = schema.safeParse({
    company: str(formData, "company"),
    cvr: str(formData, "cvr"),
    contact: str(formData, "contact"),
    email: str(formData, "email"),
    phone: str(formData, "phone"),
    wants: list(formData, "wants"),
    frequency: str(formData, "frequency"),
    people: str(formData, "people"),
    message: str(formData, "message"),
  });
  if (!parsed.success) return invalid(fieldErrors(parsed.error), formData);

  const v = parsed.data;
  const data: CompanyEmailData = {
    company: v.company,
    cvr: v.cvr.replace(/\s/g, ""),
    contact: v.contact,
    email: v.email,
    phone: v.phone,
    wants: v.wants.map((w) => optionLabel(COMPANY_WANTS, w)),
    frequency: optionLabel(COMPANY_FREQUENCY, v.frequency),
    people: v.people,
    message: v.message,
  };

  const sent = await sendEmail({
    to: EMAIL_TO,
    subject: `Firmaforespørgsel: ${v.company}`,
    react: createElement(CompanyKristineEmail, { data }),
    text: plainText("Forespørgsel om firmaaftale", companyRows(data)),
    replyTo: v.email,
  });
  if (!sent.ok) {
    console.error("[company-request] kunne ikke sende til Kristine:", sent.error);
    return sendFailure(formData);
  }

  return { ok: true, message: SUCCESS };
}
