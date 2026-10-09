import { Container } from "@/components/ui/container";
import { CmsPhoto } from "@/components/cms/photo";
import { dayText, timeRangeText, upperFirst } from "@/components/cms/text";
import { getPizzaSettings, type CmsImage, type PizzaSection, type PizzaSettings, type PizzaStop } from "@/lib/cms";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/cn";
import { SectionHeading, listMeasure } from "./heading";
import type { SectionProps } from "./types";

/**
 * One part of the pizza wagon page from the pizza settings: the opening
 * sentence, how the day goes (prose), where the wagon stands next (a dated
 * list, only when Kristine has entered places), the prices (a two-column
 * leader list, as on the forside), the menu (the photos Kristine added,
 * then pizzas and desserts as plain lists with a price where there is one)
 * or the deposit terms (prose). No tables, no boxes, no icons.
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

/**
 * The photos of the pizzas and desserts that have one, each with its name
 * under it: one photo goes wide (3/2, like a photo band), two stand side by
 * side, three or more become a grid of 4/5 tiles.
 */
function MenuPhotos({ items }: { items: { name: string; image: CmsImage }[] }) {
  if (items.length === 0) return null;
  if (items.length === 1) {
    const [item] = items;
    return (
      <figure className="mt-10">
        <CmsPhoto image={item.image} ratio="3/2" rounded="lg" sizes="(min-width: 1264px) 1136px, 100vw" />
        <figcaption className="mt-3 text-sm text-muted">{item.name}</figcaption>
      </figure>
    );
  }
  const two = items.length === 2;
  return (
    <ul className={cn("mt-10 grid gap-x-4 gap-y-6 sm:gap-x-5 lg:gap-x-6", two ? "sm:grid-cols-2" : "grid-cols-2 lg:grid-cols-4")}>
      {items.map((item) => (
        <li key={item.name}>
          <CmsPhoto
            image={item.image}
            ratio={two ? "3/2" : "4/5"}
            sizes={two ? "(min-width: 1264px) 556px, (min-width: 640px) 47vw, 100vw" : "(min-width: 1264px) 266px, (min-width: 1024px) 23vw, 47vw"}
          />
          <p className="mt-2 text-sm text-muted">{item.name}</p>
        </li>
      ))}
    </ul>
  );
}

function MenuRow({ name, note, description, priceOere }: { name: string; note?: string; description?: string; priceOere?: number }) {
  return (
    <li>
      <div className="flex items-baseline">
        <span className="min-w-0">
          {name}
          {note ? <span className="text-muted"> ({note})</span> : null}
        </span>
        {typeof priceOere === "number" ? (
          <>
            <span className="leader" aria-hidden="true" />
            <span className="tnum shrink-0 text-ink">{formatPrice(priceOere)}</span>
          </>
        ) : null}
      </div>
      {description ? <p className="mt-0.5 text-sm text-muted">{description}</p> : null}
    </li>
  );
}

function Menu({ pizza, hasTop }: { pizza: PizzaSettings; hasTop: boolean }) {
  const p = pizza.prices;
  const photos = [...pizza.pizzas, ...pizza.desserts].filter((item): item is typeof item & { image: CmsImage } => Boolean(item.image));
  if (pizza.pizzas.length === 0 && pizza.desserts.length === 0) return null;

  return (
    <>
      <MenuPhotos items={photos} />
      <div className={cn("grid gap-12 md:grid-cols-12 md:gap-x-12", (hasTop || photos.length > 0) && "mt-10")}>
        {pizza.pizzas.length > 0 ? (
          <div className="md:col-span-7">
            <p className="font-semibold text-ink">Pizzavarianter</p>
            <ul className="mt-3 list-disc space-y-3 pl-5 text-ink-2 marker:text-muted">
              {pizza.pizzas.map((item) => (
                <MenuRow
                  key={item.name}
                  name={item.name}
                  note={item.vegetarian ? "vegetarisk" : undefined}
                  description={item.description}
                  priceOere={item.priceOere}
                />
              ))}
            </ul>
          </div>
        ) : null}
        {pizza.desserts.length > 0 ? (
          <div className={pizza.pizzas.length > 0 ? "md:col-span-4 md:col-start-9" : "md:col-span-7"}>
            <p className="font-semibold text-ink">Desserter</p>
            {p.dessertOere > 0 ? (
              <p className="mt-1 text-sm text-muted">
                Kan tilkøbes til pizzaerne, {formatPrice(p.dessertOere)} pr. kuvert, minimumkøb {p.dessertMinCovers} kuverter.
              </p>
            ) : null}
            <ul className="mt-3 list-disc space-y-3 pl-5 text-ink-2 marker:text-muted">
              {pizza.desserts.map((dessert) => (
                <MenuRow key={dessert.name} name={dessert.name} description={dessert.description} priceOere={dessert.priceOere} />
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </>
  );
}

/** Today in Denmark as "YYYY-MM-DD". */
function copenhagenToday(): string {
  return new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Copenhagen" }).format(new Date());
}

/** Where the wagon stands next: date and hours on the left, the place and a note on the right, hairlines between. */
function Schedule({ stops, hasTop }: { stops: PizzaStop[]; hasTop: boolean }) {
  return (
    <ul className={cn(listMeasure, "border-t border-line", hasTop && "mt-8")}>
      {stops.map((stop) => {
        const time = timeRangeText(stop.from, stop.to);
        return (
          <li key={stop._key} className="grid gap-1 border-b border-line py-4 sm:grid-cols-[17rem_minmax(0,1fr)] sm:gap-8">
            <p className="tnum font-medium text-ink">
              {upperFirst(dayText(stop.date))}
              {time ? <span className="block font-normal text-ink-2">{upperFirst(time)}</span> : null}
            </p>
            <div>
              <p className="text-ink">{stop.place}</p>
              {stop.note ? <p className="mt-0.5 text-sm text-muted">{stop.note}</p> : null}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export async function PizzaPart({ section, level, className }: SectionProps<PizzaSection>) {
  const pizza = await getPizzaSettings();
  const { part, heading } = section;
  const today = copenhagenToday();
  const upcoming = part === "schedule" ? pizza.schedule.filter((stop) => stop.date >= today) : [];
  // The places list only exists while there is somewhere to go.
  if (part === "schedule" && upcoming.length === 0) return null;
  if (part === "menu" && pizza.pizzas.length === 0 && pizza.desserts.length === 0) return null;

  /* The opening part takes the intro from the pizza settings unless the section has a text of its own. */
  const text = section.text || (part === "intro" ? pizza.intro : undefined);
  const hasTop = Boolean(heading || text);

  let body: React.ReactNode = null;
  switch (part) {
    case "day":
      body = <Paragraphs paragraphs={pizza.day} className={hasTop ? "mt-6" : undefined} />;
      break;
    case "schedule":
      body = <Schedule stops={upcoming} hasTop={hasTop} />;
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

  /* The intro, prices and menu open with a large sentence; the terms take a short bold lead-in ("Depositum"). */
  let textClass: string;
  if (part === "terms") textClass = "font-semibold text-ink";
  else if (part === "day" || part === "schedule") textClass = "max-w-[62ch] text-ink-2";
  else if (part === "intro") textClass = "max-w-[46ch] text-lead text-ink";
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
