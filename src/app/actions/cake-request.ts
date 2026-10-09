"use server";

import { createElement } from "react";
import { z } from "zod";
import { getCakeProducts, getCakes, getOrderingSettings, getPickupLocations } from "@/lib/cms";
import { EMAIL_TO, sendEmail } from "@/lib/resend";
import {
  field,
  fieldErrors,
  formatIsoDate,
  gate,
  invalid,
  ISO_DATE,
  MSG,
  plainText,
  readValues,
  sendFailure,
  str,
  type FormState,
} from "@/lib/forms";
import { locationDetails } from "@/lib/cart-pickup";
import { evaluateCake } from "@/lib/ordering/cake-options";
import { addDays, copenhagenDate, pickupTimeText } from "@/lib/ordering/dates";
import { effectiveRule, isBeforeDeadline, type DeadlineRule } from "@/lib/ordering/deadline";
import { CAKE_DELIVERY, optionLabel, optionValues } from "@/components/forms/options";
import { CakeKristineEmail, cakeRows, type CakeEmailData } from "@/emails/cake-kristine";
import { CakeCustomerEmail, CAKE_NEXT_STEPS } from "@/emails/cake-customer";

const SUCCESS = `Tak for din forespørgsel. ${CAKE_NEXT_STEPS}`;

/** The value of "Noget andet" in the request form's cake list. */
const OTHER_CAKE = "andet";

/** The first date from today on that can still be ordered under `rule`. */
function earliestDate(rule: DeadlineRule, now: number): string {
  const today = copenhagenDate(now);
  for (let i = 0; i <= 90; i++) {
    const date = addDays(today, i);
    if (isBeforeDeadline(date, rule, now)) return date;
  }
  return addDays(today, 91);
}

async function sendCakeEmails(data: CakeEmailData, subject: string, formData: FormData): Promise<FormState> {
  const toKristine = await sendEmail({
    to: EMAIL_TO,
    subject,
    react: createElement(CakeKristineEmail, { data }),
    text: plainText("Forespørgsel på kage", cakeRows(data)),
    replyTo: data.email,
  });
  if (!toKristine.ok) {
    console.error("[cake-request] kunne ikke sende til Kristine:", toKristine.error);
    return sendFailure(formData);
  }

  const copy = await sendEmail({
    to: data.email,
    subject: "Din forespørgsel på kage",
    react: createElement(CakeCustomerEmail, { data }),
    text: plainText(`Tak for din forespørgsel. ${CAKE_NEXT_STEPS}`, cakeRows(data), "Kristine"),
    replyTo: EMAIL_TO,
  });
  if (!copy.ok) console.warn("[cake-request] kopi til kunden fejlede:", copy.error);

  return { ok: true, message: SUCCESS };
}

/* ------------------------------------------------------------------ */
/* The form at the bottom of /kager: any cake, or something else      */
/* ------------------------------------------------------------------ */

