"use server";

import { createElement } from "react";
import { z } from "zod";
import { getCakes } from "@/lib/content";
import { EMAIL_TO, sendEmail } from "@/lib/resend";
import {
  addDaysIso,
  field,
  fieldErrors,
  formatIsoDate,
  gate,
  invalid,
  ISO_DATE,
  MSG,
  plainText,
  sendFailure,
  str,
  todayIso,
  type CakeTypeExt,
  type FormState,
} from "@/lib/forms";
import { CAKE_DELIVERY, optionLabel, optionValues } from "@/components/forms/options";
import { CakeKristineEmail, cakeRows, type CakeEmailData } from "@/emails/cake-kristine";
import { CakeCustomerEmail, CAKE_NEXT_STEPS } from "@/emails/cake-customer";

const SUCCESS = `Tak for din forespørgsel. ${CAKE_NEXT_STEPS}`;

function buildSchema(cakes: CakeTypeExt[]) {
  const ids = new Set(cakes.map((c) => c.id));

  return z.object({
    cakeId: z.string().refine((id) => ids.has(id), { error: MSG.choose }),
    date: field.isoDate,
    persons: field.count(1, "Skriv, hvor mange personer kagen skal række til."),
    wishes: field.requiredText(1500),
    cakeText: field.text(200),
    allergies: field.text(500),
    delivery: z.enum(optionValues(CAKE_DELIVERY), { error: MSG.choose }),
    name: field.name,
    email: field.email,
    phone: field.phone,
    message: field.text(),
  });
}

/**
 * Each cake needs its own notice. Checked outside the schema so the message
 * shows up together with the other field errors (zod skips object refinements
 * once a field has failed).
 */
function leadTimeError(formData: FormData, cakes: CakeTypeExt[]): Record<string, string> {
  const cake = cakes.find((c) => c.id === str(formData, "cakeId"));
  const date = str(formData, "date");
  if (!cake || !ISO_DATE.test(date)) return {};
  const earliest = addDaysIso(todayIso(), cake.leadTimeDays);
  if (date >= earliest) return {};
  return {
    date: `${cake.name} skal bestilles mindst ${cake.leadTimeDays} dage før. Vælg en dato fra ${formatIsoDate(earliest)} og frem.`,
  };
}

export async function submitCakeRequest(_prev: FormState, formData: FormData): Promise<FormState> {
  const gated = await gate("kage", formData, SUCCESS);
  if (gated) return gated;

  const cakes = (await getCakes()) as CakeTypeExt[];
  const parsed = buildSchema(cakes).safeParse({
    cakeId: str(formData, "cakeId"),
    date: str(formData, "date"),
    persons: str(formData, "persons"),
    wishes: str(formData, "wishes"),
    cakeText: str(formData, "cakeText"),
    allergies: str(formData, "allergies"),
    delivery: str(formData, "delivery"),
    name: str(formData, "name"),
    email: str(formData, "email"),
    phone: str(formData, "phone"),
    message: str(formData, "message"),
  });
  const errors = { ...(parsed.success ? {} : fieldErrors(parsed.error)), ...leadTimeError(formData, cakes) };
  if (!parsed.success || Object.keys(errors).length > 0) return invalid(errors, formData);

  const v = parsed.data;
  const cake = cakes.find((c) => c.id === v.cakeId)!;
  const data: CakeEmailData = {
    cake: cake.name,
    date: formatIsoDate(v.date),
    persons: v.persons,
    wishes: v.wishes,
    cakeText: v.cakeText,
    allergies: v.allergies,
    delivery: optionLabel(CAKE_DELIVERY, v.delivery),
    name: v.name,
    email: v.email,
    phone: v.phone,
    message: v.message,
  };

  const toKristine = await sendEmail({
    to: EMAIL_TO,
    subject: `${cake.name} ${data.date}: ${v.name}`,
    react: createElement(CakeKristineEmail, { data }),
    text: plainText("Forespørgsel på kage", cakeRows(data)),
    replyTo: v.email,
  });
  if (!toKristine.ok) {
    console.error("[cake-request] kunne ikke sende til Kristine:", toKristine.error);
    return sendFailure(formData);
  }

  const copy = await sendEmail({
    to: v.email,
    subject: "Din forespørgsel på kage",
    react: createElement(CakeCustomerEmail, { data }),
    text: plainText(`Tak for din forespørgsel. ${CAKE_NEXT_STEPS}`, cakeRows(data), "Kristine"),
    replyTo: EMAIL_TO,
  });
  if (!copy.ok) console.warn("[cake-request] kopi til kunden fejlede:", copy.error);

  return { ok: true, message: SUCCESS };
}
