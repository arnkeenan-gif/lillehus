/**
 * Seeds the event categories and the events into Sanity from
 * content/events/categories.json and content/events.json.
 *
 *   npx tsx scripts/seed-events.ts             create what is missing
 *   npx tsx scripts/seed-events.ts --dry-run   print what would be written, no token needed
 *   npx tsx scripts/seed-events.ts --replace   also overwrite documents that already exist
 *
 * Or from another script (the integrator wires it into npm run seed:sanity):
 *
 *   import { seedEvents } from "./seed-events";
 *   await seedEvents({ client, dryRun, photo: photoValue });
 *
 * Every document has a stable _id (eventCategory-<slug>, event-<slug>) and
 * deterministic keys, so running it again gives the same result. By default
 * documents that already exist are left alone, so Kristine's own changes in
 * the Studio survive a second run; --replace writes the JSON over them.
 * Photos are uploaded once and remembered in scripts/.seed-assets.json, the
 * same file scripts/seed-sanity.ts uses.
 *
 * Needs NEXT_PUBLIC_SANITY_PROJECT_ID and SANITY_API_WRITE_TOKEN (Editor
 * rights), read from .env.local when they are not already set.
 */
import { createClient, type SanityClient } from "@sanity/client";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { basename, dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { toPortableText } from "../src/lib/cms/blocks";
import { isUsableEventSlug, isValidSlug } from "../src/lib/cms/events-shared";
import eventsJson from "../content/events.json";
import categoriesJson from "../content/events/categories.json";
import imagesJson from "../content/images.json";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const ASSET_MAP_FILE = resolve(ROOT, "scripts/.seed-assets.json");
const API_VERSION = "2026-09-01";

type Raw = Record<string, unknown>;
type SanityDoc = { _id: string; _type: string } & Raw;
type AssetMap = Record<string, { assetId: string; sha1: string }>;
/** Turns a path under /public into an image field value, or undefined when the file is missing. */
export type PhotoFn = (path: string, alt?: string) => Promise<Raw | undefined>;

export interface SeedEventsOptions {
  /** A client with write access. May be null in a dry run. */
  client: SanityClient | null;
  dryRun?: boolean;
  /** Overwrite documents that already exist. Off by default, so Studio edits survive. */
  replace?: boolean;
  /** Image uploader; seed-sanity.ts can pass its own so both share one upload cache. */
  photo?: PhotoFn;
  log?: (line: string) => void;
}

export interface SeedEventsResult {
  categories: number;
  events: number;
  /** Records in the JSON that were skipped, with the reason. */
  skipped: string[];
}

/* ------------------------------------------------------------------ */
/* Reading the JSON                                                    */
/* ------------------------------------------------------------------ */

function isRaw(value: unknown): value is Raw {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function str(o: Raw, key: string): string | undefined {
  const v = o[key];
  return typeof v === "string" && v.trim() !== "" ? v.trim() : undefined;
}

function num(o: Raw, key: string): number | undefined {
  const v = o[key];
  return typeof v === "number" && Number.isFinite(v) ? v : undefined;
}

function clean<T extends Raw>(doc: T): T {
  return Object.fromEntries(Object.entries(doc).filter(([, v]) => v !== undefined)) as T;
}

function validIso(value: string | undefined): string | undefined {
  return value && Number.isFinite(new Date(value).getTime()) ? value : undefined;
}

export function categoryId(slug: string): string {
  return `eventCategory-${slug}`;
}

export function eventId(slug: string): string {
  return `event-${slug}`;
}

/** The category documents, from content/events/categories.json. */
export function buildCategoryDocuments(skipped: string[] = []): SanityDoc[] {
  const list = (categoriesJson as { categories?: unknown }).categories;
  const docs: SanityDoc[] = [];
  for (const [i, entry] of (Array.isArray(list) ? list : []).entries()) {
    if (!isRaw(entry)) continue;
    const slug = str(entry, "slug");
    const title = str(entry, "title");
    if (!slug || !isValidSlug(slug) || !title) {
      skipped.push(`kategori nr. ${i + 1}: mangler navn eller en gyldig slug`);
      continue;
    }
    docs.push(
      clean({
        _id: categoryId(slug),
        _type: "eventCategory",
        title,
        slug: { _type: "slug", current: slug },
        intro: str(entry, "intro"),
        sort: num(entry, "sort") ?? (i + 1) * 10,
      }),
    );
  }
  return docs;
}

/** The event documents, from content/events.json. Photos go through `photo`. */
export async function buildEventDocuments(photo?: PhotoFn, skipped: string[] = []): Promise<SanityDoc[]> {
  const categories = new Set(buildCategoryDocuments().map((d) => (d.slug as { current: string }).current));
  const docs: SanityDoc[] = [];
  for (const [i, entry] of (eventsJson as unknown[]).entries()) {
    if (!isRaw(entry)) continue;
    const slug = str(entry, "slug");
    const title = str(entry, "title");
    const start = validIso(str(entry, "start"));
    if (!slug || !isUsableEventSlug(slug) || !title || !start) {
      skipped.push(`arrangement nr. ${i + 1}: mangler navn, en gyldig slug eller en gyldig start`);
      continue;
    }
    const category = str(entry, "category");
    if (category && !categories.has(category)) skipped.push(`${slug}: kategorien "${category}" findes ikke; arrangementet får ingen kategori`);
    const description = str(entry, "description") ?? "";
    const paragraphs = description
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter(Boolean);
    const imagePath = str(entry, "image");
    const price = num(entry, "priceOere");

    docs.push(
      clean({
        _id: eventId(slug),
        _type: "event",
        title,
        slug: { _type: "slug", current: slug },
        category: category && categories.has(category) ? { _type: "reference", _ref: categoryId(category) } : undefined,
        summary: str(entry, "summary"),
        description: paragraphs.length > 0 ? toPortableText(paragraphs, `${eventId(slug)}-`) : undefined,
        image: imagePath && photo ? await photo(imagePath, title) : undefined,
        start,
        end: validIso(str(entry, "end")),
        place: str(entry, "place"),
        priceOere: price && price > 0 ? Math.round(price) : undefined,
        signup: entry.signup === true,
        payment: entry.payment === true,
        signupDeadline: validIso(str(entry, "signupDeadline")),
        capacity: num(entry, "capacity"),
        hidden: entry.hidden === true,
      }),
    );
  }
  return docs;
}

/* ------------------------------------------------------------------ */
/* Photos (the same cache file as scripts/seed-sanity.ts)              */
/* ------------------------------------------------------------------ */

const photoMeta = imagesJson.photos as Record<string, { alt: string } | undefined>;

function loadAssetMap(): AssetMap {
  if (!existsSync(ASSET_MAP_FILE)) return {};
  try {
    return JSON.parse(readFileSync(ASSET_MAP_FILE, "utf8")) as AssetMap;
  } catch {
    return {};
  }
}

/** The built-in uploader: uploads a photo from /public once and remembers it. */
export function makePhotoUploader(client: SanityClient | null, dryRun: boolean, log: (line: string) => void): PhotoFn {
  const assetMap = loadAssetMap();
  return async (path, alt) => {
    const file = resolve(ROOT, "public", path.replace(/^\//, ""));
    if (!existsSync(file)) {
      log(`  billedet findes ikke og springes over: ${path}`);
      return undefined;
    }
    const buffer = readFileSync(file);
    const sha1 = createHash("sha1").update(buffer).digest("hex");
    let assetId = assetMap[path]?.sha1 === sha1 ? assetMap[path].assetId : undefined;
    if (!assetId) {
      if (dryRun || !client) {
        assetId = `image-dryrun-${sha1.slice(0, 12)}`;
      } else {
        const asset = await client.assets.upload("image", buffer, {
          filename: basename(path),
          title: photoMeta[path]?.alt,
          source: { id: path, name: "lillehus-seed" },
        });
        assetId = asset._id;
        assetMap[path] = { assetId, sha1 };
        writeFileSync(ASSET_MAP_FILE, `${JSON.stringify(assetMap, null, 2)}\n`);
        log(`  billede lagt op: ${path}`);
      }
    }
    return { _type: "photo", asset: { _type: "reference", _ref: assetId }, alt: photoMeta[path]?.alt ?? alt ?? "" };
  };
}

/* ------------------------------------------------------------------ */
/* Seeding                                                             */
/* ------------------------------------------------------------------ */

export async function seedEvents({
  client,
  dryRun = false,
  replace = false,
  photo,
  log = console.log,
}: SeedEventsOptions): Promise<SeedEventsResult> {
  const skipped: string[] = [];
  const upload = photo ?? makePhotoUploader(client, dryRun, log);
  const categories = buildCategoryDocuments(skipped);
  const events = await buildEventDocuments(upload, skipped);
  const docs = [...categories, ...events];

  if (dryRun || !client) {
    for (const doc of docs) log(`  ${doc._type.padEnd(14)} ${doc._id}`);
  } else {
    const BATCH = 25;
    for (let i = 0; i < docs.length; i += BATCH) {
      const tx = client.transaction();
      for (const doc of docs.slice(i, i + BATCH)) {
        if (replace) tx.createOrReplace(doc);
        else tx.createIfNotExists(doc);
      }
      await tx.commit();
    }
  }
  for (const reason of skipped) log(`  sprunget over: ${reason}`);
  return { categories: categories.length, events: events.length, skipped };
}

/* ------------------------------------------------------------------ */
/* Run on its own                                                      */
/* ------------------------------------------------------------------ */

function loadEnvFiles() {
  for (const file of [".env.local", ".env"]) {
    const path = resolve(ROOT, file);
    if (!existsSync(path)) continue;
    for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
      const match = /^\s*(?:export\s+)?([A-Z0-9_]+)\s*=\s*(.*?)\s*$/.exec(line);
      if (!match) continue;
      const [, key, raw] = match;
      const value = /^(["']).*\1$/.test(raw) ? raw.slice(1, -1) : raw;
      if (!(key in process.env)) process.env[key] = value;
    }
  }
}

async function main() {
  loadEnvFiles();
  const dryRun = process.argv.includes("--dry-run");
  const replace = process.argv.includes("--replace");
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID?.trim();
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET?.trim() || "production";
  const token = process.env.SANITY_API_WRITE_TOKEN?.trim();

  if (!dryRun && (!projectId || !token)) {
    console.error(
      [
        "Kan ikke seede arrangementer: der mangler miljøvariabler.",
        "  NEXT_PUBLIC_SANITY_PROJECT_ID  projektets id fra sanity.io/manage",
        "  SANITY_API_WRITE_TOKEN         en token med Editor-rettigheder (API, Tokens)",
        "Skriv dem i .env.local og kør igen, eller prøv med --dry-run.",
      ].join("\n"),
    );
    process.exit(1);
  }

  const client = !dryRun && projectId && token ? createClient({ projectId, dataset, apiVersion: API_VERSION, token, useCdn: false }) : null;
  console.log(
    dryRun
      ? "Prøvekørsel (dry run): bygger kategorier og arrangementer uden at skrive noget til Sanity ..."
      : `Seeder arrangementer i Sanity-projekt ${projectId}, dataset "${dataset}"${replace ? " (overskriver eksisterende)" : ""} ...`,
  );
  const result = await seedEvents({ client, dryRun, replace });
  console.log(
    `${dryRun ? "Ville lægge ind" : "Lagt ind"}: ${result.categories} kategorier og ${result.events} arrangementer` +
      (replace || dryRun ? "." : " (dem, der fandtes i forvejen, er ikke rørt)."),
  );
}

const invokedDirectly = process.argv[1] ? import.meta.url === pathToFileURL(resolve(process.argv[1])).href : false;
if (invokedDirectly) {
  main().catch((error) => {
    console.error("Seed af arrangementer fejlede:", error instanceof Error ? error.message : error);
    process.exit(1);
  });
}
