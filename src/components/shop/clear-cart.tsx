"use client";

import { useEffect } from "react";
import { clearCart } from "@/lib/cart";

/** Mounted on the thank-you page: the order is paid, so the cart is done. */
export function ClearCart() {
  useEffect(() => {
    clearCart();
  }, []);
  return null;
}
