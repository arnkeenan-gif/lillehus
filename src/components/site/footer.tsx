import Image from "next/image";
import Link from "next/link";
import { FacebookLogo, InstagramLogo } from "@phosphor-icons/react/dist/ssr";
import { getLocations, getPages, getSiteSettings } from "@/lib/cms";
import { hoursText, upperFirst } from "@/components/cms/text";
import { Container } from "@/components/ui/container";
import { NewsletterForm } from "@/components/forms/newsletter-form";

/**
 * The one tinted surface: the hand-drawn logo large beside the address, the
 * hours as sentences, every page as a link, the smiley report and the
 * newsletter. Everything comes from the site settings, the locations and
 * the page list, so Kristine's edits land here too.
 */
export async function Footer() {
  const [settings, locations, pages] = await Promise.all([getSiteSettings(), getLocations(), getPages()]);
  const year = new Date().getFullYear();
  const links = pages
    .filter((p) => !p.hidden && p.slug !== "forside")
    .map((p) => ({ href: `/${p.slug}`, label: p.navLabel || p.title }));
  const logo = settings.logo;
  const a = settings.address;

  return (
    <footer className="no-print border-t border-line bg-paper-2">
      <Container className="grid gap-12 py-16 sm:py-20 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-4">
          {logo ? (
            <Image
              src={logo.src}
              alt={logo.alt}
              width={logo.width ?? 1356}
              height={logo.height ?? 1141}
              sizes="288px"
              className="h-auto w-60 sm:w-72"
            />
          ) : null}
          <p className="mt-8 text-lg font-semibold tracking-tight text-ink">{settings.name}</p>
          <address className="mt-2 not-italic leading-relaxed text-ink-2">
            {a.street}
            <br />
            {a.postalCode} {a.city}
            <br />
            <a href={`tel:${settings.phoneHref}`} className="tnum hover:text-ink">
              {settings.phone}
            </a>
            <br />
            <a href={`mailto:${settings.email}`} className="hover:text-ink">
              {settings.email}
            </a>
          </address>
          {settings.footerText ? <p className="mt-4 max-w-[40ch] text-ink-2">{settings.footerText}</p> : null}
          <div className="mt-5 flex gap-2">
            {settings.social.instagram ? (
              <a
                href={settings.social.instagram}
                target="_blank"
                rel="noreferrer"
                className="flex size-11 items-center justify-center rounded-md text-ink-2 transition-colors duration-150 ease-out-quart hover:bg-paper-3 hover:text-ink"
              >
                <InstagramLogo size={24} aria-hidden="true" />
                <span className="sr-only">Instagram</span>
              </a>
            ) : null}
            {settings.social.facebook ? (
              <a
                href={settings.social.facebook}
                target="_blank"
                rel="noreferrer"
                className="flex size-11 items-center justify-center rounded-md text-ink-2 transition-colors duration-150 ease-out-quart hover:bg-paper-3 hover:text-ink"
              >
                <FacebookLogo size={24} aria-hidden="true" />
                <span className="sr-only">Facebook</span>
              </a>
            ) : null}
          </div>
        </div>

        <div className="lg:col-span-3">
          <p className="font-semibold text-ink">Her finder du os</p>
          <ul className="mt-4 space-y-5 text-ink-2">
            {locations.map((loc) => (
              <li key={loc.id}>
                <p className="font-medium text-ink">{loc.name}</p>
                {loc.subtitle ? <p>{loc.subtitle}</p> : null}
                {loc.hours.length > 0 ? <p className="tnum">{upperFirst(hoursText(loc.hours))}</p> : null}
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-2">
          <p className="font-semibold text-ink">Sider</p>
          <ul className="mt-4 space-y-2 text-ink-2">
            {links.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="transition-colors duration-150 ease-out-quart hover:text-ink">
                  {item.label}
                </Link>
              </li>
            ))}
            {settings.smileyUrl ? (
              <li>
                <a
                  href={settings.smileyUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="transition-colors duration-150 ease-out-quart hover:text-ink"
                >
                  Fødevarestyrelsens kontrolrapport
                </a>
              </li>
            ) : null}
          </ul>
        </div>

        <div className="lg:col-span-3">
          <p className="font-semibold text-ink">Nyhedsbrev</p>
          <p className="mt-4 text-ink-2">
            Ugens brød, nye datoer for pizzavognen og hvad der ellers sker på gården. Et par gange om måneden, ikke mere.
          </p>
          <div className="mt-4">
            <NewsletterForm />
          </div>
        </div>
      </Container>
      <div className="border-t border-line">
        <Container className="flex flex-col gap-2 py-5 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {settings.name}. CVR {settings.cvr}
          </p>
          <p>{settings.tagline}</p>
        </Container>
      </div>
    </footer>
  );
}
