import { cn } from "@/lib/cn";

export type HeadingLevel = "h1" | "h2";

type Props = {
  as: HeadingLevel;
  children: React.ReactNode;
  className?: string;
};

/**
 * The one heading a section may carry. As the page's h1 it takes the display
 * size (the same opening every page gets), as an h2 the title size. Sections
 * never carry more than one.
 */
export function SectionHeading({ as: Tag, children, className }: Props) {
  return (
    <Tag
      className={cn(
        Tag === "h1" ? "text-display font-semibold tracking-tight" : "text-title font-semibold",
        "max-w-[20ch] text-balance text-ink",
        className,
      )}
    >
      {children}
    </Tag>
  );
}

/**
 * The sentence under a section heading. Under the page's h1 it is the lead
 * (large body, like the hero's), under an h2 it is body text. `afterHeading`
 * adds the space towards the heading above; without a heading the sentence
 * opens the section itself.
 */
export function SectionIntro({
  level,
  afterHeading,
  className,
  children,
}: {
  level: HeadingLevel;
  afterHeading?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <p
      className={cn(
        level === "h1" ? "max-w-[46ch] text-lead text-ink-2" : `${textMeasure} text-ink-2`,
        afterHeading && (level === "h1" ? "mt-5" : "mt-4"),
        className,
      )}
    >
      {children}
    </p>
  );
}

/** Text links inside sections: rust, underlined, one style everywhere. */
export const textLink =
  "font-medium text-rust underline decoration-1 underline-offset-[3px] transition-colors duration-150 ease-out-quart hover:text-rust-deep";

/** Running text measure (DESIGN.md §4): 62 characters. */
export const textMeasure = "max-w-[62ch]";

/** Measure of row lists (dates, questions): a little wider than prose so rows keep to one line. */
export const listMeasure = "max-w-[46rem]";

/** Space between a section's heading (and intro) and the list or grid under it. */
export const afterIntro = "mt-10";
