/**
 * Seeds the Sanity dataset with everything in /content: settings, opening
 * hours, pizza settings, FAQ, the Instagram strip and every page in
 * content/cms-fallback/pages, then hands over to scripts/seed-ordering.ts
 * (bagværk, cakes, pickup locations, the deadline) and scripts/seed-events.ts
 * (events and their categories). Photos referenced from public/images are
 * uploaded once and remembered in scripts/.seed-assets.json.
 *
 *   npm run seed:sanity
 *   npm run seed:sanity -- --dry-run
 *
 * Needs NEXT_PUBLIC_SANITY_PROJECT_ID and SANITY_API_WRITE_TOKEN (a token with
 * Editor rights, created in sanity.io/manage under API, Tokens). Reads them
 * from .env.local when they are not already in the environment.
 *
 * Safe to run again: every document has a stable _id and keys are
 * deterministic, so nothing is doubled and unchanged photos are not
 * re-uploaded. Settings, opening hours, pizza, FAQ, Instagram and pages are
 * replaced from /content (so a re-run undoes edits made in the Studio);
 * the ordering and event documents that already exist are left alone.
 */
import { createClient, type SanityClient } from "@sanity/client";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { basename, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { toPortableText, type RichTextInput } from "../src/lib/cms/blocks";
import { FALLBACK_PAGES } from "../src/lib/cms/fallback-pages";
import siteJson from "../content/site.json";
import pizzaJson from "../content/pizza.json";
import faqJson from "../content/faq.json";
import imagesJson from "../content/images.json";
import forsideImages from "../content/pages/forside.json";
import { seedEvents } from "./seed-events";
import { seedOrdering } from "./seed-ordering";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const ASSET_MAP_FILE = resolve(ROOT, "scripts/.seed-assets.json");
const API_VERSION = "2026-09-01";

type Raw = Record<string, unknown>;
type SanityDoc = { _id: string; _type: string } & Raw;
type AssetMap = Record<string, { assetId: string; sha1: string }>;

/* ------------------------------------------------------------------ */
/* Environment                                                         */
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

loadEnvFiles();

/** `--dry-run` builds every document and prints what would be written, without a token, uploads or writes. */
const dryRun = process.argv.includes("--dry-run");

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID?.trim() || (dryRun ? "dry-run" : undefined);
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET?.trim() || "production";
const token = process.env.SANITY_API_WRITE_TOKEN?.trim() || (dryRun ? "dry-run" : undefined);

if (!projectId || !token) {
  console.error(
    [
      "Kan ikke seede: der mangler miljøvariabler.",
      "  NEXT_PUBLIC_SANITY_PROJECT_ID  projektets id fra sanity.io/manage",
      "  SANITY_API_WRITE_TOKEN         en token med Editor-rettigheder (API, Tokens)",
      "Skriv dem i .env.local og kør igen. (Missing NEXT_PUBLIC_SANITY_PROJECT_ID or SANITY_API_WRITE_TOKEN.)",
    ].join("\n"),
  );
  process.exit(1);
}

const client: SanityClient = createClient({ projectId, dataset, apiVersion: API_VERSION, token, useCdn: false });

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

const assetMap = loadAssetMap();
const stats = { uploaded: 0, reused: 0, missing: [] as string[], documents: {} as Record<string, number> };

/** Uploads a photo from /public once; returns its asset id, or undefined when the file does not exist. */
async function assetIdFor(path: string): Promise<string | undefined> {
  const file = resolve(ROOT, "public", path.replace(/^\//, ""));
  if (!existsSync(file)) {
    if (!stats.missing.includes(path)) stats.missing.push(path);
    return undefined;
  }
  const buffer = readFileSync(file);
  const sha1 = createHash("sha1").update(buffer).digest("hex");
  const cached = assetMap[path];
  if (cached && cached.sha1 === sha1) {
    stats.reused += 1;
    return cached.assetId;
  }
  if (dryRun) {
    // Remember it in memory only, so the count matches a real run without touching the map file.
    assetMap[path] = { assetId: `image-dryrun-${sha1.slice(0, 12)}`, sha1 };
    stats.uploaded += 1;
    return assetMap[path].assetId;
  }
  const asset = await client.assets.upload("image", buffer, {
    filename: basename(path),
    title: photoMeta[path]?.alt,
    source: { id: path, name: "lillehus-seed" },
  });
  assetMap[path] = { assetId: asset._id, sha1 };
  writeFileSync(ASSET_MAP_FILE, `${JSON.stringify(assetMap, null, 2)}\n`);
  stats.uploaded += 1;
  console.log(`  billede lagt op: ${path}`);
  return asset._id;
}

/** An image field value for the `photo` type: asset reference plus alt text. */
async function photoValue(path: string | undefined | null, alt?: string, extra: Raw = {}): Promise<Raw | undefined> {
  if (!path) return undefined;
  const assetId = await assetIdFor(path);
  if (!assetId) return undefined;
  return {
    _type: "photo",
    asset: { _type: "reference", _ref: assetId },
    alt: alt ?? photoMeta[path]?.alt ?? "",
    ...extra,
  };
}

/** Image values in the fallback JSON are a path or { src, alt, hotspot }. The hotspot becomes Kristine's focus point in the Studio. */
async function photoFromRaw(value: unknown): Promise<Raw | undefined> {
  if (typeof value === "string") return photoValue(value);
  if (value && typeof value === "object" && "src" in value) {
    const v = value as { src?: unknown; alt?: unknown; hotspot?: { x?: unknown; y?: unknown } };
    const x = v.hotspot?.x;
    const y = v.hotspot?.y;
    const extra = typeof x === "number" && typeof y === "number" ? { hotspot: { _type: "sanity.imageHotspot", x, y, width: 1, height: 1 } } : {};
    return photoValue(typeof v.src === "string" ? v.src : undefined, typeof v.alt === "string" ? v.alt : undefined, extra);
  }
  return undefined;
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function slug(current: string) {
  return { _type: "slug", current };
}

function ref(id: string, key: string) {
  return { _type: "reference", _ref: id, _key: key };
}

function faqId(index: number): string {
  return `faq-${String(index + 1).padStart(2, "0")}`;
}

function withLink(value: unknown): Raw | undefined {
  if (!value || typeof value !== "object") return undefined;
  const v = value as Raw;
  if (typeof v.label !== "string" || typeof v.href !== "string") return undefined;
  return { _type: "link", label: v.label, href: v.href };
}

function clean<T extends Raw>(doc: T): T {
  // Drop undefined values so Sanity does not store nulls and the seed stays diff-free.
  return Object.fromEntries(Object.entries(doc).filter(([, v]) => v !== undefined)) as T;
}

/* ------------------------------------------------------------------ */
/* Sections                                                            */
/* ------------------------------------------------------------------ */

const LINK_FIELDS = ["primaryLink", "secondaryLink", "link"];

async function convertSection(raw: Raw, index: number): Promise<Raw | null> {
  const type = raw._type;
  if (typeof type !== "string") return null;
  const key = typeof raw._key === "string" && raw._key ? raw._key : `${type}-${index}`;
  const out: Raw = { _type: type, _key: key };

  for (const [field, value] of Object.entries(raw)) {
    if (field === "_type" || field === "_key") continue;
    if (field === "image") {
      out.image = await photoFromRaw(value);
    } else if (field === "images" && Array.isArray(value)) {
      const images: Raw[] = [];
      for (const [i, entry] of value.entries()) {
        if (!entry || typeof entry !== "object") continue;
        const e = entry as Raw;
        const image = await photoFromRaw(e.image);
        if (image) images.push(clean({ _type: "galleryImage", _key: `${key}-${i}`, image, caption: typeof e.caption === "string" ? e.caption : undefined }));
      }
      out.images = images;
    } else if (field === "entries" && Array.isArray(value)) {
      const entries: Raw[] = [];
      for (const [i, entry] of value.entries()) {
        if (!entry || typeof entry !== "object") continue;
        const e = entry as Raw;
        const entryKey = typeof e._key === "string" && e._key ? e._key : `${key}-${i}`;
        const links: Raw[] = [];
        for (const [j, l] of (Array.isArray(e.links) ? e.links : []).entries()) {
          const link = withLink(l);
          if (link) links.push({ ...link, _key: `${entryKey}-${j}` });
        }
        entries.push(
          clean({
            _type: "entry",
            _key: entryKey,
            title: e.title,
            text: typeof e.text === "string" && e.text ? e.text : undefined,
            image: await photoFromRaw(e.image),
            href: e.href,
            links: links.length > 0 ? links : undefined,
          }),
        );
      }
      out.entries = entries;
    } else if (field === "body") {
      out.body = toPortableText(value as RichTextInput, `${key}-`);
    } else if (field === "products" && Array.isArray(value)) {
      out.products = value.filter((s): s is string => typeof s === "string").map((s, i) => ref(`product-${s}`, `${key}-${i}`));
    } else if (field === "items" && Array.isArray(value)) {
      out.items = value.filter((s): s is string => typeof s === "string").map((s, i) => ref(s, `${key}-${i}`));
    } else if (field === "rows" && Array.isArray(value)) {
      out.rows = value
        .filter((r): r is Raw => Boolean(r) && typeof r === "object")
        .map((r, i) => clean({ _type: "priceRow", _key: `${key}-${i}`, name: r.name, price: r.price, note: r.note }));
    } else if (LINK_FIELDS.includes(field)) {
      out[field] = withLink(value);
    } else if (typeof value === "string" && value === "") {
      // Empty strings mean "not set".
      continue;
    } else {
      out[field] = value;
    }
  }
  return clean(out);
}

/* ------------------------------------------------------------------ */
/* Documents                                                           */
/* ------------------------------------------------------------------ */

async function buildDocuments(): Promise<SanityDoc[]> {
  const docs: SanityDoc[] = [];

  // Indstillinger
  docs.push(
    clean({
      _id: "siteSettings",
      _type: "siteSettings",
      name: siteJson.name,
      shortName: siteJson.shortName,
      tagline: siteJson.tagline,
      owner: siteJson.owner,
      founded: siteJson.founded,
      cvr: siteJson.cvr,
      address: { street: siteJson.address.street, postalCode: siteJson.address.postalCode, city: siteJson.address.city, country: siteJson.address.country },
      phone: siteJson.phone,
      email: siteJson.email,
      url: siteJson.url,
      smileyUrl: siteJson.smileyUrl,
      social: { ...siteJson.social },
      logo: await photoValue("/images/logo.png"),
      logoLight: await photoValue("/images/logo-light.png"),
      announcement: { enabled: false, text: "" },
      orderEmailTo: siteJson.orderEmailTo,
    }),
  );

  // Åbningstider og steder
  docs.push({
    _id: "hours",
    _type: "hours",
    locations: siteJson.locations.map((loc) =>
      clean({
        _type: "location",
        _key: loc.id,
        id: loc.id,
        name: loc.name,
        subtitle: loc.subtitle || undefined,
        address: loc.address,
        mapsUrl: loc.mapsUrl,
        hours: loc.hours.map((h, i) => clean({ _type: "openingHours", _key: `${loc.id}-${i}`, days: h.days, time: h.time, note: h.note || undefined })),
        pickup: loc.pickup,
        notes: loc.notes || undefined,
      }),
    ),
  });

  // Pizzavogn
  type MenuItemJson = { name: string; description?: string; image?: string; priceOere?: number | null; vegetarian?: boolean; available?: boolean };
  async function menuItem(item: MenuItemJson, type: "pizzaItem" | "dessertItem", key: string): Promise<Raw> {
    return clean({
      _type: type,
      _key: key,
      name: item.name,
      description: item.description || undefined,
      image: await photoValue(item.image || undefined, undefined),
      priceOere: typeof item.priceOere === "number" ? item.priceOere : undefined,
      vegetarian: type === "pizzaItem" ? Boolean(item.vegetarian) : undefined,
      available: item.available !== false,
    });
  }
  const pizzas: Raw[] = [];
  for (const [i, p] of (pizzaJson.pizzas as MenuItemJson[]).entries()) pizzas.push(await menuItem(p, "pizzaItem", `pizza-${i}`));
  const desserts: Raw[] = [];
  for (const [i, d] of (pizzaJson.desserts as MenuItemJson[]).entries()) desserts.push(await menuItem(d, "dessertItem", `dessert-${i}`));
  const schedule = (pizzaJson.schedule as { place?: string; date?: string; from?: string; to?: string; note?: string }[]).map((stop, i) =>
    clean({ _type: "pizzaStop", _key: `stop-${i}`, place: stop.place, date: stop.date, from: stop.from || undefined, to: stop.to || undefined, note: stop.note || undefined }),
  );
  docs.push({
    _id: "pizzaSettings",
    _type: "pizzaSettings",
    intro: pizzaJson.intro,
    packages: pizzaJson.packages.map((p) => ({ _type: "pizzaPackage", _key: p.id, ...p })),
    radiusKm: pizzaJson.radiusKm,
    areaNote: pizzaJson.areaNote,
    notes: pizzaJson.notes,
    prices: { ...pizzaJson.prices },
    day: pizzaJson.day,
    pizzas,
    desserts,
    schedule,
    terms: pizzaJson.terms,
  });

  // Spørgsmål og svar
  for (const [i, item] of (faqJson as { q: string; a: string; group?: string }[]).entries()) {
    docs.push({
      _id: faqId(i),
      _type: "faqItem",
      question: item.q,
      answer: toPortableText(item.a, `${faqId(i)}-`),
      group: item.group ?? "Andet",
      sort: (i + 1) * 10,
    });
  }

  // Instagram-billeder: the forside strip. "top" and "bottom" become a hotspot so the square crop keeps the right part.
  for (const [i, entry] of forsideImages.instagram.entries()) {
    const name = basename(entry.src).replace(/\.[a-z0-9]+$/i, "");
    const y = entry.position === "top" ? 0.25 : entry.position === "bottom" ? 0.75 : undefined;
    const hotspot = y === undefined ? {} : { hotspot: { _type: "sanity.imageHotspot", x: 0.5, y, width: 1, height: 0.5 } };
    const image = await photoValue(entry.src, undefined, hotspot);
    if (!image) continue;
    docs.push({
      _id: `instagram-${name}`,
      _type: "instagramPost",
      image,
      url: siteJson.social.instagram,
      sort: (i + 1) * 10,
    });
  }

  // Sider
  for (const [pageSlug, page] of Object.entries(FALLBACK_PAGES)) {
    const sections: Raw[] = [];
    for (const [i, raw] of page.sections.entries()) {
      if (!raw || typeof raw !== "object") continue;
      const section = await convertSection(raw as Raw, i);
      if (section) sections.push(section);
    }
    docs.push(
      clean({
        _id: `page-${pageSlug}`,
        _type: "page",
        title: page.title,
        slug: slug(pageSlug),
        seo: clean({
          title: page.seo?.title,
          description: page.seo?.description,
          image: await photoValue(page.seo?.image),
        }),
        showInNav: page.showInNav ?? false,
        navLabel: page.navLabel || undefined,
        navOrder: page.navOrder ?? 100,
        hidden: page.hidden ?? false,
        sections,
      }),
    );
  }

  return docs;
}

/* ------------------------------------------------------------------ */
/* Run                                                                 */
/* ------------------------------------------------------------------ */

async function main() {
  console.log(
    dryRun
      ? "Prøvekørsel (dry run): bygger dokumenterne fra /content uden at skrive noget til Sanity ..."
      : `Seeder Sanity-projekt ${projectId}, dataset "${dataset}" fra /content ...`,
  );
  const docs = await buildDocuments();

  if (dryRun) {
    for (const doc of docs) {
      const sections = Array.isArray(doc.sections) ? ` (${(doc.sections as Raw[]).map((s) => s._type).join(", ")})` : "";
      console.log(`  ${doc._type.padEnd(14)} ${doc._id}${sections}`);
    }
  } else {
    const BATCH = 25;
    for (let i = 0; i < docs.length; i += BATCH) {
      const tx = client.transaction();
      for (const doc of docs.slice(i, i + BATCH)) tx.createOrReplace(doc);
      await tx.commit();
    }
  }

  for (const doc of docs) stats.documents[doc._type] = (stats.documents[doc._type] ?? 0) + 1;

  const labels: Record<string, string> = {
    siteSettings: "indstillinger",
    hours: "åbningstider",
    pizzaSettings: "pizzavogn",
    page: "sider",
    faqItem: "spørgsmål",
    instagramPost: "instagram-billeder",
  };
  const summary = Object.entries(stats.documents)
    .map(([type, count]) => `${count} ${labels[type] ?? type}`)
    .join(", ");

  console.log("");
  console.log(dryRun ? `Ville lægge ind i Sanity (dry run): ${summary}.` : `Lagt ind i Sanity (seeded): ${summary}.`);
  // Places and dates already in Sanity are left alone; an active place without dates (Gården on the first run) gets the same weeks the site shows without Sanity.
  console.log("");
  console.log("Bagværk, kager, afhentningssteder og bestillingsfrist:");
  await seedOrdering({ client, dryRun, assetIdFor, openDates: true });
  console.log("");
  console.log("Arrangementer og kategorier:");
  await seedEvents({ client, dryRun, photo: (path, alt) => photoValue(path, alt) });
  console.log("");
  console.log(
    dryRun
      ? `Billeder: ${stats.uploaded} ville blive lagt op, ${stats.reused} genbrugt fra scripts/.seed-assets.json.`
      : `Billeder: ${stats.uploaded} lagt op, ${stats.reused} genbrugt fra scripts/.seed-assets.json.`,
  );
  if (stats.missing.length > 0) {
    console.warn(`Billeder, der ikke findes i public/ og blev sprunget over: ${stats.missing.join(", ")}`);
  }
  if (!dryRun) console.log("Åbn /studio på siden og log ind for at se det hele. (Done. Open /studio to edit.)");
}

main().catch((error) => {
  console.error("Seed fejlede (seed failed):", error instanceof Error ? error.message : error);
  process.exit(1);
});
