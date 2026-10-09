import { CartDrawer } from "@/components/shop/cart-drawer";
import { toClientLocations } from "@/lib/cart-pickup";
import { getShopCatalog, renderTime } from "@/lib/products";

/** Cakes can go in the cart too, so the cake pages get the same cart drawer as the bagværk pages. */
export default async function CakesLayout({ children }: { children: React.ReactNode }) {
  const catalog = await getShopCatalog();
  return (
    <>
      {children}
      <CartDrawer locations={toClientLocations(catalog.locations)} renderedAt={renderTime()} />
    </>
  );
}
