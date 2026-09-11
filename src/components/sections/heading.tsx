import { cn } from "@/lib/cn";

export type HeadingLevel = "h1" | "h2";

type Props = {
  as: HeadingLevel;
  children: React.ReactNode;
  className?: string;
};

/**
 * The one heading a section may carry. As the page's h1 it takes the display
 * size, as an h2 the title size. Sections never carry more than one.
 */
export function SectionHeading({ as: Tag, children, className }: Props) {
  return (
    <Tag
      className={cn(
        Tag === "h1" ? "text-display font-bold tracking-tight" : "text-title font-semibold",
        "text-ink",
        className,
      )}
    >
      {children}
    </Tag>
  );
}

/** Text links inside sections: rust, underlined, one style everywhere. */
export const textLink =
  "font-medium text-rust underline decoration-1 underline-offset-[3px] transition-colors duration-150 ease-out-quart hover:text-rust-deep";
