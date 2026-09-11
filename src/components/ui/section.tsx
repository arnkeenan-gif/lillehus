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
 * The wrapper of a page that is not built from CMS sections (the shop, the
 * checkout, the receipt): the same opening space as the section pages get
 * from render.tsx, and the same room before the footer. Use "tint"
 * sparingly; never alternate every section.
 */
export function Section({ tone = "paper", as: Tag = "section", className, ...rest }: Props) {
  return <Tag className={cn("pb-24 pt-12 sm:pb-32 sm:pt-20", tones[tone], className)} {...rest} />;
}
