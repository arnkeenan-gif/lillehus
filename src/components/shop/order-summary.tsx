"use client";

import Image from "next/image";
import Link from "next/link";
import { Trash } from "@phosphor-icons/react";
import { QuantityStepper } from "@/components/shop/quantity-stepper";
import { isOptimizable } from "@/components/shop/product-photo";
import { cartSubtotal, removeFromCart, setCartQty, type CartLine } from "@/lib/cart";
import { locationDetails, pickupTime, type ResolvedPickup } from "@/lib/cart-pickup";
import { cn } from "@/lib/cn";
import { formatPrice } from "@/lib/format";
import { formatDayDate } from "@/lib/ordering/dates";

/*
  "Din bestilling" (Kristine's description, section 4): where and when the
  order is picked up, then every line with its options, quantity and price,
  and the total. The cart drawer shows it with steppers; the checkout shows
  it as it will be paid. Lines whose deadline has passed for the chosen date
  are marked, with a way to take them out.
*/

export const CHANGE_PICKUP_HREF = "/bagvaerk#afhentning";

export function PickupFacts({
  pickup,
  stale,
  onNavigate,
  className,
}: {
  pickup: ResolvedPickup | null;
  /** A pickup was chosen but its date or place cannot be used any more. */
  stale?: boolean;
  /** Called when the "Skift" link is followed, e.g. to close the drawer (it may prevent the navigation). */
  onNavigate?: (event: React.MouseEvent<HTMLAnchorElement>) => void;
  className?: string;
}) {
  if (!pickup) {
    return (
      <div className={cn("flex items-start justify-between gap-4", className)}>
        <p className="text-[0.95rem] text-ink-2">
          {stale ? "Den valgte dato kan ikke bruges længere. Vælg en ny." : "Du har ikke valgt afhentningssted og dato endnu."}
        </p>
        <Link
          href={CHANGE_PICKUP_HREF}
          onClick={onNavigate}
          className="shrink-0 text-[0.95rem] font-medium text-rust underline underline-offset-[3px] hover:text-rust-deep"
        >
          Vælg afhentning
        </Link>
      </div>
    );
  }
  const details = locationDetails(pickup.location);
  const time = pickupTime(pickup.date);
  return (
    <div className={cn("flex items-start justify-between gap-4", className)}>
      <dl className="grid min-w-0 gap-2 text-[0.95rem]">
        <div>
          <dt className="text-sm text-muted">Afhentningssted</dt>
          <dd className="text-ink">
            <span className="font-medium">{pickup.location.name}</span>
            {details ? <span className="block text-sm text-ink-2">{details}</span> : null}
          </dd>
        </div>
        <div>
          <dt className="text-sm text-muted">Dato</dt>
          <dd className="text-ink">{formatDayDate(pickup.date.date, { year: true })}</dd>
        </div>
        {time ? (
          <div>
            <dt className="text-sm text-muted">Afhentningstid</dt>
            <dd className="tnum text-ink">{time}</dd>
          </div>
        ) : null}
        {pickup.date.note ? (
          <div>
            <dt className="sr-only">Note</dt>
            <dd className="text-sm text-ink-2">{pickup.date.note}</dd>
          </div>
        ) : null}
      </dl>
      <Link
        href={CHANGE_PICKUP_HREF}
        onClick={onNavigate}
        className="shrink-0 text-[0.95rem] font-medium text-rust underline underline-offset-[3px] hover:text-rust-deep"
      >
        Skift
        <span className="sr-only"> afhentningssted eller dato</span>
      </Link>
    </div>
  );
}

export function OrderLines({
  items,
  expired,
  pickupDate,
  editable = false,
}: {
  items: CartLine[];
  /** Keys of lines whose deadline has passed for the chosen date. */
  expired: Set<string>;
  pickupDate?: string;
  /** Steppers and a remove button (the drawer), or a plain list (the checkout). */
  editable?: boolean;
}) {
  return (
    <ul className={cn("flex flex-col", editable ? "gap-6" : "gap-3")}>
      {items.map((item) => {
        const late = expired.has(item.key);
        return (
          <li key={item.key} className="flex gap-4">
            {editable ? (
              <div className="relative size-16 shrink-0 overflow-hidden rounded-md bg-paper-2">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt=""
                    fill
                    sizes="64px"
                    className="object-cover"
                    style={item.imagePosition ? { objectPosition: item.imagePosition } : undefined}
                    unoptimized={!isOptimizable(item.image)}
                  />
                ) : null}
              </div>
            ) : null}
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-3 text-[0.95rem]">
                <p className={cn("leading-snug", editable ? "font-medium text-ink" : "text-ink-2")}>
                  {editable ? null : <span className="tnum text-ink">{item.qty} × </span>}
                  {item.name}
                </p>
                <p className="tnum shrink-0 font-medium text-ink">{formatPrice(item.priceOere * item.qty)}</p>
              </div>
              {item.options.length > 0 ? (
                <ul className="mt-0.5 text-sm text-muted">
                  {item.options.map((option) => (
                    <li key={option}>{option}</li>
                  ))}
                </ul>
              ) : null}
              {editable ? <p className="tnum mt-0.5 text-sm text-muted">{formatPrice(item.priceOere)} pr. stk.</p> : null}
              {late ? (
                <p className="mt-1 text-sm text-danger">
                  Kan ikke nås til {pickupDate ? formatDayDate(pickupDate) : "den valgte dato"}. Tag den ud, eller vælg en senere dato.
                </p>
              ) : null}
              {editable || late ? (
                <div className="mt-3 flex items-center justify-between gap-3">
                  {editable ? (
                    <QuantityStepper
                      value={item.qty}
                      onChange={(q) => setCartQty(item.key, q)}
                      label={item.name}
                      min={item.minQty ?? 1}
                      max={item.maxQty}
                    />
                  ) : (
                    <span />
                  )}
                  <button
                    type="button"
                    onClick={() => removeFromCart(item.key)}
                    className="flex size-11 items-center justify-center rounded-md text-muted transition-colors duration-150 ease-out-quart hover:bg-paper-2 hover:text-ink"
                  >
                    <Trash size={20} aria-hidden="true" />
                    <span className="sr-only">Fjern {item.name}</span>
                  </button>
                </div>
              ) : null}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export function OrderTotal({ items, large = false, className }: { items: CartLine[]; large?: boolean; className?: string }) {
  return (
    <div className={cn("flex items-baseline justify-between gap-4 text-ink", large ? "text-lead" : "text-lg", className)}>
      <span className="font-medium">I alt</span>
      <span className="tnum font-semibold">{formatPrice(cartSubtotal(items))}</span>
    </div>
  );
}
