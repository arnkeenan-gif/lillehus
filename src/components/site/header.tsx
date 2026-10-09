import Image from "next/image";
import Link from "next/link";
import { getNavigation, getSiteSettings, type CmsImage } from "@/lib/cms";
import { Container } from "@/components/ui/container";
import { MobileNav } from "@/components/site/mobile-nav";
import { CartButton } from "@/components/shop/cart-button";
import { cn } from "@/lib/cn";

/** The logo is 40px tall in the 64px phone header and 48px in the 72px desktop header. */
const LOGO_HEIGHT = 48;

function logoWidth(logo: CmsImage): number {
  return Math.round(LOGO_HEIGHT * ((logo.width ?? 1356) / (logo.height ?? 1141)));
}

/**
 * Kristine's logo, both versions: the dark one on paper and the white one
 * while the header lies transparent over a full-image hero (cover-header-mode
 * sets the attributes on <html>). Without a white file the dark logo is
 * turned white with a filter. Both stay lazy, so a browser only fetches the
 * one it shows (see the theme image notes in the next/image docs).
 */
function HeaderLogo({ logo, light, name }: { logo: CmsImage; light?: CmsImage; name: string }) {
  const size = "h-10 w-auto lg:h-12";
  return (
    <>
      <Image
        src={logo.src}
        alt={name}
        width={logoWidth(logo)}
        height={LOGO_HEIGHT}
        fetchPriority="high"
        className={cn(
          size,
          light
            ? "[html[data-hero-cover=true]:not([data-hero-scrolled=true])_&]:hidden"
            : "[html[data-hero-cover=true]:not([data-hero-scrolled=true])_&]:brightness-0 [html[data-hero-cover=true]:not([data-hero-scrolled=true])_&]:invert [html[data-hero-cover=true]:not([data-hero-scrolled=true])_&]:drop-shadow-[0_1px_2px_rgb(0_0_0/0.35)]",
        )}
      />
      {light ? (
        <Image
          src={light.src}
          alt={name}
          width={logoWidth(light)}
          height={LOGO_HEIGHT}
          fetchPriority="high"
          // The same faint shadow the header's text gets over the photo (globals.css).
          className={cn(
            size,
            "hidden [html[data-hero-cover=true]:not([data-hero-scrolled=true])_&]:block [html[data-hero-cover=true]:not([data-hero-scrolled=true])_&]:drop-shadow-[0_1px_2px_rgb(0_0_0/0.35)]",
          )}
        />
      ) : null}
    </>
  );
}

/**
 * The Copenhagen bakery header: four menu items on the left, the logo centred,
 * the other three and the cart on the right, 72px. Over a full-image hero it
 * is transparent with white text and the white logo (see globals.css and
 * cover-header-mode.tsx). Below lg the logo sits on the left and the menu
 * folds into the hamburger. The announcement bar sits under it in rust-tint.
 */
export async function Header() {
  const [nav, settings] = await Promise.all([getNavigation(), getSiteSettings()]);
  const announcement = settings.announcement.enabled ? settings.announcement.text.trim() : "";
  // Four items sit left of the logo, the rest right of it, like the Copenhagen bakeries.
  const split = Math.min(4, Math.ceil(nav.length / 2));
  const left = nav.slice(0, split);
  const right = nav.slice(split);
  const navLink =
    "whitespace-nowrap text-[13px] opacity-80 transition-opacity duration-150 ease-out-quart hover:opacity-100";
  const logo = settings.logo;

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

          {logo ? (
            <Link href="/" className="flex shrink-0 items-center rounded-sm lg:justify-self-center">
              <HeaderLogo logo={logo} light={settings.logoLight} name={settings.name} />
            </Link>
          ) : (
            <Link
              href="/"
              className="whitespace-nowrap text-[12px] font-bold uppercase tracking-[0.14em] lg:justify-self-center lg:text-[14px] lg:tracking-[0.16em]"
            >
              {settings.name}
            </Link>
          )}

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
            <MobileNav items={nav} name={settings.name} logo={logo} />
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
