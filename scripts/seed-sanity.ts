/**
 * Seeds the Sanity dataset with everything in /content: settings, opening
 * hours, shop and pizza settings, products, cakes, events, FAQ, the Instagram
 * strip and every page in content/cms-fallback/pages. Photos referenced from
 * public/images are uploaded once and remembered in scripts/.seed-assets.json.
 *
 *   npm run seed:sanity
 *
 * Needs NEXT_PUBLIC_SANITY_PROJECT_ID and SANITY_API_WRITE_TOKEN (a token with
 * Editor rights, created in sanity.io/manage under API, Tokens). Reads them
 * from .env.local when they are not already in the environment.
 *
 * Safe to run again: every document has a stable _id and is replaced in
 * place, keys are deterministic, and unchanged photos are not re-uploaded.
 */
import { createClient, type SanityClient } from "@sanity/client";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { basename, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { toPortableText, type RichTextInput } from "../src/lib/cms/blocks";
import { FALLBACK_PAGES } from "../src/lib/cms/fallback-pages";
import siteJson from "../content/site.json";
import shopJson from "../content/shop.json";
import pizzaJson from "../content/pizza.json";
import productsJson from "../content/products.json";
import cakesJson from "../content/cakes.json";
import eventsJson from "../content/events.json";
import faqJson from "../content/faq.json";
import imagesJson from "../content/images.json";
import forsideImages from "../content/pages/forside.json";

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

/** Image values in the fallback JSON are a path or { src, alt }. */
async function photoFromRaw(value: unknown): Promise<Raw | undefined> {
  if (typeof value === "string") return photoValue(value);
  if (value && typeof value === "object" && "src" in value) {
    const v = value as { src?: unknown; alt?: unknown };
    return photoValue(typeof v.src === "string" ? v.src : undefined, typeof v.alt === "string" ? v.alt : undefined);
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
        subtitle: loc.subtitle,
        address: loc.address,
        mapsUrl: loc.mapsUrl,
        hours: loc.hours.map((h, i) => clean({ _type: "openingHours", _key: `${loc.id}-${i}`, days: h.days, time: h.time, note: h.note || undefined })),
        pickup: loc.pickup,
        notes: loc.notes || undefined,
      }),
    ),
  });

  // Bageri, afhentning og levering
  docs.push({
    _id: "shopSettings",
    _type: "shopSettings",
    pickupDays: shopJson.pickupDays,
    pickupWindow: shopJson.pickupWindow,
    pickupPlace: shopJson.pickupPlace,
    cutoffHour: shopJson.cutoffHour,
    cutoffDaysBefore: shopJson.cutoffDaysBefore,
    maxDaysAhead: shopJson.maxDaysAhead,
    minOrderOere: shopJson.minOrderOere,
    delivery: { ...shopJson.delivery },
    closedDates: shopJson.closedDates,
    notice: shopJson.notice,
  });

  // Pizzavogn
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
    pizzas: pizzaJson.pizzas.map((p, i) => ({ _type: "pizzaItem", _key: `pizza-${i}`, name: p.name, vegetarian: "vegetarian" in p ? Boolean(p.vegetarian) : false })),
    desserts: pizzaJson.desserts,
    terms: pizzaJson.terms,
  });

  // Brød og varer
  for (const [i, p] of productsJson.entries()) {
    docs.push(
      clean({
        _id: `product-${p.slug}`,
        _type: "product",
        name: p.name,
        slug: slug(p.slug),
        description: p.description,
        priceOere: p.priceOere,
        image: await photoValue(p.image || undefined, photoMeta[p.image]?.alt ?? p.name),
        category: p.category,
        days: p.days,
        allergens: p.allergens,
        active: p.active,
        sort: (i + 1) * 10,
        stripePriceId: "stripePriceId" in p ? (p as { stripePriceId?: string }).stripePriceId : undefined,
      }),
    );
  }

  // Kager på bestilling
  for (const [i, c] of cakesJson.entries()) {
    const cake = c as Raw & { slug: string; name: string; image?: string; priceNote?: string; options?: string[] };
    docs.push(
      clean({
        _id: `cake-${cake.slug}`,
        _type: "cake",
        name: cake.name,
        slug: slug(cake.slug),
        description: cake.description,
        fromPriceOere: cake.fromPriceOere,
        priceNote: cake.priceNote,
        servings: cake.servings,
        leadTimeDays: cake.leadTimeDays,
        image: await photoValue(cake.image || undefined, cake.name),
        options: cake.options,
        sort: (i + 1) * 10,
      }),
    );
  }

  // Arrangementer og kurser
  for (const e of eventsJson as Raw[]) {
    if (typeof e.slug !== "string" || typeof e.title !== "string") continue;
    docs.push(
      clean({
        _id: `event-${e.slug}`,
        _type: "event",
        title: e.title,
        slug: slug(e.slug),
        kind: e.kind ?? "arrangement",
        start: e.start,
        end: e.end,
        place: e.place,
        description: e.description,
        priceOere: e.priceOere,
        signup: e.signup ?? false,
        capacity: e.capacity,
        image: await photoValue(typeof e.image === "string" ? e.image : undefined, e.title),
      }),
    );
  }

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
    shopSettings: "bageri-indstillinger",
    pizzaSettings: "pizzavogn",
    page: "sider",
    product: "varer",
    cake: "kager",
    event: "arrangementer",
    faqItem: "spørgsmål",
    instagramPost: "instagram-billeder",
  };
  const summary = Object.entries(stats.documents)
    .map(([type, count]) => `${count} ${labels[type] ?? type}`)
    .join(", ");

  console.log("");
  console.log(dryRun ? `Ville lægge ind i Sanity (dry run): ${summary}.` : `Lagt ind i Sanity (seeded): ${summary}.`);
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
