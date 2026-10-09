/**
 * The deadline engine. Ordering for a pickup date closes at `hour`:00 Danish
 * time, `daysBefore` days before that date (Kristine's description, section
 * 5: kl. 18 two days before, so a Wednesday pickup closes Monday at 18 and a
 * Saturday pickup closes Thursday at 18). The instant is worked out in
 * Europe/Copenhagen, so it stays right across the summer time changes in
 * March and October, whatever time zone the server or browser runs in.
 *
 * Which rule applies: the product's own deadline, else its category's, else
 * the default from "Bageri og bestilling" in the Studio. Cakes have no
 * category: the cake's own deadline, else the default.
 *
 * Client-safe. The checkout runs the same functions with the server's clock,
 * so a page left open past the deadline cannot get an order through.
 */
import type { DeadlineRule } from "@/lib/cms/ordering-types";
import { addDays, formatDayDate, formatShortDate, TIME_ZONE } from "./dates";

export type { DeadlineRule };

/** Kl. 18 two days before pickup. */
export const DEFAULT_DEADLINE: DeadlineRule = { daysBefore: 2, hour: 18 };

const MAX_DAYS_BEFORE = 60;

/** A complete rule: whole days 0 to 60 and an hour 0 to 23. */
export function isDeadlineRule(value: unknown): value is DeadlineRule {
  if (!value || typeof value !== "object") return false;
  const { daysBefore, hour } = value as Partial<DeadlineRule>;
  return (
    typeof daysBefore === "number" &&
    Number.isInteger(daysBefore) &&
    daysBefore >= 0 &&
    daysBefore <= MAX_DAYS_BEFORE &&
    typeof hour === "number" &&
    Number.isInteger(hour) &&
    hour >= 0 &&
    hour <= 23
  );
}

/** The rule that applies: the first complete rule among the candidates (product, category, default). */
export function effectiveRule(...candidates: (DeadlineRule | null | undefined)[]): DeadlineRule {
  for (const rule of candidates) if (isDeadlineRule(rule)) return { daysBefore: rule.daysBefore, hour: rule.hour };
  return DEFAULT_DEADLINE;
}

export function sameRule(a: DeadlineRule, b: DeadlineRule): boolean {
  return a.daysBefore === b.daysBefore && a.hour === b.hour;
}

const zoneParts = new Intl.DateTimeFormat("en-US", {
  timeZone: TIME_ZONE,
  hourCycle: "h23",
  year: "numeric",
  month: "numeric",
  day: "numeric",
  hour: "numeric",
  minute: "numeric",
  second: "numeric",
});

/** How far Copenhagen's wall clock is ahead of UTC at an instant, in ms (1 or 2 hours). */
function zoneOffsetMs(utcMs: number): number {
  const parts = zoneParts.formatToParts(new Date(utcMs));
  const get = (type: Intl.DateTimeFormatPartTypes) => Number(parts.find((p) => p.type === type)?.value ?? 0);
  const wall = Date.UTC(get("year"), get("month") - 1, get("day"), get("hour") % 24, get("minute"), get("second"));
  return wall - Math.floor(utcMs / 1000) * 1000;
}

/**
 * The instant when the clock in Copenhagen shows `hour`:`minute` on the
 * calendar date `iso`. The offset is looked up twice so a date on the day
 * the clocks change still lands on the right hour.
 */
export function copenhagenInstant(iso: string, hour: number, minute = 0): Date {
  const [y, m, d] = iso.split("-").map(Number);
  const wall = Date.UTC(y, m - 1, d, hour, minute);
  let utc = wall - zoneOffsetMs(wall);
  const checked = wall - zoneOffsetMs(utc);
  if (checked !== utc) utc = checked;
  return new Date(utc);
}

/** When ordering for `pickupDate` closes under `rule`. */
export function deadlineFor(pickupDate: string, rule: DeadlineRule): Date {
  return copenhagenInstant(addDays(pickupDate, -rule.daysBefore), rule.hour);
}

function ms(now: Date | number): number {
  return typeof now === "number" ? now : now.getTime();
}

/** True while there is still time to order for `pickupDate`. At the deadline itself it is closed. */
export function isBeforeDeadline(pickupDate: string, rule: DeadlineRule, now: Date | number = Date.now()): boolean {
  return ms(now) < deadlineFor(pickupDate, rule).getTime();
}

/** "mandag den 12. oktober kl. 18": the moment ordering closes, as the customer reads it. */
export function deadlineText(pickupDate: string, rule: DeadlineRule): string {
  return `${formatDayDate(addDays(pickupDate, -rule.daysBefore))} kl. ${rule.hour}`;
}

/** "tors. 15. okt. kl. 18", the same moment in few characters. */
export function deadlineShortText(pickupDate: string, rule: DeadlineRule): string {
  return `${formatShortDate(addDays(pickupDate, -rule.daysBefore))} kl. ${rule.hour}`;
}

const NUMBER_WORDS = ["nul", "en", "to", "tre", "fire", "fem", "seks", "syv", "otte", "ni", "ti"];

/** The rule in general: "kl. 18 to dage før afhentning", "kl. 12 dagen før afhentning". */
export function ruleText(rule: DeadlineRule): string {
  const days =
    rule.daysBefore === 0
      ? "samme dag som afhentning"
      : rule.daysBefore === 1
        ? "dagen før afhentning"
        : `${NUMBER_WORDS[rule.daysBefore] ?? rule.daysBefore} dage før afhentning`;
  return `kl. ${rule.hour} ${days}`;
}

/**
 * The rule most products use, for the one deadline the page states for a
 * date. Ties go to the default; with no products it is the default.
 */
export function generalRule(rules: DeadlineRule[], fallback: DeadlineRule): DeadlineRule {
  const counts = new Map<string, { rule: DeadlineRule; count: number }>();
  for (const rule of rules) {
    const key = `${rule.daysBefore}:${rule.hour}`;
    const entry = counts.get(key);
    if (entry) entry.count += 1;
    else counts.set(key, { rule, count: 1 });
  }
  let best: { rule: DeadlineRule; count: number } | null = null;
  for (const entry of counts.values()) {
    if (!best || entry.count > best.count || (entry.count === best.count && sameRule(entry.rule, fallback))) best = entry;
  }
  return best?.rule ?? fallback;
}

/**
 * The latest moment anything can still be ordered for `pickupDate` under any
 * of `rules`: the date can be chosen until then.
 */
export function lastDeadline(pickupDate: string, rules: DeadlineRule[]): Date | null {
  let latest: Date | null = null;
  for (const rule of rules) {
    const d = deadlineFor(pickupDate, rule);
    if (!latest || d.getTime() > latest.getTime()) latest = d;
  }
  return latest;
}

/**
 * The deadline to show for a chosen date: the general rule's while it is
 * still open, otherwise the latest one that is still open (some products
 * may need less notice), or null when everything has closed.
 */
export function shownDeadline(
  pickupDate: string,
  rules: DeadlineRule[],
  general: DeadlineRule,
  now: Date | number,
): { rule: DeadlineRule; at: Date } | null {
  const t = ms(now);
  const generalAt = deadlineFor(pickupDate, general);
  if (t < generalAt.getTime() && rules.some((r) => sameRule(r, general))) return { rule: general, at: generalAt };
  let best: { rule: DeadlineRule; at: Date } | null = null;
  for (const rule of rules) {
    const at = deadlineFor(pickupDate, rule);
    if (at.getTime() > t && (!best || at.getTime() > best.at.getTime())) best = { rule, at };
  }
  return best;
}
