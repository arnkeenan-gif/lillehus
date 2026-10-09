/**
 * What a paid sign-up carries on its Stripe Checkout Session. The server
 * action writes it, the webhook handler (stripe.ts) and the receipt page
 * (/arrangementer/tak) read it back. Stripe allows 500 characters per value,
 * so long texts are cut.
 */

/** metadata.kind on every event session; the Stripe webhook dispatches on it. */
export const EVENT_SESSION_KIND = "event";

export interface EventSessionDetails {
  eventSlug: string;
  eventTitle: string;
  /** ISO 8601. */
  eventStart: string;
  eventEnd: string;
  eventPlace: string;
  /** "Lørdag den 14. november 2026, kl. 10.00 til 14.00", as shown on the site when the guest paid. */
  eventWhen: string;
  persons: number;
  unitOere: number;
  name: string;
  phone: string;
  email: string;
  message: string;
}

const MAX = 500;

function cut(value: string): string {
  return value.length > MAX ? `${value.slice(0, MAX - 3)}...` : value;
}

export function toSessionMetadata(d: EventSessionDetails): Record<string, string> {
  return {
    kind: EVENT_SESSION_KIND,
    eventSlug: cut(d.eventSlug),
    eventTitle: cut(d.eventTitle),
    eventStart: d.eventStart,
    eventEnd: d.eventEnd,
    eventPlace: cut(d.eventPlace),
    eventWhen: cut(d.eventWhen),
    persons: String(d.persons),
    unitOere: String(d.unitOere),
    name: cut(d.name),
    phone: cut(d.phone),
    email: cut(d.email),
    message: cut(d.message),
  };
}

/** The details back from a session's metadata, or null when the session is not an event sign-up. */
export function fromSessionMetadata(metadata: Record<string, string> | null | undefined): EventSessionDetails | null {
  if (!metadata || metadata.kind !== EVENT_SESSION_KIND || !metadata.eventSlug) return null;
  const persons = Number.parseInt(metadata.persons ?? "", 10);
  const unitOere = Number.parseInt(metadata.unitOere ?? "", 10);
  return {
    eventSlug: metadata.eventSlug,
    eventTitle: metadata.eventTitle ?? metadata.eventSlug,
    eventStart: metadata.eventStart ?? "",
    eventEnd: metadata.eventEnd ?? "",
    eventPlace: metadata.eventPlace ?? "",
    eventWhen: metadata.eventWhen ?? "",
    persons: Number.isFinite(persons) && persons > 0 ? persons : 1,
    unitOere: Number.isFinite(unitOere) && unitOere > 0 ? unitOere : 0,
    name: metadata.name ?? "",
    phone: metadata.phone ?? "",
    email: metadata.email ?? "",
    message: metadata.message ?? "",
  };
}
