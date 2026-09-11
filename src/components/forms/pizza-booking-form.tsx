"use client";

import { useActionState, useRef, useState, type ChangeEvent } from "react";
import { Plus } from "@phosphor-icons/react";
import { Checkbox, Field, Input, Select, Textarea } from "@/components/ui/field";
import { submitPizzaBooking } from "@/app/actions/pizza-booking";
import { INITIAL_FORM_STATE, controlAria, fieldError, formValues, listOf, valueOf } from "@/components/forms/form-state";
import { DESSERT_NONE, PIZZA_EVENT_TYPES, SOURCES } from "@/components/forms/options";
import {
  Fieldset,
  FormGroup,
  FormMessage,
  FormSuccess,
  Honeypot,
  SubmitButton,
  formClass,
  useTodayIso,
} from "@/components/forms/form-status";
import { PizzaEstimateCard } from "@/components/forms/pizza-estimate-card";
import { PizzaStickyBar } from "@/components/forms/pizza-sticky-bar";
import { estimatePizza, mileageLine, ratesLine, toCount, type PizzaRates } from "@/components/forms/pizza-estimate";
import { formatPrice } from "@/lib/format";
import type { PizzaMenuItem } from "@/lib/forms";

interface Props {
  pizzas: PizzaMenuItem[];
  desserts: string[];
  minAdults: number;
  dessertMinCovers: number;
  childAges: string;
  /** Per-cover prices from the pizza settings, for the running estimate. */
  rates: PizzaRates;
  /** "Sådan går det videre" from the Studio, shown under the estimate when Kristine has written any. */
  steps?: string[];
  /** The id of the form section, for the phone bar's link. */
  anchor?: string;
}

const MAX_PIZZAS = 3;

/** The fields folded away under "Flere ønsker": the group opens itself when any of them has a value or an error. */
const FOLDED_FIELDS = ["time", "eventType", "specialDiet", "dessert", "dessertCovers", "source", "message"] as const;

type Counts = { adults: string; children: string; specialDiet: string; dessertCovers: string };

/**
 * The booking form, built for speed: the nine things Kristine needs are up
 * front, everything else is folded away, and the price is estimated as the
 * visitor types (in the card beside the form from lg, in the card above the
 * button and in the bar along the bottom on phones).
 */
