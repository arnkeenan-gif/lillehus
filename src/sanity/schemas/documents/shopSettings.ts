import { defineArrayMember, defineField, defineType } from "sanity";
import { PackageIcon } from "@sanity/icons/Package";
import { WEEKDAY_OPTIONS } from "../constants";
import { isCompleteDeadline, type DeadlineValue } from "../ordering/deadline";

/**
 * "Bageri og bestilling": the default deadline (Kristine's rule, kl. 18 two
 * days before pickup), the minimum order and a message at the top of the
 * bagværk page. Pickup places and their dates live under Afhentningssteder.
 * The old pickup fields from the first shop stay at the bottom, read-only,
 * for pages that still print them; they no longer steer the ordering.
 */

const OLD = "Bruges ikke længere af bestillingen. Afhentning styres nu under Afhentningssteder, og fristen under Bestilling.";

const weekdays = () => defineArrayMember({ type: "string" });

export const shopSettings = defineType({
  name: "shopSettings",
  title: "Bageri og bestilling",
  type: "document",
  icon: PackageIcon,
  groups: [
    { name: "bestilling", title: "Bestilling", default: true },
    { name: "levering", title: "Levering" },
    { name: "gammelt", title: "Gamle felter" },
  ],
  fields: [
    defineField({
      name: "defaultDeadline",
      title: "Almindelig bestillingsfrist",
      type: "orderDeadline",
      group: "bestilling",
      initialValue: { daysBefore: 2, hour: 18 },
      description:
        "Gælder alle varer og kager, medmindre en kategori, en vare eller en kage har sin egen frist. 2 dage før kl. 18 betyder: afhentning onsdag, bestil senest mandag kl. 18; afhentning lørdag, bestil senest torsdag kl. 18.",
      validation: (rule) =>
        rule.custom((value) => (isCompleteDeadline(value as DeadlineValue | undefined) ? true : "Udfyld både dage og klokkeslæt.")),
    }),
    defineField({
      name: "minOrderOere",
      title: "Mindste bestilling i øre",
      type: "number",
      group: "bestilling",
      description: "0 betyder ingen grænse. Skriv 10000 for 100 kr.",
      initialValue: 0,
      validation: (rule) => rule.integer().min(0),
    }),
    defineField({
      name: "notice",
      title: "Besked øverst i bagværket",
      type: "text",
      rows: 2,
      group: "bestilling",
      description: 'Fx "Vi holder ferie i uge 29." Tom betyder ingen besked.',
      validation: (rule) => rule.max(300),
    }),

    defineField({
      name: "delivery",
      title: "Levering",
      type: "object",
      group: "levering",
      description: "Bruges på siden om levering. Bestillinger her på siden hentes på det valgte afhentningssted.",
      fields: [
        defineField({ name: "enabled", title: "Vi leverer", type: "boolean", initialValue: false }),
        defineField({ name: "feeOere", title: "Pris for levering i øre", type: "number", description: "Skriv 4900 for 49 kr.", initialValue: 0, validation: (rule) => rule.integer().min(0) }),
        defineField({ name: "freeAboveOere", title: "Gratis ved køb over, i øre", type: "number", description: "0 betyder aldrig gratis.", initialValue: 0, validation: (rule) => rule.integer().min(0) }),
        defineField({ name: "radiusKm", title: "Hvor langt vi kører, i km", type: "number", initialValue: 0, validation: (rule) => rule.integer().min(0) }),
        defineField({ name: "days", title: "Leveringsdage", type: "array", of: [weekdays()], options: { list: WEEKDAY_OPTIONS } }),
        defineField({ name: "note", title: "Tekst om levering", type: "text", rows: 3, validation: (rule) => rule.max(500) }),
      ],
    }),

    defineField({ name: "pickupDays", title: "Afhentningsdage", type: "array", group: "gammelt", of: [weekdays()], options: { list: WEEKDAY_OPTIONS }, readOnly: true, deprecated: { reason: OLD } }),
    defineField({ name: "pickupWindow", title: "Afhentning mellem klokken", type: "string", group: "gammelt", readOnly: true, deprecated: { reason: OLD } }),
    defineField({ name: "pickupPlace", title: "Afhentningssted", type: "string", group: "gammelt", readOnly: true, deprecated: { reason: OLD } }),
    defineField({ name: "cutoffHour", title: "Senest klokken", type: "number", group: "gammelt", readOnly: true, deprecated: { reason: OLD } }),
    defineField({ name: "cutoffDaysBefore", title: "Dage før afhentning", type: "number", group: "gammelt", readOnly: true, deprecated: { reason: OLD } }),
    defineField({ name: "maxDaysAhead", title: "Kan bestilles så mange dage frem", type: "number", group: "gammelt", readOnly: true, deprecated: { reason: OLD } }),
    defineField({
      name: "closedDates",
      title: "Lukkedage",
      type: "array",
      group: "gammelt",
      of: [defineArrayMember({ type: "date" })],
      readOnly: true,
      deprecated: { reason: "Bruges ikke længere. Luk en dato under Afhentningssteder ved at fjerne fluebenet ved Åben." },
    }),
  ],
  preview: {
    prepare: () => ({ title: "Bageri og bestilling", subtitle: "Bestillingsfrist, mindste bestilling, besked" }),
  },
});
