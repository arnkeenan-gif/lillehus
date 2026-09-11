/**
 * The building blocks of a page. Every page is a list of these, in the order
 * Kristine puts them. The site renders each `_type` with its own layout; see
 * src/lib/cms/types.ts for the shape the renderer gets.
 */
import { defineArrayMember, defineField, defineType } from "sanity";
import {
  BasketIcon,
  BillIcon,
  BlockContentIcon,
  BlockquoteIcon,
  CalendarIcon,
  ClockIcon,
  EnvelopeIcon,
  HelpCircleIcon,
  IceCreamIcon,
  ImageIcon,
  ImagesIcon,
  LaunchIcon,
  PackageIcon,
  PresentationIcon,
  ThLargeIcon,
  TrolleyIcon,
  UserIcon,
} from "../icons";
import { FORM_KIND_OPTIONS, LOCATION_FILTER_OPTIONS, TONE_OPTIONS } from "./constants";
import { sectionPreview, type PreviewMedia } from "./helpers";

const heading = (description = "Overskriften på afsnittet. Kan stå tom.") =>
  defineField({ name: "heading", title: "Overskrift", type: "string", description, validation: (rule) => rule.max(80) });

const text = (description = "Et kort stykke tekst under overskriften. Kan stå tomt.") =>
  defineField({ name: "text", title: "Tekst", type: "text", rows: 3, description });

const tone = defineField({
  name: "tone",
  title: "Baggrund",
  type: "string",
  options: { list: TONE_OPTIONS, layout: "radio" },
  initialValue: "paper",
  description: "Brug den tonede baggrund til at skille to afsnit fra hinanden, højst et par gange pr. side.",
});

export const heroSection = defineType({
  name: "heroSection",
  title: "Toppen af siden",
  type: "object",
  icon: PresentationIcon,
  fields: [
    defineField({
      name: "heading",
      title: "Overskrift",
      type: "string",
      description: "Sidens store overskrift. Højst otte ord.",
      validation: (rule) => rule.required().error("Skriv en overskrift.").max(80),
    }),
    text("En sætning under overskriften. Højst 25 ord."),
    defineField({ name: "image", title: "Billede", type: "photo", description: "Vises ved siden af teksten. Kan udelades." }),
    defineField({ name: "primaryLink", title: "Knap", type: "link", description: 'Den vigtigste knap, fx "Bestil brød".' }),
    defineField({ name: "secondaryLink", title: "Knap nummer to", type: "link", description: "En mindre knap ved siden af. Kan udelades." }),
  ],
  preview: sectionPreview("Toppen af siden"),
});

export const richTextSection = defineType({
  name: "richTextSection",
  title: "Tekst",
  type: "object",
  icon: BlockContentIcon,
  fields: [
    heading(),
    defineField({
      name: "body",
      title: "Tekst",
      type: "richText",
      validation: (rule) => rule.required().error("Skriv noget tekst i afsnittet."),
    }),
    defineField({ name: "image", title: "Billede", type: "photo", description: "Et billede ved siden af teksten. Kan udelades." }),
    defineField({
      name: "imagePosition",
      title: "Billedet står",
      type: "string",
      options: {
        list: [
          { title: "Til venstre for teksten", value: "left" },
          { title: "Til højre for teksten", value: "right" },
        ],
        layout: "radio",
      },
      initialValue: "right",
    }),
    tone,
  ],
  preview: sectionPreview("Tekst"),
});

export const photoBandSection = defineType({
  name: "photoBandSection",
  title: "Stort billede",
  type: "object",
  icon: ImageIcon,
  fields: [
    defineField({
      name: "image",
      title: "Billede",
      type: "photo",
      validation: (rule) => rule.required().error("Vælg et billede."),
    }),
    defineField({ name: "caption", title: "Billedtekst", type: "string", description: "En linje under billedet. Kan stå tom.", validation: (rule) => rule.max(120) }),
    defineField({
      name: "ratio",
      title: "Format",
      type: "string",
      options: {
        list: [
          { title: "Bredt (3:2)", value: "3/2" },
          { title: "Meget bredt (16:9)", value: "16/9" },
          { title: "Højt (4:5)", value: "4/5" },
        ],
        layout: "radio",
      },
      initialValue: "3/2",
    }),
  ],
  preview: {
    select: { caption: "caption", media: "image" },
    prepare({ caption, media }: { caption?: string; media?: PreviewMedia }) {
      return { title: caption || "Stort billede", subtitle: caption ? "Stort billede" : undefined, media };
    },
  },
});

