import type { CartItem } from "@/lib/cart";
import { cartSubtotal } from "@/lib/cart";
import { formatPrice } from "@/lib/format";

type Props = {
  items: CartItem[];
  /** Delivery fee in øre, or null when the order is collected. */
  deliveryOere?: number | null;
  title?: string;
};

/** The lines and the total beside the checkout form. The one bordered box on the page: it groups the order. */
export function OrderSummary({ items, deliveryOere = null, title = "Din kurv" }: Props) {
  const subtotal = cartSubtotal(items);
  const total = subtotal + (deliveryOere ?? 0);

  return (
    <div className="rounded-md border border-line p-5 sm:p-6">
      <h2 className="text-lg font-semibold text-ink">{title}</h2>
      <ul className="mt-4 flex flex-col gap-2.5">
        {items.map((item) => (
          <li key={item.productId} className="flex items-baseline justify-between gap-4 text-[0.95rem]">
            <span className="text-ink-2">
              <span className="tnum">{item.qty}</span> × {item.name}
            </span>
            <span className="tnum shrink-0 text-ink">{formatPrice(item.priceOere * item.qty)}</span>
          </li>
        ))}
      </ul>
      {deliveryOere !== null ? (
        <div className="mt-4 flex justify-between gap-4 border-t border-line pt-4 text-[0.95rem]">
          <span className="text-ink-2">Levering</span>
          <span className="tnum text-ink">{formatPrice(deliveryOere)}</span>
        </div>
      ) : null}
      <div className="mt-4 flex items-baseline justify-between gap-4 border-t border-line pt-4 text-ink">
        <span className="font-medium">I alt</span>
        <span className="tnum text-lg font-semibold">{formatPrice(total)}</span>
      </div>
    </div>
  );
}
