import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { ProductTile } from "@/components/shop/product-tile";
import { getShopProducts, groupByCategory, shop } from "@/lib/products";
import { site } from "@/lib/site";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Bestil brød",
  description:
    "Bestil surdejsbrød, rugbrød, boller og kager til afhentning i Hønsehuset på Torpevej 10 i Herlufmagle. Betal med kort eller MobilePay.",
};

export default async function BakeryPage() {
  const products = await getShopProducts();
  const groups = groupByCategory(products);
  const hours = shop.pickupWindow.replace(" til ", " og ");

  return (
    <Section>
      <Container>
        <div className="max-w-[65ch]">
          <h1 className="text-title font-semibold">Bestil brød til hverdagen</h1>
          <p className="mt-4 text-lg text-ink-2">
            Vælg dit brød, vælg en dag at hente det, og betal med kort eller MobilePay. Så står det klar i Hønsehuset på{" "}
            {site.address.street} mellem kl. {hours}.
          </p>
          {shop.notice ? <p className="mt-5 rounded-md bg-rust-tint px-4 py-3 text-[0.95rem] text-ink">{shop.notice}</p> : null}
        </div>

        {groups.length === 0 ? (
          <p className="mt-12 text-ink-2">
            Der er ikke noget at bestille lige nu. Følg med på{" "}
            <a
              href={site.social.facebook}
              target="_blank"
              rel="noreferrer"
              className="text-rust underline underline-offset-[3px] hover:text-rust-deep"
            >
              Facebook
            </a>
            .
          </p>
        ) : (
          groups.map((group) => (
            <section key={group.category} aria-labelledby={`kategori-${group.slug}`} className="mt-12 sm:mt-16">
              <h2 id={`kategori-${group.slug}`} className="text-xl font-semibold text-ink">
                {group.label}
              </h2>
              <div className="mt-5 grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 xl:grid-cols-4">
                {group.products.map((product) => (
                  <ProductTile key={product.id} product={product} />
                ))}
              </div>
            </section>
          ))
        )}
      </Container>
    </Section>
  );
}
