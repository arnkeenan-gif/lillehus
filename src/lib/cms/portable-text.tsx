/**
 * Renders Portable Text (rich text from Sanity, or the JSON fallback converted
 * by src/lib/cms/blocks.ts) with the site's `prose` styles from globals.css.
 * A Server Component; no state, no browser APIs.
 */
import Link from "next/link";
import { PortableText, type PortableTextComponents, type PortableTextMarkComponentProps } from "@portabletext/react";
import { cn } from "@/lib/cn";
import type { RichText as RichTextValue } from "./types";

type LinkMark = { _type: "link"; href?: string };

function LinkMark({ value, children }: PortableTextMarkComponentProps<LinkMark>) {
  const href = value?.href?.trim() || "#";
  if (href.startsWith("/") || href.startsWith("#")) {
    return <Link href={href}>{children}</Link>;
  }
  const external = /^https?:\/\//.test(href);
  return (
    <a href={href} {...(external ? { target: "_blank", rel: "noreferrer" } : {})}>
      {children}
    </a>
  );
}

export const richTextComponents: PortableTextComponents = {
  block: {
    normal: ({ children }) => <p>{children}</p>,
    h2: ({ children }) => <h2>{children}</h2>,
    h3: ({ children }) => <h3>{children}</h3>,
    blockquote: ({ children }) => <blockquote>{children}</blockquote>,
  },
  list: {
    bullet: ({ children }) => <ul>{children}</ul>,
    number: ({ children }) => <ol>{children}</ol>,
  },
  listItem: {
    bullet: ({ children }) => <li>{children}</li>,
    number: ({ children }) => <li>{children}</li>,
  },
  marks: {
    strong: ({ children }) => <strong>{children}</strong>,
    em: ({ children }) => <em>{children}</em>,
    link: LinkMark,
  },
};

type Props = {
  value: RichTextValue | null | undefined;
  /** Extra classes on the wrapper, e.g. "mt-6". The wrapper always has `prose`. */
  className?: string;
};

export function RichText({ value, className }: Props) {
  if (!value || value.length === 0) return null;
  return (
    <div className={cn("prose", className)}>
      <PortableText value={value} components={richTextComponents} />
    </div>
  );
}
