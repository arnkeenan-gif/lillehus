"use client";

import { useActionState, useState } from "react";
import { Checkbox, Field, Input, Select, Textarea } from "@/components/ui/field";
import { submitPizzaBooking } from "@/app/actions/pizza-booking";
import { INITIAL_FORM_STATE, controlAria, fieldError, formValues, valueOf } from "@/components/forms/form-state";
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
import type { PizzaMenuItem } from "@/lib/forms";

interface Props {
  pizzas: PizzaMenuItem[];
  desserts: string[];
  minAdults: number;
  dessertMinCovers: number;
  childAges: string;
}

const MAX_PIZZAS = 3;

export function PizzaBookingForm({ pizzas, desserts, minAdults, dessertMinCovers, childAges }: Props) {
  const [state, formAction, pending] = useActionState(submitPizzaBooking, INITIAL_FORM_STATE);
  const [selected, setSelected] = useState<string[]>([]);
  const [dessert, setDessert] = useState(DESSERT_NONE);
  const today = useTodayIso();

  if (state.ok) {
    return <FormSuccess title="Forespørgslen er sendt" message={state.message} />;
  }

  const values = formValues(state);
  const err = (name: string) => fieldError(state, name);
  const full = selected.length >= MAX_PIZZAS;

  const adultsHelper = `Vi bager normalt for mindst ${minAdults} voksne. Er I færre, så spørg alligevel, og skriv det i beskeden.`;
  const dietHelper = "Hvor mange kuverter skal være veganske eller glutenfri? Lad stå tomt, hvis ingen.";
  const coversHelper = `Dessert er fra ${dessertMinCovers} kuverter.`;
  const messageHelper = "Traileren med ovnen er tung, så beskriv gerne pladsen og vejen dertil.";
  const pizzaHelper = full
    ? "Tre valgt. Fjern en, hvis du vil vælge en anden."
    : `${selected.length} af ${MAX_PIZZAS} valgt. Der er altid mindst en vegetarisk.`;

  function togglePizza(name: string, checked: boolean) {
    setSelected((prev) => {
      if (checked) return prev.includes(name) ? prev : [...prev, name];
      return prev.filter((p) => p !== name);
    });
  }

  return (
    <form action={formAction} noValidate className={formClass}>
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
          <Field label="Ønsket spisetid" htmlFor="pizza-time" required error={err("time")}>
            <Input
              id="pizza-time"
              name="time"
              type="time"
              required
              defaultValue={valueOf(values, "time")}
              {...controlAria("pizza-time", err("time"))}
            />
          </Field>
          <Field label="Hvilken slags arrangement?" htmlFor="pizza-eventType" required error={err("eventType")}>
            <Select
              id="pizza-eventType"
              name="eventType"
              required
              defaultValue={valueOf(values, "eventType")}
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
          <div className="grid gap-6 sm:grid-cols-2">
            <Field label="Antal voksne" htmlFor="pizza-adults" required helper={adultsHelper} error={err("adults")}>
              <Input
                id="pizza-adults"
                name="adults"
                type="number"
                inputMode="numeric"
                min={1}
                required
                defaultValue={valueOf(values, "adults")}
                {...controlAria("pizza-adults", err("adults"), adultsHelper)}
              />
            </Field>
            <Field label={`Antal børn, ${childAges}`} htmlFor="pizza-children" error={err("children")}>
              <Input
                id="pizza-children"
                name="children"
                type="number"
                inputMode="numeric"
                min={0}
                defaultValue={valueOf(values, "children")}
                {...controlAria("pizza-children", err("children"))}
              />
            </Field>
          </div>
        </div>
      </FormGroup>

      <FormGroup legend="Hvor skal vi hen?">
        <div className="grid gap-6 sm:grid-cols-3">
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
          <Field label="Postnummer" htmlFor="pizza-postalCode" required error={err("postalCode")}>
            <Input
              id="pizza-postalCode"
              name="postalCode"
              inputMode="numeric"
              autoComplete="postal-code"
              required
              defaultValue={valueOf(values, "postalCode")}
              {...controlAria("pizza-postalCode", err("postalCode"))}
            />
          </Field>
          <Field label="By" htmlFor="pizza-city" required error={err("city")} className="sm:col-span-2">
            <Input
              id="pizza-city"
              name="city"
              autoComplete="address-level2"
              required
              defaultValue={valueOf(values, "city")}
              {...controlAria("pizza-city", err("city"))}
            />
          </Field>
        </div>
      </FormGroup>

      <FormGroup legend="Hvad skal I spise?">
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
                checked={checked}
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

        <div className="grid gap-6 sm:grid-cols-2">
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
              defaultValue={valueOf(values, "specialDiet")}
              {...controlAria("pizza-specialDiet", err("specialDiet"), dietHelper)}
            />
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
              className="sm:col-start-2"
            >
              <Input
                id="pizza-dessertCovers"
                name="dessertCovers"
                type="number"
                inputMode="numeric"
                min={dessertMinCovers}
                required
                defaultValue={valueOf(values, "dessertCovers")}
                {...controlAria("pizza-dessertCovers", err("dessertCovers"), coversHelper)}
              />
            </Field>
          ) : null}
        </div>
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
          <Field label="E-mail" htmlFor="pizza-email" required error={err("email")}>
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
          <Field label="Hvordan hørte du om os?" htmlFor="pizza-source" required error={err("source")}>
            <Select
              id="pizza-source"
              name="source"
              required
              defaultValue={valueOf(values, "source")}
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
        </div>
      </FormGroup>

      <FormGroup>
        <Field
          label="Hvor kan vognen stå, og hvad skal vi ellers vide?"
          htmlFor="pizza-message"
          required
          helper={messageHelper}
          error={err("message")}
        >
          <Textarea
            id="pizza-message"
            name="message"
            required
            defaultValue={valueOf(values, "message")}
            {...controlAria("pizza-message", err("message"), messageHelper)}
          />
        </Field>
      </FormGroup>

      <Honeypot />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <SubmitButton pending={pending}>Book pizzavognen</SubmitButton>
        <p className="text-sm text-muted">Du betaler ikke noget, før Kristine har bekræftet.</p>
      </div>
    </form>
  );
}
