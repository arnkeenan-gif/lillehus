import type { PreviewValue, StringRule } from "sanity";

/** The `media` a preview may return (an image field value, an icon component or a React node). */
export type PreviewMedia = PreviewValue["media"];

/** 5500 gives "55 kr.", 4550 gives "45,50 kr.". Same rule as src/lib/format.ts, kept local so the Studio bundle stays small. */
export function formatOere(oere: number | undefined | null): string {
  if (typeof oere !== "number" || Number.isNaN(oere)) return "";
  const whole = oere % 100 === 0;
  const n = new Intl.NumberFormat("da-DK", {
    minimumFractionDigits: whole ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(oere / 100);
  return `${n} kr.`;
}

export const HREF_HELP =
  'En side på dette site, fx "/bageri" eller "#book", eller en hel adresse, der begynder med https://. En mailadresse skrives mailto:navn@adresse.dk og et telefonnummer tel:+4522594493.';

export function isValidHref(href: string | undefined): boolean {
  if (!href) return false;
  return /^(\/|#)/.test(href) || /^https:\/\/\S+$/.test(href) || /^(mailto|tel):\S+$/.test(href);
}

/** Required link address: a relative path, an anchor, https, mailto or tel. */
export function hrefValidation(rule: StringRule) {
  return rule
    .required()
    .error("Skriv en adresse.")
    .custom((value) => (isValidHref(value) ? true : "Adressen skal begynde med /, #, https://, mailto: eller tel:"));
}

/** Preview for a section: its heading when there is one, otherwise the type's name. */
export function sectionPreview(typeTitle: string, headingField = "heading") {
  return {
    select: { heading: headingField },
    prepare({ heading }: { heading?: string }) {
      return { title: heading || typeTitle, subtitle: heading ? typeTitle : undefined };
    },
  };
}

/** "onsdag den 3. oktober 2026 kl. 11.00" for previews in the Studio. */
export function formatDateTime(iso: string | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const date = new Intl.DateTimeFormat("da-DK", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Europe/Copenhagen",
  }).format(d);
  const time = new Intl.DateTimeFormat("da-DK", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Copenhagen",
  })
    .format(d)
    .replace(":", ".");
  return time === "00.00" ? date : `${date} kl. ${time}`;
}
