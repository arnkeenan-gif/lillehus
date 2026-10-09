import { defineArrayMember, defineField, defineType } from "sanity";
import { PinIcon } from "@sanity/icons/Pin";
import { formatDayDate, normalizeClock, pickupTimeText } from "../../../lib/ordering/dates";

/**
 * A place where orders are picked up, with its own dates and pickup times.
 * Only active places are offered to customers; at launch only the farm.
 * Dates are opened a few weeks at a time with the "Åbn datoer" action at the
 * bottom of the document, and closed by removing the tick at "Åben".
 */

const CLOCK = /^\s*([01]?\d|2[0-3])[.:][0-5]\d\s*$/;

function clockCheck(value: string | undefined): true | string {
  if (!value) return true;
  return CLOCK.test(value) ? true : "Skriv klokkeslættet som 9.00 eller 14.30.";
}

export interface PickupDateValue {
  _key?: string;
  date?: string;
  open?: boolean;
  from?: string;
  to?: string;
  note?: string;
}

export const pickupDateEntry = defineType({
  name: "pickupDateEntry",
  title: "Dato",
  type: "object",
  fields: [
    defineField({
      name: "date",
      title: "Dato",
      type: "date",
      validation: (rule) => rule.required().error("Vælg en dato."),
    }),
    defineField({
      name: "open",
      title: "Åben for bestilling",
      type: "boolean",
      initialValue: true,
      description: "Fjern fluebenet for at lukke datoen, fx ved ferie eller helligdage. Den bliver stående, så du kan åbne den igen.",
    }),
    defineField({
      name: "from",
      title: "Afhentning fra kl.",
      type: "string",
      description: 'Fx "9.00". Kan stå tomt.',
      validation: (rule) => rule.custom(clockCheck),
    }),
    defineField({
      name: "to",
      title: "Afhentning til kl.",
      type: "string",
      description: 'Fx "12.00". Kan stå tomt.',
      validation: (rule) => rule.custom(clockCheck),
    }),
    defineField({
      name: "note",
      title: "Note til kunderne",
      type: "string",
      description: "Vises ved datoen, når kunden har valgt den. Kan stå tom.",
      validation: (rule) => rule.max(120),
    }),
  ],
  preview: {
    select: { date: "date", open: "open", from: "from", to: "to" },
    prepare({ date, open, from, to }: PickupDateValue) {
      const title = date ? formatDayDate(date, { year: true }) : "Dato mangler";
      const time = pickupTimeText(normalizeClock(from), normalizeClock(to));
      return { title, subtitle: open === false ? "Lukket" : time ? `Åben, ${time}` : "Åben, tid ikke sat" };
    },
  },
});

export const pickupLocation = defineType({
  name: "pickupLocation",
  title: "Afhentningssted",
  type: "document",
  icon: PinIcon,
  groups: [
    { name: "stedet", title: "Stedet", default: true },
    { name: "datoer", title: "Datoer" },
  ],
  fields: [
    defineField({
      name: "name",
      title: "Navn",
      type: "string",
      group: "stedet",
      description: 'Som kunderne skal se det, fx "Gården" eller "Næstved Torv".',
      validation: (rule) => rule.required().error("Skriv stedets navn.").max(60),
    }),
    defineField({
      name: "slug",
      title: "Id",
      type: "slug",
      group: "stedet",
      description: "Laves ud fra navnet med knappen Generer. Bruges i kurven og i bestillingerne, så ændr det ikke, når stedet er taget i brug.",
      options: { source: "name", maxLength: 60 },
      validation: (rule) => rule.required().error("Tryk på Generer for at lave et id."),
    }),
    defineField({
      name: "active",
      title: "Aktiv",
      type: "boolean",
      group: "stedet",
      initialValue: false,
      description: "Kun aktive steder kan vælges, når kunderne bestiller. Slå til, når stedet skal tages i brug.",
    }),
    defineField({
      name: "address",
      title: "Adresse",
      type: "string",
      group: "stedet",
      description: 'Fx "Torpevej 10, 4160 Herlufmagle". Vises under navnet.',
      validation: (rule) => rule.max(120),
    }),
    defineField({
      name: "note",
      title: "Kort note",
      type: "string",
      group: "stedet",
      description: 'Vises før adressen, fx "Hønsehuset". Kan stå tom.',
      validation: (rule) => rule.max(80),
    }),
    defineField({
      name: "mapsUrl",
      title: "Link til kort",
      type: "url",
      group: "stedet",
      description: "Et link til Google Maps eller lignende. Kan stå tomt.",
      validation: (rule) => rule.uri({ scheme: ["https"] }).error("Linket skal begynde med https://"),
    }),
    defineField({
      name: "sort",
      title: "Rækkefølge",
      type: "number",
      group: "stedet",
      initialValue: 100,
      description: "Lavt tal først, når kunden vælger sted.",
      validation: (rule) => rule.integer().min(0),
    }),
    defineField({
      name: "dates",
      title: "Datoer",
      type: "array",
      group: "datoer",
      of: [defineArrayMember({ type: "pickupDateEntry" })],
      description:
        "De dage, kunderne kan vælge at hente her. Læg flere uger ind på én gang med Åbn datoer i menuen ved Udgiv nederst (de tre prikker). Luk en dato ved at fjerne fluebenet ved Åben. Husk at trykke Udgiv.",
      validation: (rule) =>
        rule.custom((value) => {
          const list = (value as PickupDateValue[] | undefined) ?? [];
          const seen = new Set<string>();
          for (const entry of list) {
            if (!entry.date) continue;
            if (seen.has(entry.date)) return `${formatDayDate(entry.date, { year: true })} står der to gange. Slet den ene.`;
            seen.add(entry.date);
          }
          return true;
        }),
    }),
  ],
  orderings: [{ title: "Rækkefølge", name: "sort", by: [{ field: "sort", direction: "asc" }, { field: "name", direction: "asc" }] }],
  preview: {
    select: { title: "name", active: "active", address: "address" },
    prepare({ title, active, address }: { title?: string; active?: boolean; address?: string }) {
      return { title: title ?? "Afhentningssted", subtitle: [active ? "Aktiv" : "Ikke aktiv", address].filter(Boolean).join(", ") };
    },
  },
});
