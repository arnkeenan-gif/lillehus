"use server";

import { createElement } from "react";
import { z } from "zod";
import { getPizza } from "@/lib/content";
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
  type PizzaContentExt,
} from "@/lib/forms";
import { DESSERT_NONE, PIZZA_EVENT_TYPES, SOURCES, optionLabel, optionValues } from "@/components/forms/options";
import { BookingKristineEmail, bookingRows, type BookingEmailData } from "@/emails/booking-kristine";
import { BookingCustomerEmail, BOOKING_NEXT_STEPS } from "@/emails/booking-customer";

const SUCCESS = `Tak for din forespørgsel. ${BOOKING_NEXT_STEPS}`;

/** Built per request because the pizza list comes from content/pizza.json. */
function buildSchema(pizza: PizzaContentExt) {
  const pizzaNames = new Set(pizza.pizzas.map((p) => p.name));

  return z.object({
    date: field.isoDate.refine((d) => d >= todayIso(), { error: MSG.pastDate }),
    time: field.time,
    eventType: z.enum(optionValues(PIZZA_EVENT_TYPES), { error: MSG.choose }),
    adults: field.count(1, "Skriv, hvor mange voksne I er."),
    children: field.countOptional,
    street: field.requiredText(200),
    postalCode: field.postalCode,
    city: field.requiredText(100),
    pizzas: z
      .array(z.string())
      .length(3, { error: "Vælg præcis tre pizzaer." })
      .refine((names) => new Set(names).size === names.length && names.every((n) => pizzaNames.has(n)), {
        error: "Vælg tre forskellige pizzaer fra listen.",
      }),
    specialDiet: field.countOptional,
    dessert: z.string().trim(),
    dessertCovers: field.countOptional,
    name: field.name,
    email: field.email,
    phone: field.phone,
    source: z.enum(optionValues(SOURCES), { error: MSG.choose }),
    message: field.requiredText(),
  });
}

/**
 * The dessert rules depend on two fields. Checked outside the schema so they
 * show up together with the other field errors (zod skips object refinements
 * once a field has failed).
 */
function dessertErrors(formData: FormData, pizza: PizzaContentExt): Record<string, string> {
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

  const pizza = (await getPizza()) as PizzaContentExt;
  const parsed = buildSchema(pizza).safeParse({
    date: str(formData, "date"),
    time: str(formData, "time"),
    eventType: str(formData, "eventType"),
    adults: str(formData, "adults"),
    children: str(formData, "children"),
    street: str(formData, "street"),
    postalCode: str(formData, "postalCode"),
    city: str(formData, "city"),
    pizzas: list(formData, "pizzas"),
    specialDiet: str(formData, "specialDiet"),
    dessert: str(formData, "dessert") || DESSERT_NONE,
    dessertCovers: str(formData, "dessertCovers"),
    name: str(formData, "name"),
    email: str(formData, "email"),
    phone: str(formData, "phone"),
    source: str(formData, "source"),
    message: str(formData, "message"),
  });
  const errors = { ...(parsed.success ? {} : fieldErrors(parsed.error)), ...dessertErrors(formData, pizza) };
  if (!parsed.success || Object.keys(errors).length > 0) return invalid(errors, formData);

  const v = parsed.data;
  const minAdults = pizza.packages[0]?.minGuests ?? 40;
  const data: BookingEmailData = {
    date: formatIsoDate(v.date),
    time: formatClock(v.time),
    eventType: optionLabel(PIZZA_EVENT_TYPES, v.eventType),
    adults: v.adults,
    children: v.children ?? 0,
    address: `${v.street}, ${v.postalCode} ${v.city}`,
    pizzas: v.pizzas,
    specialDiet: v.specialDiet ?? 0,
    dessert: v.dessert === DESSERT_NONE ? "Ingen" : `${v.dessert}, ${v.dessertCovers} kuverter`,
    name: v.name,
    email: v.email,
    phone: v.phone,
    source: optionLabel(SOURCES, v.source),
    message: v.message,
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
