import { defineField, defineType } from "sanity";
import { ImageIcon } from "../../icons";
import type { PreviewMedia } from "../helpers";

export const instagramPost = defineType({
  name: "instagramPost",
  title: "Instagram-billeder",
  type: "document",
  icon: ImageIcon,
  description: "Striben af billeder nederst på forsiden. Instagram lader os ikke hente dem automatisk, så du lægger dem ind her selv.",
  fields: [
    defineField({
      name: "image",
      title: "Billede",
      type: "photo",
      description: "Gem billedet fra din telefon og træk det herind. Det vises kvadratisk, så sæt punktet der, hvor motivet er.",
      validation: (rule) => rule.required().error("Vælg et billede."),
    }),
    defineField({
      name: "url",
      title: "Link til opslaget",
      type: "url",
      description: "Adressen på opslaget på Instagram. Kan udelades, så linker billedet til din profil.",
      validation: (rule) => rule.uri({ scheme: ["https"] }),
    }),
    defineField({
      name: "sort",
      title: "Rækkefølge",
      type: "number",
      initialValue: 100,
      description: "Lavt tal først. Det nyeste billede får det laveste tal.",
      validation: (rule) => rule.integer().min(0),
    }),
  ],
  orderings: [{ title: "Rækkefølge", name: "sort", by: [{ field: "sort", direction: "asc" }] }],
  preview: {
    select: { alt: "image.alt", sort: "sort", media: "image" },
    prepare({ alt, sort, media }: { alt?: string; sort?: number; media?: PreviewMedia }) {
      return { title: alt || "Instagram-billede", subtitle: typeof sort === "number" ? `Nummer ${sort}` : undefined, media };
    },
  },
});
