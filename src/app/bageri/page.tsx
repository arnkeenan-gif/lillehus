import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { ProductTile } from "@/components/shop/product-tile";
import { getSiteSettings } from "@/lib/cms";
import { cutoffLabel, pickupDaysLabel, pickupHours } from "@/lib/cart-pickup";
import { getShop, getShopProducts, groupByCategory } from "@/lib/products";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Bestil brød",
  description:
    "Bestil surdejsbrød, boller, rugbrød og vaniljesnegle til afhentning i Hønsehuset på Torpevej 10 i Herlufmagle. Betal med kort eller MobilePay.",
};

export default async function BakeryPage() {
  const [products, shop, settings] = await Promise.all([getShopProducts(), getShop(), getSiteSettings()]);
  const groups = groupByCategory(products);
  const lead = `Bestil ${cutoffLabel(shop)}, og hent ${pickupDaysLabel(shop.pickupDays)} mellem kl. ${pickupHours(shop.pickupWindow)} i ${shop.pickupPlace}. Oplysninger om allergener kan fås mod forespørgsel.`;

  return (
    <Section>
      <Container size="wide">
        <div className="max-w-[44rem]">
          <h1 className="max-w-[18ch] text-balance text-display font-semibold tracking-tight text-ink">Bestil brød</h1>
          <p className="mt-5 max-w-[46ch] text-lead text-ink-2">{lead}</p>
          {shop.notice ? <p className="mt-6 max-w-[62ch] rounded-md bg-rust-tint px-4 py-3 text-ink">{shop.notice}</p> : null}
        </div>

        {groups.length === 0 ? (
          <p className="mt-14 max-w-[62ch] text-ink-2 sm:mt-20">
            Der er ikke noget at bestille lige nu. Følg med på{" "}
            <a
              href={settings.social.facebook}
              target="_blank"
              rel="noreferrer"
              className="text-rust underline underline-offset-[3px] hover:text-rust-deep"
            >
              Facebook
            </a>
            .
          </p>
        ) : (
          groups.map((group, index) => (
            <section
              key={group.category}
              aria-labelledby={`kategori-${group.slug}`}
              className={index === 0 ? "mt-14 sm:mt-20" : "mt-20 sm:mt-24 lg:mt-28"}
            >
              <h2 id={`kategori-${group.slug}`} className="text-title font-semibold text-ink">
                {group.label}
              </h2>
              <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-5 md:grid-cols-3 lg:gap-x-6 xl:grid-cols-4">
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
