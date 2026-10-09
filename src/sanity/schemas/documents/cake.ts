import { defineArrayMember, defineField, defineType } from "sanity";
import { IceCreamIcon } from "@sanity/icons/IceCream";
import { formatOere, type PreviewMedia } from "../helpers";
import { deadlineOverrideField } from "../ordering/deadline";

/**
 * A cake with its own page (/kager/<adresse>), set up like Emma's kagemænd:
 * photos, a base price, the options the customer chooses (each can add to
 * the price), how many, a deadline of its own and sections of text under it.
 * Base price 0 means "Pris aftales": the customer sends a request with the
 * choices instead of paying, and Kristine answers with the price.
 */
export const cake = defineType({
  name: "cake",
  title: "Kage",
  type: "document",
  icon: IceCreamIcon,
  groups: [
    { name: "kagen", title: "Kagen", default: true },
    { name: "valg", title: "Valgmuligheder" },
    { name: "bestilling", title: "Bestilling" },
    { name: "beskrivelse", title: "Afsnit under kagen" },
  ],
  fields: [
    defineField({
      name: "name",
      title: "Navn",
      type: "string",
      group: "kagen",
      description: 'Fx "Kagemand eller kagekone".',
      validation: (rule) => rule.required().error("Skriv kagens navn.").max(80),
    }),
    defineField({
      name: "slug",
      title: "Adresse",
      type: "slug",
      group: "kagen",
      description: "Laves ud fra navnet med knappen Generer. Kagens side får adressen /kager/ og så denne.",
      options: { source: "name", maxLength: 60 },
      validation: (rule) => rule.required().error("Tryk på Generer for at lave en adresse."),
    }),
    defineField({
      name: "intro",
      title: "Kort tekst",
      type: "text",
      rows: 2,
      group: "kagen",
      description: "En eller to sætninger under navnet på kagens side. Kan stå tom.",
      validation: (rule) => rule.max(300),
    }),
    defineField({
      name: "images",
      title: "Billeder",
      type: "array",
      group: "kagen",
      of: [defineArrayMember({ type: "photo" })],
      options: { layout: "grid" },
      description: "Det første billede vises på oversigten. Træk billederne for at ændre rækkefølgen.",
    }),
    defineField({
      name: "basePriceOere",
      title: "Pris i øre",
      type: "number",
      group: "kagen",
      initialValue: 0,
      description:
        "Prisen før tilvalg. Skriv 49500 for 495 kr. 0 betyder Pris aftales: kunden sender en forespørgsel med sine valg, og du svarer med prisen.",
      validation: (rule) => [
        rule.required().error("Skriv en pris, eller 0 for Pris aftales.").integer().error("Kun hele tal, ingen komma.").min(0),
        rule
          .custom((value) => (typeof value === "number" && value > 0 && value < 100 ? "Er det kroner? 495 kr. skrives 49500." : true))
          .warning(),
      ],
    }),
    defineField({
      name: "active",
      title: "Vis på siden",
      type: "boolean",
      group: "kagen",
      initialValue: true,
      description: "Slå fra for at skjule kagen uden at slette den.",
    }),
    defineField({
      name: "sort",
      title: "Rækkefølge",
      type: "number",
      group: "kagen",
      initialValue: 100,
      description: "Lavt tal først på kagesiden.",
      validation: (rule) => rule.integer().min(0),
    }),
    defineField({
      name: "optionGroups",
      title: "Valgmuligheder",
      type: "array",
      group: "valg",
      of: [defineArrayMember({ type: "cakeOptionGroup" })],
      description:
        "Det kunden vælger på kagens side, fx Smag (rullemenu), Størrelse (knapper), Slik (tilvalg) eller Tekst på kagen (tekstfelt). Træk for at ændre rækkefølgen.",
    }),
    defineField({
      name: "minQuantity",
      title: "Mindst antal",
      type: "number",
      group: "bestilling",
      initialValue: 1,
      validation: (rule) => rule.required().integer().min(1).max(100),
    }),
    defineField({
      name: "maxQuantity",
      title: "Højst antal",
      type: "number",
      group: "bestilling",
      initialValue: 10,
      description: "Hvor mange kunden højst kan bestille på én gang.",
      validation: (rule) =>
        rule
          .required()
          .integer()
          .min(1)
          .max(100)
          .custom((value, context) => {
            const min = (context.parent as { minQuantity?: number } | undefined)?.minQuantity;
            return typeof value === "number" && typeof min === "number" && value < min ? "Højst antal skal være mindst lige så stort som mindst antal." : true;
          }),
    }),
    deadlineOverrideField({
      group: "bestilling",
      fallsBackTo: "den almindelige frist fra Bageri og bestilling (kager skal ofte bestilles længere tid i forvejen)",
    }),
    defineField({
      name: "sections",
      title: "Afsnit under kagen",
      type: "array",
      group: "beskrivelse",
      of: [defineArrayMember({ type: "cakeSection" })],
      description: "Fx Beskrivelse, Ingredienser og Allergener. Vises under bestillingen, det første foldet ud.",
    }),
  ],
  orderings: [{ title: "Rækkefølge", name: "sort", by: [{ field: "sort", direction: "asc" }, { field: "name", direction: "asc" }] }],
  preview: {
    select: { title: "name", price: "basePriceOere", active: "active", media: "images.0" },
    prepare({ title, price, active, media }: { title?: string; price?: number; active?: boolean; media?: PreviewMedia }) {
      const priceText = price ? formatOere(price) : "Pris aftales";
      return { title: title ?? "Kage", subtitle: [priceText, active === false ? "skjult" : null].filter(Boolean).join(", "), media };
    },
  },
});
