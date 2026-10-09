import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import type { CakeProduct } from "@/lib/cms";
import { cn } from "@/lib/cn";
import { cakePriceText } from "./cake-price";

/**
 * "Kager og specialbestillinger" at the bottom of the bagværk page
 * (Kristine's description, section 2): the page's one rust block, with the
 * cakes as links to their own pages and a way on to the cake page.
 */
export function BakeryCakesBlock({ cakes, className }: { cakes: CakeProduct[]; className?: string }) {
  return (
    <section aria-labelledby="kager-og-specialbestillinger" className={cn("bg-rust text-paper", className)}>
      <Container className="py-16 sm:py-24 lg:py-28">
        <h2 id="kager-og-specialbestillinger" className="max-w-[16ch] text-balance text-display font-bold tracking-tight text-paper">
          Kager og specialbestillinger
        </h2>
        {cakes.length > 0 ? (
          <ul className="mt-10 grid max-w-4xl gap-x-16 gap-y-1 md:grid-cols-2">
            {cakes.map((cake) => (
              <li key={cake.id}>
                <Link href={`/kager/${cake.id}`} className="group flex min-h-11 items-baseline py-1.5 text-paper">
                  <span className="min-w-0 text-lg font-medium group-hover:underline group-hover:underline-offset-[3px]">{cake.name}</span>
                  <span aria-hidden="true" className="mx-2 min-w-6 flex-1 self-baseline border-b-2 border-dotted border-paper/40" />
                  <span className="tnum shrink-0">{cakePriceText(cake)}</span>
                </Link>
              </li>
            ))}
          </ul>
        ) : null}
        <div className="mt-10">
          <Button href="/kager" variant="paper" size="lg">
            Forespørg på kage
          </Button>
        </div>
      </Container>
    </section>
  );
}
