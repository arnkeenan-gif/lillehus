"use client";

/**
 * Sanity Studio, mounted at /studio by src/app/studio/[[...tool]]/page.tsx.
 * "use client" is required: the config holds React components and functions,
 * and Next passes it to the Studio as a client module reference.
 */
import { defineConfig, isDev } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { daDKLocale } from "@sanity/locale-da-dk";
// Relative imports on purpose: the Sanity CLI (`npx sanity schema validate`) reads this file too and does not know the "@/" alias.
import { apiVersion, dataset, projectId, studioBasePath, studioTitle } from "./src/sanity/env";
import { schemaTypes } from "./src/sanity/schemas";
import { isSingleton } from "./src/sanity/schemas/constants";
import { structure } from "./src/sanity/structure";

export default defineConfig({
  name: "default",
  title: studioTitle,
  basePath: studioBasePath,
  projectId,
  dataset,
  plugins: [
    structureTool({ structure, title: "Indhold" }),
    // Danish Studio chrome: buttons, menus and messages.
    daDKLocale(),
    // GROQ playground, only while developing.
    ...(isDev ? [visionTool({ defaultApiVersion: apiVersion })] : []),
  ],
  schema: { types: schemaTypes },
  document: {
    // Singletons can be edited and published but never deleted, duplicated or unpublished.
    actions: (prev, context) =>
      isSingleton(context.schemaType)
        ? prev.filter(({ action }) => !action || !["delete", "duplicate", "unpublish"].includes(action))
        : prev,
    // Keep singletons out of the "new document" menu; they already exist.
    newDocumentOptions: (prev) => prev.filter((template) => !isSingleton(template.templateId)),
  },
});
