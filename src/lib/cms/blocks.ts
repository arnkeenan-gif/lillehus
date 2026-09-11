/**
 * Portable Text helpers shared by the CMS façade (JSON fallback) and the seed
 * script. Keep this file free of app imports: the seed runs it in plain Node.
 *
 * The fallback JSON files write rich text in a small shorthand so nobody has to
 * hand-write Portable Text blocks:
 *
 *   "En almindelig afsnit med **fed tekst** og [et link](/bageri)."
 *   { "h2": "En overskrift" }
 *   { "h3": "En mindre overskrift" }
 *   { "ul": ["Punkt", "Punkt"] }
 *   { "ol": ["Første", "Andet"] }
 *
 * A "\n" inside a string becomes a line break. The same shorthand is accepted
 * by the seed, which stores real Portable Text in Sanity, so the renderer only
 * ever sees one shape: PortableTextBlock[].
 */
import type { PortableTextBlock } from "@portabletext/react";

export type SimpleBlock =
  | string
  | { p: string }
  | { h2: string }
  | { h3: string }
  | { ul: string[] }
  | { ol: string[] };

export type RichTextInput = string | SimpleBlock[] | PortableTextBlock[] | null | undefined;

type Span = { _type: "span"; _key: string; text: string; marks: string[] };
type LinkDef = { _type: "link"; _key: string; href: string };

/** True when the value already is a Portable Text array (from Sanity). */
export function isPortableText(value: unknown): value is PortableTextBlock[] {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.every((b) => typeof b === "object" && b !== null && "_type" in b && Array.isArray((b as PortableTextBlock).children))
  );
}

/**
 * Converts a string, an array of shorthand blocks or an existing Portable Text
 * array into Portable Text. Keys are deterministic so a re-run of the seed
 * produces the same document (no needless revisions in Sanity).
 */
export function toPortableText(input: RichTextInput, keyPrefix = "b"): PortableTextBlock[] {
  if (input === null || input === undefined) return [];
  if (typeof input === "string") return input.trim() ? [paragraph(input, `${keyPrefix}0`)] : [];
  if (isPortableText(input)) return input;

  const out: PortableTextBlock[] = [];
  let n = 0;
  for (const item of input as SimpleBlock[]) {
    const key = () => `${keyPrefix}${n++}`;
    if (typeof item === "string") {
      out.push(paragraph(item, key()));
    } else if ("p" in item) {
      out.push(paragraph(item.p, key()));
    } else if ("h2" in item) {
      out.push(block(item.h2, key(), "h2"));
    } else if ("h3" in item) {
      out.push(block(item.h3, key(), "h3"));
    } else if ("ul" in item) {
      for (const li of item.ul) out.push({ ...block(li, key(), "normal"), listItem: "bullet", level: 1 });
    } else if ("ol" in item) {
      for (const li of item.ol) out.push({ ...block(li, key(), "normal"), listItem: "number", level: 1 });
    }
  }
  return out;
}

/** Each string becomes its own paragraph. Used for content/pizza.json style arrays. */
export function paragraphsToPortableText(paragraphs: string[], keyPrefix = "b"): PortableTextBlock[] {
  return paragraphs.map((p, i) => paragraph(p, `${keyPrefix}${i}`));
}

/** The text of every block, paragraphs separated by a blank line. */
export function plainText(blocks: PortableTextBlock[] | null | undefined): string {
  if (!blocks) return "";
  return blocks
    .map((b) =>
      (b.children ?? [])
        .map((c) => (typeof (c as { text?: unknown }).text === "string" ? (c as { text: string }).text : ""))
        .join(""),
    )
    .filter((s) => s.length > 0)
    .join("\n\n");
}

function paragraph(text: string, key: string): PortableTextBlock {
  return block(text, key, "normal");
}

function block(text: string, key: string, style: "normal" | "h2" | "h3"): PortableTextBlock {
  const { children, markDefs } = parseInline(text, key);
  return { _type: "block", _key: key, style, markDefs, children };
}

/** `**strong**` and `[label](href)` inside one block. */
function parseInline(text: string, blockKey: string): { children: Span[]; markDefs: LinkDef[] } {
  const children: Span[] = [];
  const markDefs: LinkDef[] = [];
  const re = /\*\*(.+?)\*\*|\[([^\]]+)\]\(([^)\s]+)\)/g;
  let last = 0;
  let links = 0;
  let spans = 0;
  const span = (t: string, marks: string[]): Span => ({ _type: "span", _key: `${blockKey}s${spans++}`, text: t, marks });

  for (let m = re.exec(text); m !== null; m = re.exec(text)) {
    if (m.index > last) children.push(span(text.slice(last, m.index), []));
    if (m[1] !== undefined) {
      children.push(span(m[1], ["strong"]));
    } else {
      const key = `${blockKey}l${links++}`;
      markDefs.push({ _type: "link", _key: key, href: m[3] });
      children.push(span(m[2], [key]));
    }
    last = m.index + m[0].length;
  }
  if (last < text.length) children.push(span(text.slice(last), []));
  if (children.length === 0) children.push(span("", []));
  return { children, markDefs };
}
