import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPage } from "@/lib/cms";
import { pageMetadata } from "@/components/cms/metadata";
import { Sections } from "@/components/sections/render";

const SLUG = "firmaaftaler";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata(await getPage(SLUG), "Firmaaftaler");
}

/** Rendered from the CMS page "firmaaftaler": the sections Kristine ordered in the Studio, or the JSON fallback. */
export default async function FirmaaftalerPage() {
  const page = await getPage(SLUG);
  if (!page) notFound();
  return <Sections page={page} />;
}