function buildSchema(ids: Set<string>) {
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

export async function submitCakeRequest(_prev: FormState, formData: FormData): Promise<FormState> {
  const gated = await gate("kage", formData, SUCCESS);
  if (gated) return gated;

  const [cakes, products, settings] = await Promise.all([getCakes(), getCakeProducts(), getOrderingSettings()]);
  const ids = new Set([...cakes.map((c) => c.id), OTHER_CAKE]);
  const parsed = buildSchema(ids).safeParse({
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

  // Each cake has its own notice (its deadline rule, else the default). Checked outside the schema so
  // the message shows up together with the other field errors.
  const cakeId = str(formData, "cakeId");
  const date = str(formData, "date");
  const product = products.find((c) => c.id === cakeId);
  const rule = effectiveRule(product?.deadline, settings.defaultDeadline);
  const extra: Record<string, string> = {};
  if (ISO_DATE.test(date) && ids.has(cakeId)) {
    const earliest = earliestDate(rule, Date.now());
    if (date < earliest) extra.date = `Vælg en dato fra ${formatIsoDate(earliest)} og frem.`;
  }

  const errors = { ...(parsed.success ? {} : fieldErrors(parsed.error)), ...extra };
  if (!parsed.success || Object.keys(errors).length > 0) return invalid(errors, formData);

  const v = parsed.data;
  const cakeName = v.cakeId === OTHER_CAKE ? "Noget andet" : (cakes.find((c) => c.id === v.cakeId)?.name ?? "Kage");
  const data: CakeEmailData = {
    cake: cakeName,
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
  return sendCakeEmails(data, `${cakeName} ${data.date}: ${v.name}`, formData);
}

/* ------------------------------------------------------------------ */
/* A cake's own page when its price is "Pris aftales"                  */
/* ------------------------------------------------------------------ */

const orderRequestSchema = z.object({
  name: field.name,
  email: field.email,
  phone: field.phone,
  message: field.text(),
});

function parseSelections(value: string): unknown {
  if (!value) return {};
  try {
    return JSON.parse(value);
  } catch {
    return {};
  }
}

/**
 * The request from /kager/<id> for a cake without a price: the chosen
 * options, quantity, pickup place and date go to Kristine, who answers with
 * the price. Everything is checked again here: the cake and its options
 * against the CMS, the place must be active, the date open there, and the
 * cake's deadline not passed (with the server's clock).
 */
export async function submitCakeOrderRequest(_prev: FormState, formData: FormData): Promise<FormState> {
  const gated = await gate("kage", formData, SUCCESS);
  if (gated) return gated;

  const parsed = orderRequestSchema.safeParse({
    name: str(formData, "name"),
    email: str(formData, "email"),
    phone: str(formData, "phone"),
    message: str(formData, "message"),
  });
  const errors: Record<string, string> = parsed.success ? {} : fieldErrors(parsed.error);

  const [cakes, locations, settings] = await Promise.all([getCakeProducts(), getPickupLocations(), getOrderingSettings()]);
  const cake = cakes.find((c) => c.id === str(formData, "cakeId"));
  if (!cake) {
    return { ok: false, errors, message: "Kagen kan ikke bestilles længere.", values: readValues(formData) };
  }

  const evaluation = evaluateCake(cake, parseSelections(str(formData, "selections")));
  for (const [groupId, message] of Object.entries(evaluation.errors)) errors[`option:${groupId}`] = message;

  const quantity = Number(str(formData, "quantity"));
  if (!Number.isInteger(quantity) || quantity < cake.minQuantity || quantity > cake.maxQuantity) {
    errors.quantity = `Vælg et antal fra ${cake.minQuantity} til ${cake.maxQuantity}.`;
  }

  const location = locations.find((l) => l.id === str(formData, "locationId"));
  const date = location?.dates.find((d) => d.date === str(formData, "date"));
  const rule = effectiveRule(cake.deadline, settings.defaultDeadline);
  if (!location) errors.pickup = "Vælg et afhentningssted.";
  else if (!date) errors.pickup = "Vælg en dato.";
  else if (!isBeforeDeadline(date.date, rule, Date.now())) errors.pickup = "Fristen for den dato er gået. Vælg en senere dato.";

  if (!parsed.success || Object.keys(errors).length > 0 || !location || !date) return invalid(errors, formData);

  const v = parsed.data;
  const time = pickupTimeText(date.from, date.to);
  const details = locationDetails(location);
  const data: CakeEmailData = {
    cake: cake.name,
    date: formatIsoDate(date.date),
    quantity,
    options: evaluation.lines,
    place: [location.name, details, time].filter(Boolean).join(", "),
    name: v.name,
    email: v.email,
    phone: v.phone,
    message: v.message,
  };
  return sendCakeEmails(data, `${cake.name} ${data.date}, ${location.name}: ${v.name}`, formData);
}
