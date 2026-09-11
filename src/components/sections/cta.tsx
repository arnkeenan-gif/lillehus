import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import type { CmsImage, CtaSection } from "@/lib/cms";
import { cn } from "@/lib/cn";
import { SectionHeading } from "./heading";
import type { SectionProps } from "./types";

/**
 * The colour moment of a page. With the "tint" tone the block is full-bleed
 * rust with paper text, a display heading, one sentence and a paper button;
 * a photo, when the CMS provides one, bleeds on the right half from lg. The
 * paper tone is the same words on paper with a primary button.
 */
type CtaData = CtaSection & { image?: CmsImage };

export function Cta({ section, level: Tag, className }: SectionProps<CtaData>) {
  const { heading, text, link, tone, image } = section;

  if (tone === "tint") {
    return (
      <section className={cn("relative bg-rust text-paper", className)}>
        <Container className="grid lg:grid-cols-12 lg:gap-12">
          <div className={cn("py-16 sm:py-24 lg:py-32", image ? "lg:col-span-7" : "lg:col-span-10")}>
            {heading ? (
              <Tag className="max-w-[16ch] text-balance text-display font-bold tracking-tight text-paper">{heading}</Tag>
            ) : null}
            {text ? <p className="mt-6 max-w-[42ch] text-lead text-paper">{text}</p> : null}
            <div className={cn(heading || text ? "mt-10" : undefined)}>
              <Button href={link.href} variant="paper" size="lg">
                {link.label}
              </Button>
            </div>
          </div>
        </Container>
        {image ? (
          <div className="relative aspect-[3/2] lg:absolute lg:inset-y-0 lg:right-0 lg:aspect-auto lg:w-[42%]">
            <Image
              src={image.src}
              alt={image.alt}
              fill
              sizes="(min-width: 1024px) 42vw, 100vw"
              placeholder={image.lqip ? "blur" : "empty"}
              blurDataURL={image.lqip}
              style={image.hotspot ? { objectPosition: `${Math.round(image.hotspot.x * 100)}% ${Math.round(image.hotspot.y * 100)}%` } : undefined}
              className="object-cover"
            />
          </div>
        ) : null}
      </section>
    );
  }

  return (
    <section className={className}>
      <Container>
        {heading ? (
          <SectionHeading as={Tag} className="max-w-[20ch] text-balance">
            {heading}
          </SectionHeading>
        ) : null}
        <div className="max-w-[62ch]">
          {text ? <p className="mt-4 text-lead text-ink-2">{text}</p> : null}
          <div className={cn(heading || text ? "mt-8" : undefined)}>
            <Button href={link.href} size="lg">
              {link.label}
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
