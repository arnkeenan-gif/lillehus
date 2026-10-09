import { defineArrayMember, defineField, defineType } from "sanity";
import { CalendarIcon, TrolleyIcon } from "../../icons";
import { formatOere, type PreviewMedia } from "../helpers";

/** "11.00", "9.30" or "11:00". */
const CLOCK = /^([01]?\d|2[0-3])[.:][0-5]\d$/;

/** Name, description, photo, price and whether it is on the menu: shared by pizzas and desserts. */
function menuItemFields(kind: "pizza" | "dessert") {
  const pizza = kind === "pizza";
  return [
    defineField({
      name: "name",
      title: pizza ? "Pizza" : "Dessert",
      type: "string",
      description: pizza ? 'Fyldet, adskilt med komma, fx "Tomat, mozzarella og basilikum".' : 'Fx "Citrontærte".',
      validation: (rule) => rule.required().error(pizza ? "Skriv, hvad der er på pizzaen." : "Skriv dessertens navn.").max(140),
    }),
    defineField({
      name: "description",
      title: "Beskrivelse",
      type: "text",
      rows: 2,
      description: "Et par ord mere, hvis der er brug for det. Kan stå tom.",
      validation: (rule) => rule.max(300),
    }),
    defineField({
      name: "image",
      title: "Billede",
      type: "photo",
      description: "Vises over listen på pizzavognens side. Kan udelades.",
    }),
    defineField({
      name: "priceOere",
      title: pizza ? "Pris pr. pizza i øre" : "Pris pr. kuvert i øre",
      type: "number",
      description: pizza
        ? "Kun hvis pizzaen har sin egen pris. Skriv 9500 for 95 kr. Til arrangementer er prisen pr. kuvert, så feltet kan stå tomt."
        : "Skriv 7500 for 75 kr. Står feltet tomt, gælder dessertprisen under Priser.",
      validation: (rule) => rule.integer().min(0),
    }),
    ...(pizza ? [defineField({ name: "vegetarian", title: "Vegetarisk", type: "boolean", initialValue: false })] : []),
    defineField({
      name: "available",
      title: "Tilgængelig",
      type: "boolean",
      initialValue: true,
      description: pizza
        ? "Slå fra for at skjule pizzaen på siden og i bookingformularen uden at slette den."
        : "Slå fra for at skjule desserten på siden og i bookingformularen uden at slette den.",
    }),
  ];
}

function menuItemPreview(fallbackTitle: string) {
  return {
    select: { title: "name", vegetarian: "vegetarian", price: "priceOere", available: "available", media: "image" },
    prepare({ title, vegetarian, price, available, media }: { title?: string; vegetarian?: boolean; price?: number; available?: boolean; media?: PreviewMedia }) {
      const notes = [vegetarian ? "vegetarisk" : null, typeof price === "number" ? formatOere(price) : null, available === false ? "skjult" : null];
      return { title: title ?? fallbackTitle, subtitle: notes.filter(Boolean).join(", ") || undefined, media };
    },
  };
}

/** "lørdag den 17. oktober 2026" for previews. */
function previewDate(iso: string | undefined): string {
  if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return "";
  return new Intl.DateTimeFormat("da-DK", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${iso}T12:00:00Z`));
}

export const pizzaSettings = defineType({
  name: "pizzaSettings",
  title: "Pizzavogn",
  type: "document",
  icon: TrolleyIcon,
  groups: [
    { name: "tekst", title: "Tekster", default: true },
    { name: "priser", title: "Priser" },
    { name: "menu", title: "Pizzaer og desserter" },
    { name: "steder", title: "Steder og datoer" },
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
      description: "Pizzaerne på siden og i bookingformularen, i den rækkefølge de står her. Man vælger tre til et arrangement.",
      of: [
        defineArrayMember({
          name: "pizzaItem",
          title: "Pizza",
          type: "object",
          fields: menuItemFields("pizza"),
          preview: menuItemPreview("Pizza"),
        }),
      ],
      validation: (rule) => rule.min(1).error("Skriv mindst en pizza."),
    }),
    defineField({
      name: "desserts",
      title: "Desserter",
      type: "array",
      group: "menu",
      description: "Desserter, der kan tilkøbes til pizzaerne.",
      of: [
        defineArrayMember({
          name: "dessertItem",
          title: "Dessert",
          type: "object",
          fields: menuItemFields("dessert"),
          preview: menuItemPreview("Dessert"),
        }),
      ],
    }),

    defineField({
      name: "schedule",
      title: "Steder og datoer",
      type: "array",
      group: "steder",
      description:
        "Hvor og hvornår pizzavognen står, så man kan komme forbi. Listen vises på pizzavognens side, når der står noget i den, og datoer, der er passeret, forsvinder af sig selv.",
      of: [
        defineArrayMember({
          name: "pizzaStop",
          title: "Sted og dato",
          type: "object",
          icon: CalendarIcon,
          fields: [
            defineField({ name: "place", title: "Sted", type: "string", description: "Fx navnet på markedet og byen.", validation: (rule) => rule.required().error("Skriv stedet.").max(120) }),
            defineField({
              name: "date",
              title: "Dato",
              type: "date",
              options: { dateFormat: "D. MMMM YYYY" },
              validation: (rule) => rule.required().error("Vælg en dato."),
            }),
            defineField({
              name: "from",
              title: "Åbner kl.",
              type: "string",
              description: 'Fx "11.00". Kan stå tom.',
              validation: (rule) => rule.custom((v) => (!v || CLOCK.test(v) ? true : 'Skriv tiden som "11.00".')),
            }),
            defineField({
              name: "to",
              title: "Lukker kl.",
              type: "string",
              description: 'Fx "15.00". Kan stå tom.',
              validation: (rule) => rule.custom((v) => (!v || CLOCK.test(v) ? true : 'Skriv tiden som "15.00".')),
            }),
            defineField({ name: "note", title: "Note", type: "string", description: 'Fx "Eller til vi er udsolgt". Kan stå tom.', validation: (rule) => rule.max(160) }),
          ],
          preview: {
            select: { place: "place", date: "date", from: "from", to: "to" },
            prepare({ place, date, from, to }: { place?: string; date?: string; from?: string; to?: string }) {
              const time = from ? ` kl. ${from}${to ? ` til ${to}` : ""}` : "";
              return { title: place || "Sted", subtitle: `${previewDate(date)}${time}` || undefined };
            },
          },
        }),
      ],
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
    prepare: () => ({ title: "Pizzavogn", subtitle: "Priser, pizzaer, desserter, steder og datoer" }),
  },
});
