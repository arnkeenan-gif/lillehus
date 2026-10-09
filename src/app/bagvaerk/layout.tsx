import { CartDrawer } from "@/components/shop/cart-drawer";
import { toClientLocations } from "@/lib/cart-pickup";
import { getShopCatalog, renderTime } from "@/lib/products";

/** The cart drawer lives here (and in the kager layout) so it exists on every shop route and nowhere else. */
export default async function BakeryLayout({ children }: { children: React.ReactNode }) {
  const catalog = await getShopCatalog();
  return (
    <>
      {children}
      <CartDrawer locations={toClientLocations(catalog.locations)} renderedAt={renderTime()} />
    </>
  );
}
