/**
 * Whether an event can be signed up for right now, and how: the page decides
 * what to show from this, and the server actions check it again when the
 * form is sent, so a page left open past a deadline cannot slip through.
 * Capacity is information only: without a database the site cannot count
 * who has signed up.
 */
import type { EventEntry } from "@/lib/cms/events-types";
import { isPast, startTime } from "./dates";

/** Most people one sign-up may cover when the event has no capacity set. */
export const MAX_PERSONS = 50;

export type SignupState =
  /** The event is over. */
  | { kind: "past" }
  /** Kristine has not turned sign-up on. */
  | { kind: "none" }
  /** The deadline has passed, or the event has started. */
  | { kind: "closed" }
  /** The free form: name, e-mail, phone, number of people, message. */
  | { kind: "form" }
  /** Pay with Stripe Checkout: price per person times the number of people. */
  | { kind: "pay"; unitOere: number }
  /** Payment is on, but Stripe is not set up: show the phone number instead. */
  | { kind: "pay-unavailable"; unitOere: number };

export function signupState(event: EventEntry, { now = Date.now(), stripe }: { now?: number; stripe: boolean }): SignupState {
  if (isPast(event, now)) return { kind: "past" };
  if (!event.signup) return { kind: "none" };
  const deadline = event.signupDeadline ? new Date(event.signupDeadline).getTime() : startTime(event);
  if (Number.isFinite(deadline) && now >= deadline) return { kind: "closed" };
  if (event.payment && event.priceOere) {
    return stripe ? { kind: "pay", unitOere: event.priceOere } : { kind: "pay-unavailable", unitOere: event.priceOere };
  }
  return { kind: "form" };
}

/** True while the sign-up form or the payment can be used. */
export function isSignupOpen(state: SignupState): boolean {
  return state.kind === "form" || state.kind === "pay" || state.kind === "pay-unavailable";
}

/** How many people one sign-up may cover. */
export function maxPersons(event: Pick<EventEntry, "capacity">): number {
  return Math.min(event.capacity ?? MAX_PERSONS, MAX_PERSONS);
}
