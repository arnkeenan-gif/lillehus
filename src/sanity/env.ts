/**
 * Sanity connection details. Everything in this file is safe to ship to the
 * browser: the project id and dataset are public. Tokens are read only in
 * server files (src/sanity/lib/client.ts, scripts/seed-sanity.ts).
 */
export const projectId = (process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "").trim();
export const dataset = (process.env.NEXT_PUBLIC_SANITY_DATASET ?? "").trim() || "production";

/** A fixed API date so query results never change under our feet. Bump it on purpose only. */
export const apiVersion = "2026-09-01";

export const studioBasePath = "/studio";
export const studioTitle = "Det lille hus på landet";

/**
 * True when a project id is set. Without one the site never contacts Sanity
 * and every façade function returns the JSON in /content instead.
 */
export const isSanityConfigured = /^[a-z0-9][a-z0-9-]*$/.test(projectId);
