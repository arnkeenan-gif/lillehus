import Link from "next/link";
import { CmsPhoto } from "@/components/cms/photo";
import type { CakeProduct } from "@/lib/cms";
import { cn } from "@/lib/cn";
import { cakePriceText } from "./cake-price";

/**
 * The cakes Kristine set up, each linking to its own page. Cakes with a
 * photo are tiles (photo, name, price); cakes without one are set like the
 * chalkboard, name and price on one line with a dotted leader, so nothing
 * stands in an empty box.
 */
export function CakeTiles({ cakes, className }: { cakes: CakeProduct[]; className?: string }) {
  const withPhoto = cakes.filter((c) => c.photos[0]);
  const withoutPhoto = cakes.filter((c) => !c.photos[0]);
  if (cakes.length === 0) return null;

  return (
    <div className={className}>
      {withPhoto.length > 0 ? (
        <ul className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-5 lg:grid-cols-3 lg:gap-x-6 lg:gap-y-10">
          {withPhoto.map((cake) => (
            <li key={cake.id}>
              <Link href={`/kager/${cake.id}`} className="group block">
                <CmsPhoto image={cake.photos[0]} ratio="4/5" sizes="(min-width: 1264px) 380px, (min-width: 1024px) 31vw, 45vw" />
                <p className="mt-3 font-medium text-ink group-hover:underline group-hover:underline-offset-[3px]">{cake.name}</p>
                <p className="tnum text-[0.95rem] text-ink-2">{cakePriceText(cake)}</p>
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
      {withoutPhoto.length > 0 ? (
        <ul className={cn("grid gap-x-16 gap-y-2 md:grid-cols-2 lg:gap-x-24", withPhoto.length > 0 && "mt-12")}>
          {withoutPhoto.map((cake) => (
            <li key={cake.id}>
              <Link href={`/kager/${cake.id}`} className="group flex min-h-11 items-baseline py-1.5">
                <span className="min-w-0 text-lg font-medium text-ink group-hover:underline group-hover:underline-offset-[3px]">{cake.name}</span>
                <span className="leader" aria-hidden="true" />
                <span className="tnum shrink-0 text-lg text-ink">{cakePriceText(cake)}</span>
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
