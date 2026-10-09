/**
 * Seeds the ordering documents into Sanity from the JSON fallback:
 * categories (content/ordering/categories.json), products
 * (content/ordering/products.json), cakes (content/ordering/cakes.json),
 * pickup locations (content/ordering/pickup-locations.json) and the default
 * deadline in "Bageri og bestilling" (content/shop.json). Photos from
 * public/images are uploaded once and remembered in scripts/.seed-assets.json,
 * the same map scripts/seed-sanity.ts uses.
 *
 *   npx tsx scripts/seed-ordering.ts               create what is missing
 *   npx tsx scripts/seed-ordering.ts --dry-run     print what would be written; no token, no uploads
 *   npx tsx scripts/seed-ordering.ts --replace     also overwrite documents that already exist
 *   npx tsx scripts/seed-ordering.ts --open-dates  give active places without dates the fallback weekdays
 *
 * Or from another script:
 *
 *   import { seedOrdering } from "./seed-ordering";
 *   await seedOrdering({ client, dryRun, assetIdFor });
 *
 * Safe to run again: every document has a stable _id (productCategory-<id>,
 * product-<id>, cake-<id>, pickupLocation-<id>). By default existing
 * documents are left alone, so Kristine's edits survive a re-run; only
 * products and cakes still in the old shape (written by an earlier seed)
 * are replaced. With --replace everything is overwritten from the JSON,
 * except the dates on pickup locations, which are always kept.
 *
 * Needs NEXT_PUBLIC_SANITY_PROJECT_ID and SANITY_API_WRITE_TOKEN (Editor),
 * read from .env.local when not already in the environment.
 */
