/**
 * Server-side helpers shared by every public form: honeypot, client IP,
 * rate-limit gate, Danish messages, zod field schemas, error flattening,
 * Copenhagen date helpers and the plain-text email body.
 *
 * Client components must not import this file (it pulls in next/headers and
 * zod). They use src/components/forms/form-state.ts, which is re-exported here.
 */
import { headers } from "next/headers";
import { z, type ZodError } from "zod";
import type { CakeType, EventItem, PizzaContent } from "@/lib/content";
import { formatDateLong, formatTime } from "@/lib/format";
import { site } from "@/lib/site";
import { rateLimit } from "@/lib/rate-limit";
import { HONEYPOT_FIELD, type FormState, type FormValues } from "@/components/forms/form-state";

export type { FormState, FormValues } from "@/components/forms/form-state";
export { HONEYPOT_FIELD, INITIAL_FORM_STATE } from "@/components/forms/form-state";

/* ------------------------------------------------------------------ */
/* Messages                                                            */
/* ------------------------------------------------------------------ */

export const MSG = {
  required: "Skal udfyldes.",
  email: "Skriv en e-mailadresse, vi kan svare på.",
  phone: "Skriv et telefonnummer, vi kan ringe til.",
  number: "Skriv et tal.",
  wholeNumber: "Skriv et helt tal.",
  choose: "Vælg en af mulighederne.",
  date: "Vælg en dato.",
  pastDate: "Datoen er allerede passeret.",
  time: "Vælg et klokkeslæt.",
  postalCode: "Skriv et postnummer på fire cifre.",
  tooLong: "Teksten er for lang.",
  checkFields: "Tjek felterne markeret med rødt, og prøv igen.",
  rateLimited: "Du har sendt mange beskeder på kort tid. Vent lidt, og prøv igen.",
  sendFailed: `Vi kunne ikke sende din besked lige nu. Prøv igen om lidt, eller ring til os på ${site.phone}.`,
} as const;

/** The answer-time promise, used on every success message and in the emails. */

/* ------------------------------------------------------------------ */
/* Honeypot, IP and the shared gate                                    */
/* ------------------------------------------------------------------ */

export function isHoneypotFilled(formData: FormData): boolean {
  const v = formData.get(HONEYPOT_FIELD);
  return typeof v === "string" && v.trim().length > 0;
}

/** First address in x-forwarded-for (Vercel and most proxies), else x-real-ip. */
export async function getClientIp(): Promise<string> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return h.get("x-real-ip")?.trim() || "ukendt";
}

/**
 * Runs before validation in every action. Returns a FormState to send back
 * immediately (a bot gets a fake success so it stops; a flooding IP gets a
 * friendly message), or null when the request may proceed.
 */
export async function gate(form: string, formData: FormData, successMessage: string): Promise<FormState | null> {
  if (isHoneypotFilled(formData)) return { ok: true, message: successMessage };
  const ip = await getClientIp();
  const limit = rateLimit(form, ip);
  if (!limit.ok) {
    return { ok: false, errors: {}, message: MSG.rateLimited, values: readValues(formData) };
  }
  return null;
}

/* ------------------------------------------------------------------ */
/* FormData helpers                                                    */
/* ------------------------------------------------------------------ */

/** Trimmed string value of a field; missing fields read as "". */
export function str(formData: FormData, name: string): string {
  const v = formData.get(name);
  return typeof v === "string" ? v.trim() : "";
}

/** All values of a repeated field (checkbox groups), trimmed and non-empty. */
export function list(formData: FormData, name: string): string[] {
  return formData
    .getAll(name)
    .filter((v): v is string => typeof v === "string")
    .map((v) => v.trim())
    .filter(Boolean);
}

