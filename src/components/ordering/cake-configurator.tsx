"use client";

import { useActionState, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox, Field, Input, Select, Textarea } from "@/components/ui/field";
import { Fieldset, FormMessage, FormSuccess, Honeypot, Radio } from "@/components/forms/form-status";
import { INITIAL_FORM_STATE, controlAria, fieldError } from "@/components/forms/form-state";
import { QuantityStepper } from "@/components/shop/quantity-stepper";
import { submitCakeOrderRequest } from "@/app/actions/cake-request";
import {
  addToCart,
  getCartState,
  lineKey,
  openCart,
  removeManyFromCart,
  setCartPickup,
  useCart,
  useCartPickup,
  type CartLine,
} from "@/lib/cart";
import { expiredLines, resolvePickup, type ClientLocation } from "@/lib/cart-pickup";
import type { CakeOptionGroup, DeadlineRule } from "@/lib/cms/ordering-types";
import { formatPrice } from "@/lib/format";
import { defaultSelections, evaluateCake, selectionsKey, type CakeSelections } from "@/lib/ordering/cake-options";
import { copenhagenDate, formatDayDate } from "@/lib/ordering/dates";
import { isBeforeDeadline } from "@/lib/ordering/deadline";
import { PickupChooser, type PickupDraft } from "./pickup-chooser";
import { currentTime, useNow } from "./use-now";

/*
  The order part of a cake's page, in the order Emma's page has it: the
  price (live: base price plus the chosen options), the options (dropdown,
  radio buttons, add-ons, a text field), where and when to pick up (with
  the cake's own deadline), how many, and "Læg i kurv". A cake with base
  price 0 says "Pris aftales" and sends a request with the same choices
  instead; Kristine answers with the price.
*/

export interface ConfigurableCake {
  id: string;
  name: string;
  basePriceOere: number;
  optionGroups: CakeOptionGroup[];
  minQuantity: number;
  maxQuantity: number;
  image?: string;
  imagePosition?: string;
}

type Props = {
  cake: ConfigurableCake;
  rule: DeadlineRule;
  locations: ClientLocation[];
  renderedAt: number;
  /** "cart" when the cake has a price, "request" for "Pris aftales". */
  mode: "cart" | "request";
};

function joinNames(names: string[]): string {
  if (names.length <= 1) return names.join("");
  return `${names.slice(0, -1).join(", ")} og ${names[names.length - 1]}`;
}

function startDraft(locations: ClientLocation[], cartPickup: PickupDraft | null): PickupDraft | null {
  if (cartPickup && locations.some((l) => l.id === cartPickup.locationId)) return cartPickup;
  return locations.length === 1 ? { locationId: locations[0].id, date: null } : null;
}

