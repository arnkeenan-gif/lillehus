import Link from "next/link";
import { formatPrice } from "@/lib/format";
import type { ShopProduct } from "@/lib/products";
import { ProductOrderControls } from "@/components/shop/add-to-cart";
import { ProductPhoto, hotspotPosition } from "@/components/shop/product-photo";

/**
 * One product as a line on the bagværk list, like a line on the board: a
 * small photo, the name and description, the price, and quantity with
 * "Læg i kurv". Photo and name open the product's own page.
 */
export function ProductRow({ product, eager = false }: { product: ShopProduct; eager?: boolean }) {
  const photo = product.photo;
  const href = `/bagvaerk/vare/${product.id}`;
  return (
    <li className="grid grid-cols-[88px_1fr] gap-x-4 gap-y-3 py-5 sm:grid-cols-[112px_1fr_auto] sm:items-center sm:gap-x-6">
      <Link href={href} tabIndex={-1} aria-hidden="true" className="relative block aspect-square overflow-hidden rounded-md bg-paper-2 sm:row-span-1">
        {photo ? <ProductPhoto photo={photo} alt={product.name} sizes="112px" eager={eager} /> : null}
      </Link>
      <div className="min-w-0">
        <h3 className="text-lg font-medium leading-snug text-ink">
          <Link href={href} className="hover:underline hover:underline-offset-[3px]">
            {product.name}
          </Link>
        </h3>
        {product.description ? <p className="mt-1 max-w-[52ch] text-ink-2">{product.description}</p> : null}
        {product.priceOere > 0 ? <p className="tnum mt-1 text-ink-2">{formatPrice(product.priceOere)}</p> : null}
      </div>
      <ProductOrderControls
        className="col-span-2 pt-0 sm:col-span-1 sm:w-64"
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
    </li>
  );
}
