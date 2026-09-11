import Image from "next/image";
import { cn } from "@/lib/cn";
import type { CmsImage } from "@/lib/cms";

/**
 * One photo from the CMS in a fixed aspect-ratio box. The box carries the
 * ratio (and a different ratio from sm or lg when the slot changes shape),
 * next/image fills it, the hotspot Kristine marked in Sanity becomes the
 * object-position, and the tiny lqip preview blurs in first when it exists.
 */
export type PhotoRatio = "16/9" | "3/2" | "4/5" | "1/1" | "21/9";

const base: Record<PhotoRatio, string> = {
  "16/9": "aspect-[16/9]",
  "3/2": "aspect-[3/2]",
  "4/5": "aspect-[4/5]",
  "1/1": "aspect-square",
  "21/9": "aspect-[21/9]",
};

const fromSm: Record<PhotoRatio, string> = {
  "16/9": "sm:aspect-[16/9]",
  "3/2": "sm:aspect-[3/2]",
  "4/5": "sm:aspect-[4/5]",
  "1/1": "sm:aspect-square",
  "21/9": "sm:aspect-[21/9]",
};

const fromLg: Record<PhotoRatio, string> = {
  "16/9": "lg:aspect-[16/9]",
  "3/2": "lg:aspect-[3/2]",
  "4/5": "lg:aspect-[4/5]",
  "1/1": "lg:aspect-square",
  "21/9": "lg:aspect-[21/9]",
};

type Props = {
  image: CmsImage;
  ratio: PhotoRatio;
  /** Ratio from 640px, when the slot changes shape. */
  smRatio?: PhotoRatio;
  /** Ratio from 1024px, when the slot changes shape. */
  lgRatio?: PhotoRatio;
  /** The `sizes` attribute for next/image. Always set it. */
  sizes: string;
  /** Only on the hero. */
  priority?: boolean;
  /** `md` for photos in the page, `lg` for full-width bands, `none` for full-bleed. */
  rounded?: "md" | "lg" | "none";
  className?: string;
};

export function CmsPhoto({ image, ratio, smRatio, lgRatio, sizes, priority, rounded = "md", className }: Props) {
  const position = image.hotspot
    ? `${Math.round(image.hotspot.x * 100)}% ${Math.round(image.hotspot.y * 100)}%`
    : undefined;

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden bg-paper-2",
        rounded === "md" && "rounded-md",
        rounded === "lg" && "rounded-lg",
        base[ratio],
        smRatio ? fromSm[smRatio] : null,
        lgRatio ? fromLg[lgRatio] : null,
        className,
      )}
    >
      <Image
        src={image.src}
        alt={image.alt}
        fill
        sizes={sizes}
        priority={priority}
        placeholder={image.lqip ? "blur" : "empty"}
        blurDataURL={image.lqip}
        style={position ? { objectPosition: position } : undefined}
        className="object-cover"
      />
    </div>
  );
}

/**
 * True when the file is wide enough to be shown `displayWidth` CSS pixels
 * wide without being upscaled more than about 1.15x. Files with an unknown
 * width pass, so a Sanity image without metadata still renders.
 */
export function fitsWidth(image: CmsImage | undefined, displayWidth: number): boolean {
  if (!image?.width) return true;
  return image.width * 1.15 >= displayWidth;
}

/** The hand-drawn logo and other transparent PNG marks: shown whole, never cropped. */
export function isMark(image: CmsImage): boolean {
  return /\.png(\?.*)?$/i.test(image.src);
}
