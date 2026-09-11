import { defineArrayMember, defineField, defineType } from "sanity";
import { IceCreamIcon } from "../../icons";
import { formatOere, type PreviewMedia } from "../helpers";

export const cake = defineType({
  name: "cake",
  title: "Kager på bestilling",
  type: "document",
  icon: IceCreamIcon,
  fields: [
    defineField({
      name: "name",
      title: "Navn",
      type: "string",
      description: 'Fx "Kagemand eller kagekone".',
      validation: (rule) => rule.required().error("Skriv kagens navn.").max(80),
    }),
    defineField({
      name: "slug",
      title: "Adresse",
      type: "slug",
      description: "Laves ud fra navnet med knappen Generer. Bruges i forespørgselsformularen.",
      options: { source: "name", maxLength: 60 },
      validation: (rule) => rule.required().error("Tryk på Generer for at lave en adresse."),
    }),
    defineField({
      name: "description",
      title: "Beskrivelse",
      type: "text",
      rows: 3,
      description: "En eller to sætninger om kagen og hvem den passer til.",
      validation: (rule) => rule.max(300),
    }),
    defineField({
      name: "fromPriceOere",
      title: "Fra-pris i øre",
      type: "number",
      description: 'Skriv 45000 for 450 kr. Siden skriver "fra" foran.',
      validation: (rule) => rule.required().error("Skriv en fra-pris.").integer().error("Kun hele tal, ingen komma.").min(0),
    }),
    defineField({
      name: "priceNote",
      title: "Prisen gælder",
      type: "string",
      description: 'Fx "pr. person" for kagetapas. Tom for en pris pr. kage.',
      validation: (rule) => rule.max(40),
    }),
    defineField({
      name: "servings",
      title: "Til hvor mange",
      type: "string",
      description: 'Fx "15 til 25 personer" eller "Fra 12 personer".',
      validation: (rule) => rule.required().error("Skriv, hvor mange kagen rækker til.").max(60),
    }),
    defineField({
      name: "leadTimeDays",
      title: "Bestil senest dage før",
      type: "number",
      description: "Hvor mange dage før du skal have besked. Formularen tillader ikke datoer tættere på.",
      initialValue: 5,
      validation: (rule) => rule.required().integer().min(0).max(60),
    }),
    defineField({ name: "image", title: "Billede", type: "photo" }),
    defineField({
      name: "options",
      title: "Valg til formularen",
      type: "array",
      of: [defineArrayMember({ type: "string" })],
      description: 'Smage eller varianter, kunden kan vælge mellem, fx "Jordbær" og "Chokolade". Kan stå tom.',
    }),
    defineField({
      name: "sort",
      title: "Rækkefølge",
      type: "number",
      initialValue: 100,
      description: "Lavt tal først på siden.",
      validation: (rule) => rule.integer().min(0),
    }),
  ],
  orderings: [{ title: "Rækkefølge", name: "sort", by: [{ field: "sort", direction: "asc" }, { field: "name", direction: "asc" }] }],
  preview: {
    select: { title: "name", price: "fromPriceOere", note: "priceNote", media: "image" },
    prepare({ title, price, note, media }: { title?: string; price?: number; note?: string; media?: PreviewMedia }) {
      return { title: title ?? "Kage", subtitle: price ? `fra ${formatOere(price)}${note ? ` ${note}` : ""}` : undefined, media };
    },
  },
});
