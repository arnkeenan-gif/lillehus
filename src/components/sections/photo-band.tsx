import { Container } from "@/components/ui/container";
import { CmsPhoto } from "@/components/cms/photo";
import type { PhotoBandSection } from "@/lib/cms";
import type { SectionProps } from "./types";

/** Files at least this wide fill the wide (1400px) container; smaller ones stay at 1200px. */
const WIDE_MIN_WIDTH = 1250;

/** One photograph across the page, the caption in small text below it. */
export function PhotoBand({ section, className }: SectionProps<PhotoBandSection>) {
  const { image, caption, ratio } = section;
  const wide = (image.width ?? Number.MAX_SAFE_INTEGER) >= WIDE_MIN_WIDTH;

  return (
    <section className={className}>
      <Container size={wide ? "wide" : "default"}>
        <figure className={ratio === "4/5" ? "max-w-3xl" : undefined}>
          <CmsPhoto
            image={image}
            ratio={ratio}
            rounded="lg"
            sizes={wide ? "(min-width: 1464px) 1336px, 100vw" : "(min-width: 1264px) 1136px, 100vw"}
          />
          {caption ? <figcaption className="mt-3 text-sm text-muted">{caption}</figcaption> : null}
        </figure>
      </Container>
    </section>
  );
}
