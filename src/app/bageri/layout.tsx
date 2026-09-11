import { CartDrawer } from "@/components/shop/cart-drawer";

/** The cart drawer lives here so it exists on every shop route and nowhere else. */
export default function BakeryLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <CartDrawer />
    </>
  );
}
