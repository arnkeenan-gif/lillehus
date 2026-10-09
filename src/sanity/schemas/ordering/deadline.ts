import { defineField, defineType } from "sanity";

/**
 * A deadline: "kl. 18, 2 dage før afhentning". Used as the default in
 * "Bageri og bestilling" and as an optional override on a category, a
 * product or a cake. An override counts only when both numbers are filled
 * in; empty means "use the next rule up".
 */

export interface DeadlineValue {
  daysBefore?: number;
  hour?: number;
}

export function isCompleteDeadline(value: DeadlineValue | undefined | null): value is Required<DeadlineValue> {
  return typeof value?.daysBefore === "number" && typeof value?.hour === "number";
}

/** "kl. 18, 2 dage før" for previews; "" when the override is empty. */
export function deadlineSummary(value: DeadlineValue | undefined | null): string {
  if (!isCompleteDeadline(value)) return "";
  const days = value.daysBefore === 0 ? "samme dag" : value.daysBefore === 1 ? "dagen før" : `${value.daysBefore} dage før`;
  return `kl. ${value.hour}, ${days}`;
}

export const orderDeadline = defineType({
  name: "orderDeadline",
  title: "Bestillingsfrist",
  type: "object",
  options: { columns: 2 },
  fields: [
    defineField({
      name: "daysBefore",
      title: "Dage før afhentning",
      type: "number",
      description: "2 betyder to dage før: afhentning lørdag, bestil senest torsdag.",
      validation: (rule) => rule.integer().error("Kun hele dage.").min(0).max(60),
    }),
    defineField({
      name: "hour",
      title: "Senest klokken",
      type: "number",
      description: "18 betyder kl. 18.00.",
      validation: (rule) => rule.integer().error("Kun hele timer.").min(0).max(23),
    }),
  ],
  validation: (rule) =>
    rule.custom((value) => {
      const v = value as DeadlineValue | undefined;
      if (!v) return true;
      const hasDays = typeof v.daysBefore === "number";
      const hasHour = typeof v.hour === "number";
      return hasDays === hasHour ? true : "Udfyld både dage og klokkeslæt, eller lad begge stå tomme.";
    }),
});

/** The description for an override field, with what applies when it is left empty. */
export function overrideDescription(fallsBackTo: string): string {
  return `Lad begge felter stå tomme, så gælder ${fallsBackTo}. Udfyld dem kun, hvis netop dette skal have en anden frist.`;
}

/** An optional override field, e.g. on a product. */
export function deadlineOverrideField(options: { group?: string; fallsBackTo: string; title?: string }) {
  return defineField({
    name: "deadline",
    title: options.title ?? "Egen bestillingsfrist",
    type: "orderDeadline",
    group: options.group,
    description: overrideDescription(options.fallsBackTo),
  });
}
