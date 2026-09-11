import { cn } from "@/lib/cn";
import { formatPrice } from "@/lib/format";
import { bakedDaysLabel } from "@/lib/cart-pickup";
import { allergensLabel, type ShopProduct } from "@/lib/products";
import { AddToCart } from "@/components/shop/add-to-cart";
import { ProductPhoto, hotspotPosition } from "@/components/shop/product-photo";

/**
 * One product in the grid: photo, name, two lines of description, price, the
 * facts, and the add row. No border, no background, no shadow; the photo is
 * the tile. A product without a photo gets no box at all: name, price and
 * the add row sit at the top of the grid cell, next to the photo tiles.
 */
export function ProductTile({ product }: { product: ShopProduct }) {
  const facts = [allergensLabel(product.allergens), bakedDaysLabel(product.days)].filter((f): f is string => Boolean(f));
  const hasPhoto = Boolean(product.photo?.src || product.image);

  return (
    <article className="flex flex-col">
      {hasPhoto ? (
        <div className="relative aspect-[4/5] overflow-hidden rounded-md bg-paper-2">
          <ProductPhoto
            photo={product.photo}
            src={product.image}
            alt={product.name}
            sizes="(min-width: 1440px) 320px, (min-width: 1280px) 25vw, (min-width: 768px) 33vw, 50vw"
          />
        </div>
      ) : null}
      <h3 className={cn("font-semibold leading-snug text-ink", hasPhoto && "mt-3")}>{product.name}</h3>
      {product.description ? <p className="mt-1 line-clamp-2 text-sm text-ink-2">{product.description}</p> : null}
      <p className="tnum mt-1.5 font-medium text-ink">{formatPrice(product.priceOere)}</p>
      {facts.length > 0 ? <p className="mt-1 text-sm text-muted">{facts.join(". ")}.</p> : null}
      <AddToCart
        className={hasPhoto ? "mt-auto" : undefined}
        item={{
          productId: product.id,
          slug: product.slug,
          name: product.name,
          priceOere: product.priceOere,
          image: product.photo?.src ?? product.image ?? undefined,
          imagePosition: hotspotPosition(product.photo),
          days: product.days,
        }}
      />
    </article>
  );
}
