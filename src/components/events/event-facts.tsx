import Link from "next/link";
import type { EventEntry } from "@/lib/cms";
import { deadlineLabel, priceLabel, whenLong } from "@/lib/events/dates";
import { cn } from "@/lib/cn";

/**
 * The practical facts under an event's title: when, where, the price, the
 * category, the number of places and the sign-up deadline. Only the ones
 * Kristine filled in are shown.
 */
export function EventFacts({ event, showDeadline, className }: { event: EventEntry; showDeadline: boolean; className?: string }) {
  const facts: { label: string; value: React.ReactNode; tnum?: boolean }[] = [
    { label: "Hvornår", value: whenLong(event), tnum: true },
  ];
  if (event.place) facts.push({ label: "Hvor", value: event.place });
  const price = priceLabel(event);
  if (price) facts.push({ label: "Pris", value: price, tnum: true });
  if (event.category) {
    facts.push({
      label: "Kategori",
      value: (
        <Link
          href={`/arrangementer/kategori/${event.category.slug}`}
          className="underline decoration-line decoration-1 underline-offset-[3px] transition-colors duration-150 ease-out-quart hover:text-rust hover:decoration-rust"
        >
          {event.category.title}
        </Link>
      ),
    });
  }
  if (event.capacity) facts.push({ label: "Pladser", value: String(event.capacity), tnum: true });
  if (showDeadline && event.signupDeadline) {
    facts.push({ label: "Tilmelding senest", value: deadlineLabel(event.signupDeadline), tnum: true });
  }

  return (
    <dl className={cn("grid grid-cols-2 gap-x-6 gap-y-5 sm:gap-x-8 lg:grid-cols-4", className)}>
      {facts.map((fact) => (
        <div key={fact.label} className={cn("min-w-0", fact.label === "Hvornår" && "col-span-2")}>
          <dt className="text-sm text-muted">{fact.label}</dt>
          <dd className={cn("mt-0.5 text-ink", fact.tnum && "tnum")}>{fact.value}</dd>
        </div>
      ))}
    </dl>
  );
}