export const gallerySection = defineType({
  name: "gallerySection",
  title: "Billedgalleri",
  type: "object",
  icon: ImagesIcon,
  fields: [
    heading(),
    defineField({
      name: "images",
      title: "Billeder",
      type: "array",
      of: [
        defineArrayMember({
          name: "galleryImage",
          title: "Billede",
          type: "object",
          fields: [
            defineField({ name: "image", title: "Billede", type: "photo", validation: (rule) => rule.required() }),
            defineField({ name: "caption", title: "Billedtekst", type: "string", validation: (rule) => rule.max(120) }),
          ],
          preview: {
            select: { title: "caption", alt: "image.alt", media: "image" },
            prepare({ title, alt, media }: { title?: string; alt?: string; media?: PreviewMedia }) {
              return { title: title || alt || "Billede", media };
            },
          },
        }),
      ],
      validation: (rule) => rule.min(1).error("Læg mindst et billede i galleriet."),
    }),
    defineField({
      name: "columns",
      title: "Billeder ved siden af hinanden",
      type: "number",
      options: {
        list: [
          { title: "2", value: 2 },
          { title: "3", value: 3 },
          { title: "4", value: 4 },
        ],
        layout: "radio",
        direction: "horizontal",
      },
      initialValue: 3,
      description: "På en telefon står de altid i en eller to kolonner.",
    }),
  ],
  preview: sectionPreview("Billedgalleri"),
});

export const productStripSection = defineType({
  name: "productStripSection",
  title: "Brød fra bageriet",
  type: "object",
  icon: BasketIcon,
  fields: [
    heading('Fx "Det bager vi".'),
    text("Står den tom, viser siden selv bestillingsfrist og afhentningsdage fra Bageri, afhentning og levering."),
    defineField({
      name: "mode",
      title: "Hvilke varer",
      type: "string",
      options: {
        list: [
          { title: "De første varer fra bageriet, automatisk", value: "auto" },
          { title: "Dem jeg vælger her", value: "manual" },
        ],
        layout: "radio",
      },
      initialValue: "auto",
    }),
    defineField({
      name: "products",
      title: "Varer",
      type: "array",
      of: [defineArrayMember({ type: "reference", to: [{ type: "product" }] })],
      hidden: ({ parent }) => (parent as { mode?: string } | undefined)?.mode !== "manual",
    }),
    defineField({
      name: "limit",
      title: "Højst så mange varer",
      type: "number",
      initialValue: 4,
      validation: (rule) => rule.required().integer().min(1).max(12),
    }),
    defineField({ name: "link", title: "Knap under varerne", type: "link", description: 'Fx "Bestil brød" til /bageri.' }),
  ],
  preview: sectionPreview("Brød fra bageriet"),
});

export const priceListSection = defineType({
  name: "priceListSection",
  title: "Prisliste",
  type: "object",
  icon: BillIcon,
  description: "En liste som på tavlen: navn, pris og en lille note pr. linje.",
  fields: [
    heading(),
    defineField({ name: "intro", title: "Indledning", type: "text", rows: 2, description: "Et par linjer over listen. Kan stå tom." }),
    defineField({
      name: "rows",
      title: "Linjer",
      type: "array",
      of: [
        defineArrayMember({
          name: "priceRow",
          title: "Linje",
          type: "object",
          fields: [
            defineField({ name: "name", title: "Navn", type: "string", validation: (rule) => rule.required().error("Skriv et navn.").max(80) }),
            defineField({
              name: "price",
              title: "Pris",
              type: "string",
              description: 'Skriv prisen som tekst, fx "275 kr. pr. kuvert" eller "fra 450 kr.".',
              validation: (rule) => rule.required().error("Skriv en pris.").max(40),
            }),
            defineField({ name: "note", title: "Note", type: "string", description: "En lille bemærkning under linjen. Kan stå tom.", validation: (rule) => rule.max(120) }),
          ],
          preview: { select: { title: "name", subtitle: "price" } },
        }),
      ],
      validation: (rule) => rule.min(1).error("Skriv mindst en linje."),
    }),
    defineField({ name: "footnote", title: "Fodnote", type: "string", description: "En linje under listen, fx om allergener. Kan stå tom.", validation: (rule) => rule.max(200) }),
  ],
  preview: sectionPreview("Prisliste"),
});

export const hoursSection = defineType({
  name: "hoursSection",
  title: "Åbningstider og steder",
  type: "object",
  icon: ClockIcon,
  description: "Viser stederne og tiderne fra Åbningstider og steder. Ret tiderne der, ikke her.",
  fields: [
    heading('Fx "Her får du fat i brødet".'),
    text(),
    defineField({
      name: "only",
      title: "Vis",
      type: "string",
      options: { list: LOCATION_FILTER_OPTIONS, layout: "radio" },
      initialValue: "alle",
    }),
    defineField({ name: "link", title: "Link under tiderne", type: "link", description: 'Fx "Se kort, kalender og hvordan du henter" til /find-os. Kan udelades.' }),
  ],
  preview: sectionPreview("Åbningstider og steder"),
});

