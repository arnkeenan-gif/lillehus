import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { CmsPhoto } from "@/components/cms/photo";
import type { HeroSection } from "@/lib/cms";
import type { SectionProps } from "./types";

/** Photos at least this wide go edge to edge; smaller files sit inside the container. */
const FULL_BLEED_MIN_WIDTH = 1800;

/**
 * The top of a page: the photograph first, edge to edge when the file is
 * big enough, otherwise in the container at 3/2 (4/5 on phones). Under it,
 * on paper and left-aligned, the display headline, one sentence and the
 * buttons. Nothing is ever written over the photo.
 */
export function Hero({ section, level: Tag, className }: SectionProps<HeroSection>) {
  const { heading, text, image, primaryLink, secondaryLink } = section;
  const fullBleed = Boolean(image && (image.width ?? 0) >= FULL_BLEED_MIN_WIDTH);

  return (
    <section className={className}>
      {image ? (
        fullBleed ? (
          <CmsPhoto
            image={image}
            ratio="4/5"
            lgRatio="16/9"
            rounded="none"
            priority
            sizes="100vw"
            className="lg:max-h-[78vh] lg:min-h-[60vh]"
          />
        ) : (
          <Container className="pt-4 sm:pt-6">
            <CmsPhoto
              image={image}
              ratio="4/5"
              smRatio="3/2"
              rounded="lg"
              priority
              sizes="(min-width: 1264px) 1136px, 100vw"
              className="lg:max-h-[68vh]"
            />
          </Container>
        )
      ) : null}

      <Container className={image ? "pt-8 sm:pt-10" : "pt-12 sm:pt-20"}>
        <Tag className="max-w-[18ch] text-balance text-display font-bold tracking-tight text-ink">{heading}</Tag>
        {text ? <p className="mt-5 max-w-[46ch] text-lead text-ink-2">{text}</p> : null}
        {primaryLink || secondaryLink ? (
          <div className="mt-8 flex flex-wrap gap-3">
            {primaryLink ? (
              <Button href={primaryLink.href} size="lg">
                {primaryLink.label}
              </Button>
            ) : null}
            {secondaryLink ? (
              <Button href={secondaryLink.href} size="lg" variant="secondary">
                {secondaryLink.label}
              </Button>
            ) : null}
          </div>
        ) : null}
      </Container>
    </section>
  );
}
