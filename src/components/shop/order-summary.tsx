import type { CartItem } from "@/lib/cart";
import { cartSubtotal } from "@/lib/cart";
import { formatPrice } from "@/lib/format";

type Props = {
  items: CartItem[];
  /** Delivery fee in øre, or null when the order is collected. */
  deliveryOere?: number | null;
  title?: string;
};

/** The lines and the total, used beside the checkout form. */
export function OrderSummary({ items, deliveryOere = null, title = "Din kurv" }: Props) {
  const subtotal = cartSubtotal(items);
  const total = subtotal + (deliveryOere ?? 0);

  return (
    <div className="rounded-md border border-line p-5">
      <h2 className="text-lg font-semibold text-ink">{title}</h2>
      <ul className="mt-3 divide-y divide-line">
        {items.map((item) => (
          <li key={item.productId} className="flex items-baseline justify-between gap-4 py-2.5 text-[0.95rem]">
            <span className="text-ink-2">
              <span className="tnum">{item.qty}</span> × {item.name}
            </span>
            <span className="tnum shrink-0 text-ink">{formatPrice(item.priceOere * item.qty)}</span>
          </li>
        ))}
      </ul>
      {deliveryOere !== null ? (
        <div className="mt-3 flex justify-between border-t border-line pt-3 text-[0.95rem]">
          <span className="text-ink-2">Levering</span>
          <span className="tnum text-ink">{formatPrice(deliveryOere)}</span>
        </div>
      ) : null}
      <div className="mt-3 flex justify-between border-t border-line pt-3 font-semibold text-ink">
        <span>I alt</span>
        <span className="tnum">{formatPrice(total)}</span>
      </div>
    </div>
  );
}
