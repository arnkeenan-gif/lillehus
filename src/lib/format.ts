/**
 * Danish formatting helpers. Prices are always integers in øre
 * (Stripe minor units), never floats.
 */

const dkk = new Intl.NumberFormat("da-DK", {
  style: "currency",
  currency: "DKK",
  currencyDisplay: "code",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

/** 4500 → "45 kr.", 4550 → "45,50 kr." */
export function formatPrice(oere: number): string {
  const whole = oere % 100 === 0;
  const n = new Intl.NumberFormat("da-DK", {
    minimumFractionDigits: whole ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(oere / 100);
  return `${n} kr.`;
}

/** Same but with the ISO code, for invoices/emails where "DKK" is clearer. */
export function formatPriceISO(oere: number): string {
  return dkk.format(oere / 100);
}

const longDate = new Intl.DateTimeFormat("da-DK", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "Europe/Copenhagen",
});

const shortDate = new Intl.DateTimeFormat("da-DK", {
  day: "numeric",
  month: "short",
  timeZone: "Europe/Copenhagen",
});

const time = new Intl.DateTimeFormat("da-DK", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/Copenhagen",
});

/** "fredag den 11. september 2026" */
export function formatDateLong(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  const s = longDate.format(date);
  // Newer ICU data already writes "fredag den 11. september 2026"; older data omits "den".
  return /^\p{L}+ den /u.test(s) ? s : s.replace(/^(\p{L}+) /u, "$1 den ");
}

/** "11. sep." */
export function formatDateShort(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  return shortDate.format(date);
}

/** "17.30" (Danish convention uses a period, not a colon) */
export function formatTime(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  return time.format(date).replace(":", ".");
}

/** Capitalise the first letter of a Danish string (weekday names are lowercase). */
export function ucfirst(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export const WEEKDAYS_DA = [
  "søndag",
  "mandag",
  "tirsdag",
  "onsdag",
  "torsdag",
  "fredag",
  "lørdag",
] as const;
