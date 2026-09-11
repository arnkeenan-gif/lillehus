"use client";

import { useActionState, useEffect, useState, useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { OrderSummary } from "@/components/shop/order-summary";
import { controlAria } from "@/components/forms/form-state";
import { Radio } from "@/components/forms/form-status";
import { createCheckoutSession } from "@/app/bageri/kasse/actions";
import { cartSubtotal, openCart, removeManyFromCart, useCart } from "@/lib/cart";
import { INITIAL_CHECKOUT_STATE, type Fulfilment } from "@/lib/cart-order";
import {
  constraintHelper,
  filterDaysForItems,
  pickupHours,
  pickupPlaceShort,
  type DeliveryConfig,
  type PickupDay,
} from "@/lib/cart-pickup";
import { formatPrice } from "@/lib/format";

type Props = {
  /** Every day the bakery can take an order for, computed on the server. */
  days: PickupDay[];
  stripeReady: boolean;
  delivery: DeliveryConfig;
  minOrderOere: number;
  pickupPlace: string;
  pickupWindow: string;
  phone: string;
  phoneHref: string;
};

const subscribeNever = () => () => {};
/** False during server render and hydration, true afterwards. */
function useHydrated() {
  return useSyncExternalStore(
    subscribeNever,
    () => true,
    () => false,
  );
}

const PHONE_HELPER = "Så vi kan ringe, hvis der er noget med din bestilling.";
const EMAIL_HELPER = "Vi sender din kvittering hertil.";
const NOTE_HELPER = "Skal brødet skæres? Andet vi skal vide?";

export function CheckoutForm({ days, stripeReady, delivery, minOrderOere, pickupPlace, pickupWindow, phone, phoneHref }: Props) {
  const [state, formAction, pending] = useActionState(createCheckoutSession, INITIAL_CHECKOUT_STATE);
  const hydrated = useHydrated();
  const items = useCart();

  const [fulfilment, setFulfilment] = useState<Fulfilment>("pickup");
  const [pickupDate, setPickupDate] = useState("");
  const [name, setName] = useState("");
  const [phoneValue, setPhoneValue] = useState("");
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");

  // Lines the server no longer sells are dropped from the cart so the user can try again.
  const removed = state.removedProductIds;
  useEffect(() => {
    if (removed && removed.length > 0) removeManyFromCart(removed);
  }, [removed]);

  const isDelivery = delivery.enabled && fulfilment === "delivery";
  const daysForItems = filterDaysForItems(days, items);
  const options = isDelivery ? daysForItems.filter((d) => delivery.days.includes(d.weekday)) : daysForItems;
  const selectedDate = options.some((d) => d.iso === pickupDate) ? pickupDate : (options[0]?.iso ?? "");

  const subtotal = cartSubtotal(items);
  const deliveryOere = isDelivery ? (subtotal >= delivery.freeAboveOere ? 0 : delivery.feeOere) : null;
  const belowMin = minOrderOere > 0 && subtotal < minOrderOere;

  const place = pickupPlaceShort(pickupPlace);
  const constraint = constraintHelper(items);
  const dayHelper = isDelivery ? delivery.note : (constraint ?? `Hent i ${pickupPlace}, mellem kl. ${pickupHours(pickupWindow)}.`);
  const noDayError =
    options.length === 0
      ? isDelivery
        ? "Vi kan ikke levere på en dag, hvor alt i kurven bliver bagt. Vælg afhentning i stedet."
        : "Varerne i kurven bages ikke på samme dag. Fjern en af dem, eller bestil dem hver for sig."
      : undefined;
  const dayError = state.errors?.pickupDate ?? noDayError;

  const canSubmit = stripeReady && !pending && hydrated && items.length > 0 && options.length > 0 && !belowMin;

  if (hydrated && items.length === 0) {
    return (
      <div className="max-w-[60ch]">
        <p className="text-lead text-ink">Din kurv er tom.</p>
        <p className="mt-2 text-ink-2">Læg noget i kurven i bageriet, så kan du betale her.</p>
        <div className="mt-6">
          <Button href="/bageri">Tilbage til bageriet</Button>
        </div>
      </div>
    );
  }

  const cartField = JSON.stringify(items.map((i) => ({ productId: i.productId, qty: i.qty })));

  return (
    <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
      <form action={formAction} noValidate className="flex flex-col gap-6 lg:col-span-7">
        <input type="hidden" name="items" value={cartField} />
        <div className="hidden" aria-hidden="true">
          <label htmlFor="website">Hjemmeside</label>
          <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
        </div>

        {delivery.enabled ? (
          <fieldset className="flex min-w-0 flex-col gap-1">
            <legend className="float-left w-full pb-2 text-sm font-medium text-ink">Afhentning eller levering</legend>
            <Radio
              id="fulfilment-pickup"
              name="fulfilment"
              value="pickup"
              checked={fulfilment === "pickup"}
              onChange={() => setFulfilment("pickup")}
              label={
                <>
                  Jeg henter selv i {place}
                  <span className="block text-sm text-muted">Gratis</span>
                </>
              }
            />
            <Radio
              id="fulfilment-delivery"
              name="fulfilment"
              value="delivery"
              checked={fulfilment === "delivery"}
              onChange={() => setFulfilment("delivery")}
              label={
                <>
                  Levering
                  <span className="block text-sm text-muted">
                    {formatPrice(delivery.feeOere)}, gratis over {formatPrice(delivery.freeAboveOere)}. {delivery.note}
                  </span>
                </>
              }
            />
            {state.errors?.fulfilment ? (
              <p role="alert" className="text-sm text-danger">
                {state.errors.fulfilment}
              </p>
            ) : null}
          </fieldset>
        ) : (
          <input type="hidden" name="fulfilment" value="pickup" />
        )}

        <Field label={isDelivery ? "Leveringsdag" : "Afhentningsdag"} htmlFor="pickupDate" required helper={dayHelper} error={dayError}>
          <Select
            id="pickupDate"
            name="pickupDate"
            value={selectedDate}
            onChange={(e) => setPickupDate(e.target.value)}
            required
            disabled={options.length === 0}
            {...controlAria("pickupDate", dayError, dayHelper)}
          >
            {options.length === 0 ? (
              <option value="">Ingen dage at vælge</option>
            ) : (
              options.map((d) => (
                <option key={d.iso} value={d.iso}>
                  {d.label}
                </option>
              ))
            )}
          </Select>
        </Field>

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

        {state.message ? (
          <p role="alert" className="rounded-md bg-danger-tint px-4 py-3 text-danger">
            {state.message}
          </p>
        ) : null}
        {belowMin ? <p className="text-sm text-muted">Mindste bestilling er {formatPrice(minOrderOere)}.</p> : null}

        {stripeReady ? (
          <div>
            <Button type="submit" size="lg" disabled={!canSubmit} className="w-full sm:w-auto sm:min-w-56">
              {pending ? "Sender dig til betaling..." : "Gå til betaling"}
            </Button>
            <p className="mt-3 text-sm text-muted">Du betaler med kort eller MobilePay på næste side.</p>
          </div>
        ) : (
          <p className="rounded-md bg-rust-tint px-4 py-3 text-ink">
            Betaling er ikke sat op endnu. Ring eller skriv til os, så tager vi bestillingen manuelt. Telefon{" "}
            <a href={`tel:${phoneHref}`} className="tnum font-medium text-rust underline underline-offset-[3px] hover:text-rust-deep">
              {phone}
            </a>
            .
          </p>
        )}
      </form>

      <aside className="lg:col-span-5">
        <div className="lg:sticky lg:top-24">
          {hydrated ? (
            <OrderSummary items={items} deliveryOere={deliveryOere} />
          ) : (
            <div className="rounded-md border border-line p-5 sm:p-6">
              <p className="text-sm text-muted">Henter din kurv...</p>
            </div>
          )}
          <p className="mt-3 text-sm text-muted">
            Vil du ændre noget?{" "}
            <button type="button" onClick={openCart} className="text-rust underline underline-offset-[3px] hover:text-rust-deep">
              Åbn kurven
            </button>
          </p>
        </div>
      </aside>
    </div>
  );
}
