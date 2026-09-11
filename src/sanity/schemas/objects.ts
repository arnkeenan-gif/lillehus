import { defineArrayMember, defineField, defineType } from "sanity";
import { LinkIcon } from "../icons";
import { HREF_HELP, hrefValidation } from "./helpers";

/** A button or a text link: what it says and where it goes. */
export const link = defineType({
  name: "link",
  title: "Link",
  type: "object",
  icon: LinkIcon,
  fields: [
    defineField({
      name: "label",
      title: "Tekst",
      type: "string",
      description: 'Det, der står på knappen eller linket, fx "Bestil brød".',
      validation: (rule) => rule.required().error("Skriv, hvad der skal stå på linket.").max(60),
    }),
    defineField({
      name: "href",
      title: "Adresse",
      type: "string",
      description: HREF_HELP,
      validation: hrefValidation,
    }),
  ],
  preview: {
    select: { title: "label", subtitle: "href" },
  },
});

/** A photo with the point that must stay in view and a description for screen readers. */
export const photo = defineType({
  name: "photo",
  title: "Billede",
  type: "image",
  options: { hotspot: true },
  fields: [
    defineField({
      name: "alt",
      title: "Hvad viser billedet?",
      type: "string",
      description:
        'En kort dansk sætning til dem, der ikke kan se billedet, fx "Kanelsnegle og boller i en kurv". Ikke et salgsbudskab.',
      validation: (rule) => rule.max(200).required().warning("Skriv gerne, hvad billedet viser."),
    }),
  ],
});

/** Long-form text: paragraphs, two heading sizes, lists, bold and links. */
export const richText = defineType({
  name: "richText",
  title: "Tekst",
  type: "array",
  of: [
    defineArrayMember({
      type: "block",
      styles: [
        { title: "Almindelig tekst", value: "normal" },
        { title: "Overskrift", value: "h2" },
        { title: "Lille overskrift", value: "h3" },
      ],
      lists: [
        { title: "Punkter", value: "bullet" },
        { title: "Numre", value: "number" },
      ],
      marks: {
        decorators: [{ title: "Fed", value: "strong" }],
        annotations: [
          defineArrayMember({
            name: "link",
            title: "Link",
            type: "object",
            icon: LinkIcon,
            fields: [
              defineField({
                name: "href",
                title: "Adresse",
                type: "string",
                description: HREF_HELP,
                validation: hrefValidation,
              }),
            ],
          }),
        ],
      },
    }),
  ],
});

export const objectTypes = [link, photo, richText];
