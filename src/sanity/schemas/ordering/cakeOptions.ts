import { defineArrayMember, defineField, defineType } from "sanity";
import { ControlsIcon } from "@sanity/icons/Controls";
import { formatOere } from "../helpers";

/**
 * The options on a cake's page, like Emma's kagemænd: a dropdown or radio
 * buttons (choose one), add-ons (choose several) or a text field. Each
 * choice can add to the price. Plus the sections of text under the cake.
 */

export const CAKE_OPTION_TYPES = [
  { title: "Rullemenu, kunden vælger én", value: "dropdown" },
  { title: "Knapper, kunden vælger én", value: "radio" },
  { title: "Tilvalg, kunden kan vælge flere", value: "addons" },
  { title: "Tekstfelt, kunden skriver selv", value: "text" },
];

interface ChoiceValue {
  label?: string;
  priceOere?: number;
  isDefault?: boolean;
}

interface GroupValue {
  title?: string;
  type?: string;
  required?: boolean;
  choices?: ChoiceValue[];
}

export const cakeOptionChoice = defineType({
  name: "cakeOptionChoice",
  title: "Valg",
  type: "object",
  fields: [
    defineField({
      name: "label",
      title: "Navn",
      type: "string",
      description: 'Det kunden ser, fx "Kagekone" eller "25 til 30 personer".',
      validation: (rule) => rule.required().error("Skriv, hvad valget hedder.").max(80),
    }),
    defineField({
      name: "priceOere",
      title: "Pristillæg i øre",
      type: "number",
      initialValue: 0,
      description: "Lægges oven i kagens pris. 0 betyder ingen ekstra pris. Skriv 5000 for 50 kr.",
      validation: (rule) => rule.integer().error("Kun hele tal, ingen komma.").min(0),
    }),
    defineField({
      name: "isDefault",
      title: "Valgt på forhånd",
      type: "boolean",
      initialValue: false,
      description: "Er valgt, når siden åbner. Kunden kan vælge om.",
    }),
  ],
  preview: {
    select: { title: "label", price: "priceOere", isDefault: "isDefault" },
    prepare({ title, price, isDefault }: { title?: string; price?: number; isDefault?: boolean }) {
      const parts = [price ? `+ ${formatOere(price)}` : null, isDefault ? "valgt på forhånd" : null].filter(Boolean);
      return { title: title ?? "Valg", subtitle: parts.join(", ") || undefined };
    },
  },
});

export const cakeOptionGroup = defineType({
  name: "cakeOptionGroup",
  title: "Valgmulighed",
  type: "object",
  icon: ControlsIcon,
  fields: [
    defineField({
      name: "title",
      title: "Overskrift",
      type: "string",
      description: 'Det kunden skal vælge, fx "Smag", "Størrelse", "Slik" eller "Tekst på kagen".',
      validation: (rule) => rule.required().error("Skriv en overskrift.").max(60),
    }),
    defineField({
      name: "type",
      title: "Slags",
      type: "string",
      options: { list: CAKE_OPTION_TYPES, layout: "radio" },
      initialValue: "dropdown",
      validation: (rule) => rule.required().error("Vælg, hvordan kunden vælger."),
    }),
    defineField({
      name: "required",
      title: "Skal vælges",
      type: "boolean",
      initialValue: true,
      description: "Kunden kan ikke bestille uden at vælge (eller skrive) noget her.",
    }),
    defineField({
      name: "helper",
      title: "Hjælpetekst",
      type: "string",
      description: 'En kort linje under feltet, fx "Navn og alder". Kan stå tom.',
      validation: (rule) => rule.max(120),
    }),
    defineField({
      name: "choices",
      title: "Valg",
      type: "array",
      of: [defineArrayMember({ type: "cakeOptionChoice" })],
      description: "Det kunden kan vælge imellem. Træk for at ændre rækkefølgen.",
      hidden: ({ parent }) => (parent as GroupValue | undefined)?.type === "text",
      validation: (rule) =>
        rule.custom((value, context) => {
          const group = context.parent as GroupValue | undefined;
          if (group?.type === "text") return true;
          const list = (value as ChoiceValue[] | undefined) ?? [];
          if (list.length === 0) return "Tilføj mindst ét valg.";
          if ((group?.type === "dropdown" || group?.type === "radio") && list.filter((c) => c.isDefault).length > 1) {
            return "Kun ét valg kan være valgt på forhånd, når kunden kun kan vælge én.";
          }
          return true;
        }),
    }),
  ],
  preview: {
    select: { title: "title", type: "type", choices: "choices", required: "required" },
    prepare({ title, type, choices, required }: GroupValue) {
      const kind = CAKE_OPTION_TYPES.find((t) => t.value === type)?.title.split(",")[0] ?? "";
      const count = type === "text" ? "" : `${choices?.length ?? 0} valg`;
      return { title: title ?? "Valgmulighed", subtitle: [kind, count, required ? "skal vælges" : null].filter(Boolean).join(", ") };
    },
  },
});

export const cakeSection = defineType({
  name: "cakeSection",
  title: "Afsnit",
  type: "object",
  fields: [
    defineField({
      name: "heading",
      title: "Overskrift",
      type: "string",
      description: 'Fx "Beskrivelse", "Ingredienser" eller "Allergener".',
      validation: (rule) => rule.required().error("Skriv en overskrift.").max(80),
    }),
    defineField({ name: "body", title: "Tekst", type: "richText" }),
  ],
  preview: {
    select: { title: "heading" },
    prepare({ title }: { title?: string }) {
      return { title: title ?? "Afsnit" };
    },
  },
});
