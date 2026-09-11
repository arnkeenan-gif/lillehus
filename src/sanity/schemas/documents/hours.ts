import { defineArrayMember, defineField, defineType } from "sanity";
import { ClockIcon, PinIcon } from "../../icons";

export const hours = defineType({
  name: "hours",
  title: "Åbningstider og steder",
  type: "document",
  icon: ClockIcon,
  fields: [
    defineField({
      name: "locations",
      title: "Steder",
      type: "array",
      description: "Gården og torvedagen. Tiderne her vises på forsiden, under Find os, i sidefoden og på kontaktsiden.",
      of: [
        defineArrayMember({
          name: "location",
          title: "Sted",
          type: "object",
          icon: PinIcon,
          fields: [
            defineField({
              name: "id",
              title: "Kort navn til siden",
              type: "string",
              description: 'Ændr det ikke: "bageriet" og "naestved" bruges af siden til at vide, hvor der hentes brød.',
              validation: (rule) =>
                rule
                  .required()
                  .error("Skriv et kort navn.")
                  .regex(/^[a-z0-9-]+$/, { name: "små bogstaver uden mellemrum" })
                  .error("Kun små bogstaver, tal og bindestreg."),
            }),
            defineField({ name: "name", title: "Navn", type: "string", validation: (rule) => rule.required().error("Skriv stedets navn.").max(60) }),
            defineField({ name: "subtitle", title: "Undertitel", type: "string", description: 'Fx "På gården" eller "Axeltorv, foran Løveapoteket".', validation: (rule) => rule.max(80) }),
            defineField({ name: "address", title: "Adresse", type: "string", validation: (rule) => rule.required().error("Skriv adressen.") }),
            defineField({ name: "mapsUrl", title: "Link til Google Maps", type: "url", validation: (rule) => rule.uri({ scheme: ["https"] }) }),
            defineField({
              name: "hours",
              title: "Tider",
              type: "array",
              of: [
                defineArrayMember({
                  name: "openingHours",
                  title: "Tid",
                  type: "object",
                  fields: [
                    defineField({ name: "days", title: "Dage", type: "string", description: 'Fx "Mandag til fredag" eller "Onsdag".', validation: (rule) => rule.required().error("Skriv, hvilke dage det gælder.") }),
                    defineField({ name: "time", title: "Klokken", type: "string", description: 'Fx "7 til 18" eller "9 til 14". Siden skriver selv "kl." foran.', validation: (rule) => rule.required().error("Skriv tidsrummet.") }),
                    defineField({ name: "note", title: "Note", type: "string", description: 'Fx "Eller til vi er udsolgt". Kan stå tom.', validation: (rule) => rule.max(200) }),
                  ],
                  preview: {
                    select: { days: "days", time: "time" },
                    prepare({ days, time }: { days?: string; time?: string }) {
                      return { title: days ?? "Tid", subtitle: time ? `kl. ${time}` : undefined };
                    },
                  },
                }),
              ],
              validation: (rule) => rule.min(1).error("Skriv mindst en tid."),
            }),
            defineField({
              name: "pickup",
              title: "Bestilt brød hentes her",
              type: "boolean",
              initialValue: false,
            }),
            defineField({ name: "notes", title: "Bemærkning", type: "text", rows: 2, description: "En linje under tiderne, fx om MobilePay eller kaffe. Kan stå tom.", validation: (rule) => rule.max(300) }),
          ],
          preview: {
            select: { title: "name", subtitle: "subtitle" },
          },
        }),
      ],
      validation: (rule) => rule.min(1).error("Der skal være mindst et sted."),
    }),
  ],
  preview: {
    prepare: () => ({ title: "Åbningstider og steder", subtitle: "Gården, fryseren og torvedagen" }),
  },
});
