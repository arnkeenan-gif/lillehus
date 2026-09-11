import { defineArrayMember, defineField, defineType } from "sanity";
import { TrolleyIcon } from "../../icons";
import { formatOere } from "../helpers";

export const pizzaSettings = defineType({
  name: "pizzaSettings",
  title: "Pizzavogn",
  type: "document",
  icon: TrolleyIcon,
  groups: [
    { name: "tekst", title: "Tekster", default: true },
    { name: "priser", title: "Priser" },
    { name: "menu", title: "Pizzaer og desserter" },
    { name: "praktisk", title: "Praktisk" },
  ],
  fields: [
    defineField({
      name: "intro",
      title: "Indledning",
      type: "text",
      rows: 3,
      group: "tekst",
      description: "Den første sætning på pizzavognens side og i bookingmailen.",
      validation: (rule) => rule.required().error("Skriv en indledning.").max(400),
    }),
    defineField({
      name: "day",
      title: "Sådan foregår det",
      type: "array",
      group: "tekst",
      of: [defineArrayMember({ type: "text", rows: 4 })],
      description: "Et afsnit pr. felt. Fortæl, hvordan dagen forløber, fra I kommer, til I kører igen.",
    }),
    defineField({
      name: "areaNote",
      title: "Hvor vi kører",
      type: "string",
      group: "tekst",
      description: 'Fx "Vi kører på Sjælland, Fyn og Lolland-Falster."',
      validation: (rule) => rule.max(200),
    }),
    defineField({
      name: "radiusKm",
      title: "Normal afstand i km",
      type: "number",
      group: "tekst",
      description: "Bruges i bookingformularens tekst.",
      initialValue: 40,
      validation: (rule) => rule.integer().min(0),
    }),
    defineField({
      name: "notes",
      title: "Små bemærkninger",
      type: "array",
      group: "tekst",
      of: [defineArrayMember({ type: "string" })],
      description: 'Fx "Oplysninger om allergener fås ved forespørgsel." Vises under priserne.',
    }),

    defineField({
      name: "packages",
      title: "Tilbud",
      type: "array",
      group: "priser",
      of: [
        defineArrayMember({
          name: "pizzaPackage",
          title: "Tilbud",
          type: "object",
          fields: [
            defineField({ name: "id", title: "Kort navn til siden", type: "string", description: 'Ændr det ikke uden grund, fx "ad-libitum".', validation: (rule) => rule.required().regex(/^[a-z0-9-]+$/, { name: "små bogstaver" }) }),
            defineField({ name: "name", title: "Navn", type: "string", validation: (rule) => rule.required().error("Skriv et navn.") }),
            defineField({ name: "description", title: "Beskrivelse", type: "text", rows: 2 }),
            defineField({ name: "pricePerPersonOere", title: "Pris pr. voksen i øre", type: "number", description: "Skriv 27500 for 275 kr.", validation: (rule) => rule.integer().min(0) }),
            defineField({ name: "minGuests", title: "Mindste antal voksne", type: "number", initialValue: 40, validation: (rule) => rule.required().integer().min(1) }),
            defineField({ name: "includes", title: "Det er med i prisen", type: "array", of: [defineArrayMember({ type: "string" })] }),
          ],
          preview: {
            select: { title: "name", price: "pricePerPersonOere" },
            prepare({ title, price }: { title?: string; price?: number }) {
              return { title: title ?? "Tilbud", subtitle: price ? `${formatOere(price)} pr. voksen` : undefined };
            },
          },
        }),
      ],
      validation: (rule) => rule.min(1).error("Der skal være mindst et tilbud. Det første bruges som hovedtilbud."),
    }),
    defineField({
      name: "prices",
      title: "Andre priser",
      type: "object",
      group: "priser",
      fields: [
        defineField({ name: "childOere", title: "Barn i øre", type: "number", description: "Skriv 17500 for 175 kr.", validation: (rule) => rule.required().integer().min(0) }),
        defineField({ name: "childAges", title: "Barn er", type: "string", description: 'Fx "0 til 7 år".', validation: (rule) => rule.required() }),
        defineField({ name: "specialDietExtraOere", title: "Tillæg for vegansk eller glutenfri, i øre", type: "number", description: "Pr. kuvert. Skriv 2500 for 25 kr.", validation: (rule) => rule.required().integer().min(0) }),
        defineField({ name: "dessertOere", title: "Dessert pr. kuvert i øre", type: "number", description: "Skriv 7500 for 75 kr.", validation: (rule) => rule.required().integer().min(0) }),
        defineField({ name: "dessertMinCovers", title: "Dessert til mindst så mange", type: "number", initialValue: 12, validation: (rule) => rule.required().integer().min(1) }),
        defineField({ name: "mileagePerKmOere", title: "Kørsel pr. km i øre", type: "number", description: "Skriv 400 for 4 kr.", validation: (rule) => rule.required().integer().min(0) }),
        defineField({ name: "mileageNote", title: "Note om kørsel", type: "string", description: 'Fx "plus eventuelle bropenge".' }),
      ],
    }),

    defineField({
      name: "pizzas",
      title: "Pizzaer",
      type: "array",
      group: "menu",
      of: [
        defineArrayMember({
          name: "pizzaItem",
          title: "Pizza",
          type: "object",
          fields: [
            defineField({ name: "name", title: "Pizza", type: "string", description: "Fyldet, adskilt med komma.", validation: (rule) => rule.required().error("Skriv, hvad der er på pizzaen.") }),
            defineField({ name: "vegetarian", title: "Vegetarisk", type: "boolean", initialValue: false }),
          ],
          preview: {
            select: { title: "name", vegetarian: "vegetarian" },
            prepare({ title, vegetarian }: { title?: string; vegetarian?: boolean }) {
              return { title: title ?? "Pizza", subtitle: vegetarian ? "vegetarisk" : undefined };
            },
          },
        }),
      ],
      validation: (rule) => rule.min(1).error("Skriv mindst en pizza."),
    }),
    defineField({
      name: "desserts",
      title: "Desserter",
      type: "array",
      group: "menu",
      of: [defineArrayMember({ type: "string" })],
    }),

    defineField({
      name: "terms",
      title: "Praktisk",
      type: "array",
      group: "praktisk",
      of: [defineArrayMember({ type: "text", rows: 4 })],
      description: "Et afsnit pr. felt: vand og strøm, plads til traileren, depositum.",
    }),
  ],
  preview: {
    prepare: () => ({ title: "Pizzavogn", subtitle: "Priser, pizzaer, desserter og betingelser" }),
  },
});
