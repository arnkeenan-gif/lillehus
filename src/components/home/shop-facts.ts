import shopJson from "@content/shop.json";

/*
  Read-only sentences built from content/shop.json, so the forside, find-os,
  levering and handelsbetingelser all say the same thing when the shop lane
  changes a value. The shop lane owns the JSON; this file only reads it.
*/

export const shop = shopJson;

const DAY_LABELS: Record<string, string> = {
  man: "mandag",
  tir: "tirsdag",
  ons: "onsdag",
  tor: "torsdag",
  fre: "fredag",
  lør: "lørdag",
  søn: "søndag",
};

export function dayLabel(day: string): string {
  return DAY_LABELS[day] ?? day;
}

/** ["a", "b", "c"] gives "a, b og c". */
export function listDa(items: string[]): string {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} og ${items[items.length - 1]}`;
}

/** "tirsdag, onsdag, torsdag og fredag" */
export function pickupDaysText(): string {
  return listDa(shop.pickupDays.map(dayLabel));
}

/** "dagen før kl. 18" */
export function cutoffText(): string {
  const before = shop.cutoffDaysBefore === 1 ? "dagen før" : `${shop.cutoffDaysBefore} dage før`;
  return `${before} kl. ${shop.cutoffHour}`;
}

/** "fredag" or "onsdag og fredag" */
export function deliveryDaysText(): string {
  return listDa(shop.delivery.days.map(dayLabel));
}
