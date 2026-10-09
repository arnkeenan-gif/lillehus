import Link from "next/link";
import { Container } from "@/components/ui/container";
import { CmsPhoto } from "@/components/cms/photo";
import type { EntriesSection } from "@/lib/cms";
import { cn } from "@/lib/cn";
import { SectionHeading } from "./heading";
import type { SectionProps } from "./types";

/** Column classes by number of entries; three is the forside's Bagværk, Pizzavogn, Arrangementer. */
const columns: Record<number, string> = {
  1: "md:max-w-xl",
  2: "md:grid-cols-2",
  3: "md:grid-cols-3",
  4: "md:grid-cols-2 lg:grid-cols-4",
};

const sizes: Record<number, string> = {
  1: "(min-width: 768px) 576px, 100vw",
  2: "(min-width: 1464px) 656px, (min-width: 768px) 47vw, 100vw",
  3: "(min-width: 1464px) 432px, (min-width: 768px) 31vw, 100vw",
  4: "(min-width: 1464px) 322px, (min-width: 1024px) 23vw, (min-width: 768px) 47vw, 100vw",
};

/**
 * The main ways into the site as large photo tiles, the way the Copenhagen
 * bakeries open their forside: a big photo (4/5 from md, 3/2 on phones so
 * three tiles do not take three screens), the title under it in the title
 * size, an optional line, and the smaller links stacked under the title.
 * The photo and the title are one link; the small links are their own, so
 * nothing is nested. No borders, no boxes, nothing written on the photos.
 */
export function Entries({ section, level, className }: SectionProps<EntriesSection>) {
  const { heading, entries } = section;
  const count = Math.min(4, Math.max(1, entries.length));
  // Under a section heading the titles are h3; without one they are the page's h2s.
  const TitleTag = heading ? "h3" : "h2";

  return (
    <section className={className}>
      <Container size="wide">
        {heading ? (
          <SectionHeading as={level} className="mb-8 sm:mb-10">
            {heading}
          </SectionHeading>
        ) : null}
        <ul className={cn("grid gap-x-5 gap-y-12 lg:gap-x-6", columns[count])}>
          {entries.map((entry) => (
            <li key={entry._key}>
              <Link href={entry.href} className="group block">
                {entry.image ? (
                  <CmsPhoto
                    // The title names the link; the photo is decoration inside it.
                    image={{ ...entry.image, alt: "" }}
                    ratio="3/2"
                    className="md:aspect-[4/5]"
                    sizes={sizes[count]}
                  />
                ) : null}
                <TitleTag
                  className={cn(
                    "text-title font-semibold text-ink decoration-1 underline-offset-[6px] group-hover:underline",
                    entry.image && "mt-4 sm:mt-5",
                  )}
                >
                  {entry.title}
                </TitleTag>
              </Link>
              {entry.text ? <p className="mt-2 max-w-[40ch] text-ink-2">{entry.text}</p> : null}
              {entry.links.length > 0 ? (
                <ul className={entry.text ? "mt-3" : "mt-2"}>
                  {entry.links.map((link) => (
                    <li key={`${link.href}-${link.label}`}>
                      <Link
                        href={link.href}
                        className="inline-flex min-h-11 items-center text-[1.0625rem] text-ink underline decoration-line decoration-1 underline-offset-[5px] transition-colors duration-150 ease-out-quart hover:text-rust hover:decoration-rust"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : null}
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
