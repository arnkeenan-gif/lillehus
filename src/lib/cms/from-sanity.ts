/**
 * Shared by every façade module: read from Sanity when it is configured,
 * fall back to the JSON in /content when it is not, when Sanity has no
 * document for this yet, or when Sanity does not answer.
 */
import { isSanityConfigured } from "@/sanity/env";

export async function fromSanity<T>(what: string, load: () => Promise<T | null>, fallback: () => T): Promise<T> {
  if (!isSanityConfigured) return fallback();
  try {
    const value = await load();
    if (value !== null && value !== undefined) return value;
    console.warn(`[cms] ${what}: findes ikke i Sanity endnu, bruger content/. Kør npm run seed:sanity.`);
  } catch (error) {
    console.error(`[cms] ${what}: Sanity svarede ikke, bruger content/.`, error);
  }
  return fallback();
}
