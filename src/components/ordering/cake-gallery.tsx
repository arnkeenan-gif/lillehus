"use client";

import { useState } from "react";
import Image from "next/image";
import type { CmsImage } from "@/lib/cms";
import { cn } from "@/lib/cn";
import { hotspotPosition, isOptimizable } from "@/components/shop/product-photo";

/**
 * The cake's photos: one big (4/5), and the others as thumbnails under it
 * that swap the big one. A single photo is just the photo; no photos, no
 * gallery (the page leaves it out).
 */
export function CakeGallery({ photos, name }: { photos: CmsImage[]; name: string }) {
  const [index, setIndex] = useState(0);
  if (photos.length === 0) return null;
  const current = photos[Math.min(index, photos.length - 1)];

  return (
    <div>
      <div className="relative aspect-[4/5] overflow-hidden rounded-md bg-paper-2">
        <Image
          key={current.src}
          src={current.src}
          alt={current.alt || name}
          fill
          loading="eager"
          sizes="(min-width: 1264px) 680px, (min-width: 1024px) 55vw, 100vw"
          className="object-cover"
          style={hotspotPosition(current) ? { objectPosition: hotspotPosition(current) } : undefined}
          placeholder={current.lqip ? "blur" : "empty"}
          blurDataURL={current.lqip}
          unoptimized={!isOptimizable(current.src)}
        />
      </div>
      {photos.length > 1 ? (
        <ul className="mt-3 flex gap-2 overflow-x-auto pb-1" aria-label="Flere billeder">
          {photos.map((photo, i) => (
            <li key={`${photo.src}-${i}`} className="shrink-0">
              <button
                type="button"
                onClick={() => setIndex(i)}
                aria-current={i === index ? "true" : undefined}
                className={cn(
                  "relative block size-16 overflow-hidden rounded-md border-2 transition-colors duration-150 ease-out-quart sm:size-20",
                  i === index ? "border-rust" : "border-transparent hover:border-line",
                )}
              >
                <Image
                  src={photo.src}
                  alt=""
                  fill
                  sizes="80px"
                  className="object-cover"
                  style={hotspotPosition(photo) ? { objectPosition: hotspotPosition(photo) } : undefined}
                  unoptimized={!isOptimizable(photo.src)}
                />
                <span className="sr-only">
                  Vis billede {i + 1} af {photos.length}
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
