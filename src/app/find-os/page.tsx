import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPage } from "@/lib/cms";
import { pageMetadata } from "@/components/cms/metadata";
import { Sections } from "@/components/sections/render";

const SLUG = "find-os";

/** Events and products change; refresh the static page every hour. */
export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata(await getPage(SLUG), "Find os");
}

/** Rendered from the CMS page "find-os": the sections Kristine ordered in the Studio, or the JSON fallback. */
export default async function FindOsPage() {
  const page = await getPage(SLUG);
  if (!page) notFound();
  return <Sections page={page} />;
}
