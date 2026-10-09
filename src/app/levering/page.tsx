import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPage } from "@/lib/cms";
import { pageMetadata } from "@/components/cms/metadata";
import { Sections } from "@/components/sections/render";

const SLUG = "levering";

/** The open pickup dates move on; refresh the static page every hour. */
export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata(await getPage(SLUG), "Afhentning og levering");
}

/** Rendered from the CMS page "levering": the sections Kristine ordered in the Studio, or the JSON fallback. */
export default async function LeveringPage() {
  const page = await getPage(SLUG);
  if (!page || page.hidden) notFound();
  return <Sections page={page} />;
}