export const eventsSection = defineType({
  name: "eventsSection",
  title: "Det sker",
  type: "object",
  icon: CalendarIcon,
  description: "Viser de næste datoer fra Arrangementer og kurser.",
  fields: [
    heading('Fx "Det sker" eller "Kommende arrangementer".'),
    text(),
    defineField({
      name: "showWeek",
      title: "Vis også den faste uge",
      type: "boolean",
      initialValue: false,
      description: "Sætter en tabel med de faste tider fra Åbningstider og steder over datoerne.",
    }),
    defineField({
      name: "emptyText",
      title: "Når kalenderen er tom",
      type: "text",
      rows: 3,
      description: "Den tekst, der står, når der ikke er nogen kommende datoer.",
    }),
    defineField({
      name: "limit",
      title: "Højst så mange datoer",
      type: "number",
      initialValue: 3,
      validation: (rule) => rule.required().integer().min(1).max(50),
    }),
    defineField({ name: "link", title: "Link under listen", type: "link", description: 'Fx "Se alle arrangementer" til /arrangementer. Kan udelades.' }),
  ],
  preview: sectionPreview("Det sker"),
});

export const faqSection = defineType({
  name: "faqSection",
  title: "Spørgsmål og svar",
  type: "object",
  icon: HelpCircleIcon,
  fields: [
    heading(),
    defineField({
      name: "mode",
      title: "Hvilke spørgsmål",
      type: "string",
      options: {
        list: [
          { title: "Alle, samlet i grupper", value: "all" },
          { title: "Kun dem jeg vælger her", value: "selected" },
        ],
        layout: "radio",
      },
      initialValue: "all",
    }),
    defineField({
      name: "items",
      title: "Spørgsmål",
      type: "array",
      of: [defineArrayMember({ type: "reference", to: [{ type: "faqItem" }] })],
      hidden: ({ parent }) => (parent as { mode?: string } | undefined)?.mode !== "selected",
    }),
  ],
  preview: sectionPreview("Spørgsmål og svar"),
});

export const instagramSection = defineType({
  name: "instagramSection",
  title: "Instagram-billeder",
  type: "object",
  icon: ThLargeIcon,
  description: "En stribe af billederne under Instagram-billeder, med et link til din Instagram-profil.",
  fields: [
    heading(),
    defineField({
      name: "linkLabel",
      title: "Tekst på linket",
      type: "string",
      initialValue: "Følg med på Instagram",
      validation: (rule) => rule.max(60),
    }),
    defineField({
      name: "limit",
      title: "Antal billeder",
      type: "number",
      initialValue: 6,
      description: "Seks passer i en række på en computer.",
      validation: (rule) => rule.required().integer().min(1).max(12),
    }),
  ],
  preview: sectionPreview("Instagram-billeder"),
});

export const ctaSection = defineType({
  name: "ctaSection",
  title: "Tekst med knap",
  type: "object",
  icon: LaunchIcon,
  fields: [
    heading(),
    text(),
    defineField({ name: "link", title: "Knap", type: "link", validation: (rule) => rule.required().error("Vælg, hvor knappen skal føre hen.") }),
    tone,
  ],
  preview: {
    select: { heading: "heading", label: "link.label" },
    prepare({ heading, label }: { heading?: string; label?: string }) {
      return { title: heading || label || "Tekst med knap", subtitle: "Tekst med knap" };
    },
  },
});

export const formSection = defineType({
  name: "formSection",
  title: "Formular",
  type: "object",
  icon: EnvelopeIcon,
  fields: [
    defineField({
      name: "kind",
      title: "Hvilken formular",
      type: "string",
      options: { list: FORM_KIND_OPTIONS, layout: "radio" },
      validation: (rule) => rule.required().error("Vælg en formular."),
    }),
    heading('Fx "Book pizzavognen". Kan stå tom.'),
    text("Et par linjer over formularen, fx hvornår Kristine svarer."),
    defineField({
      name: "steps",
      title: "Sådan går det videre",
      type: "array",
      of: [defineArrayMember({ type: "string" })],
      description: "Korte punkter, der står ved siden af formularen. Kan stå tom.",
    }),
  ],
  preview: {
    select: { heading: "heading", kind: "kind" },
    prepare({ heading, kind }: { heading?: string; kind?: string }) {
      const kindTitle = FORM_KIND_OPTIONS.find((k) => k.value === kind)?.title ?? "Formular";
      return { title: heading || kindTitle, subtitle: `Formular: ${kindTitle}` };
    },
  },
});

