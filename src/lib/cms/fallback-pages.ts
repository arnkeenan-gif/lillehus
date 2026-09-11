/**
 * The page documents in content/cms-fallback/pages, keyed by slug. Used by
 * the façade when Sanity is not configured and by scripts/seed-sanity.ts to
 * push the same pages into Sanity. Relative imports on purpose: the seed
 * runs outside Next and does not know the @content alias.
 */
import arrangementer from "../../../content/cms-fallback/pages/arrangementer.json";
import bageri from "../../../content/cms-fallback/pages/bageri.json";
import faq from "../../../content/cms-fallback/pages/faq.json";
import findOs from "../../../content/cms-fallback/pages/find-os.json";
import firmaaftaler from "../../../content/cms-fallback/pages/firmaaftaler.json";
import forside from "../../../content/cms-fallback/pages/forside.json";
import handelsbetingelser from "../../../content/cms-fallback/pages/handelsbetingelser.json";
import kager from "../../../content/cms-fallback/pages/kager.json";
import kontakt from "../../../content/cms-fallback/pages/kontakt.json";
import levering from "../../../content/cms-fallback/pages/levering.json";
import omOs from "../../../content/cms-fallback/pages/om-os.json";
import pizza from "../../../content/cms-fallback/pages/pizza.json";
import privatlivspolitik from "../../../content/cms-fallback/pages/privatlivspolitik.json";

/** What a page file looks like before the façade or the seed touches it. */
export interface RawPage {
  title: string;
  slug: string;
  seo?: { title?: string; description?: string; image?: string };
  showInNav?: boolean;
  navLabel?: string;
  navOrder?: number;
  hidden?: boolean;
  sections: unknown[];
}

export const FALLBACK_PAGES: Record<string, RawPage> = {
  forside,
  bageri,
  kager,
  pizza,
  arrangementer,
  "find-os": findOs,
  "om-os": omOs,
  kontakt,
  firmaaftaler,
  levering,
  faq,
  handelsbetingelser,
  privatlivspolitik,
};
