import Link from "next/link";
import { getNavigation, getSiteSettings } from "@/lib/cms";
import { Container } from "@/components/ui/container";
import { MobileNav } from "@/components/site/mobile-nav";
import { CartButton } from "@/components/shop/cart-button";

/**
 * The Copenhagen bakery header: menu items on the left, the wordmark centred,
 * the cart on the right, 72px. Over a full-image hero it is transparent with
 * white text (see globals.css and cover-header-mode.tsx). Below lg the menu
 * folds into the hamburger. The announcement bar sits under it in rust-tint.
 */
export async function Header() {
  const [nav, settings] = await Promise.all([getNavigation(), getSiteSettings()]);
  const announcement = settings.announcement.enabled ? settings.announcement.text.trim() : "";
  // Four items sit left of the wordmark, the rest right of it, like the Copenhagen bakeries.
  const split = Math.min(4, Math.ceil(nav.length / 2));
  const left = nav.slice(0, split);
  const right = nav.slice(split);
  const navLink =
    "whitespace-nowrap text-[13px] opacity-80 transition-opacity duration-150 ease-out-quart hover:opacity-100";

  return (
    <>
      <header className="site-header no-print sticky top-0 z-40 border-b border-line bg-paper text-ink">
        <Container className="flex h-16 items-center justify-between gap-4 lg:grid lg:h-[72px] lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
          <nav aria-label="Hovedmenu" className="hidden lg:block">
            <ul className="flex items-center gap-5">
              {left.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className={navLink}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <Link
            href="/"
            className="whitespace-nowrap text-[12px] font-bold uppercase tracking-[0.14em] lg:justify-self-center lg:text-[14px] lg:tracking-[0.16em]"
          >
            {settings.name}
          </Link>

          <div className="flex items-center justify-end gap-1 lg:gap-5">
            <nav aria-label="Mere" className="hidden lg:block">
              <ul className="flex items-center gap-5">
                {right.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className={navLink}>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <CartButton />
            <MobileNav items={nav} name={settings.name} />
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