/** Everything the visitor typed, to echo back on failure. Skips the honeypot and Next's own $ACTION fields. */
export function readValues(formData: FormData): FormValues {
  const out: FormValues = {};
  for (const [key, raw] of formData.entries()) {
    if (key === HONEYPOT_FIELD || key.startsWith("$") || typeof raw !== "string") continue;
    const prev = out[key];
    if (prev === undefined) out[key] = raw;
    else out[key] = Array.isArray(prev) ? [...prev, raw] : [prev, raw];
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* zod                                                                 */
/* ------------------------------------------------------------------ */

export const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
export const TIME_HHMM = /^([01]\d|2[0-3]):[0-5]\d$/;

const MAX_SHORT = 120;
const MAX_LONG = 2000;

function isPhone(v: string): boolean {
  return v.replace(/\D/g, "").length >= 8;
}

const blankToUndefined = (v: unknown) => (typeof v === "string" && v.trim() === "" ? undefined : v);

/** Reusable field schemas with Danish messages. */
export const field = {
  name: z.string().trim().min(1, { error: MSG.required }).max(MAX_SHORT, { error: MSG.tooLong }),
  /** Trim first: z.email() checks the raw string, so a padded address would fail. */
  email: z
    .string()
    .trim()
    .max(MAX_SHORT, { error: MSG.tooLong })
    .pipe(z.email({ error: MSG.email })),
  phone: z
    .string()
    .trim()
    .min(1, { error: MSG.required })
    .max(40, { error: MSG.tooLong })
    .refine(isPhone, { error: MSG.phone }),
  phoneOptional: z
    .string()
    .trim()
    .max(40, { error: MSG.tooLong })
    .refine((v) => v === "" || isPhone(v), { error: MSG.phone }),
  /** Optional free text. */
  text: (max: number = MAX_LONG) => z.string().trim().max(max, { error: MSG.tooLong }),
  /** Required free text. */
  requiredText: (max: number = MAX_LONG) =>
    z.string().trim().min(1, { error: MSG.required }).max(max, { error: MSG.tooLong }),
  /** Required whole number with a minimum and a message for it. */
  count: (min: number, minMessage: string) =>
    z.coerce
      .number({ error: MSG.number })
      .int({ error: MSG.wholeNumber })
      .min(min, { error: minMessage })
      .max(100000, { error: MSG.number }),
  /** Optional whole number; blank reads as undefined instead of 0. */
  countOptional: z.preprocess(
    blankToUndefined,
    z.coerce.number({ error: MSG.number }).int({ error: MSG.wholeNumber }).min(0, { error: MSG.number }).max(100000, { error: MSG.number }).optional(),
  ),
  isoDate: z.string().regex(ISO_DATE, { error: MSG.date }),
  time: z.string().regex(TIME_HHMM, { error: MSG.time }),
  postalCode: z.string().trim().regex(/^\d{4}$/, { error: MSG.postalCode }),
};

/** First message per top-level field. */
export function fieldErrors(error: ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "_form");
    if (!(key in out)) out[key] = issue.message;
  }
  return out;
}

export function invalid(errors: Record<string, string>, formData: FormData): FormState {
  return { ok: false, errors, message: MSG.checkFields, values: readValues(formData) };
}

export function sendFailure(formData: FormData): FormState {
  return { ok: false, errors: {}, message: MSG.sendFailed, values: readValues(formData) };
}

/* ------------------------------------------------------------------ */
/* Dates (Europe/Copenhagen, ISO strings, no DST surprises)            */
/* ------------------------------------------------------------------ */

const cphIso = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Europe/Copenhagen",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** Today's date in Copenhagen as "YYYY-MM-DD". */
export function todayIso(): string {
  return cphIso.format(new Date());
}

export function addDaysIso(iso: string, days: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
}

/** Noon UTC of that calendar day, so Copenhagen formatting lands on the right date. */
export function isoToDate(iso: string): Date {
  return new Date(`${iso}T12:00:00Z`);
}

/**
 * formatDateLong() inserts "den" after the weekday, but the Danish locale data
 * in current Node/ICU already includes it, which yields "søndag den den 11.".
 * Collapse that here until src/lib/format.ts checks before inserting.
 */
export function formatDayLong(d: Date | string): string {
  return formatDateLong(d).replace(" den den ", " den ");
}

/** "fredag den 11. september 2026" from "2026-09-11". */
export function formatIsoDate(iso: string): string {
  return formatDayLong(isoToDate(iso));
}

/** "18.30" from "18:30". */
export function formatClock(hhmm: string): string {
  return hhmm.replace(":", ".");
}

/** "lørdag den 3. oktober 2026 kl. 10.00"; the clock is left out for a midnight start. */
export function formatEventWhen(event: EventItem): string {
  const day = formatDayLong(event.start);
  const clock = formatTime(event.start);
  return clock === "00.00" ? day : `${day} kl. ${clock}`;
}

/* ------------------------------------------------------------------ */
/* Plain-text email body                                               */
/* ------------------------------------------------------------------ */

export type TextRow = [label: string, value: string | number | null | undefined];

export function plainText(title: string, rows: TextRow[], outro?: string): string {
  const lines = rows
    .filter(([, v]) => v !== undefined && v !== null && String(v).trim() !== "")
    .map(([label, v]) => `${label}: ${String(v).trim()}`);
  return [title, "", ...lines, ...(outro ? ["", outro] : [])].join("\n");
}

/* ------------------------------------------------------------------ */
/* Extended content types (this lane only; content.ts stays untouched) */
/* ------------------------------------------------------------------ */

export interface PizzaMenuItem {
  name: string;
  vegetarian?: boolean;
}

export interface PizzaPrices {
  childOere: number;
  childAges: string;
  specialDietExtraOere: number;
  dessertOere: number;
  dessertMinCovers: number;
  mileagePerKmOere: number;
  mileageNote: string;
}

/** content/pizza.json as this lane reads it. `packages[0]` is the ad libitum offer. */
export interface PizzaContentExt extends PizzaContent {
  areaNote: string;
  prices: PizzaPrices;
  /** Paragraphs under "Sådan går dagen". */
  day: string[];
  pizzas: PizzaMenuItem[];
  desserts: string[];
  /** Paragraphs under "Praktisk". */
  terms: string[];
}

/** content/cakes.json entries may carry a unit for the price ("pr. person"). */
export interface CakeTypeExt extends CakeType {
  priceNote?: string;
}
