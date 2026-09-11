"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { QuantityStepper } from "@/components/shop/quantity-stepper";
import { addToCart, type CartItem } from "@/lib/cart";

/** Quantity plus "Læg i kurv" on a product tile. The label confirms the add for a moment. */
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
    <div className="mt-auto flex flex-col gap-2 pt-4">
      <QuantityStepper value={qty} onChange={setQty} label={item.name} />
      <Button type="button" onClick={add} className="w-full">
        {added ? "Lagt i kurven" : "Læg i kurv"}
      </Button>
      <span className="sr-only" role="status">
        {added ? `${item.name} er lagt i kurven` : ""}
      </span>
    </div>
  );
}
