import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CaretLeft } from "@phosphor-icons/react/dist/ssr";
import { Container } from "@/components/ui/container";
import { OrderFlowProvider, PickupBar } from "@/components/ordering/order-flow";
import { ProductOrderControls } from "@/components/shop/add-to-cart";
import { ProductPhoto, hotspotPosition } from "@/components/shop/product-photo";
import { ProductTile } from "@/components/shop/product-tile";
import { toClientLocations } from "@/lib/cart-pickup";
import { formatPrice } from "@/lib/format";
import { generalRule } from "@/lib/ordering/deadline";
import { getShopCatalog, renderTime } from "@/lib/products";

/*
  One product from the bagværk: the photo large, name, price, description,
  quantity and "Læg i kurv" (the same order flow as /bagvaerk, so the pickup
  place and date carry over), and the other products from its category
  underneath. Everything comes from the product in the CMS.
*/

export const revalidate = 60;

export async function generateStaticParams() {
  const catalog = await getShopCatalog();
  return catalog.products.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const product = (await getShopCatalog()).products.find((p) => p.id === id);
  if (!product) return {};
  return {
    title: product.name,
    description: product.description || `${product.name}, ${formatPrice(product.priceOere)}. Bestil og hent på gården.`,
  };
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const catalog = await getShopCatalog();
  const product = catalog.products.find((p) => p.id === id);
  if (!product) notFound();

  const rules = catalog.products.filter((p) => p.canOrder).map((p) => p.rule);
  const fallbackRule = catalog.settings.defaultDeadline;
  const group = catalog.groups.find((g) => g.products.some((p) => p.id === id));
  const others = group ? group.products.filter((p) => p.id !== id) : [];
  const photo = product.photo;

  return (
    <OrderFlowProvider
      locations={toClientLocations(catalog.locations)}
      rules={rules.length > 0 ? rules : [fallbackRule]}
      general={generalRule(rules, fallbackRule)}
      renderedAt={renderTime()}
    >
      <Container className="pt-8 sm:pt-12">
        <Link
          href="/bagvaerk"
          className="inline-flex min-h-11 items-center gap-1.5 text-ink-2 transition-colors duration-150 ease-out-quart hover:text-ink"
        >
          <CaretLeft size={16} aria-hidden="true" />
          Alt bagværk
        </Link>
      </Container>

      <PickupBar className="mt-4" />

      <Container className="pt-8 sm:pt-12">
        <article className="grid gap-8 md:grid-cols-2 md:gap-12 lg:gap-16">
          {photo ? (
            <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-paper-2">
              <ProductPhoto photo={photo} alt={product.name} sizes="(min-width: 1264px) 560px, (min-width: 768px) 45vw, 100vw" eager />
            </div>
          ) : null}
          <div className="md:pt-4">
            {group ? <p className="text-ink-2">{group.category.title}</p> : null}
            <h1 className="mt-2 text-balance text-display font-semibold tracking-tight text-ink">{product.name}</h1>
            {product.priceOere > 0 ? <p className="tnum mt-4 text-lead text-ink">{formatPrice(product.priceOere)}</p> : null}
            {product.description ? <p className="mt-6 max-w-[52ch] text-ink-2">{product.description}</p> : null}
            <p className="mt-6 max-w-[52ch] text-sm text-muted">Oplysninger om allergener kan fås mod forespørgsel.</p>
            <div className="mt-6 max-w-sm">
              <ProductOrderControls
                product={{
                  id: product.id,
                  name: product.name,
                  priceOere: product.priceOere,
                  rule: product.rule,
                  canOrder: product.canOrder,
                  image: photo?.src,
                  imagePosition: hotspotPosition(photo),
                }}
              />
            </div>
          </div>
        </article>

        {others.length > 0 && group ? (
          <section aria-labelledby="mere" className="pb-24 pt-20 sm:pb-32 sm:pt-24">
            <h2 id="mere" className="border-b border-line pb-3 text-title font-semibold text-ink">
              Mere {group.category.title.toLowerCase()}
            </h2>
            <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-5 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-6">
              {others.map((p) => (
                <ProductTile key={p.id} product={p} />
              ))}
            </div>
          </section>
        ) : (
          <div className="pb-24 sm:pb-32" />
        )}
      </Container>
    </OrderFlowProvider>
  );
}
