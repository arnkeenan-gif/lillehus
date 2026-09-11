import siteJson from "@content/site.json";

export type SiteConfig = typeof siteJson;
export type SiteLocation = SiteConfig["locations"][number];

/** Static facts about the business. Edit content/site.json, not this file. */
export const site: SiteConfig = siteJson;

/** Main navigation. Keep to one line at desktop; seven short Danish labels. */
export const NAV = [
  { href: "/bageri", label: "Bageri" },
  { href: "/kager", label: "Kager" },
  { href: "/pizza", label: "Pizzavogn" },
  { href: "/arrangementer", label: "Arrangementer" },
  { href: "/find-os", label: "Find os" },
  { href: "/om-os", label: "Om os" },
  { href: "/kontakt", label: "Kontakt" },
] as const;

/** Secondary links for the footer. */
export const FOOTER_LINKS = [
  { href: "/levering", label: "Levering" },
  { href: "/firmaaftaler", label: "Firmaaftaler" },
  { href: "/faq", label: "Spørgsmål og svar" },
  { href: "/handelsbetingelser", label: "Handelsbetingelser" },
  { href: "/privatlivspolitik", label: "Privatlivspolitik" },
] as const;

export function fullAddress(): string {
  const a = site.address;
  return `${a.street}, ${a.postalCode} ${a.city}`;
}
