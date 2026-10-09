import type { CartLine, CartPickup } from "@/lib/cart";
import type { PickupDate, PickupLocation } from "@/lib/cms/ordering-types";
import { formatDayDate, pickupTimeText } from "@/lib/ordering/dates";
import { isBeforeDeadline } from "@/lib/ordering/deadline";

/*
  Pickup helpers shared by the bagværk page, the cake pages, the cart drawer
  and the checkout. Pure functions on the façade's PickupLocation shape, so
  client components and the server action can both use them. The old weekday
  logic (tirsdag til fredag, dagen før kl. 18) is gone: an order is picked up
  on a date Kristine opened for a location, and the deadline engine in
  src/lib/ordering/deadline.ts decides until when it can be ordered.
*/

/** What a browser needs to know about a pickup location. */
export type ClientLocation = Pick<PickupLocation, "id" | "name" | "address" | "note" | "mapsUrl" | "dates">;

export function toClientLocations(locations: PickupLocation[]): ClientLocation[] {
  return locations.map(({ id, name, address, note, mapsUrl, dates }) => ({ id, name, address, note, mapsUrl, dates }));
}

export interface ResolvedPickup {
  location: ClientLocation;
  date: PickupDate;
}

/**
 * The chosen pickup, when its location is still offered and its date is
 * still open and not in the past; otherwise null (the customer chooses again).
 */
export function resolvePickup(pickup: CartPickup | null, locations: ClientLocation[], today: string): ResolvedPickup | null {
  if (!pickup) return null;
  const location = locations.find((l) => l.id === pickup.locationId);
  const date = location?.dates.find((d) => d.date === pickup.date);
  if (!location || !date || date.date < today) return null;
  return { location, date };
}

/** "Hønsehuset, Torpevej 10, 4160 Herlufmagle": the note and the address, when there are any. */
export function locationDetails(location: Pick<ClientLocation, "note" | "address">): string {
  return [location.note, location.address].filter((s): s is string => Boolean(s && s.trim())).join(", ");
}

/** "kl. 9.00 til 12.00" for the chosen date, or "" when Kristine has not set a time. */
export function pickupTime(date: Pick<PickupDate, "from" | "to">): string {
  return pickupTimeText(date.from, date.to);
}

/** "Gården, lørdag den 17. oktober, kl. 9.00 til 12.00" */
export function pickupSentence(resolved: ResolvedPickup, options: { year?: boolean } = {}): string {
  const time = pickupTime(resolved.date);
  return [resolved.location.name, formatDayDate(resolved.date.date, options), time].filter(Boolean).join(", ");
}

/** The lines in the cart that can no longer be ordered for `date` (their deadline has passed). */
export function expiredLines(items: CartLine[], date: string, now: number): CartLine[] {
  return items.filter((line) => !isBeforeDeadline(date, line.rule, now));
}
