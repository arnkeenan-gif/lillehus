import Link from "next/link";
import type { EventCategory } from "@/lib/cms";
import { cn } from "@/lib/cn";

/**
 * "Alle" plus one link per subcategory. Each category has its own address
 * (/arrangementer/kategori/kurser), so a filtered calendar can be shared and
 * found. The current one is underlined and marked for screen readers.
 */
export function CategoryNav({
  categories,
  active,
  className,
}: {
  categories: EventCategory[];
  /** The slug of the category being shown; null on the page with all of them. */
  active: string | null;
  className?: string;
}) {
  if (categories.length === 0) return null;
  const items = [
    { href: "/arrangementer#kalender", label: "Alle", current: active === null },
    ...categories.map((c) => ({ href: `/arrangementer/kategori/${c.slug}`, label: c.title, current: active === c.slug })),
  ];

  return (
    <nav aria-label="Kategorier" className={className}>
      <ul className="-ml-0.5 flex flex-wrap gap-x-6 gap-y-1">
        {items.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={item.current ? "page" : undefined}
              className={cn(
                "inline-flex min-h-11 items-center border-b-2 px-0.5 text-[0.95rem] transition-colors duration-150 ease-out-quart",
                item.current ? "border-ink font-semibold text-ink" : "border-transparent text-ink-2 hover:border-line hover:text-ink",
              )}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
