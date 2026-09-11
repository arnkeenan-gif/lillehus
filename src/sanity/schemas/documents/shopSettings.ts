import { defineArrayMember, defineField, defineType } from "sanity";
import { PackageIcon } from "../../icons";
import { WEEKDAY_OPTIONS } from "../constants";

const weekdays = () =>
  defineArrayMember({ type: "string" });

export const shopSettings = defineType({
  name: "shopSettings",
  title: "Bageri, afhentning og levering",
  type: "document",
  icon: PackageIcon,
  groups: [
    { name: "afhentning", title: "Afhentning", default: true },
    { name: "frist", title: "Bestillingsfrist" },
    { name: "levering", title: "Levering" },
    { name: "lukket", title: "Lukkedage og besked" },
  ],
  fields: [
    defineField({
      name: "pickupDays",
      title: "Afhentningsdage",
      type: "array",
      group: "afhentning",
      of: [weekdays()],
      options: { list: WEEKDAY_OPTIONS },
      description: "Sæt kryds ved de dage, kunder kan vælge at hente brød.",
      validation: (rule) => rule.min(1).error("Vælg mindst en dag."),
    }),
    defineField({
      name: "pickupWindow",
      title: "Afhentning mellem klokken",
      type: "string",
      group: "afhentning",
      description: 'Fx "7 til 18". Siden skriver selv "kl." foran.',
      validation: (rule) => rule.required().error("Skriv tidsrummet."),
    }),
    defineField({
      name: "pickupPlace",
      title: "Afhentningssted",
      type: "string",
      group: "afhentning",
      description: 'Fx "Hønsehuset, Torpevej 10, 4160 Herlufmagle".',
      validation: (rule) => rule.required().error("Skriv, hvor brødet hentes."),
    }),
    defineField({
      name: "minOrderOere",
      title: "Mindste bestilling i øre",
      type: "number",
      group: "afhentning",
      description: "0 betyder ingen grænse. Skriv 10000 for 100 kr.",
      initialValue: 0,
      validation: (rule) => rule.required().integer().min(0),
    }),

    defineField({
      name: "cutoffHour",
      title: "Senest klokken",
      type: "number",
      group: "frist",
      description: "Bestillinger skal være inde senest denne time. 18 betyder kl. 18.",
      initialValue: 18,
      validation: (rule) => rule.required().integer().min(0).max(23),
    }),
    defineField({
      name: "cutoffDaysBefore",
      title: "Dage før afhentning",
      type: "number",
      group: "frist",
      description: "1 betyder dagen før afhentning, 2 betyder to dage før.",
      initialValue: 1,
      validation: (rule) => rule.required().integer().min(0).max(14),
    }),
    defineField({
      name: "maxDaysAhead",
      title: "Kan bestilles så mange dage frem",
      type: "number",
      group: "frist",
      initialValue: 14,
      validation: (rule) => rule.required().integer().min(1).max(90),
    }),

    defineField({
      name: "delivery",
      title: "Levering",
      type: "object",
      group: "levering",
      fields: [
        defineField({ name: "enabled", title: "Vi leverer", type: "boolean", initialValue: false, description: "Slå til, når I begynder at køre ud med brød." }),
        defineField({ name: "feeOere", title: "Pris for levering i øre", type: "number", description: "Skriv 4900 for 49 kr.", initialValue: 4900, validation: (rule) => rule.integer().min(0) }),
        defineField({ name: "freeAboveOere", title: "Gratis ved køb over, i øre", type: "number", description: "Skriv 40000 for 400 kr. 0 betyder aldrig gratis.", initialValue: 40000, validation: (rule) => rule.integer().min(0) }),
        defineField({ name: "radiusKm", title: "Hvor langt vi kører, i km", type: "number", initialValue: 15, validation: (rule) => rule.integer().min(0) }),
        defineField({ name: "days", title: "Leveringsdage", type: "array", of: [weekdays()], options: { list: WEEKDAY_OPTIONS } }),
        defineField({ name: "note", title: "Tekst om levering", type: "text", rows: 3, description: "Vises på siden om levering, både før og efter I begynder.", validation: (rule) => rule.max(500) }),
      ],
    }),

    defineField({
      name: "closedDates",
      title: "Lukkedage",
      type: "array",
      group: "lukket",
      of: [defineArrayMember({ type: "date" })],
      description: "Datoer, hvor der ikke kan hentes brød, fx helligdage og ferie.",
    }),
    defineField({
      name: "notice",
      title: "Besked øverst i bageriet",
      type: "text",
      rows: 2,
      group: "lukket",
      description: 'Fx "Vi holder ferie i uge 29, bestil til ugen efter". Tom betyder ingen besked.',
      validation: (rule) => rule.max(300),
    }),
  ],
  preview: {
    prepare: () => ({ title: "Bageri, afhentning og levering", subtitle: "Afhentningsdage, frist, levering, lukkedage" }),
  },
});
