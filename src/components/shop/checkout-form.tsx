"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/field";
import { controlAria } from "@/components/forms/form-state";
import { OrderLines, OrderTotal, PickupFacts } from "@/components/shop/order-summary";
import { useNow } from "@/components/ordering/use-now";
import { createCheckoutSession } from "@/app/bagvaerk/kasse/actions";
import { cartSubtotal, openCart, removeManyFromCart, useCart, useCartPickup, useCartReady } from "@/lib/cart";
import { INITIAL_CHECKOUT_STATE } from "@/lib/cart-order";
import { expiredLines, resolvePickup, type ClientLocation } from "@/lib/cart-pickup";
import { formatPrice } from "@/lib/format";
import { copenhagenDate } from "@/lib/ordering/dates";

/*
  The checkout: "Din bestilling" (pickup place, date, time, lines, total) and
  the four fields. The cart goes to the server action as JSON (ids, chosen
  options, quantities and the pickup); the server checks all of it again
  with its own clock and the CMS before sending the customer to Stripe.
  Lines the server no longer sells are taken out of the cart; lines whose
  deadline has passed are marked and block the payment until they are
  taken out or another date is chosen.
*/

type Props = {
  locations: ClientLocation[];
  renderedAt: number;
  stripeReady: boolean;
  minOrderOere: number;
  phone: string;
  phoneHref: string;
};

const PHONE_HELPER = "Så vi kan ringe, hvis der er noget med din bestilling.";
const EMAIL_HELPER = "Vi sender din kvittering hertil.";
const NOTE_HELPER = "Er der noget, vi skal vide?";

export function CheckoutForm({ locations, renderedAt, stripeReady, minOrderOere, phone, phoneHref }: Props) {
  const [state, formAction, pending] = useActionState(createCheckoutSession, INITIAL_CHECKOUT_STATE);
  const ready = useCartReady();
  const items = useCart();
  const stored = useCartPickup();
  const now = useNow(renderedAt);
  const pickup = useMemo(() => resolvePickup(stored, locations, copenhagenDate(now)), [stored, locations, now]);

  const [name, setName] = useState("");
  const [phoneValue, setPhoneValue] = useState("");
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");

  // Lines the server no longer sells are dropped from the cart so the customer can try again.
  const removed = state.removedKeys;
  useEffect(() => {
    if (removed && removed.length > 0) removeManyFromCart(removed);
  }, [removed]);

  const expired = useMemo(() => {
    const keys = new Set(pickup ? expiredLines(items, pickup.date.date, now).map((l) => l.key) : []);
    for (const key of state.expiredKeys ?? []) if (items.some((i) => i.key === key)) keys.add(key);
    return keys;
  }, [items, pickup, now, state.expiredKeys]);

  if (ready && items.length === 0) {
    return (
      <div className="max-w-[60ch]">
        <p className="text-lead text-ink">Din kurv er tom.</p>
        <p className="mt-2 text-ink-2">Læg noget i kurven i bagværket, så kan du betale her.</p>
        <div className="mt-6">
          <Button href="/bagvaerk">Tilbage til bagværket</Button>
        </div>
      </div>
    );
  }

  const subtotal = cartSubtotal(items);
  const belowMin = minOrderOere > 0 && subtotal < minOrderOere;
  const blocker = !pickup
    ? "Vælg afhentningssted og dato, før du går til betaling."
    : expired.size > 0
      ? "Tag de varer ud, der ikke kan nås til datoen, eller vælg en senere dato."
      : belowMin
        ? `Mindste bestilling er ${formatPrice(minOrderOere)}.`
        : null;
  const canSubmit = ready && !pending && items.length > 0 && !blocker;

  const orderField = JSON.stringify({
    pickup: stored,
    lines: items.map((i) => ({ key: i.key, kind: i.kind, productId: i.productId, qty: i.qty, ...(i.selections ? { selections: i.selections } : {}) })),
  });

  return (
    <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
      <aside aria-labelledby="oversigt-titel" className="order-first lg:order-none lg:col-span-5 lg:col-start-8 lg:row-start-1">
        <div className="lg:sticky lg:top-24">
          <div className="rounded-md border border-line p-5 sm:p-6">
            <h2 id="oversigt-titel" className="sr-only">
              Oversigt over din bestilling
            </h2>
            {ready ? (
              <>
                <PickupFacts pickup={pickup} stale={Boolean(stored) && !pickup} className="border-b border-line pb-5" />
                <div className="py-5">
                  <OrderLines items={items} expired={expired} pickupDate={pickup?.date.date} />
                </div>
                <OrderTotal items={items} className="border-t border-line pt-4" />
              </>
            ) : (
              <p className="text-sm text-muted">Henter din bestilling...</p>
            )}
          </div>
          <p className="mt-3 text-sm text-muted">
            Vil du ændre antal?{" "}
            <button type="button" onClick={openCart} className="text-rust underline underline-offset-[3px] hover:text-rust-deep">
              Åbn kurven
            </button>
          </p>
        </div>
      </aside>

      <form action={formAction} noValidate className="flex flex-col gap-6 lg:col-span-7 lg:row-start-1">
        <input type="hidden" name="order" value={orderField} />
        <div className="hidden" aria-hidden="true">
          <label htmlFor="website">Hjemmeside</label>
          <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
        </div>

        <h2 className="text-xl font-semibold text-ink">Dine oplysninger</h2>

        <Field label="Navn" htmlFor="name" required error={state.errors?.name}>
          <Input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            {...controlAria("name", state.errors?.name)}
          />
        </Field>

        <Field label="Telefon" htmlFor="phone" required helper={PHONE_HELPER} error={state.errors?.phone}>
          <Input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            required
            value={phoneValue}
            onChange={(e) => setPhoneValue(e.target.value)}
            className="tnum"
            {...controlAria("phone", state.errors?.phone, PHONE_HELPER)}
          />
        </Field>

        <Field label="E-mail" htmlFor="email" required helper={EMAIL_HELPER} error={state.errors?.email}>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            {...controlAria("email", state.errors?.email, EMAIL_HELPER)}
          />
        </Field>

        <Field label="Besked til os" htmlFor="note" helper={NOTE_HELPER} error={state.errors?.note}>
          <Textarea
            id="note"
            name="note"
            rows={3}
            maxLength={500}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            {...controlAria("note", state.errors?.note, NOTE_HELPER)}
          />
        </Field>

        {state.message && !(state.paymentUnavailable && !stripeReady) ? (
          <p role="alert" className="rounded-md bg-danger-tint px-4 py-3 text-danger">
            {state.message}
          </p>
        ) : null}

        {!stripeReady ? (
          <p role={state.paymentUnavailable ? "alert" : undefined} className="rounded-md bg-rust-tint px-4 py-3 text-ink">
            Betaling er ikke sat op endnu. Ring eller skriv til os, så tager vi bestillingen manuelt. Telefon{" "}
            <a href={`tel:${phoneHref}`} className="tnum font-medium text-rust underline underline-offset-[3px] hover:text-rust-deep">
              {phone}
            </a>
            .
          </p>
        ) : null}

        <div>
          <Button type="submit" size="lg" disabled={!canSubmit} className="w-full sm:w-auto sm:min-w-56">
            {pending ? "Sender dig til betaling..." : "Gå til betaling"}
          </Button>
          {ready && blocker ? (
            <p className="mt-3 text-sm text-muted">{blocker}</p>
          ) : (
            <p className="mt-3 text-sm text-muted">Du betaler med kort eller MobilePay på næste side.</p>
          )}
        </div>
      </form>
    </div>
  );
}
