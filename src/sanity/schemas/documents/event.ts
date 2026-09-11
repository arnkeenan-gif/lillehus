import { defineField, defineType } from "sanity";
import { CalendarIcon } from "../../icons";
import { EVENT_KIND_OPTIONS } from "../constants";
import { formatDateTime, type PreviewMedia } from "../helpers";

export const event = defineType({
  name: "event",
  title: "Arrangementer og kurser",
  type: "document",
  icon: CalendarIcon,
  fields: [
    defineField({
      name: "title",
      title: "Navn",
      type: "string",
      description: 'Fx "Åbent hus i haven og huset".',
      validation: (rule) => rule.required().error("Skriv, hvad arrangementet hedder.").max(80),
    }),
    defineField({
      name: "slug",
      title: "Adresse",
      type: "slug",
      description: "Laves ud fra navnet med knappen Generer. Bruges ved tilmelding.",
      options: { source: "title", maxLength: 60 },
      validation: (rule) => rule.required().error("Tryk på Generer for at lave en adresse."),
    }),
    defineField({
      name: "kind",
      title: "Type",
      type: "string",
      options: { list: EVENT_KIND_OPTIONS, layout: "radio", direction: "horizontal" },
      initialValue: "arrangement",
      validation: (rule) => rule.required().error("Vælg en type."),
    }),
    defineField({
      name: "start",
      title: "Starter",
      type: "datetime",
      options: { timeStep: 15 },
      validation: (rule) => rule.required().error("Vælg dato og klokkeslæt."),
    }),
    defineField({
      name: "end",
      title: "Slutter",
      type: "datetime",
      options: { timeStep: 15 },
      description: "Kan udelades. Arrangementet forsvinder fra siden, når det er slut.",
      validation: (rule) =>
        rule.min(rule.valueOfField("start")).error("Slutter skal ligge efter Starter."),
    }),
    defineField({
      name: "place",
      title: "Sted",
      type: "string",
      description: 'Fx "Torpevej 10, Herlufmagle".',
      validation: (rule) => rule.required().error("Skriv, hvor det foregår.").max(120),
    }),
    defineField({
      name: "description",
      title: "Beskrivelse",
      type: "text",
      rows: 4,
      description: "Hvad sker der, og hvad skal man vide. Et par sætninger.",
      validation: (rule) => rule.max(1000),
    }),
    defineField({
      name: "priceOere",
      title: "Pris pr. person i øre",
      type: "number",
      description: "Skriv 15000 for 150 kr. Tom betyder gratis.",
      validation: (rule) => rule.integer().min(0),
    }),
    defineField({
      name: "signup",
      title: "Tilmelding på siden",
      type: "boolean",
      initialValue: false,
      description: "Slå til for at vise en tilmeldingsformular under arrangementet.",
    }),
    defineField({
      name: "capacity",
      title: "Pladser",
      type: "number",
      description: "Hvor mange der kan være med. Kan udelades.",
      validation: (rule) => rule.integer().min(1),
    }),
    defineField({ name: "image", title: "Billede", type: "photo" }),
  ],
  orderings: [{ title: "Dato", name: "start", by: [{ field: "start", direction: "asc" }] }],
  preview: {
    select: { title: "title", start: "start", place: "place", media: "image" },
    prepare({ title, start, place, media }: { title?: string; start?: string; place?: string; media?: PreviewMedia }) {
      return { title: title ?? "Arrangement", subtitle: [formatDateTime(start), place].filter(Boolean).join(", "), media };
    },
  },
});
