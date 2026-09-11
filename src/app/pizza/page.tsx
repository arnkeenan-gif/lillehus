import type { Metadata } from "next";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { PizzaBookingForm } from "@/components/forms/pizza-booking-form";
import { getPizza } from "@/lib/content";
import { formatPrice } from "@/lib/format";
import type { PizzaContentExt } from "@/lib/forms";

export const metadata: Metadata = {
  title: "Den rullende pizzavogn",
  description:
    "Book pizzavognen til barnedåb, konfirmation, fødselsdag eller firmafest. Vi bager økologiske surdejspizzaer i den hjemmebyggede stenovn hos jer, på Sjælland, Fyn og Lolland-Falster.",
};

type FactRow = [label: string, value: string];

function FactList({ title, rows }: { title: string; rows: FactRow[] }) {
  return (
    <div>
      <h3 className="text-lg font-semibold text-ink">{title}</h3>
      <dl className="mt-4 space-y-3">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-baseline justify-between gap-6">
            <dt className="text-ink-2">{label}</dt>
            <dd className="tnum text-right font-medium text-ink">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export default async function PizzaPage() {
  const pizza = (await getPizza()) as PizzaContentExt;
  const offer = pizza.packages[0];
  const minAdults = offer?.minGuests ?? 40;
  const prices = pizza.prices;

  const perCover: FactRow[] = [
    ["Voksen", formatPrice(offer?.pricePerPersonOere ?? 0)],
    [`Barn, ${prices.childAges}`, formatPrice(prices.childOere)],
    ["Vegansk eller glutenfri", `+ ${formatPrice(prices.specialDietExtraOere)}`],
    ["Dessert", `${formatPrice(prices.dessertOere)}, mindst ${prices.dessertMinCovers} kuverter`],
  ];
  const conditions: FactRow[] = [
    ["Minimum", `${minAdults} voksne`],
    ["Tid", "Ad libitum i op til to timer"],
    ["Kørsel", `${formatPrice(prices.mileagePerKmOere)} pr. km ${prices.mileageNote}`],
    ["Depositum", "En tredjedel af beløbet"],
  ];

  return (
    <>
      {/* Hero: text left, photo right at lg; stacked below. */}
      <Section className="pb-10 sm:pb-14">
        <Container className="grid items-center gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-6">
            <h1 className="text-display font-semibold">Den rullende pizzavogn</h1>
            <p className="mt-6 max-w-[48ch] text-lg text-ink-2">{pizza.intro}</p>
            <div className="mt-8">
              <Button href="#book" size="lg">
                Book pizzavognen
              </Button>
            </div>
          </div>
          <div className="lg:col-span-6">
            <Image
              src="/images/wood-fired-pizza-oven.jpg"
              alt="Den hjemmebyggede stenovn med flammer, en person i hvid striktrøje ved siden af"
              width={1080}
              height={810}
              sizes="(min-width: 1024px) 580px, 100vw"
              priority
              className="aspect-[3/2] w-full rounded-md object-cover"
            />
          </div>
        </Container>
      </Section>

      {/* How it works: single-column prose. */}
      <Section className="pt-6 sm:pt-10">
        <Container size="narrow">
          <h2 className="text-title font-semibold">Sådan foregår det</h2>
          <div className="prose mt-6">
            {pizza.day.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </Container>
      </Section>

      {/* Prices: two-column facts list. */}
      <Section tone="tint">
        <Container>
          <div className="max-w-[60ch]">
            <h2 className="text-title font-semibold">Priser</h2>
            {offer ? <p className="mt-4 text-ink-2">{offer.description}</p> : null}
          </div>
          <div className="mt-10 grid gap-10 sm:grid-cols-2 sm:gap-16 lg:max-w-4xl">
            <FactList title="Pr. kuvert" rows={perCover} />
            <FactList title="Betingelser" rows={conditions} />
          </div>
          <p className="mt-10 max-w-[60ch] text-sm text-muted">
            {pizza.areaNote} {pizza.notes.join(" ")}
          </p>
        </Container>
      </Section>

      {/* Photo band with caption below. */}
      <Section className="pb-6 sm:pb-10">
        <Container>
          <figure>
            <Image
              src="/images/pizza-rocket-parma-ham.jpg"
              alt="Pizza med rucola, parmaskinke og parmesan"
              width={1266}
              height={846}
              sizes="(min-width: 1200px) 1136px, 100vw"
              className="aspect-[3/2] w-full rounded-lg object-cover lg:aspect-[16/9]"
            />
            <figcaption className="mt-3 text-sm text-muted">Rucola, parmaskinke og parmesan, lige ud af ovnen.</figcaption>
          </figure>
        </Container>
      </Section>

      {/* The menu: two plain lists. */}
      <Section>
        <Container>
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-7">
              <h2 className="text-title font-semibold">Pizzaerne</h2>
              <p className="mt-4 max-w-[60ch] text-ink-2">
                I vælger tre. Der er altid mindst en vegetarisk, og vegansk kan I få, hvis I beder om det.
              </p>
              <ul className="mt-8 list-disc space-y-3 pl-5 text-ink-2 marker:text-muted">
                {pizza.pizzas.map((item) => (
                  <li key={item.name}>
                    {item.name}
                    {item.vegetarian ? <span className="text-muted"> (vegetarisk)</span> : null}
                  </li>
                ))}
              </ul>
            </div>
            <div className="lg:col-span-4 lg:col-start-9">
              <h2 className="text-title font-semibold">Desserter</h2>
              <p className="mt-4 text-ink-2">Kan tilkøbes til mindst {prices.dessertMinCovers} kuverter.</p>
              <ul className="mt-8 list-disc space-y-3 pl-5 text-ink-2 marker:text-muted">
                {pizza.desserts.map((dessert) => (
                  <li key={dessert}>{dessert}</li>
                ))}
              </ul>
            </div>
          </div>
        </Container>
      </Section>

      {/* Practical terms. */}
      <Section tone="tint">
        <Container>
          <div className="max-w-[65ch]">
            <h2 className="text-title font-semibold">Praktisk</h2>
            <div className="prose mt-6">
              {pizza.terms.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>
        </Container>
      </Section>

      {/* Booking: form with a side summary. */}
      <Section id="book" className="scroll-mt-20 border-t border-line">
        <Container className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <h2 className="text-title font-semibold">Book pizzavognen</h2>
            <p className="mt-4 max-w-[60ch] text-ink-2">
              Udfyld formularen, så vender Kristine tilbage inden for to hverdage. Det er en forespørgsel: I betaler
              ikke noget, før hun har bekræftet.
            </p>
            <div className="mt-10">
              <PizzaBookingForm
                pizzas={pizza.pizzas}
                desserts={pizza.desserts}
                minAdults={minAdults}
                dessertMinCovers={prices.dessertMinCovers}
                childAges={prices.childAges}
              />
            </div>
          </div>
          <aside className="lg:col-span-4 lg:col-start-9">
            <div className="lg:sticky lg:top-24">
              <h3 className="text-lg font-semibold text-ink">Sådan går det videre</h3>
              <ol className="mt-4 list-decimal space-y-3 pl-5 text-[0.95rem] text-ink-2 marker:text-muted">
                <li>Du sender forespørgslen her på siden.</li>
                <li>
                  Kristine svarer inden for to hverdage med en bekræftelse, den samlede pris og betalingsoplysninger
                  til depositum.
                </li>
                <li>Depositum er en tredjedel af beløbet. Resten betaler I på dagen.</li>
                <li>Vi kommer to timer før spisetid og bager i to timer, eller til I er mætte.</li>
              </ol>
            </div>
          </aside>
        </Container>
      </Section>
    </>
  );
}
