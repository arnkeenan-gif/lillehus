import Link from "next/link";
import { getProducts } from "@/lib/content";
import { formatPrice } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Photo, altFor } from "@/components/home/photo";
import { cutoffText, pickupDaysText, shop } from "@/components/home/shop-facts";
import forside from "@content/pages/forside.json";

const fallbackImages: Record<string, string> = forside.productFallbackImages;

/**
 * Layout family: product grid. Two columns on a phone, four from lg.
 * Renders nothing when the shop has no active products.
 */
export async function Bread() {
  const products = (await getProducts()).slice(0, 4);
  if (products.length === 0) return null;

  return (
    <Section>
      <Container>
        <h2 className="text-title font-semibold">Det bager vi</h2>
        <p className="mt-4 max-w-[52ch] text-ink-2">
          Bestil senest {cutoffText()}. Hent i Hønsehuset {pickupDaysText()}, kl. {shop.pickupWindow}.
        </p>
        <ul className="mt-10 grid grid-cols-2 gap-x-5 gap-y-8 lg:grid-cols-4 lg:gap-x-8">
          {products.map((p) => {
            const src = p.image || fallbackImages[p.category] || fallbackImages.andet;
            return (
              <li key={p.id}>
                <Link href="/bageri" className="group block">
                  <Photo
                    src={src}
                    ratio="4/5"
                    alt={altFor(src, p.name)}
                    sizes="(min-width: 1024px) 270px, 45vw"
                  />
                  <p className="mt-3 font-medium text-ink group-hover:underline group-hover:underline-offset-[3px]">
                    {p.name}
                  </p>
                  <p className="tnum text-[0.95rem] text-ink-2">{formatPrice(p.priceOere)}</p>
                </Link>
              </li>
            );
          })}
        </ul>
        <div className="mt-10">
          <Button href="/bageri">Bestil brød</Button>
        </div>
      </Container>
    </Section>
  );
}
