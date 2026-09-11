import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPage } from "@/lib/cms";
import { pageMetadata } from "@/components/cms/metadata";
import { Sections } from "@/components/sections/render";

const SLUG = "om-os";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata(await getPage(SLUG), "Om os");
}

/** Rendered from the CMS page "om-os": the sections Kristine ordered in the Studio, or the JSON fallback. */
export default async function OmOsPage() {
  const page = await getPage(SLUG);
  if (!page) notFound();
  return <Sections page={page} />;
}
