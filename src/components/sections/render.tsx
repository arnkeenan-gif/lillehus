import type { Page, Section } from "@/lib/cms";
import { Container } from "@/components/ui/container";
import type { HeadingLevel } from "./heading";
import { CakeList } from "./cake-list";
import { Contact } from "./contact";
import { Cta } from "./cta";
import { Events } from "./events";
import { Faq } from "./faq";
import { FormBlock } from "./form";
import { Gallery } from "./gallery";
import { Hero } from "./hero";
import { Hours } from "./hours";
import { InstagramGrid } from "./instagram";
import { PhotoBand } from "./photo-band";
import { PickupInfo } from "./pickup-info";
import { PizzaPart } from "./pizza";
import { PriceList } from "./price-list";
import { ProductStrip } from "./product-strip";
import { Quote } from "./quote";
import { RichTextBlock } from "./rich-text";

/**
 * Renders a CMS page as its list of sections and decides the space between
 * them (DESIGN.md §5). The rhythm is not uniform: the first block after a
 * hero starts with confident space (64 to 96px after a full-image cover,
 * 56 to 80px after a title on paper), photo blocks may touch each other
 * with an 8px gap, a photo and a text block stand 64 to 96px apart, and
 * text blocks stand 80 to 128px apart. The rust block is full-bleed and
 * keeps the text rhythm.
 *
 * The page's one h1 is the heading of the first section when it has one
 * (a hero always has one); otherwise the page title opens the page and every
 * section heading is an h2.
 */

/** Sections that are mostly photograph, allowed to sit close together. */
const PHOTO_SECTIONS = new Set<Section["_type"]>(["photoBandSection", "gallerySection", "instagramSection"]);

function hasHeading(section: Section): boolean {
  return "heading" in section && typeof section.heading === "string" && section.heading.trim() !== "";
}

/** A hero whose photograph fills the first screen (see hero.tsx). */
function isCoverHero(section: Section): boolean {
  return section._type === "heroSection" && section.variant === "cover" && Boolean(section.image);
}

function spacing(prev: Section | undefined, current: Section, first: boolean): string {
  if (first) return current._type === "heroSection" ? "" : "pt-12 sm:pt-20";
  // After the page title that render.tsx sets when the first section has no heading.
  if (!prev) return "mt-12 sm:mt-16";
  if (prev._type === "heroSection") {
    if (isCoverHero(prev) || prev.image) return "mt-16 sm:mt-24";
    return "mt-14 sm:mt-20";
  }
  const photoPair = PHOTO_SECTIONS.has(prev._type) && PHOTO_SECTIONS.has(current._type);
  if (photoPair) return "mt-2";
  if (PHOTO_SECTIONS.has(prev._type) || PHOTO_SECTIONS.has(current._type)) return "mt-16 sm:mt-20 lg:mt-24";
  return "mt-20 sm:mt-24 lg:mt-32";
}

/** The rust block sits on the footer when it closes the page; paper keeps a margin. */
function endsInRust(sections: Section[]): boolean {
  const last = sections[sections.length - 1];
  return last?._type === "ctaSection" && last.tone === "tint";
}

export function Sections({ page }: { page: Page }) {
  const sections = page.sections;
  const opensWithHeading = sections.length > 0 && hasHeading(sections[0]);

  return (
    <div className={endsInRust(sections) ? undefined : "pb-24 sm:pb-32"}>
      {!opensWithHeading ? (
        <Container className="pt-12 sm:pt-20">
          <h1 className="max-w-[18ch] text-balance text-display font-semibold tracking-tight text-ink">{page.title}</h1>
        </Container>
      ) : null}
      {sections.map((section, index) => {
        const first = index === 0 && opensWithHeading;
        const level: HeadingLevel = first ? "h1" : "h2";
        const className = spacing(sections[index - 1], section, first);
        return (
          <SectionSwitch key={section._key} section={section} prev={sections[index - 1]} level={level} className={className} />
        );
      })}
    </div>
  );
}

/** True when the section is a hero that already carries a lead sentence under its title. */
function isHeroWithLead(section: Section | undefined): boolean {
  return section?._type === "heroSection" && typeof section.text === "string" && section.text.trim() !== "";
}

function SectionSwitch({
  section,
  prev,
  level,
  className,
}: {
  section: Section;
  prev: Section | undefined;
  level: HeadingLevel;
  className: string;
}) {
  switch (section._type) {
    case "heroSection":
      return <Hero section={section} level={level} className={className} />;
    case "richTextSection":
      return <RichTextBlock section={section} level={level} className={className} afterLead={isHeroWithLead(prev)} />;
    case "photoBandSection":
      return <PhotoBand section={section} level={level} className={className} />;
    case "gallerySection":
      return <Gallery section={section} level={level} className={className} />;
    case "productStripSection":
      return <ProductStrip section={section} level={level} className={className} />;
    case "priceListSection":
      return <PriceList section={section} level={level} className={className} />;
    case "hoursSection":
      return <Hours section={section} level={level} className={className} />;
    case "eventsSection":
      return <Events section={section} level={level} className={className} />;
    case "faqSection":
      return <Faq section={section} level={level} className={className} />;
    case "instagramSection":
      return <InstagramGrid section={section} level={level} className={className} />;
    case "ctaSection":
      return <Cta section={section} level={level} className={className} />;
    case "formSection":
      return <FormBlock section={section} level={level} className={className} />;
    case "quoteSection":
      return <Quote section={section} level={level} className={className} />;
    case "cakeListSection":
      return <CakeList section={section} level={level} className={className} />;
    case "pizzaSection":
      return <PizzaPart section={section} level={level} className={className} />;
    case "pickupInfoSection":
      return <PickupInfo section={section} level={level} className={className} />;
    case "contactSection":
      return <Contact section={section} level={level} className={className} />;
    default:
      return null;
  }
}
