import Link from "next/link";
import { getNavigation, getSiteSettings } from "@/lib/cms";
import { Container } from "@/components/ui/container";
import { MobileNav } from "@/components/site/mobile-nav";
import { CartButton } from "@/components/shop/cart-button";

/**
 * One line, 72px: the wordmark, the seven menu items Kristine marked in the
 * Studio, the cart. Below lg the menu folds into the hamburger. The
 * announcement bar sits under the header in rust-tint when it is switched on.
 */
export async function Header() {
  const [nav, settings] = await Promise.all([getNavigation(), getSiteSettings()]);
  const announcement = settings.announcement.enabled ? settings.announcement.text.trim() : "";

  return (
    <>
      <header className="no-print sticky top-0 z-40 border-b border-line bg-paper">
        <Container className="flex h-16 items-center justify-between gap-6 lg:h-[72px]">
          <Link href="/" className="shrink-0 text-[1.05rem] font-semibold tracking-tight text-ink">
            {settings.name}
          </Link>

          <nav aria-label="Hovedmenu" className="hidden lg:block">
            <ul className="flex items-center gap-7">
              {nav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-[0.95rem] text-ink-2 transition-colors duration-150 ease-out-quart hover:text-ink"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-1">
            <CartButton />
            <MobileNav items={nav} />
          </div>
        </Container>
      </header>
      {announcement ? (
        <div className="no-print bg-rust-tint">
          <Container className="py-3 text-[0.95rem] text-ink">
            <p>{announcement}</p>
          </Container>
        </div>
      ) : null}
    </>
  );
}
