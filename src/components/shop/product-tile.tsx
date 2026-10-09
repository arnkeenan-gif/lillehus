import { cn } from "@/lib/cn";
import { formatPrice } from "@/lib/format";
import type { ShopProduct } from "@/lib/products";
import { ProductOrderControls } from "@/components/shop/add-to-cart";
import { ProductPhoto, hotspotPosition } from "@/components/shop/product-photo";

/**
 * One product in the bagværk grid: photo, name, description, price, and the
 * order controls. No border, no background, no shadow; the photo is the
 * tile. A product without a photo gets no box at all: name, price and the
 * controls sit at the top of the grid cell, next to the photo tiles.
 */
export function ProductTile({ product, eager = false }: { product: ShopProduct; eager?: boolean }) {
  const photo = product.photo;
  return (
    <article className="flex flex-col">
      {photo ? (
        <div className="relative aspect-[4/5] overflow-hidden rounded-md bg-paper-2">
          <ProductPhoto
            photo={photo}
            alt={product.name}
            sizes="(min-width: 1264px) 370px, (min-width: 768px) 31vw, 46vw"
            eager={eager}
          />
        </div>
      ) : null}
      <h3 className={cn("font-semibold leading-snug text-ink", photo && "mt-3")}>{product.name}</h3>
      {product.description ? <p className="mt-1 text-sm text-ink-2">{product.description}</p> : null}
      {product.priceOere > 0 ? <p className="tnum mt-1.5 font-medium text-ink">{formatPrice(product.priceOere)}</p> : null}
      <ProductOrderControls
        className={photo ? "mt-auto" : undefined}
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
    </article>
  );
}
