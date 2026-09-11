import Link from "next/link";
import { NAV, site } from "@/lib/site";
import { Container } from "@/components/ui/container";
import { MobileNav } from "@/components/site/mobile-nav";
import { CartButton } from "@/components/shop/cart-button";

export function Header() {
  return (
    <header className="no-print sticky top-0 z-40 border-b border-line bg-paper/95 backdrop-blur-sm">
      <Container className="flex h-16 items-center justify-between gap-6 sm:h-[72px]">
        <Link href="/" className="shrink-0 text-[1.05rem] font-semibold tracking-tight text-ink">
          {site.name}
        </Link>

        <nav aria-label="Hovedmenu" className="hidden lg:block">
          <ul className="flex items-center gap-7">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-[0.95rem] text-ink-2 transition-colors hover:text-ink"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <CartButton />
          <MobileNav />
        </div>
      </Container>
    </header>
  );
}
