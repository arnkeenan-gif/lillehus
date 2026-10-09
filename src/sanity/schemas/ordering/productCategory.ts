import { defineField, defineType } from "sanity";
import { TagIcon } from "@sanity/icons/Tag";
import { deadlineOverrideField, deadlineSummary, type DeadlineValue } from "./deadline";

/** A heading in the bagværk shop. Kristine can add as many as she likes; one without products is not shown. */
export const productCategory = defineType({
  name: "productCategory",
  title: "Kategori",
  type: "document",
  icon: TagIcon,
  fields: [
    defineField({
      name: "title",
      title: "Navn",
      type: "string",
      description: 'Overskriften i bagværket, fx "Rugbrød" eller "Croissanter og wienerbrød".',
      validation: (rule) => rule.required().error("Skriv kategoriens navn.").max(60),
    }),
    defineField({
      name: "slug",
      title: "Adresse",
      type: "slug",
      description: "Laves ud fra navnet med knappen Generer. Bruges til at hoppe til kategorien på siden.",
      options: { source: "title", maxLength: 60 },
      validation: (rule) => rule.required().error("Tryk på Generer for at lave en adresse."),
    }),
    defineField({
      name: "sort",
      title: "Rækkefølge",
      type: "number",
      initialValue: 100,
      description: "Lavt tal først på siden. 10, 20, 30 giver plads til at skyde en ny kategori ind.",
      validation: (rule) => rule.integer().min(0),
    }),
    defineField({
      name: "description",
      title: "Kort tekst",
      type: "text",
      rows: 2,
      description: "Vises under overskriften. Kan stå tom.",
      validation: (rule) => rule.max(300),
    }),
    deadlineOverrideField({
      title: "Egen bestillingsfrist for kategorien",
      fallsBackTo: "den almindelige frist fra Bageri og bestilling for alle varer i kategorien",
    }),
  ],
  orderings: [{ title: "Rækkefølge", name: "sort", by: [{ field: "sort", direction: "asc" }, { field: "title", direction: "asc" }] }],
  preview: {
    select: { title: "title", deadline: "deadline" },
    prepare({ title, deadline }: { title?: string; deadline?: DeadlineValue }) {
      const own = deadlineSummary(deadline);
      return { title: title ?? "Kategori", subtitle: own ? `Egen frist: ${own}` : undefined };
    },
  },
});
