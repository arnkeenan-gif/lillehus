import { Container } from "@/components/ui/container";
import { getPizzaSettings, type PizzaSection, type PizzaSettings } from "@/lib/cms";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/cn";
import { upperFirst } from "@/components/cms/text";
import { SectionHeading } from "./heading";
import type { SectionProps } from "./types";

/**
 * One part of the pizza wagon page from the pizza settings: the prices (a
 * two-column leader list, as on the forside), the menu (two plain lists
 * side by side), how the day goes (prose) or the deposit terms (prose).
 * No tables, no boxes, no icons.
 */
function Paragraphs({ paragraphs, className }: { paragraphs: string[]; className?: string }) {
  return (
    <div className={cn("max-w-[62ch] space-y-5 text-ink-2", className)}>
      {paragraphs.map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}
    </div>
  );
}

interface PriceRow {
  name: string;
  price: string;
  note?: string;
}

/** The facts a visitor needs before booking, one row each. Zero rates are left out. */
function priceRows(pizza: PizzaSettings): PriceRow[] {
  const offer = pizza.packages[0];
  const p = pizza.prices;
  const rows: PriceRow[] = [];
  if (offer?.pricePerPersonOere) {
    rows.push({ name: "Voksen", price: `${formatPrice(offer.pricePerPersonOere)} pr. kuvert`, note: offer.description || undefined });
  }
  if (p.childOere > 0) {
    rows.push({ name: `Barn, ${p.childAges}`, price: `${formatPrice(p.childOere)} pr. kuvert` });
  }
  if (p.specialDietExtraOere > 0) {
    rows.push({ name: "Tilvalg af vegansk eller glutenfri", price: `+ ${formatPrice(p.specialDietExtraOere)} pr. kuvert` });
  }
  if (p.dessertOere > 0) {
    rows.push({ name: "Dessert", price: `${formatPrice(p.dessertOere)} pr. kuvert`, note: `Minimumkøb ${p.dessertMinCovers} kuverter` });
  }
  if (p.mileagePerKmOere > 0) {
    rows.push({
      name: "Kørselstillæg",
      price: `${formatPrice(p.mileagePerKmOere)} pr. km`,
      note: p.mileageNote ? upperFirst(p.mileageNote) : undefined,
    });
  }
  return rows;
}

function Prices({ pizza, hasTop }: { pizza: PizzaSettings; hasTop: boolean }) {
  const offer = pizza.packages[0];
  const footnote = [pizza.areaNote, ...pizza.notes].filter(Boolean).join(" ");

  return (
    <>
      <ul className={cn("md:columns-2 md:gap-x-16 lg:gap-x-24", hasTop && "mt-10")}>
        {priceRows(pizza).map((row) => (
          <li key={row.name} className="break-inside-avoid py-3">
            <div className="flex items-baseline">
              <span className="text-lg font-medium text-ink">{row.name}</span>
              <span className="leader" aria-hidden="true" />
              <span className="tnum shrink-0 text-lg text-ink">{row.price}</span>
            </div>
            {row.note ? <p className="mt-0.5 max-w-[40ch] text-sm text-muted">{row.note}</p> : null}
          </li>
        ))}
      </ul>
      {offer && offer.includes.length > 0 ? (
        <div className="mt-10 max-w-[62ch]">
          <p className="font-semibold text-ink">Det er med i prisen</p>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-ink-2 marker:text-muted">
            {offer.includes.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      ) : null}
      {footnote ? <p className="mt-8 max-w-[62ch] text-sm text-muted">{footnote}</p> : null}
    </>
  );
}

function Menu({ pizza, hasTop }: { pizza: PizzaSettings; hasTop: boolean }) {
  const p = pizza.prices;
  return (
    <div className={cn("grid gap-12 md:grid-cols-12 md:gap-x-12", hasTop && "mt-10")}>
      <div className="md:col-span-7">
        <p className="font-semibold text-ink">Pizzavarianter</p>
        <ul className="mt-3 list-disc space-y-3 pl-5 text-ink-2 marker:text-muted">
          {pizza.pizzas.map((item) => (
            <li key={item.name}>
              {item.name}
              {item.vegetarian ? <span className="text-muted"> (vegetarisk)</span> : null}
            </li>
          ))}
        </ul>
      </div>
      {pizza.desserts.length > 0 ? (
        <div className="md:col-span-4 md:col-start-9">
          <p className="font-semibold text-ink">Desserter</p>
          {p.dessertOere > 0 ? (
            <p className="mt-1 text-sm text-muted">
              Kan tilkøbes til pizzaerne, {formatPrice(p.dessertOere)} pr. kuvert, minimumkøb {p.dessertMinCovers} kuverter.
            </p>
          ) : null}
          <ul className="mt-3 list-disc space-y-3 pl-5 text-ink-2 marker:text-muted">
            {pizza.desserts.map((dessert) => (
              <li key={dessert}>{dessert}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

export async function PizzaPart({ section, level, className }: SectionProps<PizzaSection>) {
  const pizza = await getPizzaSettings();
  const { part, heading } = section;
  /* The prices open the page, so without a text of their own they take the intro from the pizza settings. */
  const text = section.text || (part === "prices" ? pizza.intro : undefined);
  const hasTop = Boolean(heading || text);

  let body: React.ReactNode;
  switch (part) {
    case "day":
      body = <Paragraphs paragraphs={pizza.day} className={hasTop ? "mt-6" : undefined} />;
      break;
    case "prices":
      body = <Prices pizza={pizza} hasTop={hasTop} />;
      break;
    case "menu":
      body = <Menu pizza={pizza} hasTop={hasTop} />;
      break;
    case "terms":
      body = <Paragraphs paragraphs={pizza.terms} className={hasTop ? "mt-4" : undefined} />;
      break;
  }

  /* Prices and menu open with a large intro sentence; the terms take a short bold lead-in ("Depositum"). */
  let textClass: string;
  if (part === "terms") textClass = "font-semibold text-ink";
  else if (part === "day") textClass = "max-w-[62ch] text-ink-2";
  else textClass = "max-w-[62ch] text-lead text-ink";

  return (
    <section className={className}>
      <Container>
        {heading ? <SectionHeading as={level}>{heading}</SectionHeading> : null}
        {text ? <p className={cn(textClass, heading && "mt-4")}>{text}</p> : null}
        {body}
      </Container>
    </section>
  );
}
