import { defineArrayMember, defineField, defineType } from "sanity";
import { DocumentIcon } from "../../icons";
import { SECTION_TYPE_NAMES } from "../sections";

export const page = defineType({
  name: "page",
  title: "Side",
  type: "document",
  icon: DocumentIcon,
  groups: [
    { name: "indhold", title: "Indhold", default: true },
    { name: "menu", title: "Menu og søgning" },
  ],
  fields: [
    defineField({
      name: "title",
      title: "Sidens navn",
      type: "string",
      group: "indhold",
      description: "Bruges i browserens faneblad og i Studio. Selve overskriften på siden skriver du i det første afsnit.",
      validation: (rule) => rule.required().error("Giv siden et navn.").max(80),
    }),
    defineField({
      name: "slug",
      title: "Adresse",
      type: "slug",
      group: "indhold",
      description: 'Det, der står efter skråstregen i adressen, fx "om-os". Forsiden hedder "forside". Ændr ikke adressen på en side, andre linker til.',
      options: { source: "title", maxLength: 60 },
      validation: (rule) => rule.required().error("Siden skal have en adresse. Tryk på Generer."),
    }),
    defineField({
      name: "sections",
      title: "Afsnit",
      type: "array",
      group: "indhold",
      description: "Siden består af afsnit, oppefra og ned. Træk i dem for at bytte om, og tryk på plusset for at lægge et nyt til.",
      of: SECTION_TYPE_NAMES.map((name) => defineArrayMember({ type: name })),
    }),

    defineField({
      name: "showInNav",
      title: "Vis i menuen",
      type: "boolean",
      group: "menu",
      initialValue: false,
      description: "Menuen har plads til syv sider. Sider, der ikke er i menuen, kan stadig linkes til fra sidefoden og fra andre sider.",
    }),
    defineField({
      name: "navLabel",
      title: "Navn i menuen",
      type: "string",
      group: "menu",
      description: 'Kort, fx "Bageri". Står der ikke noget, bruges sidens navn.',
      validation: (rule) => rule.max(20),
    }),
    defineField({
      name: "navOrder",
      title: "Plads i menuen",
      type: "number",
      group: "menu",
      description: "Lavt tal først. 10, 20, 30 giver plads til at skyde noget ind senere.",
      initialValue: 100,
      validation: (rule) => rule.integer().min(0),
    }),
    defineField({
      name: "hidden",
      title: "Skjul siden",
      type: "boolean",
      group: "menu",
      initialValue: false,
      description: "Siden svarer med Siden findes ikke, indtil du slår det fra igen. Til sider, der ikke er færdige.",
    }),
    defineField({
      name: "seo",
      title: "Søgemaskiner og deling",
      type: "object",
      group: "menu",
      description: "Det, Google og Facebook viser, når nogen finder eller deler siden. Kan stå tomt, så bruges sidens navn og første tekst.",
      fields: [
        defineField({ name: "title", title: "Titel", type: "string", description: "Højst 60 tegn.", validation: (rule) => rule.max(70) }),
        defineField({ name: "description", title: "Beskrivelse", type: "text", rows: 3, description: "En eller to sætninger, højst 160 tegn.", validation: (rule) => rule.max(170) }),
        defineField({ name: "image", title: "Billede ved deling", type: "photo", description: "Et bredt billede. Ellers bruges sidens første billede." }),
      ],
    }),
  ],
  orderings: [
    { title: "Plads i menuen", name: "navOrder", by: [{ field: "navOrder", direction: "asc" }, { field: "title", direction: "asc" }] },
    { title: "Navn", name: "title", by: [{ field: "title", direction: "asc" }] },
  ],
  preview: {
    select: { title: "title", slug: "slug.current", hidden: "hidden", showInNav: "showInNav" },
    prepare({ title, slug, hidden, showInNav }: { title?: string; slug?: string; hidden?: boolean; showInNav?: boolean }) {
      const flags = [hidden ? "skjult" : null, showInNav ? "i menuen" : null].filter(Boolean).join(", ");
      return { title: title ?? "Side", subtitle: [slug ? `/${slug === "forside" ? "" : slug}` : "", flags].filter(Boolean).join("  ") };
    },
  },
});
