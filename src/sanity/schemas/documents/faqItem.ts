import { defineField, defineType } from "sanity";
import { HelpCircleIcon } from "../../icons";

export const faqItem = defineType({
  name: "faqItem",
  title: "Spørgsmål og svar",
  type: "document",
  icon: HelpCircleIcon,
  fields: [
    defineField({
      name: "question",
      title: "Spørgsmål",
      type: "string",
      description: 'Som kunden ville stille det, fx "Hvornår skal jeg senest bestille?"',
      validation: (rule) => rule.required().error("Skriv spørgsmålet.").max(160),
    }),
    defineField({
      name: "answer",
      title: "Svar",
      type: "richText",
      description: "Kort og konkret, som du ville sige det over disken.",
      validation: (rule) => rule.required().error("Skriv et svar."),
    }),
    defineField({
      name: "group",
      title: "Gruppe",
      type: "string",
      description: 'Spørgsmål med samme gruppe står sammen under en overskrift, fx "Bestilling og afhentning". Skriv gruppen ens hver gang.',
      validation: (rule) => rule.required().error("Skriv en gruppe.").max(60),
    }),
    defineField({
      name: "sort",
      title: "Rækkefølge",
      type: "number",
      initialValue: 100,
      description: "Lavt tal først inden for gruppen.",
      validation: (rule) => rule.integer().min(0),
    }),
  ],
  orderings: [{ title: "Rækkefølge", name: "sort", by: [{ field: "group", direction: "asc" }, { field: "sort", direction: "asc" }] }],
  preview: {
    select: { title: "question", subtitle: "group" },
  },
});
