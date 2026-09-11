import Image from "next/image";
import imagesJson from "@content/images.json";
import { cn } from "@/lib/cn";

/*
  One photo in a fixed aspect ratio, with the Danish alt text looked up in
  content/images.json so Kristine only maintains it in one place. Used by
  the forside sections and by the pages in the same lane.
*/

type PhotoMeta = { alt: string; w: number; h: number };
const photos = imagesJson.photos as Record<string, PhotoMeta | undefined>;

export type Ratio = "1/1" | "4/5" | "3/2" | "3/4" | "16/9";

const ratios: Record<Ratio, string> = {
  "1/1": "aspect-square",
  "4/5": "aspect-[4/5]",
  "3/2": "aspect-[3/2]",
  "3/4": "aspect-[3/4]",
  "16/9": "aspect-video",
};

/** Alt text for a path under /public/images, from content/images.json. */
export function altFor(src: string, fallback = ""): string {
  return photos[src]?.alt ?? fallback;
}

type Props = {
  src: string;
  ratio: Ratio;
  /** The `sizes` attribute for next/image; always set it. */
  sizes: string;
  /** Overrides the alt from images.json (product photos owned by the shop). */
  alt?: string;
  priority?: boolean;
  /** An object-position utility, e.g. "object-top" or "object-[50%_65%]". */
  position?: string;
  rounded?: "md" | "lg";
  className?: string;
};

export function Photo({ src, ratio, sizes, alt, priority, position, rounded = "md", className }: Props) {
  return (
    <div
      className={cn(
        "relative overflow-hidden bg-paper-2",
        rounded === "lg" ? "rounded-lg" : "rounded-md",
        ratios[ratio],
        className,
      )}
    >
      <Image
        src={src}
        alt={alt ?? altFor(src)}
        fill
        sizes={sizes}
        priority={priority}
        className={cn("object-cover", position)}
      />
    </div>
  );
}
