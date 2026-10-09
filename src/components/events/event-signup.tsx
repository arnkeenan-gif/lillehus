import { EventSignupForm } from "@/components/forms/event-signup-form";
import type { EventEntry, SiteSettings } from "@/lib/cms";
import { CONFIRM_SENTENCE, EVENT_NEXT_STEPS } from "@/lib/events/copy";
import { priceLabel } from "@/lib/events/dates";
import { maxPersons, type SignupState } from "@/lib/events/status";
import { cn } from "@/lib/cn";
import { EventCheckoutForm } from "./event-checkout-form";

const phoneLink =
  "tnum whitespace-nowrap font-medium text-rust underline decoration-1 underline-offset-[3px] transition-colors duration-150 ease-out-quart hover:text-rust-deep";

/**
 * "Tilmeld dig" on an event's page. What it holds depends on the event:
 * the free form (Kristine gets a mail), the payment form (Stripe Checkout),
 * the phone number when payment is on but Stripe is not set up yet, or a
 * line saying sign-up has closed. Nothing at all for an event without
 * sign-up or one that has taken place.
 */
export function EventSignup({
  event,
  state,
  settings,
  className,
}: {
  event: EventEntry;
  state: SignupState;
  settings: Pick<SiteSettings, "phone" | "phoneHref">;
  className?: string;
}) {
  if (state.kind === "past" || state.kind === "none") return null;
  const phone = (
    <a href={`tel:${settings.phoneHref}`} className={phoneLink}>
      {settings.phone}
    </a>
  );
  const price = priceLabel(event);

  return (
    <section id="tilmeld" aria-labelledby="tilmeld-titel" className={cn("scroll-mt-24", className)}>
      <h2 id="tilmeld-titel" className="text-title font-semibold text-ink">
        Tilmeld dig
      </h2>

      {state.kind === "closed" ? (
        <p className="mt-4 max-w-[52ch] text-lg text-ink-2">Tilmeldingen er lukket. Ring på {phone}, hvis du har spørgsmål.</p>
      ) : null}

      {state.kind === "pay-unavailable" ? (
        <p className="mt-4 max-w-[52ch] text-lg text-ink-2">
          Prisen er {price}. Betaling på siden er ikke sat op endnu. Ring på {phone}, så tilmelder vi dig.
        </p>
      ) : null}

      {state.kind === "pay" ? (
        <>
          <p className="mt-4 max-w-[62ch] text-ink-2">Prisen er {price}. Du betaler, når du tilmelder dig.</p>
          <div className="mt-8 max-w-2xl">
            <EventCheckoutForm eventId={event.slug} eventTitle={event.title} unitOere={state.unitOere} maxPersons={maxPersons(event)} />
          </div>
        </>
      ) : null}

      {state.kind === "form" ? (
        <>
          <p className="mt-4 max-w-[62ch] text-ink-2">{price ? `Prisen er ${price}. ${EVENT_NEXT_STEPS}` : CONFIRM_SENTENCE}</p>
          <div className="mt-8 max-w-2xl">
            <EventSignupForm eventId={event.slug} eventTitle={event.title} maxPersons={maxPersons(event)} />
          </div>
        </>
      ) : null}
    </section>
  );
}
