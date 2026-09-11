import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { CmsPhoto } from "@/components/cms/photo";
import { CoverHeaderMode } from "@/components/site/cover-header-mode";
import { cn } from "@/lib/cn";
import type { HeroSection } from "@/lib/cms";
import type { SectionProps } from "./types";

/** Photos at least this wide go edge to edge in the stacked variant. */
const FULL_BLEED_MIN_WIDTH = 1800;

export function Hero(props: SectionProps<HeroSection>) {
  if (props.section.variant === "cover" && props.section.image) return <HeroCover {...props} />;
  return <HeroStacked {...props} />;
}

/**
 * The full-image opening the Copenhagen bakeries use: the photograph fills
 * the first screen edge to edge, the header floats over it, and one line
 * with two underlined links sits at the bottom left of the photo.
 */
function HeroCover({ section, level: Tag, className }: SectionProps<HeroSection>) {
  const { heading, text, image, primaryLink, secondaryLink } = section;
  if (!image) return null;
  const links = [primaryLink, secondaryLink].filter((l): l is NonNullable<typeof l> => Boolean(l));
  const position = image.hotspot
    ? `${Math.round(image.hotspot.x * 100)}% ${Math.round(image.hotspot.y * 100)}%`
    : "50% 50%";

  return (
    <section
      className={cn(
        "relative -mt-16 h-[82svh] max-h-[920px] min-h-[540px] w-full overflow-hidden bg-ink text-white lg:-mt-[72px]",
        className,
      )}
    >
      <Image
        src={image.src}
        alt={image.alt}
        fill
        priority
        sizes="100vw"
        className="object-cover"
        style={{ objectPosition: position }}
        placeholder={image.lqip ? "blur" : "empty"}
        blurDataURL={image.lqip}
      />
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/0 to-black/60" />
      <Container className="relative flex h-full flex-col justify-end pb-12 sm:pb-14 lg:pb-16">
        <Tag className="max-w-[12ch] text-balance text-[2rem] font-semibold leading-[1.08] tracking-tight sm:text-[2.5rem] lg:text-[2.75rem]">{heading}</Tag>
        {text ? <p className="mt-4 max-w-[36ch] text-[1.05rem] text-white/90 sm:text-lg">{text}</p> : null}
        {links.length > 0 ? (
          <div className="mt-6 flex flex-wrap gap-x-8 gap-y-3">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-[13px] font-semibold uppercase tracking-[0.12em] underline decoration-1 underline-offset-[6px] transition-opacity duration-150 ease-out-quart hover:opacity-80"
              >
                {l.label} ›
              </Link>
            ))}
          </div>
        ) : null}
      </Container>
      <CoverHeaderMode />
    </section>
  );
}

/**
 * The photograph first, edge to edge when the file is big enough, otherwise
 * in the container at 3/2 (4/5 on phones); under it, on paper, the headline,
 * one sentence and the buttons.
 */
function HeroStacked({ section, level: Tag, className }: SectionProps<HeroSection>) {
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
        <Tag className="max-w-[18ch] text-balance text-display font-semibold tracking-tight text-ink">{heading}</Tag>
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
