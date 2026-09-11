import type { Metadata } from "next";
import { getSiteSettings, type Page } from "@/lib/cms";

/**
 * <title>, description and the sharing image for a CMS page. The forside
 * uses its SEO title as-is; every other page gets the site name appended by
 * the template in src/app/layout.tsx. When the page has no sharing image the
 * layout's opengraph-image.jpg is used, so openGraph is only set when needed.
 */
export async function pageMetadata(page: Page | null, fallbackTitle: string): Promise<Metadata> {
  if (!page) return { title: fallbackTitle };

  const title = page.seo.title?.trim() || page.title;
  const description = page.seo.description?.trim() || undefined;
  const metadata: Metadata = {
    title: page.slug === "forside" ? { absolute: title } : title,
    description,
  };

  const image = page.seo.image;
  if (image) {
    const settings = await getSiteSettings();
    metadata.openGraph = {
      type: "website",
      locale: "da_DK",
      siteName: settings.name,
      title,
      description,
      images: [{ url: image.src, width: image.width, height: image.height, alt: image.alt }],
    };
  }
  return metadata;
}