import { createClient, type SanityClient } from "@sanity/client";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { basename, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { toPortableText, type RichTextInput } from "../src/lib/cms/blocks";
import categoriesJson from "../content/ordering/categories.json";
import productsJson from "../content/ordering/products.json";
import cakesJson from "../content/ordering/cakes.json";
import pickupJson from "../content/ordering/pickup-locations.json";
import shopJson from "../content/shop.json";
import imagesJson from "../content/images.json";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const ASSET_MAP_FILE = resolve(ROOT, "scripts/.seed-assets.json");
const API_VERSION = "2026-09-01";

type Raw = Record<string, unknown>;
export type SanityDoc = { _id: string; _type: string } & Raw;
type AssetMap = Record<string, { assetId: string; sha1: string }>;

export interface SeedOrderingOptions {
  /** A client with a write token. May be null in a dry run. */
  client: SanityClient | null;
  dryRun?: boolean;
  /** Overwrite documents that already exist (pickup dates are kept). */
  replace?: boolean;
  /** Give active places without any dates the fallback weekdays for the fallback number of weeks. */
  openDates?: boolean;
  /** Share photo uploads with another seed; defaults to the asset map in scripts/.seed-assets.json. */
  assetIdFor?: (path: string) => Promise<string | undefined>;
  log?: (line: string) => void;
}

export interface SeedOrderingResult {
  documents: SanityDoc[];
  created: string[];
  replaced: string[];
  kept: string[];
}

/* ------------------------------------------------------------------ */
/* Reading the JSON                                                    */
/* ------------------------------------------------------------------ */

function rows(value: unknown): Raw[] {
  return Array.isArray(value) ? value.filter((x): x is Raw => Boolean(x) && typeof x === "object") : [];
}

function str(o: Raw, key: string): string | undefined {
  const v = o[key];
  return typeof v === "string" && v.trim() !== "" ? v.trim() : undefined;
}

function num(o: Raw, key: string, fallback: number): number {
  const v = o[key];
  return typeof v === "number" && Number.isFinite(v) ? v : fallback;
}

function bool(o: Raw, key: string, fallback: boolean): boolean {
  const v = o[key];
  return typeof v === "boolean" ? v : fallback;
}

function deadline(value: unknown): Raw | undefined {
  if (!value || typeof value !== "object") return undefined;
  const { daysBefore, hour } = value as Raw;
  if (typeof daysBefore !== "number" || typeof hour !== "number") return undefined;
  return { _type: "orderDeadline", daysBefore, hour };
}

function slug(current: string) {
  return { _type: "slug", current };
}

function clean<T extends Raw>(doc: T): T {
  // Drop undefined values so Sanity does not store nulls and a re-run stays diff-free.
  return Object.fromEntries(Object.entries(doc).filter(([, v]) => v !== undefined)) as T;
}

/* ------------------------------------------------------------------ */
/* Photos                                                              */
/* ------------------------------------------------------------------ */

const photoMeta = imagesJson.photos as Record<string, { alt: string; w: number; h: number } | undefined>;

function loadAssetMap(): AssetMap {
  if (!existsSync(ASSET_MAP_FILE)) return {};
  try {
    return JSON.parse(readFileSync(ASSET_MAP_FILE, "utf8")) as AssetMap;
  } catch {
    return {};
  }
}

/** Uploads a photo from /public once (same map as seed-sanity.ts); returns its asset id, or undefined when the file is missing. */
function makeAssetUploader(client: SanityClient | null, dryRun: boolean, log: (line: string) => void) {
  const assetMap = loadAssetMap();
  return async function assetIdFor(path: string): Promise<string | undefined> {
    const file = resolve(ROOT, "public", path.replace(/^\//, ""));
    if (!existsSync(file)) {
      log(`  billede findes ikke og springes over: ${path}`);
      return undefined;
    }
    const buffer = readFileSync(file);
    const sha1 = createHash("sha1").update(buffer).digest("hex");
    const cached = assetMap[path];
    if (cached && cached.sha1 === sha1) return cached.assetId;
    if (dryRun || !client) {
      assetMap[path] = { assetId: `image-dryrun-${sha1.slice(0, 12)}`, sha1 };
      return assetMap[path].assetId;
    }
    const asset = await client.assets.upload("image", buffer, {
      filename: basename(path),
      title: photoMeta[path]?.alt,
      source: { id: path, name: "lillehus-seed" },
    });
    assetMap[path] = { assetId: asset._id, sha1 };
    writeFileSync(ASSET_MAP_FILE, `${JSON.stringify(assetMap, null, 2)}\n`);
    log(`  billede lagt op: ${path}`);
    return asset._id;
  };
}

/* ------------------------------------------------------------------ */
/* Documents                                                           */
/* ------------------------------------------------------------------ */

function generateDates(weekdays: number[], weeks: number): string[] {
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Copenhagen" }).format(new Date());
  const start = new Date(`${today}T12:00:00Z`);
  const out: string[] = [];
  for (let i = 0; i < weeks * 7; i++) {
    const d = new Date(start.getTime() + i * 86_400_000);
    if (weekdays.includes(d.getUTCDay())) out.push(d.toISOString().slice(0, 10));
  }
  return out;
}

/** Every ordering document from the JSON, ready for Sanity. */
export async function buildOrderingDocuments(
  assetIdFor: (path: string) => Promise<string | undefined>,
  { openDates = false }: { openDates?: boolean } = {},
): Promise<SanityDoc[]> {
  async function photo(path: string | undefined, key?: string): Promise<Raw | undefined> {
    if (!path) return undefined;
    const assetId = await assetIdFor(path);
    if (!assetId) return undefined;
    return clean({
      _type: "photo",
      _key: key,
      asset: { _type: "reference", _ref: assetId },
      alt: photoMeta[path]?.alt ?? "",
    });
  }

  const docs: SanityDoc[] = [];

  for (const c of rows((categoriesJson as Raw).categories)) {
    const id = str(c, "id");
    const title = str(c, "title");
    if (!id || !title) continue;
    docs.push(
      clean({
        _id: `productCategory-${id}`,
        _type: "productCategory",
        title,
        slug: slug(id),
        sort: num(c, "sort", 100),
        description: str(c, "description"),
        deadline: deadline(c.deadline),
      }),
    );
  }

  for (const p of rows((productsJson as Raw).products)) {
    const id = str(p, "id");
    const name = str(p, "name");
    const category = str(p, "category");
    if (!id || !name || !category) continue;
    docs.push(
      clean({
        _id: `product-${id}`,
        _type: "product",
        name,
        slug: slug(id),
        category: { _type: "reference", _ref: `productCategory-${category}` },
        description: str(p, "description"),
        priceOere: Math.max(0, Math.round(num(p, "priceOere", 0))),
        image: await photo(str(p, "image")),
        active: bool(p, "active", true),
        orderable: bool(p, "orderable", true),
        sort: num(p, "sort", 100),
        deadline: deadline(p.deadline),
      }),
    );
  }

  for (const c of rows((cakesJson as Raw).cakes)) {
    const id = str(c, "id");
    const name = str(c, "name");
    if (!id || !name) continue;
    const images: Raw[] = [];
    for (const [i, src] of (Array.isArray(c.images) ? c.images : []).entries()) {
      const image = typeof src === "string" ? await photo(src, `${id}-billede-${i + 1}`) : undefined;
      if (image) images.push(image);
    }
    docs.push(
      clean({
        _id: `cake-${id}`,
        _type: "cake",
        name,
        slug: slug(id),
        intro: str(c, "intro"),
        images,
        basePriceOere: Math.max(0, Math.round(num(c, "basePriceOere", 0))),
        optionGroups: rows(c.optionGroups).map((g, gi) => {
          const groupId = str(g, "id") ?? `valg-${gi + 1}`;
          return clean({
            _type: "cakeOptionGroup",
            _key: groupId,
            title: str(g, "title") ?? "Valg",
            type: str(g, "type") ?? "dropdown",
            required: bool(g, "required", false),
            helper: str(g, "helper"),
            choices: rows(g.choices).map((ch, ci) =>
              clean({
                _type: "cakeOptionChoice",
                _key: str(ch, "id") ?? `${groupId}-${ci + 1}`,
                label: str(ch, "label") ?? "Valg",
                priceOere: Math.max(0, Math.round(num(ch, "priceOere", 0))),
                isDefault: bool(ch, "default", false),
              }),
            ),
          });
        }),
        minQuantity: num(c, "minQuantity", 1),
        maxQuantity: num(c, "maxQuantity", 10),
        deadline: deadline(c.deadline),
        sections: rows(c.sections).map((s, si) =>
          clean({
            _type: "cakeSection",
            _key: `${id}-afsnit-${si + 1}`,
            heading: str(s, "heading"),
            body: toPortableText(s.body as RichTextInput, `${id}-${si}-`),
          }),
        ),
        active: bool(c, "active", true),
        sort: num(c, "sort", 100),
      }),
    );
  }

  const pickup = pickupJson as Raw;
  const fallbackWeekdays = Array.isArray(pickup.fallbackWeekdays) ? pickup.fallbackWeekdays.filter((d): d is number => typeof d === "number") : [];
  const fallbackWeeks = num(pickup, "fallbackWeeksAhead", 4);
  for (const l of rows(pickup.locations)) {
    const id = str(l, "id");
    const name = str(l, "name");
    if (!id || !name) continue;
    const active = bool(l, "active", false);
    let dates: Raw[] = rows(l.dates)
      .filter((d) => typeof d.date === "string")
      .map((d) =>
        clean({
          _type: "pickupDateEntry",
          _key: `d${String(d.date).replace(/-/g, "")}`,
          date: d.date as string,
          open: d.closed !== true,
          from: str(d, "from"),
          to: str(d, "to"),
          note: str(d, "note"),
        }),
      );
    if (dates.length === 0 && active && openDates) {
      dates = generateDates(fallbackWeekdays, fallbackWeeks).map((date) => ({ _type: "pickupDateEntry", _key: `d${date.replace(/-/g, "")}`, date, open: true }));
    }
    docs.push(
      clean({
        _id: `pickupLocation-${id}`,
        _type: "pickupLocation",
        name,
        slug: slug(id),
        active,
        address: str(l, "address"),
        note: str(l, "note"),
        mapsUrl: str(l, "mapsUrl"),
        sort: num(l, "sort", 100),
        dates,
      }),
    );
  }

  return docs;
}

/** The default deadline (and the minimum order) for "Bageri og bestilling". */
function settingsValues(): Raw {
  const shop = shopJson as Raw;
  return clean({
    defaultDeadline: deadline(shop.defaultDeadline) ?? { _type: "orderDeadline", daysBefore: 2, hour: 18 },
    minOrderOere: typeof shop.minOrderOere === "number" ? shop.minOrderOere : undefined,
  });
}

/* ------------------------------------------------------------------ */
/* Writing                                                             */
/* ------------------------------------------------------------------ */

interface Existing {
  _id: string;
  _type: string;
  oldCategory?: boolean;
  oldCake?: boolean;
  dates?: Raw[] | null;
}

export async function seedOrdering(options: SeedOrderingOptions): Promise<SeedOrderingResult> {
  const { client, dryRun = false, replace = false, openDates = false } = options;
  const log = options.log ?? ((line: string) => console.log(line));
  const assetIdFor = options.assetIdFor ?? makeAssetUploader(client, dryRun, log);
  const documents = await buildOrderingDocuments(assetIdFor, { openDates });

  const existing = new Map<string, Existing>();
  if (client && !dryRun) {
    const found = await client.fetch<Existing[]>(
      `*[_id in $ids]{ _id, _type, "oldCategory": _type == "product" && defined(category) && !defined(category._ref), "oldCake": _type == "cake" && !defined(basePriceOere), dates }`,
      { ids: documents.map((d) => d._id) },
    );
    for (const doc of found) existing.set(doc._id, doc);
  }

  const created: string[] = [];
  const replaced: string[] = [];
  const kept: string[] = [];
  const writes: { op: "create" | "replace"; doc: SanityDoc }[] = [];

  for (const doc of documents) {
    const current = existing.get(doc._id);
    if (!current) {
      writes.push({ op: "create", doc });
      created.push(doc._id);
      continue;
    }
    const oldShape = Boolean(current.oldCategory || current.oldCake);
    if (!replace && !oldShape) {
      kept.push(doc._id);
      continue;
    }
    // Never lose the dates Kristine opened or closed.
    const next = doc._type === "pickupLocation" && Array.isArray(current.dates) && current.dates.length > 0 ? { ...doc, dates: current.dates } : doc;
    writes.push({ op: "replace", doc: next });
    replaced.push(doc._id);
  }

  if (dryRun || !client) {
    for (const { op, doc } of writes) log(`  ${op === "create" ? "opret " : "erstat"} ${doc._type.padEnd(16)} ${doc._id}`);
    log(`  indstil shopSettings.defaultDeadline (hvis den mangler): ${JSON.stringify(settingsValues().defaultDeadline)}`);
  } else {
    const BATCH = 25;
    for (let i = 0; i < writes.length; i += BATCH) {
      const tx = client.transaction();
      for (const { op, doc } of writes.slice(i, i + BATCH)) {
        if (op === "create") tx.createIfNotExists(doc);
        else tx.createOrReplace(doc);
      }
      await tx.commit();
    }
    const settings = settingsValues();
    await client
      .transaction()
      .createIfNotExists({ _id: "shopSettings", _type: "shopSettings" })
      .patch("shopSettings", (p) => (replace ? p.set(settings) : p.setIfMissing(settings)))
      .commit();
  }

  return { documents, created, replaced, kept };
}

/* ------------------------------------------------------------------ */
/* Command line                                                        */
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
  const openDates = process.argv.includes("--open-dates");
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID?.trim();
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET?.trim() || "production";
  const token = process.env.SANITY_API_WRITE_TOKEN?.trim();

  if (!dryRun && (!projectId || !token)) {
    console.error(
      [
        "Kan ikke seede bestillingen: der mangler miljøvariabler.",
        "  NEXT_PUBLIC_SANITY_PROJECT_ID  projektets id fra sanity.io/manage",
        "  SANITY_API_WRITE_TOKEN         en token med Editor-rettigheder (API, Tokens)",
        "Skriv dem i .env.local og kør igen, eller prøv med --dry-run.",
      ].join("\n"),
    );
    process.exit(1);
  }

  const client = projectId && token ? createClient({ projectId, dataset, apiVersion: API_VERSION, token, useCdn: false }) : null;
  console.log(
    dryRun
      ? "Prøvekørsel (dry run): bygger bestillingens dokumenter uden at skrive noget til Sanity ..."
      : `Seeder bestillingen i Sanity-projekt ${projectId}, dataset "${dataset}" ...`,
  );
  const result = await seedOrdering({ client: dryRun ? null : client, dryRun, replace, openDates });

  const count = (type: string) => result.documents.filter((d) => d._type === type).length;
  console.log("");
  console.log(
    `${count("productCategory")} kategorier, ${count("product")} varer, ${count("cake")} kager, ${count("pickupLocation")} afhentningssteder.`,
  );
  console.log(
    dryRun
      ? `Ville oprette ${result.created.length} og erstatte ${result.replaced.length} (uden at se i Sanity antages alt at være nyt).`
      : `Oprettet ${result.created.length}, erstattet ${result.replaced.length}, ladt være ${result.kept.length} (de findes allerede; brug --replace for at overskrive).`,
  );
  if (!dryRun) console.log("Åbn /studio og se Afhentningssteder: brug Åbn datoer for at åbne de første datoer, og tryk Udgiv.");
}

const isMain = process.argv[1] ? resolve(process.argv[1]) === fileURLToPath(import.meta.url) : false;
if (isMain) {
  main().catch((error) => {
    console.error("Seed fejlede (seed failed):", error instanceof Error ? error.message : error);
    process.exit(1);
  });
}
