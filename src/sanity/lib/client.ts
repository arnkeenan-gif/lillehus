import { createClient, type SanityClient } from "@sanity/client";
import { apiVersion, dataset, isSanityConfigured, projectId } from "@/sanity/env";

let cached: SanityClient | undefined;

/**
 * The read client for published content. Server only. Created lazily so a
 * build without NEXT_PUBLIC_SANITY_PROJECT_ID never constructs (or contacts)
 * anything; the façade checks isSanityConfigured before calling this.
 *
 * Uses @sanity/client directly (the same copy Studio and the seed use);
 * next-sanity's wrapper only adds live preview and stega, which we do not use.
 */
export function getClient(): SanityClient {
  if (!isSanityConfigured) {
    throw new Error("Sanity er ikke sat op: NEXT_PUBLIC_SANITY_PROJECT_ID mangler.");
  }
  if (!cached) {
    const token = process.env.SANITY_API_READ_TOKEN?.trim() || undefined;
    cached = createClient({
      projectId,
      dataset,
      apiVersion,
      // The CDN is fast and cheap; with a token (private dataset) we go to the API directly.
      useCdn: !token,
      perspective: "published",
      token,
    });
  }
  return cached;
}
