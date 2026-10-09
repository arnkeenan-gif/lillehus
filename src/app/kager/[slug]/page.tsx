import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CaretDown } from "@phosphor-icons/react/dist/ssr";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { CakeConfigurator } from "@/components/ordering/cake-configurator";
import { CakeGallery } from "@/components/ordering/cake-gallery";
import { hotspotPosition } from "@/components/shop/product-photo";
import { getCakeProduct, getCakeProducts, RichText } from "@/lib/cms";
import { toClientLocations } from "@/lib/cart-pickup";
import { cn } from "@/lib/cn";
import { cakeInCart, cakeRule, getShopCatalog, renderTime } from "@/lib/products";

/*
  One cake, set up like Emma's kagemænd (Kristine's description, section 3):
  the photos, the name, the live price, the options, where and when to pick
  up (with the cake's own deadline), how many, and "Læg i kurv"; the long
  description sections under it. A cake without a price says "Pris aftales"
  and sends a request with the same choices instead.
*/

export const revalidate = 60;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getCakeProducts()).map((cake) => ({ slug: cake.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const cake = await getCakeProduct(slug);
  if (!cake) return { title: "Kager" };
  return { title: cake.name, description: cake.intro || undefined };
}

export default async function CakePage({ params }: Props) {
  const { slug } = await params;
  const [cake, catalog] = await Promise.all([getCakeProduct(slug), getShopCatalog()]);
  if (!cake) notFound();

  const hasPhotos = cake.photos.length > 0;
  const first = cake.photos[0];

  return (
    <Section>
      <Container>
        <div className={cn("grid gap-10 lg:gap-14", hasPhotos && "lg:grid-cols-12")}>
          {hasPhotos ? (
            <div className="lg:col-span-7">
              <div className="lg:sticky lg:top-24">
                <CakeGallery photos={cake.photos} name={cake.name} />
              </div>
            </div>
          ) : null}
          <div className={cn(hasPhotos ? "lg:col-span-5" : "max-w-[44rem]")}>
            <h1 className="max-w-[18ch] text-balance text-display font-semibold tracking-tight text-ink">{cake.name}</h1>
            {cake.intro ? <p className="mt-5 max-w-[46ch] text-lead text-ink-2">{cake.intro}</p> : null}
            <div className="mt-6">
              <CakeConfigurator
                cake={{
                  id: cake.id,
                  name: cake.name,
                  basePriceOere: cake.basePriceOere,
                  optionGroups: cake.optionGroups,
                  minQuantity: cake.minQuantity,
                  maxQuantity: cake.maxQuantity,
                  image: first?.src,
                  imagePosition: hotspotPosition(first),
                }}
                rule={cakeRule(cake, catalog.settings)}
                locations={toClientLocations(catalog.locations)}
                renderedAt={renderTime()}
                mode={cakeInCart(cake) ? "cart" : "request"}
              />
            </div>
          </div>
        </div>

        {cake.sections.length > 0 ? (
          <div className="mt-20 max-w-[46rem] border-t border-line sm:mt-24">
            {cake.sections.map((section, i) => (
              <details key={section.id} open={i === 0} className="group border-b border-line">
                <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-6 py-4 text-left text-lg font-semibold text-ink transition-colors duration-150 ease-out-quart hover:text-rust [&::-webkit-details-marker]:hidden">
                  <span>{section.heading || cake.name}</span>
                  <CaretDown
                    size={20}
                    aria-hidden="true"
                    className="shrink-0 text-muted transition-transform duration-150 ease-out-quart group-open:rotate-180"
                  />
                </summary>
                <RichText value={section.body} className="pb-6" />
              </details>
            ))}
          </div>
        ) : null}
      </Container>
    </Section>
  );
}
