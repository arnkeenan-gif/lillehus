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
import { SectionHeading, textMeasure } from "./heading";
import type { SectionProps } from "./types";

/**
 * Prose, alone in a 62ch column or beside a photo. Beside a photo the text
 * starts at the top edge of the photo, never floating mid-height, and the
 * photo takes five of twelve columns from lg. A short block (a few
 * sentences) gets a smaller, square photo in four columns so the words are
 * not dwarfed by it; without a heading, and when it does not follow a hero
 * that already has a lead sentence, such a block is set in the lead size,
 * like the "this week" text on the forside. On phones the photo comes
 * first, full width. The hand-drawn logo is a mark, not a photo: it is
 * shown whole at 224 to 320px.
 */

/** A few plain paragraphs, at most 480 characters: short enough for the lead size. */
function isShort(section: RichTextSection): boolean {
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
    normal: ({ children }) => <p className="max-w-[46ch] text-lead text-ink">{children}</p>,
  },
  marks: {
    ...markComponents,
    strong: ({ children }) => <strong className="font-semibold text-ink">{children}</strong>,
  },
};

type Props = SectionProps<RichTextSection> & {
  /** True when the section above is a hero with a lead sentence; the block then stays body size. */
  afterLead?: boolean;
};

export function RichTextBlock({ section, level, className, afterLead }: Props) {
  const { heading, body, image, imagePosition, tone } = section;
  const short = isShort(section);
  const lead = short && !heading && !afterLead;
  const mark = image ? isMark(image) : false;
  const left = imagePosition === "left";
  // A short text or the logo gets the narrow photo column; running prose the wide one.
  const narrow = mark || short;

  const headingNode = heading ? <SectionHeading as={level}>{heading}</SectionHeading> : null;

  const text = lead ? (
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
  );

  const content = image ? (
    <div className="grid gap-8 lg:grid-cols-12 lg:items-start lg:gap-12">
      <div
        className={cn(
          "lg:row-start-1",
          // Five columns at lg (372px at 1024px, never a thumbnail), four from xl for the narrow slot.
          narrow ? "lg:col-span-5 xl:col-span-4" : "lg:col-span-5",
          left ? "lg:col-start-1" : narrow ? "lg:col-start-8 xl:col-start-9" : "lg:col-start-8",
        )}
      >
        {mark ? (
          <Image
            src={image.src}
            alt={image.alt}
            width={image.width ?? 1356}
            height={image.height ?? 1141}
            sizes="(min-width: 1024px) 320px, 256px"
            className="h-auto w-56 sm:w-64 lg:w-full lg:max-w-[320px]"
          />
        ) : (
          <CmsPhoto
            image={image}
            ratio="4/5"
            lgRatio={short ? "1/1" : "4/5"}
            sizes={
              narrow
                ? "(min-width: 1280px) 350px, (min-width: 1024px) 38vw, (min-width: 640px) 448px, 100vw"
                : "(min-width: 1264px) 450px, (min-width: 1024px) 38vw, (min-width: 640px) 448px, 100vw"
            }
            className="max-w-md lg:max-w-none"
          />
        )}
      </div>
      <div className={cn("lg:col-span-7 lg:row-start-1", left ? "lg:col-start-6" : "lg:col-start-1")}>
        {headingNode}
        <div className={lead ? undefined : textMeasure}>{text}</div>
      </div>
    </div>
  ) : (
    <>
      {headingNode}
      <div className={lead ? undefined : textMeasure}>{text}</div>
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
