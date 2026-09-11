import { Container } from "@/components/ui/container";
import { CakeRequestForm } from "@/components/forms/cake-request-form";
import { CompanyRequestForm } from "@/components/forms/company-request-form";
import { ContactForm } from "@/components/forms/contact-form";
import { CourseInterestForm } from "@/components/forms/course-interest-form";
import { EventSignupForm } from "@/components/forms/event-signup-form";
import { NewsletterForm } from "@/components/forms/newsletter-form";
import { PizzaBookingForm } from "@/components/forms/pizza-booking-form";
import { pizzaRates } from "@/components/forms/pizza-estimate";
import { getCakes, getEvents, getPizzaSettings, type FormKind, type FormSection } from "@/lib/cms";
import { formatDateLong, formatTime, ucfirst } from "@/lib/format";
import { cn } from "@/lib/cn";
import { SectionHeading } from "./heading";
import type { SectionProps } from "./types";

/** Anchor ids so hero buttons can point at the form: /pizza#book, /kager#forespoerg. */
const ANCHORS: Record<FormKind, string> = {
  pizza: "book",
  cake: "forespoerg",
  company: "forespoerg",
  contact: "skriv",
  course: "kursus",
  newsletter: "nyhedsbrev",
  event: "tilmeld",
};

async function renderForm(section: FormSection): Promise<React.ReactNode> {
  switch (section.kind) {
    case "pizza": {
      const pizza = await getPizzaSettings();
      return (
        <PizzaBookingForm
          pizzas={pizza.pizzas}
          desserts={pizza.desserts}
          minAdults={pizza.packages[0]?.minGuests ?? 40}
          dessertMinCovers={pizza.prices.dessertMinCovers}
          childAges={pizza.prices.childAges}
          rates={pizzaRates(pizza)}
          steps={section.steps}
          anchor={ANCHORS.pizza}
        />
      );
    }
    case "cake": {
      const cakes = await getCakes();
      return <CakeRequestForm cakes={cakes.map((c) => ({ id: c.id, name: c.name, leadTimeDays: c.leadTimeDays }))} />;
    }
    case "contact":
      return <ContactForm />;
    case "company":
      return <CompanyRequestForm />;
    case "course":
      return <CourseInterestForm />;
    case "newsletter":
      return <NewsletterForm />;
    case "event": {
      const events = (await getEvents()).filter((e) => e.signup);
      if (events.length === 0) {
        return <p className="text-ink-2">Der er ikke noget at tilmelde sig lige nu. Vi skriver her, når næste dato er sat.</p>;
      }
      return (
        <div className="space-y-16">
          {events.map((event) => {
            const clock = formatTime(event.start);
            return (
              <div key={event.id}>
                <h3 className="text-xl font-semibold text-ink">{event.title}</h3>
                <p className="tnum mt-1 text-ink-2">
                  {ucfirst(formatDateLong(event.start))}
                  {clock !== "00.00" ? `, kl. ${clock}` : ""}. {event.place}
                </p>
                <div className="mt-6">
                  <EventSignupForm eventId={event.id} eventTitle={event.title} />
                </div>
              </div>
            );
          })}
        </div>
      );
    }
    default:
      return null;
  }
}

/**
 * The booking, request and contact forms with their heading and text; the
 * "Sådan går det videre" steps stand beside the form from lg. The pizza
 * form lays itself out instead: the fields on the left and the running
 * price estimate on the right (with the steps under it, if any).
 */
export async function FormBlock({ section, level, className }: SectionProps<FormSection>) {
  const form = await renderForm(section);
  if (!form) return null;
  const { heading, text, steps } = section;
  const hasTop = Boolean(heading || text);
  const top = (
    <>
      {heading ? <SectionHeading as={level}>{heading}</SectionHeading> : null}
      {text ? <p className="mt-4 max-w-[62ch] text-ink-2">{text}</p> : null}
    </>
  );

  if (section.kind === "pizza") {
    return (
      <section id={ANCHORS.pizza} className={cn("scroll-mt-24", className)}>
        <Container>
          {top}
          <div className={cn(hasTop && "mt-10")}>{form}</div>
        </Container>
      </section>
    );
  }

  return (
    <section id={ANCHORS[section.kind]} className={cn("scroll-mt-24", className)}>
      <Container>
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            {top}
            <div className={cn(hasTop && "mt-10")}>{form}</div>
          </div>
          {steps.length > 0 ? (
            <aside className="lg:col-span-4 lg:col-start-9">
              <div className="lg:sticky lg:top-24">
                <p className="font-semibold text-ink">Sådan går det videre</p>
                <ol className="mt-4 list-decimal space-y-3 pl-5 text-[0.95rem] text-ink-2 marker:text-muted">
                  {steps.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
              </div>
            </aside>
          ) : null}
        </div>
      </Container>
    </section>
  );
}
