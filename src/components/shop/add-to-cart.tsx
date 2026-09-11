"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { QuantityStepper } from "@/components/shop/quantity-stepper";
import { addToCart, type CartItem } from "@/lib/cart";

/**
 * Quantity plus "Læg i kurv" under a product tile. One row where the tile is
 * wide enough for both (two columns from sm, three from lg, four from xl),
 * stacked in the narrow phone grid and the three-column tablet grid. The
 * label confirms the add for a moment.
 */
export function AddToCart({ item }: { item: Omit<CartItem, "qty"> }) {
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  function add() {
    addToCart(item, qty);
    setQty(1);
    setAdded(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setAdded(false), 1600);
  }

  return (
    <div className="mt-auto grid grid-cols-1 gap-2 pt-4 sm:grid-cols-[auto_1fr] md:grid-cols-1 lg:grid-cols-[auto_1fr]">
      <QuantityStepper value={qty} onChange={setQty} label={item.name} className="justify-self-start" />
      <Button type="button" variant="secondary" onClick={add} className="w-full">
        {added ? "Lagt i kurven" : "Læg i kurv"}
      </Button>
      <span className="sr-only" role="status">
        {added ? `${item.name} er lagt i kurven` : ""}
      </span>
    </div>
  );
}
