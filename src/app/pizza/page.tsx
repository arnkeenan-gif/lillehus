import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPage } from "@/lib/cms";
import { pageMetadata } from "@/components/cms/metadata";
import { Sections } from "@/components/sections/render";

const SLUG = "pizza";

/** The wagon's places and dates pass; refresh the static page every hour. */
export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata(await getPage(SLUG), "Pizzavogn");
}

/** Rendered from the CMS page "pizza": the sections Kristine ordered in the Studio, or the JSON fallback. */
export default async function PizzaPage() {
  const page = await getPage(SLUG);
  if (!page || page.hidden) notFound();
  return <Sections page={page} />;
}
