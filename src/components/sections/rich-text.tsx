import Image from "next/image";
import {
  PortableText,
  type PortableTextBlockComponent,
  type PortableTextComponents,
  type PortableTextMarkComponent,
} from "@portabletext/react";
import { Container } from "@/components/ui/container";
import { CmsPhoto, isMark } from "@/components/cms/photo";
import { RichText, type RichTextSection } from "@/lib/cms";
import { richTextComponents } from "@/lib/cms/portable-text";
import { cn } from "@/lib/cn";
import { SectionHeading } from "./heading";
import type { SectionProps } from "./types";

/**
 * Prose, alone in a 62ch column or beside a photo (7/5 at lg, stacked
 * below). A short block without a heading, such as the "this week" text on
 * the forside, is set in the lead size instead of body size. The hand-drawn
 * logo is a mark, not a photo: it is shown whole at 240 to 320px.
 */

function isLead(section: RichTextSection): boolean {
  if (section.heading) return false;
  const blocks = section.body;
  if (blocks.length === 0 || blocks.length > 3) return false;
  let chars = 0;
  for (const block of blocks) {
    if (block._type !== "block" || (block.style && block.style !== "normal") || block.listItem) return false;
    for (const child of block.children ?? []) {
      const text = (child as { text?: unknown }).text;
      if (typeof text === "string") chars += text.length;
    }
  }
  return chars <= 480;
}

const blockComponents = (richTextComponents.block ?? {}) as Record<string, PortableTextBlockComponent>;
const markComponents = (richTextComponents.marks ?? {}) as Record<string, PortableTextMarkComponent>;

const leadComponents: PortableTextComponents = {
  ...richTextComponents,
  block: {
    ...blockComponents,
    normal: ({ children }) => <p className="text-lead text-ink">{children}</p>,
  },
  marks: {
    ...markComponents,
    strong: ({ children }) => <strong className="font-semibold text-ink">{children}</strong>,
  },
};

export function RichTextBlock({ section, level, className }: SectionProps<RichTextSection>) {
  const { heading, body, image, imagePosition, tone } = section;
  const lead = isLead(section);
  const mark = image ? isMark(image) : false;

  const headingNode = heading ? (
    <SectionHeading as={level} className="max-w-[20ch] text-balance">
      {heading}
    </SectionHeading>
  ) : null;

  const text = (
    <>
      {lead ? (
        <div
          className={cn(
            "space-y-5 [&_a]:text-rust [&_a]:underline [&_a]:decoration-1 [&_a]:underline-offset-[3px] [&_a:hover]:text-rust-deep",
            heading && "mt-6",
          )}
        >
          <PortableText value={body} components={leadComponents} />
        </div>
      ) : (
        <RichText value={body} className={heading ? "mt-6" : undefined} />
      )}
    </>
  );

  const content = image ? (
    <div className="grid gap-10 lg:grid-cols-12 lg:items-center lg:gap-16">
      <div className={cn(mark ? "lg:col-span-4" : "lg:col-span-5", imagePosition === "left" ? "lg:order-first" : "lg:order-last")}>
        {mark ? (
          <Image
            src={image.src}
            alt={image.alt}
            width={image.width ?? 1356}
            height={image.height ?? 1141}
            sizes="(min-width: 1024px) 320px, 288px"
            className="h-auto w-60 sm:w-72 lg:w-80"
          />
        ) : (
          <CmsPhoto
            image={image}
            ratio="4/5"
            sizes="(min-width: 1264px) 470px, (min-width: 1024px) 40vw, (min-width: 640px) 448px, 100vw"
            className="max-w-md lg:max-w-none"
          />
        )}
      </div>
      <div className="lg:col-span-7">
        {headingNode}
        {text}
      </div>
    </div>
  ) : (
    <>
      {headingNode}
      <div className="max-w-[62ch]">{text}</div>
    </>
  );

  if (tone === "tint") {
    return (
      <section className={cn("bg-paper-2 py-16 sm:py-24", className)}>
        <Container>{content}</Container>
      </section>
    );
  }

  return (
    <section className={className}>
      <Container>{content}</Container>
    </section>
  );
}
