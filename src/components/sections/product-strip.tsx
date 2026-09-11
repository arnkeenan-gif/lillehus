import Link from "next/link";
import { Container } from "@/components/ui/container";
import { CmsPhoto } from "@/components/cms/photo";
import { cutoffText, pickupDaysText } from "@/components/cms/text";
import { getProducts, getShopSettings, type CmsImage, type Product, type ProductStripSection } from "@/lib/cms";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/cn";
import { SectionHeading, SectionIntro, afterIntro, textLink } from "./heading";
import type { SectionProps } from "./types";

/**
 * Bread as a shop window: photo (4/5), name, price. Four across from lg, two
 * on phones, even gutters at every width, no borders, no buttons; every tile
 * links to the shop. Products without a photo are left out, since the photo
 * is the tile.
 */
function photoOf(product: Product): CmsImage | undefined {
  if (product.photo) return product.photo;
  if (product.image) return { src: product.image, alt: product.name };
  return undefined;
}

export async function ProductStrip({ section, level, className }: SectionProps<ProductStripSection>) {
  const [all, shop] = await Promise.all([section.mode === "auto" ? getProducts() : section.products, getShopSettings()]);
  const products = all
    .map((product) => ({ product, photo: photoOf(product) }))
    .filter((entry): entry is { product: Product; photo: CmsImage } => Boolean(entry.photo))
    .slice(0, section.limit);
  if (products.length === 0) return null;

  const text =
    section.text ??
    `Bestil senest ${cutoffText(shop)}. Hent i Hønsehuset ${pickupDaysText(shop)}, kl. ${shop.pickupWindow}.`;
  const hasTop = Boolean(section.heading || text);

  return (
    <section className={className}>
      <Container>
        {section.heading ? <SectionHeading as={level}>{section.heading}</SectionHeading> : null}
        {text ? (
          <SectionIntro level={level} afterHeading={Boolean(section.heading)}>
            {text}
          </SectionIntro>
        ) : null}
        <ul className={cn("grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-5 lg:grid-cols-4 lg:gap-x-6 lg:gap-y-10", hasTop && afterIntro)}>
          {products.map(({ product, photo }) => (
            <li key={product.id}>
              <Link href="/bageri" className="group block">
                <CmsPhoto image={photo} ratio="4/5" sizes="(min-width: 1264px) 272px, (min-width: 1024px) 23vw, 45vw" />
                <p className="mt-3 font-medium text-ink group-hover:underline group-hover:underline-offset-[3px]">{product.name}</p>
                <p className="tnum text-[0.95rem] text-ink-2">{formatPrice(product.priceOere)}</p>
              </Link>
            </li>
          ))}
        </ul>
        {section.link ? (
          <p className="mt-10">
            <Link href={section.link.href} className={textLink}>
              {section.link.label}
            </Link>
          </p>
        ) : null}
      </Container>
    </section>
  );
}
