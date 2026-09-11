import Image from "next/image";
import { formatPrice } from "@/lib/format";
import { bakedDaysLabel } from "@/lib/cart-pickup";
import { allergensLabel, productImageAlt, type ShopProduct } from "@/lib/products";
import { AddToCart } from "@/components/shop/add-to-cart";

/**
 * One product in the grid. The bordered card is allowed here because it groups
 * the photo, the price and the add button into one interactive unit.
 */
export function ProductTile({ product }: { product: ShopProduct }) {
  const days = bakedDaysLabel(product.days);
  const allergens = allergensLabel(product.allergens);

  return (
    <article className="flex flex-col rounded-md border border-line p-3 sm:p-4">
      <div className="relative aspect-[4/5] overflow-hidden rounded-md bg-paper-2">
        {product.image ? (
          <Image
            src={product.image}
            alt={productImageAlt(product)}
            fill
            sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 50vw"
            className="object-cover"
            unoptimized={product.image.startsWith("http")}
          />
        ) : null}
      </div>
      <h3 className="mt-3 text-[1.05rem] font-semibold leading-snug text-ink">{product.name}</h3>
      {product.description ? <p className="mt-1 text-sm text-ink-2">{product.description}</p> : null}
      <p className="tnum mt-2 font-medium text-ink">{formatPrice(product.priceOere)}</p>
      {allergens ? <p className="mt-1 text-sm text-muted">{allergens}</p> : null}
      {days ? <p className="mt-1 text-sm text-muted">{days}</p> : null}
      <AddToCart
        item={{
          productId: product.id,
          slug: product.slug,
          name: product.name,
          priceOere: product.priceOere,
          image: product.image || undefined,
          days: product.days,
        }}
      />
    </article>
  );
}
