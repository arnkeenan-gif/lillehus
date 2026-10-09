import { defineField, defineType } from "sanity";
import { CalendarIcon } from "@sanity/icons/Calendar";
import { formatDateTime, formatOere, type PreviewMedia } from "../helpers";
import { EVENT_SLUG_RESERVED, danishSlugify, slugValidation } from "./fields";

type EventDocument = { signup?: boolean; priceOere?: number; payment?: boolean; start?: string };

/**
 * One event: a day in the garden, a course, a market. It shows in the
 * calendar on /arrangementer and gets its own page, /arrangementer/<adresse>,
 * with sign-up (free, or paid with Stripe) when Kristine turns it on.
 */
export const event = defineType({
  name: "event",
  title: "Arrangement",
  type: "document",
  icon: CalendarIcon,
  fieldsets: [
    { name: "time", title: "Tid og sted" },
    {
      name: "signup",
      title: "Tilmelding og betaling",
      description: "Slå tilmelding til, hvis gæsterne skal melde sig på siden. Med en pris og betaling slået til betaler de med det samme.",
    },
  ],
  fields: [
    defineField({
      name: "title",
      title: "Navn",
      type: "string",
      description: 'Det, der står i kalenderen og som overskrift, fx "Åben dørene til haven og huset".',
      validation: (rule) => rule.required().error("Skriv, hvad arrangementet hedder.").max(80),
    }),
    defineField({
      name: "slug",
      title: "Adresse",
      type: "slug",
      description: "Laves ud fra navnet med knappen Generer. Arrangementet får adressen /arrangementer/ og så det, der står her.",
      options: { source: "title", maxLength: 60, slugify: (input: string) => danishSlugify(input) },
      validation: (rule) => slugValidation(rule, EVENT_SLUG_RESERVED),
    }),
    defineField({
      name: "category",
      title: "Kategori",
      type: "reference",
      to: [{ type: "eventCategory" }],
      description: "Hvor arrangementet hører til. En ny kategori kan laves her eller under Arrangementer, Kategorier.",
      validation: (rule) => rule.required().error("Vælg en kategori."),
    }),
    defineField({
      name: "summary",
      title: "Kort beskrivelse",
      type: "text",
      rows: 2,
      description: "En eller to linjer, der står i listen under kalenderen og når siden deles. Kan stå tom.",
      validation: (rule) => rule.max(200),
    }),
    defineField({
      name: "description",
      title: "Beskrivelse",
      type: "richText",
      description: "Står på arrangementets side: hvad der sker, og hvad man skal vide.",
    }),
    defineField({
      name: "image",
      title: "Billede",
      type: "photo",
      description: "Står øverst på arrangementets side. Kan udelades.",
    }),
    defineField({
      name: "start",
      title: "Starter",
      type: "datetime",
      fieldset: "time",
      options: { timeStep: 15 },
      description: "Dato og klokkeslæt. Står klokken på 00.00, vises kun datoen.",
      validation: (rule) => rule.required().error("Vælg dato og klokkeslæt."),
    }),
    defineField({
      name: "end",
      title: "Slutter",
      type: "datetime",
      fieldset: "time",
      options: { timeStep: 15 },
      description: "Kan udelades. Arrangementet forsvinder fra kalenderen, når det er slut, og siden siger, at det har fundet sted.",
      validation: (rule) => rule.min(rule.valueOfField("start")).error("Slutter skal ligge efter Starter."),
    }),
    defineField({
      name: "place",
      title: "Sted",
      type: "string",
      fieldset: "time",
      initialValue: "Torpevej 10, 4160 Herlufmagle",
      validation: (rule) => rule.required().error("Skriv, hvor det foregår.").max(120),
    }),
    defineField({
      name: "signup",
      title: "Tilmelding på siden",
      type: "boolean",
      fieldset: "signup",
      initialValue: false,
      description: "Slå til for at vise Tilmeld dig på arrangementets side. Tilmeldingen kommer til dig på mail.",
    }),
    defineField({
      name: "priceOere",
      title: "Pris pr. person i øre",
      type: "number",
      fieldset: "signup",
      description: "Skriv 15000 for 150 kr. Tom eller 0 betyder, at der ikke står nogen pris.",
      validation: (rule) => [
        rule.integer().error("Skriv et helt tal i øre.").min(0),
        rule
          .custom((value: number | undefined) =>
            typeof value === "number" && value > 0 && value < 1000 ? `Det er ${formatOere(value)}. Er prisen skrevet i øre?` : true,
          )
          .warning(),
      ],
    }),
    defineField({
      name: "payment",
      title: "Betaling ved tilmelding",
      type: "boolean",
      fieldset: "signup",
      initialValue: false,
      description:
        "Gæsten betaler prisen gange antal personer med det samme, gennem Stripe. Kræver en pris. Uden Stripe på siden står dit telefonnummer i stedet.",
      hidden: ({ document }) => !(document as EventDocument | undefined)?.signup,
      validation: (rule) =>
        rule.custom((value: boolean | undefined, context) => {
          const doc = context.document as EventDocument | undefined;
          if (value && doc?.signup && !(doc.priceOere && doc.priceOere > 0)) return "Skriv en pris, eller slå betaling fra.";
          return true;
        }),
    }),
    defineField({
      name: "signupDeadline",
      title: "Sidste frist for tilmelding",
      type: "datetime",
      fieldset: "signup",
      options: { timeStep: 15 },
      description: "Kan udelades; så lukker tilmeldingen, når arrangementet starter.",
      hidden: ({ document }) => !(document as EventDocument | undefined)?.signup,
    }),
    defineField({
      name: "capacity",
      title: "Antal pladser",
      type: "number",
      fieldset: "signup",
      description:
        "Står på siden som information, og én tilmelding kan højst være til så mange. Siden tæller ikke tilmeldingerne sammen, så hold selv øje med, hvornår der er fuldt.",
      validation: (rule) => rule.integer().min(1),
    }),
    defineField({
      name: "hidden",
      title: "Skjul arrangementet",
      type: "boolean",
      initialValue: false,
      description: "Slå til for at fjerne arrangementet fra siden uden at slette det.",
    }),
  ],
  orderings: [
    { title: "Dato, nyeste først", name: "startDesc", by: [{ field: "start", direction: "desc" }] },
    { title: "Dato, ældste først", name: "startAsc", by: [{ field: "start", direction: "asc" }] },
  ],
  preview: {
    select: {
      title: "title",
      start: "start",
      category: "category.title",
      hidden: "hidden",
      price: "priceOere",
      signup: "signup",
      payment: "payment",
      media: "image",
    },
    prepare({
      title,
      start,
      category,
      hidden,
      price,
      signup,
      payment,
      media,
    }: {
      title?: string;
      start?: string;
      category?: string;
      hidden?: boolean;
      price?: number;
      signup?: boolean;
      payment?: boolean;
      media?: PreviewMedia;
    }) {
      const facts = [
        formatDateTime(start),
        category,
        price ? formatOere(price) : "",
        signup ? (payment && price ? "betaling" : "tilmelding") : "",
      ].filter(Boolean);
      return {
        title: `${hidden ? "Skjult: " : ""}${title || "Arrangement uden navn"}`,
        subtitle: facts.join(", "),
        media: media ?? CalendarIcon,
      };
    },
  },
});
