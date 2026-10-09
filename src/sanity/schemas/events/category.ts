import { defineField, defineType } from "sanity";
import { TagIcon } from "@sanity/icons/Tag";
import { danishSlugify, slugValidation } from "./fields";

/**
 * A subcategory of Arrangementer: "Arrangementer på gården", "Kurser",
 * "Øvrige arrangementer", and whatever Kristine adds. Each one gets a link
 * over the calendar and its own page, /arrangementer/kategori/<adresse>.
 */
export const eventCategory = defineType({
  name: "eventCategory",
  title: "Kategori for arrangementer",
  type: "document",
  icon: TagIcon,
  fields: [
    defineField({
      name: "title",
      title: "Navn",
      type: "string",
      description: 'Fx "Kurser". Står i menuen over kalenderen og som overskrift på kategoriens side.',
      validation: (rule) => rule.required().error("Skriv kategoriens navn.").max(60),
    }),
    defineField({
      name: "slug",
      title: "Adresse",
      type: "slug",
      description: "Laves ud fra navnet med knappen Generer. Kategoriens side får adressen /arrangementer/kategori/ og så det, der står her.",
      options: { source: "title", maxLength: 60, slugify: (input: string) => danishSlugify(input) },
      validation: (rule) => slugValidation(rule),
    }),
    defineField({
      name: "intro",
      title: "Kort tekst",
      type: "text",
      rows: 3,
      description: "Et par sætninger øverst på kategoriens side. Kan stå tom.",
      validation: (rule) => rule.max(400),
    }),
    defineField({
      name: "sort",
      title: "Rækkefølge",
      type: "number",
      description: "Lavest tal står først i menuen over kalenderen, fx 10, 20, 30.",
      initialValue: 100,
      validation: (rule) => rule.integer().min(0),
    }),
  ],
  orderings: [
    {
      title: "Rækkefølge",
      name: "sort",
      by: [
        { field: "sort", direction: "asc" },
        { field: "title", direction: "asc" },
      ],
    },
  ],
  preview: {
    select: { title: "title", slug: "slug.current" },
    prepare({ title, slug }: { title?: string; slug?: string }) {
      return {
        title: title || "Kategori uden navn",
        subtitle: slug ? `/arrangementer/kategori/${slug}` : "Mangler en adresse",
      };
    },
  },
});
