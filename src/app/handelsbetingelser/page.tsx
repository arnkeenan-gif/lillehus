import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPage } from "@/lib/cms";
import { pageMetadata } from "@/components/cms/metadata";
import { Sections } from "@/components/sections/render";

const SLUG = "handelsbetingelser";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata(await getPage(SLUG), "Handelsbetingelser");
}

/** Rendered from the CMS page "handelsbetingelser": the sections Kristine ordered in the Studio, or the JSON fallback. */
export default async function HandelsbetingelserPage() {
  const page = await getPage(SLUG);
  if (!page) notFound();
  return <Sections page={page} />;
}
