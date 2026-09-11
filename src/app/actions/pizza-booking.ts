"use server";

import { createElement } from "react";
import { z } from "zod";
import { getPizzaSettings, type PizzaSettings } from "@/lib/cms";
import { EMAIL_TO, sendEmail } from "@/lib/resend";
import {
  field,
  fieldErrors,
  formatClock,
  formatIsoDate,
  gate,
  invalid,
  list,
  MSG,
  plainText,
  sendFailure,
  str,
  todayIso,
  type FormState,
} from "@/lib/forms";
import { DESSERT_NONE, PIZZA_EVENT_TYPES, SOURCES, optionLabel, optionValues } from "@/components/forms/options";
import { depositLine, estimateLine, estimatePizza, pizzaRates } from "@/components/forms/pizza-estimate";
import { BookingKristineEmail, bookingRows, type BookingEmailData } from "@/emails/booking-kristine";
import { BookingCustomerEmail, BOOKING_NEXT_STEPS } from "@/emails/booking-customer";

/** The second paragraph of the success state; the form shows the first. */
const SUCCESS = "Kristine vender tilbage og bekræfter pris og dato. Du betaler ikke noget nu. Depositum betales først, når hun har bekræftet.";

/** What the emails show for a folded field the visitor left empty, so Kristine sees every field. */
const NOT_GIVEN = "Ikke udfyldt";

const blankToUndefined = (v: unknown) => (typeof v === "string" && v.trim() === "" ? undefined : v);

/** The folded fields: left blank is fine, filled in wrong is not. */
function optional<T extends z.ZodType>(schema: T) {
  return z.preprocess(blankToUndefined, schema.optional());
}

/** Built per request because the pizza list comes from the pizza settings (Sanity or content/pizza.json). */
function buildSchema(pizza: PizzaSettings) {
  const pizzaNames = new Set(pizza.pizzas.map((p) => p.name));

  return z.object({
    date: field.isoDate.refine((d) => d >= todayIso(), { error: MSG.pastDate }),
    adults: field.count(1, "Skriv, hvor mange voksne I er."),
    children: field.countOptional,
    street: field.requiredText(200),
    postalCity: field.requiredText(120),
    pizzas: z
      .array(z.string())
      .length(3, { error: "Vælg præcis tre pizzaer." })
      .refine((names) => new Set(names).size === names.length && names.every((n) => pizzaNames.has(n)), {
        error: "Vælg tre forskellige pizzaer fra listen.",
      }),
    name: field.name,
    email: field.email,
    phone: field.phone,
    time: optional(field.time),
    eventType: optional(z.enum(optionValues(PIZZA_EVENT_TYPES), { error: MSG.choose })),
    specialDiet: field.countOptional,
    dessert: z.string().trim(),
    dessertCovers: field.countOptional,
    source: optional(z.enum(optionValues(SOURCES), { error: MSG.choose })),
    message: field.text(),
  });
}

/**
 * The dessert rules depend on two fields. Checked outside the schema so they
 * show up together with the other field errors (zod skips object refinements
 * once a field has failed).
 */
function dessertErrors(formData: FormData, pizza: PizzaSettings): Record<string, string> {
  const dessert = str(formData, "dessert") || DESSERT_NONE;
  if (dessert === DESSERT_NONE) return {};
  if (!pizza.desserts.includes(dessert)) return { dessert: MSG.choose };

  const covers = str(formData, "dessertCovers");
  const min = pizza.prices.dessertMinCovers;
  if (covers === "") return { dessertCovers: "Skriv, hvor mange der skal have dessert." };
  const n = Number(covers);
  if (Number.isInteger(n) && n < min) return { dessertCovers: `Dessert er fra ${min} kuverter.` };
  return {};
}

export async function submitPizzaBooking(_prev: FormState, formData: FormData): Promise<FormState> {
  const gated = await gate("pizza", formData, SUCCESS);
  if (gated) return gated;

  const pizza = await getPizzaSettings();
  const parsed = buildSchema(pizza).safeParse({
    date: str(formData, "date"),
    adults: str(formData, "adults"),
    children: str(formData, "children"),
    street: str(formData, "street"),
    postalCity: str(formData, "postalCity"),
    pizzas: list(formData, "pizzas"),
    name: str(formData, "name"),
    email: str(formData, "email"),
    phone: str(formData, "phone"),
    time: str(formData, "time"),
    eventType: str(formData, "eventType"),
    specialDiet: str(formData, "specialDiet"),
    dessert: str(formData, "dessert") || DESSERT_NONE,
    dessertCovers: str(formData, "dessertCovers"),
    source: str(formData, "source"),
    message: str(formData, "message"),
  });
  const errors = { ...(parsed.success ? {} : fieldErrors(parsed.error)), ...dessertErrors(formData, pizza) };
  if (!parsed.success || Object.keys(errors).length > 0) return invalid(errors, formData);

  const v = parsed.data;
  const minAdults = pizza.packages[0]?.minGuests ?? 40;
  const rates = pizzaRates(pizza);
  const hasDessert = v.dessert !== DESSERT_NONE;
  const estimate = estimatePizza(rates, {
    adults: v.adults,
    children: v.children ?? 0,
    specialDiet: v.specialDiet ?? 0,
    dessertCovers: hasDessert ? (v.dessertCovers ?? 0) : 0,
  });

  const data: BookingEmailData = {
    date: formatIsoDate(v.date),
    time: v.time ? `kl. ${formatClock(v.time)}` : NOT_GIVEN,
    eventType: v.eventType ? optionLabel(PIZZA_EVENT_TYPES, v.eventType) : NOT_GIVEN,
    adults: v.adults,
    children: v.children ?? 0,
    address: `${v.street}, ${v.postalCity}`,
    pizzas: v.pizzas,
    specialDiet: v.specialDiet ?? 0,
    dessert: hasDessert ? `${v.dessert}, ${v.dessertCovers} kuverter` : "Ingen",
    estimate: estimateLine(estimate, rates),
    deposit: depositLine(estimate),
    name: v.name,
    email: v.email,
    phone: v.phone,
    source: v.source ? optionLabel(SOURCES, v.source) : NOT_GIVEN,
    message: v.message || NOT_GIVEN,
    belowMinimum: v.adults < minAdults,
  };

  const toKristine = await sendEmail({
    to: EMAIL_TO,
    subject: `Pizzavognen ${data.date}: ${v.name}`,
    react: createElement(BookingKristineEmail, { data }),
    text: plainText("Forespørgsel på pizzavognen", bookingRows(data)),
    replyTo: v.email,
  });
  if (!toKristine.ok) {
    console.error("[pizza-booking] kunne ikke sende til Kristine:", toKristine.error);
    return sendFailure(formData);
  }

  const copy = await sendEmail({
    to: v.email,
    subject: "Din forespørgsel på pizzavognen",
    react: createElement(BookingCustomerEmail, { data }),
    text: plainText(`Tak for din forespørgsel. ${BOOKING_NEXT_STEPS}`, bookingRows(data), "Kristine og Nicolas"),
    replyTo: EMAIL_TO,
  });
  if (!copy.ok) console.warn("[pizza-booking] kopi til kunden fejlede:", copy.error);

  return { ok: true, message: SUCCESS };
}
