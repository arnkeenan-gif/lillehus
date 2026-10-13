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
    <article id={`vare-${product.id}`} className="flex scroll-mt-40 flex-col rounded-md target:outline target:outline-2 target:outline-offset-8 target:outline-rust/60">
      {photo ? (
        <div className="relative aspect-[4/5] overflow-hidden rounded-md bg-paper-2">
          <ProductPhoto
            photo={photo}
            alt={product.name}
            sizes="(min-width: 1264px) 272px, (min-width: 1024px) 23vw, (min-width: 768px) 31vw, 46vw"
            eager={eager}
          />
        </div>
      ) : null}
      <div className={cn("flex items-baseline justify-between gap-3", photo && "mt-3")}>
        <h3 className="font-medium leading-snug text-ink">{product.name}</h3>
        {product.priceOere > 0 ? <p className="tnum shrink-0 text-ink-2">{formatPrice(product.priceOere)}</p> : null}
      </div>
      {product.description ? <p className="mt-1 text-sm text-ink-2">{product.description}</p> : null}
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
