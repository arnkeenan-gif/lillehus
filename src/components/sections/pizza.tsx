import { Container } from "@/components/ui/container";
import { getPizzaSettings, type PizzaSection, type PizzaSettings } from "@/lib/cms";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/cn";
import { upperFirst } from "@/components/cms/text";
import { SectionHeading } from "./heading";
import type { SectionProps } from "./types";

/**
 * One part of the pizza wagon page from the pizza settings: how the day
 * goes (prose), the prices (a leader list plus what is included), the menu
 * (two plain lists) or the practical terms (prose).
 */
function Paragraphs({ paragraphs, className }: { paragraphs: string[]; className?: string }) {
  return (
    <div className={cn("prose", className)}>
      {paragraphs.map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}
    </div>
  );
}

function Prices({ pizza, hasTop }: { pizza: PizzaSettings; hasTop: boolean }) {
  const offer = pizza.packages[0];
  const p = pizza.prices;
  const rows: { name: string; price: string; note?: string }[] = [];
  if (offer?.pricePerPersonOere) {
    rows.push({ name: "Voksen", price: `${formatPrice(offer.pricePerPersonOere)} pr. kuvert`, note: offer.description });
  }
  rows.push(
    { name: `Barn, ${p.childAges}`, price: `${formatPrice(p.childOere)} pr. kuvert` },
    { name: "Vegansk eller glutenfri", price: `+ ${formatPrice(p.specialDietExtraOere)} pr. kuvert` },
    { name: "Dessert", price: `${formatPrice(p.dessertOere)} pr. kuvert`, note: `Fra ${p.dessertMinCovers} kuverter` },
    { name: "Kørsel", price: `${formatPrice(p.mileagePerKmOere)} pr. km`, note: p.mileageNote ? upperFirst(p.mileageNote) : undefined },
    { name: "Depositum", price: "en tredjedel af beløbet", note: "Resten betaler I på dagen" },
  );
  const footnote = [pizza.areaNote, ...pizza.notes].filter(Boolean).join(" ");

  return (
    <>
      <ul className={cn("md:columns-2 md:gap-x-16 lg:gap-x-24", hasTop && "mt-10")}>
        {rows.map((row) => (
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
  return (
    <div className={cn("grid gap-10 lg:grid-cols-12 lg:gap-16", hasTop && "mt-8")}>
      <ul className="list-disc space-y-3 pl-5 text-ink-2 marker:text-muted lg:col-span-7">
        {pizza.pizzas.map((item) => (
          <li key={item.name}>
            {item.name}
            {item.vegetarian ? <span className="text-muted"> (vegetarisk)</span> : null}
          </li>
        ))}
      </ul>
      {pizza.desserts.length > 0 ? (
        <div className="lg:col-span-4 lg:col-start-9">
          <p className="font-semibold text-ink">Dessert, fra {pizza.prices.dessertMinCovers} kuverter</p>
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
  const { part, heading, text } = section;
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
      body = <Paragraphs paragraphs={pizza.terms} className={hasTop ? "mt-6" : undefined} />;
      break;
  }

  return (
    <section className={className}>
      <Container>
        {heading ? <SectionHeading as={level}>{heading}</SectionHeading> : null}
        {text ? <p className={cn("max-w-[62ch]", part === "menu" ? "text-lead text-ink" : "text-ink-2", heading && "mt-4")}>{text}</p> : null}
        {body}
      </Container>
    </section>
  );
}
