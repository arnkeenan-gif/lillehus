import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPage } from "@/lib/cms";
import { pageMetadata } from "@/components/cms/metadata";
import { Sections } from "@/components/sections/render";

const SLUG = "fryser";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata(await getPage(SLUG), "Fryser");
}

/** Rendered from the CMS page "fryser": the sections Kristine ordered in the Studio, or the JSON fallback. */
export default async function FryserPage() {
  const page = await getPage(SLUG);
  if (!page || page.hidden) notFound();
  return <Sections page={page} />;
}
