"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { QuantityStepper } from "@/components/shop/quantity-stepper";
import { useOrderFlow } from "@/components/ordering/order-flow";
import { addToCart, lineKey, type CartLine } from "@/lib/cart";
import type { DeadlineRule } from "@/lib/cms/ordering-types";
import { cn } from "@/lib/cn";
import { formatDayDate } from "@/lib/ordering/dates";
import { deadlineText, isBeforeDeadline, sameRule } from "@/lib/ordering/deadline";

/**
 * Quantity plus "Læg i kurv" under a product, when it can be ordered for the
 * chosen pickup date; otherwise a calm sentence saying why. Before a pickup
 * is chosen the button opens the pickup dialog and adds the product once a
 * date is chosen. A product with its own deadline says so for the chosen date.
 */
export interface OrderableProduct {
  id: string;
  name: string;
  priceOere: number;
  rule: DeadlineRule;
  canOrder: boolean;
  image?: string;
  imagePosition?: string;
}

export function ProductOrderControls({ product, className }: { product: OrderableProduct; className?: string }) {
  const { pickup, now, general, openChooser, recentlyAdded } = useOrderFlow();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  if (!product.canOrder) {
    return <p className={cn("pt-4 text-sm text-muted", className)}>Kan ikke bestilles på siden lige nu.</p>;
  }

  const date = pickup?.date.date ?? null;
  if (date && !isBeforeDeadline(date, product.rule, now)) {
    return (
      <p className={cn("pt-4 text-sm text-muted", className)}>
        Kan ikke nås til {formatDayDate(date)}. Fristen var {deadlineText(date, product.rule)}.
      </p>
    );
  }

  const line: Omit<CartLine, "qty"> = {
    key: lineKey("product", product.id),
    kind: "product",
    productId: product.id,
    name: product.name,
    priceOere: product.priceOere,
    image: product.image,
    imagePosition: product.imagePosition,
    options: [],
    rule: product.rule,
  };

  function add() {
    if (!date) {
      openChooser({ line, qty });
      setQty(1);
      return;
    }
    addToCart(line, qty);
    setQty(1);
    setAdded(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setAdded(false), 1600);
  }

  const showAdded = added || recentlyAdded === product.id;
  const ownDeadline = date && !sameRule(product.rule, general) ? `Bestil senest ${deadlineText(date, product.rule)}.` : null;

  return (
    <div className={cn("pt-4", className)}>
      {ownDeadline ? <p className="mb-2 text-sm text-muted">{ownDeadline}</p> : null}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-[auto_1fr] md:grid-cols-1 lg:grid-cols-[auto_1fr]">
        <QuantityStepper value={qty} onChange={setQty} label={product.name} className="justify-self-start" />
        <Button type="button" variant="secondary" onClick={add} className="w-full" aria-haspopup={date ? undefined : "dialog"}>
          {showAdded ? "Lagt i kurven" : "Læg i kurv"}
        </Button>
      </div>
      <span className="sr-only" role="status">
        {showAdded ? `${product.name} er lagt i kurven` : ""}
      </span>
    </div>
  );
}
