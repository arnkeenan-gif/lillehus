import { createImageUrlBuilder, type ImageUrlBuilder, type SanityImageSource } from "@sanity/image-url";
import { dataset, projectId } from "@/sanity/env";

let builder: ImageUrlBuilder | undefined;

/**
 * URL builder for images on cdn.sanity.io. Chain .width(), .height(),
 * .fit("max"), .auto("format") and finish with .url(). Accepts an image
 * field value (with hotspot and crop), an asset document or an asset id.
 */
export function urlFor(source: SanityImageSource): ImageUrlBuilder {
  builder ??= createImageUrlBuilder({ projectId, dataset });
  return builder.image(source);
}

/** The widest image the site ever asks for. Photos are shown at most 1200px wide, times two for retina. */
export const MAX_IMAGE_WIDTH = 2400;
