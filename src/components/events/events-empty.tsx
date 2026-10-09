import Link from "next/link";
import type { SiteSettings } from "@/lib/cms";
import { textLink } from "@/components/sections/heading";

/**
 * Nothing in the calendar: Kristine's own words (from the "Det sker" section
 * of the arrangementer page, or one plain sentence on a category page), then
 * where new dates are announced, in her words from the old site, with the
 * Facebook and Instagram links from Indstillinger.
 */
export function EventsEmpty({
  text,
  social,
  allHref,
  className,
}: {
  text: string;
  social: SiteSettings["social"];
  /** A link to every coming event, for a category page that is empty while others are not. */
  allHref?: string;
  className?: string;
}) {
  const { facebook, instagram } = social;
  return (
    <div className={className}>
      <p className="max-w-[46ch] text-lead text-ink">{text}</p>
      {facebook || instagram ? (
        <p className="mt-4 max-w-[62ch] text-ink-2">
          Når de annonceres, sker det via vores{" "}
          {facebook ? (
            <a href={facebook} target="_blank" rel="noreferrer" className={textLink}>
              facebookside
            </a>
          ) : null}
          {facebook && instagram ? " og vores " : null}
          {instagram ? (
            <a href={instagram} target="_blank" rel="noreferrer" className={textLink}>
              Instagramprofil
            </a>
          ) : null}
          .
        </p>
      ) : null}
      {allHref ? (
        <p className="mt-6">
          <Link href={allHref} className={textLink}>
            Se alle arrangementer
          </Link>
        </p>
      ) : null}
    </div>
  );
}
