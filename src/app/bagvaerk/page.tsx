import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { pageMetadata } from "@/components/cms/metadata";
import { BakeryCakesBlock } from "@/components/ordering/bakery-cakes-block";
import { OrderFlowProvider, PickupBar, StartOrderButton } from "@/components/ordering/order-flow";
import { ProductTile } from "@/components/shop/product-tile";
import { getPage, getSiteSettings } from "@/lib/cms";
import { toClientLocations } from "@/lib/cart-pickup";
import { generalRule } from "@/lib/ordering/deadline";
import { getShopCatalog, renderTime } from "@/lib/products";

/*
  The bagværk shop (Kristine's description, sections 1, 2, 4 to 6): the
  title, the allergen line and "Bestil bagværk", then every category with
  its products (photo, name, description, price, and the order controls
  when the product can be ordered for the chosen date), and the cakes at the
  bottom. Which dates can be chosen and until when is worked out in the
  browser against the deadline rules and checked again at the checkout.
*/

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata(await getPage("bagvaerk"), "Bagværk");
}

export default async function BakeryPage() {
  const [catalog, settings] = await Promise.all([getShopCatalog(), getSiteSettings()]);
  const rules = catalog.products.filter((p) => p.canOrder).map((p) => p.rule);
  const fallbackRule = catalog.settings.defaultDeadline;
  const general = generalRule(rules, fallbackRule);
  const notice = catalog.settings.notice?.trim();
  const renderedAt = renderTime();

  return (
    <OrderFlowProvider
      locations={toClientLocations(catalog.locations)}
      rules={rules.length > 0 ? rules : [fallbackRule]}
      general={general}
      renderedAt={renderedAt}
    >
      <Container className="pt-12 sm:pt-20">
        <h1 className="max-w-[18ch] text-balance text-display font-semibold tracking-tight text-ink">Bagværk</h1>
        <p className="mt-5 max-w-[46ch] text-lead text-ink-2">Oplysninger om allergener kan fås mod forespørgsel.</p>
        {notice ? <p className="mt-6 max-w-[62ch] rounded-md bg-rust-tint px-4 py-3 text-ink">{notice}</p> : null}
        <div className="mt-8">
          <StartOrderButton />
        </div>
        {catalog.groups.length >= 3 ? (
          <nav aria-label="Kategorier" className="mt-10">
            <ul className="flex flex-wrap gap-x-5 gap-y-2 text-[0.95rem]">
              {catalog.groups.map(({ category }) => (
                <li key={category.id}>
                  <a
                    href={`#kategori-${category.id}`}
                    className="inline-flex min-h-11 items-center text-ink underline decoration-line decoration-1 underline-offset-[5px] transition-colors duration-150 ease-out-quart hover:text-rust hover:decoration-rust"
                  >
                    {category.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        ) : null}
      </Container>

      <PickupBar className="mt-10 sm:mt-14" />

      <Container className="pb-24 sm:pb-32">
        {catalog.groups.length === 0 ? (
          <p className="mt-10 max-w-[62ch] text-ink-2">
            Der er ikke noget at bestille lige nu.
            {settings.social.facebook ? (
              <>
                {" "}
                Følg med på{" "}
                <a href={settings.social.facebook} target="_blank" rel="noreferrer" className="text-rust underline underline-offset-[3px] hover:text-rust-deep">
                  Facebook
                </a>
                .
              </>
            ) : null}
          </p>
        ) : (
          catalog.groups.map(({ category, products }, index) => (
            <section
              key={category.id}
              id={`kategori-${category.id}`}
              aria-labelledby={`kategori-${category.id}-titel`}
              className={index === 0 ? "scroll-mt-40 pt-10" : "scroll-mt-40 pt-20 sm:pt-24"}
            >
              <h2 id={`kategori-${category.id}-titel`} className="text-title font-semibold text-ink">
                {category.title}
              </h2>
              {category.description ? <p className="mt-3 max-w-[62ch] text-ink-2">{category.description}</p> : null}
              <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-5 md:grid-cols-3 lg:gap-x-6 lg:gap-y-12">
                {products.map((product, i) => (
                  <ProductTile key={product.id} product={product} eager={index === 0 && i < 3} />
                ))}
              </div>
            </section>
          ))
        )}
      </Container>

      <BakeryCakesBlock cakes={catalog.cakes} />
    </OrderFlowProvider>
  );
}