export function PizzaBookingForm({
  pizzas,
  desserts,
  minAdults,
  dessertMinCovers,
  childAges,
  rates,
  steps = [],
  anchor = "book",
}: Props) {
  const [state, formAction, pending] = useActionState(submitPizzaBooking, INITIAL_FORM_STATE);
  const [selected, setSelected] = useState<string[]>([]);
  /* The selects are controlled: React applies a select's defaultValue only at
     mount, so an uncontrolled one would come back empty after a failed submit. */
  const [dessert, setDessert] = useState(DESSERT_NONE);
  const [eventType, setEventType] = useState("");
  const [source, setSource] = useState("");
  /* Controlled, so the numbers survive the reset React does after the action and feed the estimate. */
  const [counts, setCounts] = useState<Counts>({ adults: "", children: "", specialDiet: "", dessertCovers: "" });
  const today = useTodayIso();
  const blockRef = useRef<HTMLDivElement>(null);

  if (state.ok) {
    return <FormSuccess title="Tak, vi har fået din forespørgsel." message={state.message} />;
  }

  const values = formValues(state);
  const err = (name: string) => fieldError(state, name);
  const full = selected.length >= MAX_PIZZAS;
  /* The boxes are uncontrolled: React resets the form after the action, and an
     uncontrolled box then follows its (echoed) default, where a controlled one
     would come back empty. `selected` only drives the helper and the max-3 lock. */
  const echoedPizzas = listOf(values, "pizzas");

  const estimate = estimatePizza(rates, {
    adults: toCount(counts.adults),
    children: toCount(counts.children),
    specialDiet: toCount(counts.specialDiet),
    dessertCovers: dessert === DESSERT_NONE ? 0 : toCount(counts.dessertCovers),
  });
  const barLines: [string, string] =
    estimate.totalOere > 0
      ? [`Cirka ${formatPrice(estimate.totalOere)}`, mileageLine(rates)]
      : [ratesLine(rates), mileageLine(rates)];

  const moreOpen = FOLDED_FIELDS.some((name) => {
    if (err(name)) return true;
    const value = valueOf(values, name);
    return name === "dessert" ? value !== "" && value !== DESSERT_NONE : value !== "";
  });

  const adultsHelper = `Minimum ${minAdults} voksne. Er I færre, så spørg alligevel.`;
  const dietHelper = `Hvor mange kuverter skal være veganske eller glutenfri? Tillæg ${formatPrice(rates.specialDietExtraOere)} pr. kuvert.`;
  const coversHelper = `Dessert er fra ${dessertMinCovers} kuverter, ${formatPrice(rates.dessertOere)} pr. kuvert.`;
  const messageHelper = "Traileren med pizzavognen er tung, så pladsen skal kunne køres til.";
  const pizzaHelper = full
    ? "Tre valgt. Fjern en, hvis du vil vælge en anden."
    : `${selected.length} af ${MAX_PIZZAS} valgt. Der er altid mindst en vegetarisk.`;

  function togglePizza(name: string, checked: boolean) {
    setSelected((prev) => {
      if (checked) return prev.includes(name) ? prev : [...prev, name];
      return prev.filter((p) => p !== name);
    });
  }

  const setCount = (key: keyof Counts) => (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.currentTarget.value;
    setCounts((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <>
      <div ref={blockRef} className="grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-7">
          {/* React resets the form after the action, which throws the selects back to their first option
              while the state still holds the choice. Nothing should be reset here: on failure every value
              stays, on success the form is replaced. */}
          <form action={formAction} noValidate className={formClass} onReset={(e) => e.preventDefault()}>
            <FormMessage message={state.message} />

            <FormGroup legend="Hvornår, og hvor mange er I?">
              <div className="grid gap-6 sm:grid-cols-2">
                <Field label="Dato for arrangementet" htmlFor="pizza-date" required error={err("date")}>
                  <Input
                    id="pizza-date"
                    name="date"
                    type="date"
                    required
                    min={today}
                    defaultValue={valueOf(values, "date")}
                    {...controlAria("pizza-date", err("date"))}
                  />
                </Field>
                <div className="grid grid-cols-2 gap-6">
                  <Field label="Antal voksne" htmlFor="pizza-adults" required helper={adultsHelper} error={err("adults")}>
                    <Input
                      id="pizza-adults"
                      name="adults"
                      type="number"
                      inputMode="numeric"
                      min={1}
                      required
                      value={counts.adults}
                      onChange={setCount("adults")}
                      {...controlAria("pizza-adults", err("adults"), adultsHelper)}
                    />
                  </Field>
                  <Field label={`Børn, ${childAges}`} htmlFor="pizza-children" error={err("children")}>
                    <Input
                      id="pizza-children"
                      name="children"
                      type="number"
                      inputMode="numeric"
                      min={0}
                      value={counts.children}
                      onChange={setCount("children")}
                      {...controlAria("pizza-children", err("children"))}
                    />
                  </Field>
                </div>
              </div>
            </FormGroup>

            <FormGroup legend="Hvor skal vi hen?">
              <div className="grid gap-6 sm:grid-cols-5">
                <Field label="Adresse for arrangementet" htmlFor="pizza-street" required error={err("street")} className="sm:col-span-3">
                  <Input
                    id="pizza-street"
                    name="street"
                    autoComplete="street-address"
                    required
                    defaultValue={valueOf(values, "street")}
                    {...controlAria("pizza-street", err("street"))}
                  />
                </Field>
                <Field label="Postnummer og by" htmlFor="pizza-postalCity" required error={err("postalCity")} className="sm:col-span-2">
                  <Input
                    id="pizza-postalCity"
                    name="postalCity"
                    required
                    defaultValue={valueOf(values, "postalCity")}
                    {...controlAria("pizza-postalCity", err("postalCity"))}
                  />
                </Field>
              </div>
            </FormGroup>

            <FormGroup>
              <Fieldset id="pizza-pizzas" legend="Vælg tre pizzaer" required helper={pizzaHelper} error={err("pizzas")}>
                {pizzas.map((pizza, i) => {
                  const checked = selected.includes(pizza.name);
                  const blocked = !checked && full;
                  return (
                    <Checkbox
                      key={pizza.name}
                      id={`pizza-p${i}`}
                      name="pizzas"
                      value={pizza.name}
                      defaultChecked={echoedPizzas.includes(pizza.name)}
                      disabled={blocked}
                      onChange={(e) => togglePizza(pizza.name, e.currentTarget.checked)}
                      className={blocked ? "opacity-50" : undefined}
                      label={
                        <>
                          {pizza.name}
                          {pizza.vegetarian ? <span className="text-muted"> (vegetarisk)</span> : null}
                        </>
                      }
                    />
                  );
                })}
              </Fieldset>
            </FormGroup>

            <FormGroup legend="Hvem skal vi kontakte?">
              <div className="grid gap-6 sm:grid-cols-2">
                <Field label="Navn" htmlFor="pizza-name" required error={err("name")}>
                  <Input
                    id="pizza-name"
                    name="name"
                    autoComplete="name"
                    required
                    defaultValue={valueOf(values, "name")}
                    {...controlAria("pizza-name", err("name"))}
                  />
                </Field>
                <Field label="Telefon" htmlFor="pizza-phone" required error={err("phone")}>
                  <Input
                    id="pizza-phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    required
                    defaultValue={valueOf(values, "phone")}
                    {...controlAria("pizza-phone", err("phone"))}
                  />
                </Field>
                <Field label="E-mail" htmlFor="pizza-email" required error={err("email")} className="sm:col-span-2">
                  <Input
                    id="pizza-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    defaultValue={valueOf(values, "email")}
                    {...controlAria("pizza-email", err("email"))}
                  />
                </Field>
              </div>
            </FormGroup>

            <FormGroup>
              <details open={moreOpen || undefined} className="group">
                <summary className="flex cursor-pointer list-none items-center gap-3 py-1 font-semibold text-ink [&::-webkit-details-marker]:hidden">
                  <Plus
                    size={20}
                    aria-hidden="true"
                    className="shrink-0 text-muted transition-transform duration-150 ease-out-quart group-open:rotate-45"
                  />
                  Flere ønsker (valgfrit)
                </summary>
                <div className="mt-6 flex flex-col gap-6">
                  <div className="grid gap-6 sm:grid-cols-2">
                    <Field label="Ønsket spisetid" htmlFor="pizza-time" error={err("time")}>
                      <Input
                        id="pizza-time"
                        name="time"
                        type="time"
                        defaultValue={valueOf(values, "time")}
                        {...controlAria("pizza-time", err("time"))}
                      />
                    </Field>
                    <Field label="Hvilken slags arrangement?" htmlFor="pizza-eventType" error={err("eventType")}>
                      <Select
                        id="pizza-eventType"
                        name="eventType"
                        value={eventType}
                        onChange={(e) => setEventType(e.currentTarget.value)}
                        {...controlAria("pizza-eventType", err("eventType"))}
                      >
                        <option value="">Vælg</option>
                        {PIZZA_EVENT_TYPES.map((o) => (
                          <option key={o.value} value={o.value}>
                            {o.label}
                          </option>
                        ))}
                      </Select>
                    </Field>
                    <Field
                      label="Veganske eller glutenfri kuverter"
                      htmlFor="pizza-specialDiet"
                      helper={dietHelper}
                      error={err("specialDiet")}
                    >
                      <Input
                        id="pizza-specialDiet"
                        name="specialDiet"
                        type="number"
                        inputMode="numeric"
                        min={0}
                        value={counts.specialDiet}
                        onChange={setCount("specialDiet")}
                        {...controlAria("pizza-specialDiet", err("specialDiet"), dietHelper)}
                      />
                    </Field>
                    <Field label="Hvordan hørte du om os?" htmlFor="pizza-source" error={err("source")}>
                      <Select
                        id="pizza-source"
                        name="source"
                        value={source}
                        onChange={(e) => setSource(e.currentTarget.value)}
                        {...controlAria("pizza-source", err("source"))}
                      >
                        <option value="">Vælg</option>
                        {SOURCES.map((o) => (
                          <option key={o.value} value={o.value}>
                            {o.label}
                          </option>
                        ))}
                      </Select>
                    </Field>
                    <Field label="Dessert" htmlFor="pizza-dessert" error={err("dessert")}>
                      <Select
                        id="pizza-dessert"
                        name="dessert"
                        value={dessert}
                        onChange={(e) => setDessert(e.currentTarget.value)}
                        {...controlAria("pizza-dessert", err("dessert"))}
                      >
                        <option value={DESSERT_NONE}>Ingen dessert</option>
                        {desserts.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </Select>
                    </Field>
                    {dessert !== DESSERT_NONE ? (
                      <Field
                        label="Antal kuverter med dessert"
                        htmlFor="pizza-dessertCovers"
                        required
                        helper={coversHelper}
                        error={err("dessertCovers")}
                      >
                        <Input
                          id="pizza-dessertCovers"
                          name="dessertCovers"
                          type="number"
                          inputMode="numeric"
                          min={dessertMinCovers}
                          required
                          value={counts.dessertCovers}
                          onChange={setCount("dessertCovers")}
                          {...controlAria("pizza-dessertCovers", err("dessertCovers"), coversHelper)}
                        />
                      </Field>
                    ) : null}
                  </div>
                  <Field
                    label="Hvor kan vognen stå, og hvad skal vi ellers vide?"
                    htmlFor="pizza-message"
                    helper={messageHelper}
                    error={err("message")}
                  >
                    <Textarea
                      id="pizza-message"
                      name="message"
                      defaultValue={valueOf(values, "message")}
                      {...controlAria("pizza-message", err("message"), messageHelper)}
                    />
                  </Field>
                </div>
              </details>
            </FormGroup>

            <Honeypot />

            <PizzaEstimateCard estimate={estimate} rates={rates} className="lg:hidden" />

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <SubmitButton pending={pending}>Book pizzavognen</SubmitButton>
              <p className="text-sm text-muted">Du betaler ikke noget, før Kristine har bekræftet.</p>
            </div>
          </form>
        </div>

        <aside className="hidden lg:col-span-5 lg:col-start-8 lg:block xl:col-span-4 xl:col-start-9">
          <div className="lg:sticky lg:top-24">
            <PizzaEstimateCard estimate={estimate} rates={rates} />
            {steps.length > 0 ? (
              <div className="mt-8">
                <p className="font-semibold text-ink">Sådan går det videre</p>
                <ol className="mt-4 list-decimal space-y-3 pl-5 text-[0.95rem] text-ink-2 marker:text-muted">
                  {steps.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
              </div>
            ) : null}
          </div>
        </aside>
      </div>

      <PizzaStickyBar target={blockRef} href={`#${anchor}`} lines={barLines} />
    </>
  );
}
