import { Container } from "@/components/ui/container";
import { CmsPhoto } from "@/components/cms/photo";
import type { GallerySection } from "@/lib/cms";
import { cn } from "@/lib/cn";
import { SectionHeading, afterIntro } from "./heading";
import type { SectionProps } from "./types";

const stepColumns: Record<GallerySection["columns"], string> = {
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-2 lg:grid-cols-3",
  4: "sm:grid-cols-2 lg:grid-cols-4",
};

/**
 * Photos in their order with the caption under each, e.g. "Sådan finder du
 * fryseren": every photo the same 4/5 shape, numbered when there is more
 * than one, one per row on phones.
 */
function Steps({ section, level, className }: SectionProps<GallerySection>) {
  const { heading, images, columns } = section;
  const numbered = images.length > 1;
  return (
    <section className={className}>
      <Container>
        {heading ? <SectionHeading as={level}>{heading}</SectionHeading> : null}
        <ol className={cn("grid gap-x-5 gap-y-10 lg:gap-x-6", stepColumns[columns] ?? stepColumns[3], heading && afterIntro)}>
          {images.map((item, index) => (
            <li key={item._key}>
              <CmsPhoto
                image={item.image}
                ratio="4/5"
                sizes={
                  columns === 2
                    ? "(min-width: 1264px) 556px, (min-width: 640px) 47vw, 100vw"
                    : "(min-width: 1264px) 365px, (min-width: 1024px) 31vw, (min-width: 640px) 47vw, 100vw"
                }
              />
              {item.caption || numbered ? (
                <p className="mt-3 max-w-[40ch] text-ink-2">
                  {numbered ? <span className="tnum mr-2 font-semibold text-ink">{index + 1}.</span> : null}
                  {item.caption}
                </p>
              ) : null}
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}

/** The 2x2 cell is about 660px wide on a desktop; files narrower than this would blur there. */
const BIG_CELL_MIN_WIDTH = 400;

const columnClasses: Record<GallerySection["columns"], string> = {
  2: "md:grid-cols-2",
  3: "md:grid-cols-3",
  4: "md:grid-cols-4",
};

/**
 * A mixed photo grid: the first big-enough photo spans two columns and two
 * rows, the rest are square cells, 8px apart, nothing written over them.
 * Captions, if Kristine wrote any, become one line under the grid.
 */
export function Gallery({ section, level, className }: SectionProps<GallerySection>) {
  if (section.layout === "steps") return <Steps section={section} level={level} className={className} />;
  const { heading, images, columns } = section;
  const bigIndex = images.findIndex((item) => (item.image.width ?? Number.MAX_SAFE_INTEGER) >= BIG_CELL_MIN_WIDTH);
  const ordered = bigIndex > 0 ? [images[bigIndex], ...images.filter((_, i) => i !== bigIndex)] : images;
  const captions = images.map((item) => item.caption?.trim()).filter((c): c is string => Boolean(c));

  return (
    <section className={className}>
      <Container size="wide">
        {heading ? (
          <SectionHeading as={level} className="mb-8">
            {heading}
          </SectionHeading>
        ) : null}
        <ul className={cn("grid grid-flow-dense grid-cols-2 gap-2", columnClasses[columns] ?? "md:grid-cols-4")}>
          {ordered.map((item, index) => {
            const big = index === 0 && bigIndex >= 0;
            return (
              <li key={item._key} className={big ? "col-span-2 row-span-2" : undefined}>
                <CmsPhoto
                  image={item.image}
                  ratio="1/1"
                  sizes={
                    big
                      ? "(min-width: 1464px) 664px, (min-width: 768px) 50vw, 100vw"
                      : "(min-width: 1464px) 328px, (min-width: 768px) 25vw, 50vw"
                  }
                />
              </li>
            );
          })}
        </ul>
        {captions.length > 0 ? <p className="mt-3 text-sm text-muted">{captions.join(" ")}</p> : null}
      </Container>
    </section>
  );
}
