import { Container } from "@/components/ui/container";
import { CmsPhoto } from "@/components/cms/photo";
import type { GallerySection } from "@/lib/cms";
import { cn } from "@/lib/cn";
import { SectionHeading } from "./heading";
import type { SectionProps } from "./types";

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
