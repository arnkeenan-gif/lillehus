import { CartDrawer } from "@/components/shop/cart-drawer";
import { pickupPlaceShort } from "@/lib/cart-pickup";
import { getShop } from "@/lib/products";

/** The cart drawer lives here so it exists on every shop route and nowhere else. */
export default async function BakeryLayout({ children }: { children: React.ReactNode }) {
  const shop = await getShop();
  return (
    <>
      {children}
      <CartDrawer note={`Du henter i ${pickupPlaceShort(shop.pickupPlace)}. Betal med kort eller MobilePay.`} />
    </>
  );
}
