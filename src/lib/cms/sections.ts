/**
 * Turns raw section data into the typed Section union. The same builder
 * serves both sources: the JSON fallback (images are paths, products and FAQ
 * entries are ids) and Sanity (images are asset objects, references are
 * already followed). The context tells it how to resolve each of those.
 * Unknown or broken sections are dropped rather than crashing a page.
 */
import { toPortableText, type RichTextInput } from "./blocks";
import type {
  CmsImage,
  CmsLink,
  FaqItem,
  FormKind,
  GallerySection,
  PriceListRow,
  Product,
  Section,
  SectionType,
} from "./types";

export interface SectionContext {
  image: (value: unknown, fallbackAlt?: string) => CmsImage | undefined;
  product: (value: unknown) => Product | undefined;
  faq: (value: unknown) => FaqItem | undefined;
}

type Raw = Record<string, unknown>;

const FORM_KINDS: readonly FormKind[] = ["pizza", "cake", "contact", "company", "course", "newsletter", "event"];

export function buildSections(raw: unknown, ctx: SectionContext): Section[] {
  if (!Array.isArray(raw)) return [];
  const out: Section[] = [];
  raw.forEach((item, index) => {
    if (!item || typeof item !== "object") return;
    const section = buildSection(item as Raw, index, ctx);
    if (section) out.push(section);
  });
  return out;
}

function isRaw(v: unknown): v is Raw {
  return typeof v === "object" && v !== null;
}

function str(o: Raw, key: string): string | undefined {
  const v = o[key];
  return typeof v === "string" && v.trim() !== "" ? v : undefined;
}

function num(o: Raw, key: string, fallback: number): number {
  const v = o[key];
  return typeof v === "number" && Number.isFinite(v) ? v : fallback;
}

function bool(o: Raw, key: string, fallback: boolean): boolean {
  const v = o[key];
  return typeof v === "boolean" ? v : fallback;
}

function oneOf<T extends string>(o: Raw, key: string, allowed: readonly T[], fallback: T): T {
  const v = o[key];
  return typeof v === "string" && (allowed as readonly string[]).includes(v) ? (v as T) : fallback;
}

function strings(o: Raw, key: string): string[] {
  const v = o[key];
  return Array.isArray(v) ? v.filter((s): s is string => typeof s === "string" && s.trim() !== "") : [];
}

function link(o: Raw, key: string): CmsLink | undefined {
  const v = o[key];
  if (!isRaw(v)) return undefined;
  const label = str(v, "label");
  const href = str(v, "href");
  return label && href ? { label, href } : undefined;
}

function list(o: Raw, key: string): unknown[] {
  const v = o[key];
  return Array.isArray(v) ? v : [];
}

function buildSection(raw: Raw, index: number, ctx: SectionContext): Section | null {
  const type = raw._type as SectionType;
  const _key = str(raw, "_key") ?? `${type}-${index}`;
  const heading = str(raw, "heading");
  const text = str(raw, "text");

  switch (type) {
    case "heroSection": {
      const h = heading;
      if (!h) return null;
      return {
        _type: type,
        _key,
        heading: h,
        text,
        image: ctx.image(raw.image),
        primaryLink: link(raw, "primaryLink"),
        secondaryLink: link(raw, "secondaryLink"),
      };
    }
    case "richTextSection": {
      const body = toPortableText(raw.body as RichTextInput, `${_key}-`);
      if (body.length === 0 && !heading) return null;
      return {
        _type: type,
        _key,
        heading,
        body,
        image: ctx.image(raw.image),
        imagePosition: oneOf(raw, "imagePosition", ["left", "right"] as const, "right"),
        tone: oneOf(raw, "tone", ["paper", "tint"] as const, "paper"),
      };
    }
    case "photoBandSection": {
      const image = ctx.image(raw.image);
      if (!image) return null;
      return { _type: type, _key, image, caption: str(raw, "caption"), ratio: oneOf(raw, "ratio", ["3/2", "16/9", "4/5"] as const, "3/2") };
    }
    case "gallerySection": {
      const images: GallerySection["images"] = [];
      list(raw, "images").forEach((entry, i) => {
        if (!isRaw(entry)) return;
        const image = ctx.image(entry.image);
        if (image) images.push({ _key: str(entry, "_key") ?? `${_key}-${i}`, image, caption: str(entry, "caption") });
      });
      if (images.length === 0) return null;
      const columns = num(raw, "columns", 3);
      return { _type: type, _key, heading, images, columns: columns === 2 || columns === 4 ? columns : 3 };
    }
    case "productStripSection": {
      const mode = oneOf(raw, "mode", ["auto", "manual"] as const, "auto");
      const products = mode === "manual" ? list(raw, "products").map(ctx.product).filter((p): p is Product => Boolean(p)) : [];
      return { _type: type, _key, heading, text, mode, products, limit: num(raw, "limit", 4), link: link(raw, "link") };
    }
    case "priceListSection": {
      const rows: PriceListRow[] = [];
      list(raw, "rows").forEach((entry, i) => {
        if (!isRaw(entry)) return;
        const name = str(entry, "name");
        const price = str(entry, "price");
        if (name && price) rows.push({ _key: str(entry, "_key") ?? `${_key}-${i}`, name, price, note: str(entry, "note") });
      });
      if (rows.length === 0) return null;
      return { _type: type, _key, heading, intro: str(raw, "intro"), rows, footnote: str(raw, "footnote") };
    }
    case "hoursSection": {
      const only = str(raw, "only");
      return { _type: type, _key, heading, text, only: only && only !== "alle" ? only : undefined, link: link(raw, "link") };
    }
    case "eventsSection":
      return {
        _type: type,
        _key,
        heading,
        text,
        showWeek: bool(raw, "showWeek", false),
        emptyText: str(raw, "emptyText"),
        limit: num(raw, "limit", 3),
        link: link(raw, "link"),
      };
    case "faqSection": {
      const mode = oneOf(raw, "mode", ["all", "selected"] as const, "all");
      const items = mode === "selected" ? list(raw, "items").map(ctx.faq).filter((f): f is FaqItem => Boolean(f)) : [];
      return { _type: type, _key, heading, mode, items };
    }
    case "instagramSection":
      return { _type: type, _key, heading, linkLabel: str(raw, "linkLabel"), limit: num(raw, "limit", 6) };
    case "ctaSection": {
      const l = link(raw, "link");
      if (!l) return null;
      return { _type: type, _key, heading, text, link: l, image: ctx.image(raw.image), tone: oneOf(raw, "tone", ["paper", "tint"] as const, "paper") };
    }
    case "formSection": {
      const kind = raw.kind;
      if (typeof kind !== "string" || !(FORM_KINDS as readonly string[]).includes(kind)) return null;
      return { _type: type, _key, kind: kind as FormKind, heading, text, steps: strings(raw, "steps") };
    }
    case "quoteSection": {
      const quote = str(raw, "quote");
      if (!quote) return null;
      return { _type: type, _key, quote, attribution: str(raw, "attribution") };
    }
    case "cakeListSection":
      return { _type: type, _key, heading, text };
    case "pizzaSection": {
      const part = raw.part;
      if (part !== "day" && part !== "prices" && part !== "menu" && part !== "terms") return null;
      return { _type: type, _key, part, heading, text };
    }
    case "pickupInfoSection":
      return { _type: type, _key, heading, detail: oneOf(raw, "detail", ["kort", "udførlig"] as const, "kort"), text, link: link(raw, "link") };
    case "contactSection":
      return { _type: type, _key, heading, text };
    default:
      return null;
  }
}
