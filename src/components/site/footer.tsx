import Image from "next/image";
import Link from "next/link";
import { FacebookLogo, InstagramLogo } from "@phosphor-icons/react/dist/ssr";
import { FOOTER_LINKS, NAV, site, fullAddress } from "@/lib/site";
import { Container } from "@/components/ui/container";
import { NewsletterForm } from "@/components/forms/newsletter-form";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="no-print border-t border-line bg-paper-2">
      <Container className="grid gap-12 py-14 sm:py-16 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-4">
          <Image
            src="/images/logo-640.png"
            alt={`${site.name}, håndtegnet logo`}
            width={640}
            height={539}
            className="mb-6 w-52 sm:w-60"
          />
          <p className="text-lg font-semibold tracking-tight">{site.name}</p>
          <address className="mt-3 text-[0.95rem] not-italic leading-relaxed text-ink-2">
            {fullAddress()}
            <br />
            <a href={`tel:${site.phoneHref}`} className="hover:text-ink">
              {site.phone}
            </a>
            <br />
            <a href={`mailto:${site.email}`} className="hover:text-ink">
              {site.email}
            </a>
          </address>
          <div className="mt-5 flex gap-2">
            <a
              href={site.social.instagram}
              target="_blank"
              rel="noreferrer"
              className="flex size-11 items-center justify-center rounded-md text-ink-2 hover:bg-paper-3 hover:text-ink"
            >
              <InstagramLogo size={24} aria-hidden="true" />
              <span className="sr-only">Instagram</span>
            </a>
            <a
              href={site.social.facebook}
              target="_blank"
              rel="noreferrer"
              className="flex size-11 items-center justify-center rounded-md text-ink-2 hover:bg-paper-3 hover:text-ink"
            >
              <FacebookLogo size={24} aria-hidden="true" />
              <span className="sr-only">Facebook</span>
            </a>
          </div>
        </div>

        <div className="lg:col-span-3">
          <p className="text-sm font-medium text-ink">Her finder du os</p>
          <ul className="mt-3 space-y-4 text-[0.95rem] text-ink-2">
            {site.locations.map((loc) => (
              <li key={loc.id}>
                <p className="font-medium text-ink">{loc.name}</p>
                <p>{loc.subtitle}</p>
                {loc.hours.map((h) => (
                  <p key={h.days} className="tnum">
                    {h.days} {h.time}
                  </p>
                ))}
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-2">
          <p className="text-sm font-medium text-ink">Sider</p>
          <ul className="mt-3 space-y-2 text-[0.95rem] text-ink-2">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="hover:text-ink">
                  {item.label}
                </Link>
              </li>
            ))}
            {FOOTER_LINKS.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="hover:text-ink">
                  {item.label}
                </Link>
              </li>
            ))}
            {site.smileyUrl ? (
              <li>
                <a href={site.smileyUrl} target="_blank" rel="noreferrer" className="hover:text-ink">
                  Fødevarestyrelsens kontrolrapport
                </a>
              </li>
            ) : null}
          </ul>
        </div>

        <div className="lg:col-span-3">
          <p className="text-sm font-medium text-ink">Nyhedsbrev</p>
          <p className="mt-3 text-[0.95rem] text-ink-2">
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
            © {year} {site.name}. CVR {site.cvr}
          </p>
          <p>{fullAddress()}</p>
        </Container>
      </div>
    </footer>
  );
}
