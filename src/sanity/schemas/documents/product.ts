import { defineArrayMember, defineField, defineType } from "sanity";
import { BasketIcon } from "../../icons";
import { ALLERGEN_OPTIONS, CATEGORY_OPTIONS, WEEKDAY_OPTIONS } from "../constants";
import { formatOere, type PreviewMedia } from "../helpers";

export const product = defineType({
  name: "product",
  title: "Brød og varer",
  type: "document",
  icon: BasketIcon,
  groups: [
    { name: "indhold", title: "Varen", default: true },
    { name: "avanceret", title: "Avanceret" },
  ],
  fields: [
    defineField({
      name: "name",
      title: "Navn",
      type: "string",
      group: "indhold",
      description: 'Som det står på tavlen, fx "Surdejsboller, 4 stk."',
      validation: (rule) => rule.required().error("Skriv varens navn.").max(80),
    }),
    defineField({
      name: "slug",
      title: "Adresse",
      type: "slug",
      group: "indhold",
      description: "Laves ud fra navnet med knappen Generer. Bruges i adressen og i kurven, så ændr den ikke, når varen først er sat til salg.",
      options: { source: "name", maxLength: 60 },
      validation: (rule) => rule.required().error("Tryk på Generer for at lave en adresse."),
    }),
    defineField({
      name: "description",
      title: "Beskrivelse",
      type: "text",
      rows: 3,
      group: "indhold",
      description: "En eller to sætninger: hvad er det, og hvad er det godt til.",
      validation: (rule) => rule.max(300),
    }),
    defineField({
      name: "priceOere",
      title: "Pris i øre",
      type: "number",
      group: "indhold",
      description: "Skriv 5500 for 55 kr. og 4550 for 45,50 kr.",
      validation: (rule) => rule.required().error("Skriv en pris.").integer().error("Kun hele tal, ingen komma.").min(0),
    }),
    defineField({ name: "image", title: "Billede", type: "photo", group: "indhold", description: "Et billede af varen. Højformat eller kvadrat ser bedst ud." }),
    defineField({
      name: "category",
      title: "Kategori",
      type: "string",
      group: "indhold",
      options: { list: CATEGORY_OPTIONS, layout: "radio", direction: "horizontal" },
      initialValue: "brød",
      validation: (rule) => rule.required().error("Vælg en kategori."),
    }),
    defineField({
      name: "days",
      title: "Kan hentes",
      type: "array",
      group: "indhold",
      of: [defineArrayMember({ type: "string" })],
      options: { list: WEEKDAY_OPTIONS },
      description: "Sæt kryds ved de dage, varen bages til. Ingen kryds betyder alle afhentningsdage.",
    }),
    defineField({
      name: "allergens",
      title: "Allergener",
      type: "array",
      group: "indhold",
      of: [defineArrayMember({ type: "string" })],
      options: { list: ALLERGEN_OPTIONS },
      description: "Sæt kryds ved det, varen indeholder.",
    }),
    defineField({
      name: "active",
      title: "Til salg",
      type: "boolean",
      group: "indhold",
      initialValue: true,
      description: "Slå fra for at tage varen af hylden uden at slette den.",
    }),
    defineField({
      name: "sort",
      title: "Rækkefølge",
      type: "number",
      group: "indhold",
      initialValue: 100,
      description: "Lavt tal først i bageriet. 10, 20, 30 giver plads til at skyde noget ind.",
      validation: (rule) => rule.integer().min(0),
    }),
    defineField({
      name: "stripePriceId",
      title: "Stripe price id",
      type: "string",
      group: "avanceret",
      description: "Kun hvis varen også findes i Stripe. Begynder med price_. Ellers lad feltet stå tomt.",
      validation: (rule) => rule.regex(/^price_[A-Za-z0-9]+$/, { name: "price_..." }).error("Et Stripe price id begynder med price_."),
    }),
  ],
  orderings: [
    { title: "Rækkefølge", name: "sort", by: [{ field: "sort", direction: "asc" }, { field: "name", direction: "asc" }] },
    { title: "Navn", name: "name", by: [{ field: "name", direction: "asc" }] },
  ],
  preview: {
    select: { title: "name", price: "priceOere", active: "active", media: "image" },
    prepare({ title, price, active, media }: { title?: string; price?: number; active?: boolean; media?: PreviewMedia }) {
      return {
        title: title ?? "Vare",
        subtitle: [formatOere(price), active === false ? "ikke til salg" : null].filter(Boolean).join(", "),
        media,
      };
    },
  },
});
