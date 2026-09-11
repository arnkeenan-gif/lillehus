import type { Metadata } from "next";
import { Hero } from "@/components/home/hero";
import { Locations } from "@/components/home/locations";
import { Bread } from "@/components/home/bread";
import { PizzaBand } from "@/components/home/pizza-band";
import { Happenings } from "@/components/home/happenings";
import { AboutTeaser } from "@/components/home/about-teaser";
import { site } from "@/lib/site";

/** Events and products change; refresh the static page every hour. */
export const revalidate = 3600;

export const metadata: Metadata = {
  title: { absolute: `${site.name}, bageri og pizzavogn ved Herlufmagle` },
  description:
    "Surdejsbrød, rugbrød og kanelsnegle bagt på gården på Torpevej. Køb i fryseren, bestil til afhentning i Hønsehuset eller mød os på Torvedag i Næstved. Book pizzavognen til festen.",
};

/**
 * Forside. Six sections, each its own layout family:
 * hero (split), locations (two-column facts), bread (product grid),
 * pizza (photo band), det sker (list + Instagram strip), om os (logo and text).
 */
export default function HomePage() {
  return (
    <>
      <Hero />
      <Locations />
      <Bread />
      <PizzaBand />
      <Happenings />
      <AboutTeaser />
    </>
  );
}
