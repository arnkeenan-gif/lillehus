import type { QueryParams } from "@sanity/client";
import { getClient } from "./client";

/** One cache tag per document type. The webhook in /api/revalidate clears the tag of the type that changed. */
export type CmsTag =
  | "siteSettings"
  | "hours"
  | "shopSettings"
  | "pizzaSettings"
  | "page"
  | "product"
  | "cake"
  | "event"
  | "faqItem"
  | "instagramPost";

/** How long a Sanity answer may be reused without the webhook. A minute keeps the site fast and Kristine's edits quick to show. */
export const REVALIDATE_SECONDS = 60;

/**
 * client.fetch with Next's cache: reused for a minute and cleared early by
 * revalidateTag when Sanity's webhook says the type changed.
 */
export async function sanityFetch<T>({
  query,
  params = {},
  tags,
  revalidate = REVALIDATE_SECONDS,
}: {
  query: string;
  params?: QueryParams;
  tags: CmsTag[];
  revalidate?: number | false;
}): Promise<T> {
  return getClient().fetch<T>(query, params, { next: { revalidate, tags } });
}