export const quoteSection = defineType({
  name: "quoteSection",
  title: "Citat",
  type: "object",
  icon: BlockquoteIcon,
  description: "Kun til rigtige citater fra rigtige mennesker, der har sagt ja til at blive citeret. Ingen opfundne anmeldelser.",
  fields: [
    defineField({
      name: "quote",
      title: "Citat",
      type: "text",
      rows: 3,
      validation: (rule) => rule.required().error("Skriv citatet.").max(400),
    }),
    defineField({
      name: "attribution",
      title: "Hvem sagde det",
      type: "string",
      description: 'Fx "Mette, Herlufmagle". Kun med personens tilladelse.',
      validation: (rule) => rule.max(80),
    }),
  ],
  preview: {
    select: { quote: "quote", attribution: "attribution" },
    prepare({ quote, attribution }: { quote?: string; attribution?: string }) {
      return { title: quote ? `"${quote.slice(0, 60)}${quote.length > 60 ? "..." : ""}"` : "Citat", subtitle: attribution || "Citat" };
    },
  },
});

export const cakeListSection = defineType({
  name: "cakeListSection",
  title: "Kager med fra-priser",
  type: "object",
  icon: IceCreamIcon,
  description: "Viser alle kager fra Kager på bestilling. Ret kagerne der, ikke her.",
  fields: [heading('Fx "Det kan du bestille".'), text()],
  preview: sectionPreview("Kager med fra-priser"),
});

export const pizzaSection = defineType({
  name: "pizzaSection",
  title: "Pizzavogn",
  type: "object",
  icon: TrolleyIcon,
  description: "En del af pizzavognens side. Selve priserne, pizzaerne og teksterne retter du under Pizzavogn i menuen.",
  fields: [
    defineField({
      name: "part",
      title: "Hvad skal vises",
      type: "string",
      options: {
        list: [
          { title: "Sådan foregår det (teksten om dagen)", value: "day" },
          { title: "Priser pr. kuvert og betingelser", value: "prices" },
          { title: "Pizzaerne og desserterne", value: "menu" },
          { title: "Praktisk (betingelserne)", value: "terms" },
        ],
        layout: "radio",
      },
      validation: (rule) => rule.required().error("Vælg, hvad afsnittet skal vise."),
    }),
    heading(),
    text(),
  ],
  preview: {
    select: { heading: "heading", part: "part" },
    prepare({ heading, part }: { heading?: string; part?: string }) {
      const parts: Record<string, string> = { day: "Sådan foregår det", prices: "Priser", menu: "Pizzaer og desserter", terms: "Praktisk" };
      const partTitle = parts[part ?? ""] ?? "Pizzavogn";
      return { title: heading || partTitle, subtitle: `Pizzavogn: ${partTitle}` };
    },
  },
});

export const pickupInfoSection = defineType({
  name: "pickupInfoSection",
  title: "Sådan henter du",
  type: "object",
  icon: PackageIcon,
  description: "Skriver selv afhentningsdage, frist, fryser og levering ud fra Bageri, afhentning og levering og Åbningstider og steder.",
  fields: [
    heading('Fx "Sådan henter du bestilt brød".'),
    defineField({
      name: "detail",
      title: "Længde",
      type: "string",
      options: {
        list: [
          { title: "Kort (til Find os)", value: "kort" },
          { title: "Udførlig (til siden om levering)", value: "udførlig" },
        ],
        layout: "radio",
      },
      initialValue: "kort",
    }),
    text("Et par linjer, der står før den automatiske tekst. Kan stå tom."),
    defineField({ name: "link", title: "Link under teksten", type: "link", description: 'Fx "Læs mere om afhentning og levering" til /levering. Kan udelades.' }),
  ],
  preview: sectionPreview("Sådan henter du"),
});

export const contactSection = defineType({
  name: "contactSection",
  title: "Telefon og mail",
  type: "object",
  icon: UserIcon,
  description: "Overskrift, tekst og telefonnummer og mail fra Indstillinger.",
  fields: [heading('Fx "Kontakt".'), text()],
  preview: sectionPreview("Telefon og mail"),
});

export const sectionTypes = [
  heroSection,
  richTextSection,
  photoBandSection,
  gallerySection,
  productStripSection,
  priceListSection,
  hoursSection,
  eventsSection,
  faqSection,
  instagramSection,
  ctaSection,
  formSection,
  quoteSection,
  cakeListSection,
  pizzaSection,
  pickupInfoSection,
  contactSection,
];

/** The `_type` names, in the order they appear in the "add section" menu. */
export const SECTION_TYPE_NAMES = sectionTypes.map((t) => t.name);
