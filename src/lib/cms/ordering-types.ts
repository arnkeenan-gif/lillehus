/**
 * Ordering types shared across lanes. The ordering lane owns this file and
 * may ADD fields; it must not rename or remove the ones below, because the
 * content lane reads them (pickup info, FAQ, front page).
 */

/** One day a location is open for pickup. Dates are local Danish dates. */
export interface PickupDate {
  /** "YYYY-MM-DD" in Europe/Copenhagen. */
  date: string;
  /** Pickup window, e.g. "9.00" and "12.00". Empty until Kristine sets it. */
  from?: string;
  to?: string;
  /** Closed for holidays or changed plans; kept so the date can be reopened. */
  closed?: boolean;
  note?: string;
}

export interface PickupLocation {
  id: string;
  name: string;
  address?: string;
  note?: string;
  mapsUrl?: string;
  /** Only active locations are offered to customers. At launch only the farm is active. */
  active: boolean;
  sort: number;
  /** Open dates in the future, soonest first, closed ones removed. */
  dates: PickupDate[];
}

/** When ordering closes: `hour` o'clock, `daysBefore` days before the pickup date, Danish local time. */
export interface DeadlineRule {
  daysBefore: number;
  hour: number;
}

export interface OrderingSettings {
  /** Default for every product unless its category or the product itself overrides it. */
  defaultDeadline: DeadlineRule;
}
