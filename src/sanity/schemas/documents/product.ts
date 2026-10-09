import { defineField, defineType } from "sanity";
import { BasketIcon } from "@sanity/icons/Basket";
import { formatOere, type PreviewMedia } from "../helpers";
import { deadlineOverrideField } from "../ordering/deadline";

/**
 * One product in the bagværk shop: under a category, with its own photo,
 * name, description and price. "Vis på siden" hides it without deleting it;
 * "Kan bestilles på siden" keeps it on the page with its price but without
 * the basket. A product can have its own deadline.
 */
export const product = defineType({
  name: "product",
  title: "Vare",
  type: "document",
  icon: BasketIcon,
  groups: [
    { name: "varen", title: "Varen", default: true },
    { name: "bestilling", title: "Bestilling" },
  ],
  fields: [
    defineField({
      name: "name",
      title: "Navn",
      type: "string",
      group: "varen",
      description: 'Som det står på tavlen, fx "Surdejsboller, 4 stk."',
      validation: (rule) => rule.required().error("Skriv varens navn.").max(80),
    }),
    defineField({
      name: "slug",
      title: "Adresse",
      type: "slug",
      group: "varen",
      description: "Laves ud fra navnet med knappen Generer. Bruges i kurven, så ændr den ikke, når varen først er sat til salg.",
      options: { source: "name", maxLength: 60 },
      validation: (rule) => rule.required().error("Tryk på Generer for at lave en adresse."),
    }),
    defineField({
      name: "category",
      title: "Kategori",
      type: "reference",
      group: "varen",
      to: [{ type: "productCategory" }],
      description: "Den overskrift, varen står under i bagværket. Nye kategorier laver du under Bagværk, Kategorier.",
      validation: (rule) => rule.required().error("Vælg en kategori."),
    }),
    defineField({
      name: "priceOere",
      title: "Pris i øre",
      type: "number",
      group: "varen",
      description: "Skriv 5500 for 55 kr. og 4550 for 45,50 kr.",
      validation: (rule) => [
        rule.required().error("Skriv en pris.").integer().error("Kun hele tal, ingen komma.").min(0),
        rule
          .custom((value) => (typeof value === "number" && value > 0 && value < 100 ? "Er det kroner? 55 kr. skrives 5500." : true))
          .warning(),
      ],
    }),
    defineField({
      name: "description",
      title: "Beskrivelse",
      type: "text",
      rows: 3,
      group: "varen",
      description: "En eller to sætninger om varen. Står den tom, vises kun navn og pris.",
      validation: (rule) => rule.max(300),
    }),
    defineField({ name: "image", title: "Billede", type: "photo", group: "varen", description: "Et billede af varen. Højformat eller kvadrat ser bedst ud." }),
    defineField({
      name: "active",
      title: "Vis på siden",
      type: "boolean",
      group: "varen",
      initialValue: true,
      description: "Slå fra for at skjule varen uden at slette den.",
    }),
    defineField({
      name: "sort",
      title: "Rækkefølge",
      type: "number",
      group: "varen",
      initialValue: 100,
      description: "Lavt tal først i kategorien. 10, 20, 30 giver plads til at skyde noget ind.",
      validation: (rule) => rule.integer().min(0),
    }),
    defineField({
      name: "orderable",
      title: "Kan bestilles på siden",
      type: "boolean",
      group: "bestilling",
      initialValue: true,
      description: "Slå fra, hvis varen skal stå på siden med pris, men ikke kan bestilles lige nu.",
    }),
    deadlineOverrideField({
      group: "bestilling",
      fallsBackTo: "kategoriens frist, og ellers den almindelige frist fra Bageri og bestilling",
    }),
  ],
  orderings: [
    { title: "Rækkefølge", name: "sort", by: [{ field: "sort", direction: "asc" }, { field: "name", direction: "asc" }] },
    { title: "Navn", name: "name", by: [{ field: "name", direction: "asc" }] },
  ],
  preview: {
    select: { title: "name", price: "priceOere", active: "active", orderable: "orderable", category: "category.title", media: "image" },
    prepare({
      title,
      price,
      active,
      orderable,
      category,
      media,
    }: {
      title?: string;
      price?: number;
      active?: boolean;
      orderable?: boolean;
      category?: string;
      media?: PreviewMedia;
    }) {
      const state = active === false ? "skjult" : orderable === false ? "kan ikke bestilles" : null;
      return { title: title ?? "Vare", subtitle: [category, formatOere(price), state].filter(Boolean).join(", "), media };
    },
  },
});
