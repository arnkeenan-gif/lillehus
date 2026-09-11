import { cn } from "@/lib/cn";

type Props = React.HTMLAttributes<HTMLElement> & {
  tone?: "paper" | "tint" | "ink";
  as?: "section" | "div" | "article";
};

const tones = {
  paper: "bg-paper text-ink",
  tint: "bg-paper-2 text-ink",
  ink: "bg-ink text-paper",
};

/**
 * Vertical rhythm for page sections. Use "tint" sparingly to separate
 * neighbouring sections; never alternate every section.
 */
export function Section({ tone = "paper", as: Tag = "section", className, ...rest }: Props) {
  return <Tag className={cn("py-14 sm:py-20", tones[tone], className)} {...rest} />;
}
