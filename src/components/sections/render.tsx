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
 * them (DESIGN.md §5): the hero sits tight against what follows, photo
 * blocks may touch each other with an 8px gap, text blocks stand 80 to
 * 112px apart, the rust block is full-bleed and keeps the text rhythm.
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

function spacing(prev: Section | undefined, current: Section, first: boolean): string {
  if (first) return current._type === "heroSection" ? "" : "pt-10 sm:pt-14";
  if (!prev) return "mt-10";
  if (prev._type === "heroSection") return "mt-10";
  const photoPair = PHOTO_SECTIONS.has(prev._type) && PHOTO_SECTIONS.has(current._type);
  if (photoPair) return "mt-2";
  if (PHOTO_SECTIONS.has(prev._type) || PHOTO_SECTIONS.has(current._type)) return "mt-16 sm:mt-20";
  return "mt-20 sm:mt-28";
}

export function Sections({ page }: { page: Page }) {
  const sections = page.sections;
  const opensWithHeading = sections.length > 0 && hasHeading(sections[0]);

  return (
    <div className="pb-20 sm:pb-28">
      {!opensWithHeading ? (
        <Container className="pt-12 sm:pt-20">
          <h1 className="max-w-[18ch] text-balance text-display font-bold tracking-tight text-ink">{page.title}</h1>
        </Container>
      ) : null}
      {sections.map((section, index) => {
        const first = index === 0 && opensWithHeading;
        const level: HeadingLevel = first ? "h1" : "h2";
        const className = spacing(sections[index - 1], section, first);
        return <SectionSwitch key={section._key} section={section} level={level} className={className} />;
      })}
    </div>
  );
}

function SectionSwitch({ section, level, className }: { section: Section; level: HeadingLevel; className: string }) {
  switch (section._type) {
    case "heroSection":
      return <Hero section={section} level={level} className={className} />;
    case "richTextSection":
      return <RichTextBlock section={section} level={level} className={className} />;
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
