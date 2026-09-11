import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { Container } from "@/components/ui/container";
import { CmsPhoto } from "@/components/cms/photo";
import { getInstagramImages, getSiteSettings, type InstagramSection } from "@/lib/cms";
import { cn } from "@/lib/cn";
import { SectionHeading, textLink } from "./heading";
import type { SectionProps } from "./types";

/** A tight strip of square photos from Instagram, then a link to the profile. */
export async function InstagramGrid({ section, level, className }: SectionProps<InstagramSection>) {
  const [images, settings] = await Promise.all([getInstagramImages(), getSiteSettings()]);
  const list = images.slice(0, section.limit);
  if (list.length === 0) return null;
  const sizes = "(min-width: 1464px) 216px, (min-width: 768px) 16vw, 33vw";

  return (
    <section className={className}>
      <Container size="wide">
        {section.heading ? (
          <SectionHeading as={level} className="mb-8">
            {section.heading}
          </SectionHeading>
        ) : null}
        <ul className="grid grid-cols-3 gap-2 md:grid-cols-6">
          {list.map((item) => (
            <li key={item.id}>
              {item.url ? (
                <a href={item.url} target="_blank" rel="noreferrer" className="block">
                  <CmsPhoto image={item.image} ratio="1/1" sizes={sizes} />
                </a>
              ) : (
                <CmsPhoto image={item.image} ratio="1/1" sizes={sizes} />
              )}
            </li>
          ))}
        </ul>
        {settings.social.instagram ? (
          <p className="mt-5">
            <a
              href={settings.social.instagram}
              target="_blank"
              rel="noreferrer"
              className={cn("inline-flex items-center gap-1", textLink)}
            >
              {section.linkLabel ?? "Følg med på Instagram"}
              <ArrowUpRight size={20} aria-hidden="true" />
              <span className="sr-only">(åbner i nyt vindue)</span>
            </a>
          </p>
        ) : null}
      </Container>
    </section>
  );
}
