import { defineField, defineType } from "sanity";
import { CogIcon } from "../../icons";

export const siteSettings = defineType({
  name: "siteSettings",
  title: "Indstillinger",
  type: "document",
  icon: CogIcon,
  groups: [
    { name: "grund", title: "Om stedet", default: true },
    { name: "kontakt", title: "Kontakt og adresse" },
    { name: "some", title: "Facebook og Instagram" },
    { name: "besked", title: "Besked øverst på siden" },
    { name: "sidefod", title: "Sidefod og mail" },
  ],
  fields: [
    defineField({
      name: "name",
      title: "Navn",
      type: "string",
      group: "grund",
      description: "Står øverst på hver side og i browserens faneblad.",
      validation: (rule) => rule.required().error("Skriv stedets navn.").max(60),
    }),
    defineField({
      name: "shortName",
      title: "Kort navn",
      type: "string",
      group: "grund",
      description: 'Bruges hvor der er lidt plads, fx "Det lille hus".',
      validation: (rule) => rule.max(30),
    }),
    defineField({
      name: "tagline",
      title: "En linje om stedet",
      type: "string",
      group: "grund",
      description: "Vises i søgeresultater og når nogen deler siden. Højst 25 ord.",
      validation: (rule) => rule.max(160),
    }),
    defineField({ name: "owner", title: "Ejer", type: "string", group: "grund", description: "Dit fulde navn, som det står i CVR." }),
    defineField({ name: "founded", title: "Startet i år", type: "number", group: "grund", validation: (rule) => rule.integer().min(1900).max(2100) }),
    defineField({ name: "cvr", title: "CVR-nummer", type: "string", group: "grund", validation: (rule) => rule.required().error("Skriv CVR-nummeret.").regex(/^\d{8}$/, { name: "otte cifre" }).error("Et CVR-nummer har otte cifre.") }),
    defineField({
      name: "logo",
      title: "Logo",
      type: "photo",
      group: "grund",
      description: "Det håndtegnede logo som PNG med gennemsigtig baggrund. Bruges i sidefoden og på Om os.",
    }),

    defineField({
      name: "address",
      title: "Adresse",
      type: "object",
      group: "kontakt",
      fields: [
        defineField({ name: "street", title: "Vej og nummer", type: "string", validation: (rule) => rule.required() }),
        defineField({ name: "postalCode", title: "Postnummer", type: "string", validation: (rule) => rule.required().regex(/^\d{4}$/, { name: "fire cifre" }).error("Et postnummer har fire cifre.") }),
        defineField({ name: "city", title: "By", type: "string", validation: (rule) => rule.required() }),
        defineField({ name: "country", title: "Land", type: "string", initialValue: "Danmark" }),
      ],
    }),
    defineField({
      name: "phone",
      title: "Telefon",
      type: "string",
      group: "kontakt",
      description: 'Som det skal vises, fx "22 59 44 93".',
      validation: (rule) => rule.required().error("Skriv et telefonnummer."),
    }),
    defineField({
      name: "email",
      title: "E-mail",
      type: "string",
      group: "kontakt",
      description: "Den adresse, kunder kan skrive til.",
      validation: (rule) => rule.required().email().error("Skriv en gyldig mailadresse."),
    }),
    defineField({
      name: "url",
      title: "Sidens adresse",
      type: "url",
      group: "kontakt",
      description: "Fx https://www.detlillehuspaalandet.net",
      validation: (rule) => rule.uri({ scheme: ["https"] }),
    }),
    defineField({
      name: "smileyUrl",
      title: "Link til kontrolrapporten",
      type: "url",
      group: "kontakt",
      description: "Din side på findsmiley.dk. Vises i sidefoden og på Om os.",
      validation: (rule) => rule.uri({ scheme: ["https"] }),
    }),

    defineField({
      name: "social",
      title: "Facebook og Instagram",
      type: "object",
      group: "some",
      fields: [
        defineField({ name: "facebook", title: "Facebook", type: "url", validation: (rule) => rule.uri({ scheme: ["https"] }) }),
        defineField({ name: "instagram", title: "Instagram", type: "url", validation: (rule) => rule.uri({ scheme: ["https"] }) }),
        defineField({ name: "instagramHandle", title: "Instagram-brugernavn", type: "string", description: "Uden @, fx detlillehuspaalandet." }),
        defineField({ name: "pinterest", title: "Pinterest", type: "url", validation: (rule) => rule.uri({ scheme: ["https"] }) }),
        defineField({ name: "linktree", title: "Linktree", type: "url", validation: (rule) => rule.uri({ scheme: ["https"] }) }),
      ],
    }),

    defineField({
      name: "announcement",
      title: "Besked øverst på siden",
      type: "object",
      group: "besked",
      description: 'En smal bjælke under menuen, fx "Lukket i uge 42" eller "Fryseren er fyldt op igen". Slå den til, når der er noget at sige.',
      fields: [
        defineField({ name: "enabled", title: "Vis beskeden", type: "boolean", initialValue: false }),
        defineField({ name: "text", title: "Besked", type: "string", validation: (rule) => rule.max(140) }),
      ],
    }),

    defineField({
      name: "footerText",
      title: "Tekst i sidefoden",
      type: "text",
      rows: 2,
      group: "sidefod",
      description: "En linje eller to nederst på hver side. Kan stå tom.",
      validation: (rule) => rule.max(300),
    }),
    defineField({
      name: "orderEmailTo",
      title: "Bestillinger sendes til",
      type: "string",
      group: "sidefod",
      description: "Den mail, der får brødbestillinger og forespørgsler. Normalt din egen.",
      validation: (rule) => rule.required().email().error("Skriv en gyldig mailadresse."),
    }),
  ],
  preview: {
    prepare: () => ({ title: "Indstillinger", subtitle: "Navn, kontakt, sociale medier, besked øverst" }),
  },
});
