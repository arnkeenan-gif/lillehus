import Image from "next/image";
import type { CmsImage } from "@/lib/cms";
import { cn } from "@/lib/cn";

/*
  Product pictures for the tiles and the cart. The parent sets the aspect
  ratio; the picture fills it, Kristine's hotspot steers the crop and the
  Sanity blur preview shows while it loads.
*/

/** CSS object-position from a CMS hotspot, or undefined for the centre. */
export function hotspotPosition(photo: Pick<CmsImage, "hotspot"> | undefined): string | undefined {
  const h = photo?.hotspot;
  if (!h) return undefined;
  return `${Math.round(h.x * 100)}% ${Math.round(h.y * 100)}%`;
}

/** next/image can optimise local files and the two CDNs allowed in next.config.ts; anything else is served as is. */
export function isOptimizable(src: string): boolean {
  return src.startsWith("/") || /^https:\/\/(cdn\.sanity\.io|files\.stripe\.com)\//.test(src);
}

type Props = {
  photo?: CmsImage;
  /** Plain path or URL, used when there is no CmsImage. */
  src?: string;
  alt: string;
  sizes: string;
  className?: string;
};

export function ProductPhoto({ photo, src, alt, sizes, className }: Props) {
  const source = photo?.src ?? src;
  if (!source) return null;
  const position = hotspotPosition(photo);
  return (
    <Image
      src={source}
      alt={photo?.alt || alt}
      fill
      sizes={sizes}
      className={cn("object-cover", className)}
      style={position ? { objectPosition: position } : undefined}
      placeholder={photo?.lqip ? "blur" : "empty"}
      blurDataURL={photo?.lqip}
      unoptimized={!isOptimizable(source)}
    />
  );
}
