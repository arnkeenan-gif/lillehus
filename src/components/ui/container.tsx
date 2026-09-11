import { cn } from "@/lib/cn";

type Props = React.HTMLAttributes<HTMLDivElement> & {
  size?: "default" | "narrow" | "wide";
};

const sizes = {
  narrow: "max-w-[760px]",
  default: "max-w-[1200px]",
  wide: "max-w-[1400px]",
};

/** Horizontal page gutter. Every section's content sits inside one of these. */
export function Container({ size = "default", className, ...rest }: Props) {
  return (
    <div
      className={cn("mx-auto w-full px-5 sm:px-8", sizes[size], className)}
      {...rest}
    />
  );
}