export function CakeConfigurator({ cake, rule, locations, renderedAt, mode }: Props) {
  const now = useNow(renderedAt);
  const stored = useCartPickup();
  const items = useCart();
  const [selections, setSelections] = useState<CakeSelections>(() => defaultSelections(cake.optionGroups));
  const [qty, setQty] = useState(cake.minQuantity);
  const [draft, setDraft] = useState<PickupDraft | null>(null);
  const [touched, setTouched] = useState(false);
  const [added, setAdded] = useState(false);

  const [state, formAction, pending] = useActionState(submitCakeOrderRequest, INITIAL_FORM_STATE);
  const [contact, setContact] = useState({ name: "", email: "", phone: "", message: "" });

  // Until the customer picks something here, follow the cart's pickup when it suits this cake.
  const today = copenhagenDate(now);
  const cartPickup = useMemo(() => {
    const resolved = resolvePickup(stored, locations, today);
    return resolved && isBeforeDeadline(resolved.date.date, rule, now) ? { locationId: resolved.location.id, date: resolved.date.date } : null;
  }, [stored, locations, today, rule, now]);
  const pickup = draft ?? startDraft(locations, cartPickup);

  const evaluation = evaluateCake(cake, selections);
  const date = pickup?.date ?? null;
  const dateOk = Boolean(date && isBeforeDeadline(date, rule, now));
  const pickupError = !pickup ? "Vælg et afhentningssted og en dato." : !date ? "Vælg en dato." : !dateOk ? "Fristen for den dato er gået. Vælg en senere dato." : undefined;
  const optionErrors = evaluation.errors;
  const showErrors = touched;
  const serverError = (name: string) => fieldError(state, name);

  // The order moves to this cake's date when it goes in the cart; say so first.
  const moving = mode === "cart" && items.length > 0 && stored && date && (stored.date !== date || stored.locationId !== pickup?.locationId);
  const leaving = moving && date ? expiredLines(items, date, now) : [];

  function setChoice(group: CakeOptionGroup, value: string | string[]) {
    setSelections((prev) => {
      const next = { ...prev };
      if ((Array.isArray(value) && value.length === 0) || value === "") delete next[group.id];
      else next[group.id] = value;
      return next;
    });
  }

  function addCake() {
    setTouched(true);
    if (Object.keys(optionErrors).length > 0 || pickupError || !pickup || !date) return;
    const time = currentTime();
    const { items: current } = getCartState();
    const gone = expiredLines(current, date, time).map((l) => l.key);
    if (gone.length > 0) removeManyFromCart(gone);
    setCartPickup({ locationId: pickup.locationId, date });
    const line: Omit<CartLine, "qty"> = {
      key: lineKey("cake", cake.id, selectionsKey(evaluation.clean)),
      kind: "cake",
      productId: cake.id,
      name: cake.name,
      priceOere: evaluation.unitOere,
      image: cake.image,
      imagePosition: cake.imagePosition,
      options: evaluation.lines,
      selections: evaluation.clean,
      rule,
      minQty: cake.minQuantity,
      maxQty: cake.maxQuantity,
      href: `/kager/${cake.id}`,
    };
    addToCart(line, qty);
    setAdded(true);
    openCart();
  }

  if (mode === "request" && state.ok) {
    return <FormSuccess title="Forespørgslen er sendt" message={state.message} />;
  }

  const priceLine =
    mode === "request" ? (
      <p className="text-lead text-ink">Pris aftales</p>
    ) : (
      <p className="tnum text-lead font-medium text-ink">
        {formatPrice(evaluation.unitOere)}
        {qty > 1 ? <span className="ml-2 text-base font-normal text-ink-2">I alt {formatPrice(evaluation.unitOere * qty)}</span> : null}
      </p>
    );

  const options = cake.optionGroups.map((group) => {
    const id = `valg-${group.id}`;
    const error = (showErrors ? optionErrors[group.id] : undefined) ?? serverError(`option:${group.id}`);
    const priceSuffix = (price: number) => (mode === "cart" && price > 0 ? ` (+ ${formatPrice(price)})` : "");
    const value = selections[group.id];

    if (group.type === "text") {
      return (
        <Field key={group.id} label={group.title} htmlFor={id} required={group.required} helper={group.helper} error={error}>
          <Input
            id={id}
            maxLength={200}
            value={typeof value === "string" ? value : ""}
            onChange={(e) => setChoice(group, e.target.value)}
            {...controlAria(id, error, group.helper)}
          />
        </Field>
      );
    }
    if (group.type === "dropdown") {
      return (
        <Field key={group.id} label={group.title} htmlFor={id} required={group.required} helper={group.helper} error={error}>
          <Select
            id={id}
            value={typeof value === "string" ? value : ""}
            onChange={(e) => setChoice(group, e.target.value)}
            {...controlAria(id, error, group.helper)}
          >
            <option value="">Vælg</option>
            {group.choices.map((choice) => (
              <option key={choice.id} value={choice.id}>
                {choice.label}
                {priceSuffix(choice.priceOere)}
              </option>
            ))}
          </Select>
        </Field>
      );
    }
    if (group.type === "radio") {
      return (
        <Fieldset key={group.id} id={id} legend={group.title} required={group.required} helper={group.helper} error={error}>
          {group.choices.map((choice) => (
            <Radio
              key={choice.id}
              id={`${id}-${choice.id}`}
              name={id}
              value={choice.id}
              checked={value === choice.id}
              onChange={() => setChoice(group, choice.id)}
              label={`${choice.label}${priceSuffix(choice.priceOere)}`}
            />
          ))}
        </Fieldset>
      );
    }
    const chosen = Array.isArray(value) ? value : [];
    return (
      <Fieldset key={group.id} id={id} legend={group.title} required={group.required} helper={group.helper} error={error}>
        {group.choices.map((choice) => (
          <Checkbox
            key={choice.id}
            id={`${id}-${choice.id}`}
            checked={chosen.includes(choice.id)}
            onChange={(e) =>
              setChoice(group, e.target.checked ? [...chosen, choice.id] : chosen.filter((c) => c !== choice.id))
            }
            label={`${choice.label}${priceSuffix(choice.priceOere)}`}
          />
        ))}
      </Fieldset>
    );
  });

  const pickupBlock = (
    <PickupChooser
      locations={locations}
      rules={[rule]}
      general={rule}
      now={now}
      value={pickup}
      onChange={(next) => setDraft(next)}
      idPrefix={`kage-${cake.id}`}
      locationLegend="Afhentningssted"
      dateLegend="Afhentningsdato"
      error={(showErrors && pickup ? pickupError : undefined) ?? serverError("pickup")}
    />
  );

  const quantityBlock = (
    <div className="flex flex-col gap-2">
      <span id={`antal-${cake.id}`} className="text-sm font-medium text-ink">
        Antal
      </span>
      <QuantityStepper value={qty} onChange={setQty} label={cake.name} min={cake.minQuantity} max={cake.maxQuantity} className="self-start" />
      {serverError("quantity") ? (
        <p role="alert" className="text-sm text-danger">
          {serverError("quantity")}
        </p>
      ) : null}
    </div>
  );

  if (mode === "cart") {
    return (
      <div className="flex flex-col gap-8">
        {priceLine}
        {options.length > 0 ? <div className="flex flex-col gap-6">{options}</div> : null}
        {pickupBlock}
        {quantityBlock}
        {moving && stored ? (
          <p className="rounded-md bg-rust-tint px-4 py-3 text-[0.95rem] text-ink">
            Din kurv er sat til {formatDayDate(stored.date)}. Lægger du kagen i kurven, flyttes hele bestillingen til{" "}
            {formatDayDate(date as string)}.
            {leaving.length > 0 ? ` ${joinNames(leaving.map((l) => l.name))} kan ikke nås til den dato og bliver taget ud af kurven.` : ""}
          </p>
        ) : null}
        {showErrors && !pickup ? (
          <p role="alert" className="text-sm text-danger">
            {pickupError}
          </p>
        ) : null}
        <div>
          <Button type="button" size="lg" onClick={addCake} className="w-full sm:w-auto sm:min-w-56">
            {added ? "Lagt i kurven" : "Læg i kurv"}
          </Button>
          <span className="sr-only" role="status">
            {added ? `${cake.name} er lagt i kurven` : ""}
          </span>
        </div>
      </div>
    );
  }

  return (
    <form
      action={formAction}
      noValidate
      onSubmit={(e) => {
        setTouched(true);
        if (Object.keys(optionErrors).length > 0 || pickupError) e.preventDefault();
      }}
      className="flex flex-col gap-8"
    >
      {priceLine}
      <FormMessage message={state.ok ? undefined : state.message} />
      {options.length > 0 ? <div className="flex flex-col gap-6">{options}</div> : null}
      {pickupBlock}
      {quantityBlock}
      {showErrors && !pickup ? (
        <p role="alert" className="text-sm text-danger">
          {pickupError}
        </p>
      ) : null}

      <input type="hidden" name="cakeId" value={cake.id} />
      <input type="hidden" name="selections" value={JSON.stringify(evaluation.clean)} />
      <input type="hidden" name="quantity" value={qty} />
      <input type="hidden" name="locationId" value={pickup?.locationId ?? ""} />
      <input type="hidden" name="date" value={date ?? ""} />

      <fieldset className="flex min-w-0 flex-col gap-6 border-t border-line pt-8">
        <legend className="float-left w-full font-semibold text-ink">Hvem skal vi kontakte?</legend>
        <div className="clear-left grid gap-6 sm:grid-cols-2">
          <Field label="Navn" htmlFor="kage-navn" required error={serverError("name")}>
            <Input
              id="kage-navn"
              name="name"
              autoComplete="name"
              required
              value={contact.name}
              onChange={(e) => setContact({ ...contact, name: e.target.value })}
              {...controlAria("kage-navn", serverError("name"))}
            />
          </Field>
          <Field label="Telefon" htmlFor="kage-telefon" required error={serverError("phone")}>
            <Input
              id="kage-telefon"
              name="phone"
              type="tel"
              autoComplete="tel"
              required
              value={contact.phone}
              onChange={(e) => setContact({ ...contact, phone: e.target.value })}
              {...controlAria("kage-telefon", serverError("phone"))}
            />
          </Field>
        </div>
        <Field label="E-mail" htmlFor="kage-email" required error={serverError("email")}>
          <Input
            id="kage-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={contact.email}
            onChange={(e) => setContact({ ...contact, email: e.target.value })}
            {...controlAria("kage-email", serverError("email"))}
          />
        </Field>
        <Field label="Besked" htmlFor="kage-besked" error={serverError("message")}>
          <Textarea
            id="kage-besked"
            name="message"
            rows={3}
            value={contact.message}
            onChange={(e) => setContact({ ...contact, message: e.target.value })}
            {...controlAria("kage-besked", serverError("message"))}
          />
        </Field>
      </fieldset>

      <Honeypot />

      <div className="flex flex-col gap-3">
        <Button type="submit" size="lg" disabled={pending} className="w-full sm:w-auto sm:min-w-56">
          {pending ? "Sender..." : "Forespørg på kage"}
        </Button>
        <p className="text-sm text-muted">Kristine bekræfter pris og dato, før noget er aftalt.</p>
      </div>
    </form>
  );
}
