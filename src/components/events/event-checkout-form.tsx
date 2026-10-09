"use client";

import { useActionState, useId, useState } from "react";
import { Field, Input, Textarea } from "@/components/ui/field";
import { startEventCheckout } from "@/app/arrangementer/actions";
import { INITIAL_FORM_STATE, controlAria, fieldError, formValues, valueOf } from "@/components/forms/form-state";
import { FormGroup, FormMessage, Honeypot, SubmitButton, formClass } from "@/components/forms/form-status";
import { formatPrice } from "@/lib/format";

/**
 * The paid sign-up: the same questions as the free form, the running total
 * (price per person times the number of people) and the button that sends
 * the guest on to Stripe Checkout. The server prices it again from the CMS.
 */
export function EventCheckoutForm({
  eventId,
  eventTitle,
  unitOere,
  maxPersons = 50,
}: {
  eventId: string;
  eventTitle: string;
  unitOere: number;
  maxPersons?: number;
}) {
  const [state, formAction, pending] = useActionState(startEventCheckout, INITIAL_FORM_STATE);
  const values = formValues(state);
  const [persons, setPersons] = useState(() => ("persons" in values ? valueOf(values, "persons") : "1"));
  const uid = useId();
  const id = (name: string) => `${uid}-${name}`;
  const err = (name: string) => fieldError(state, name);

  const count = Number.parseInt(persons, 10);
  const valid = Number.isFinite(count) && count >= 1 && count <= maxPersons;
  const total = valid ? formatPrice(unitOere * count) : null;

  return (
    <form action={formAction} noValidate className={formClass} aria-label={`Tilmeld dig ${eventTitle}`}>
      <FormMessage message={state.ok ? undefined : state.message} />
      <input type="hidden" name="eventId" value={eventId} />

      <FormGroup>
        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="Antal personer" htmlFor={id("persons")} required error={err("persons")}>
            <Input
              id={id("persons")}
              name="persons"
              type="number"
              inputMode="numeric"
              min={1}
              max={maxPersons}
              required
              value={persons}
              onChange={(e) => setPersons(e.target.value)}
              className="sm:max-w-40"
              {...controlAria(id("persons"), err("persons"))}
            />
          </Field>
          <Field label="Navn" htmlFor={id("name")} required error={err("name")} className="sm:col-start-1">
            <Input
              id={id("name")}
              name="name"
              autoComplete="name"
              required
              defaultValue={valueOf(values, "name")}
              {...controlAria(id("name"), err("name"))}
            />
          </Field>
          <Field label="Telefon" htmlFor={id("phone")} required error={err("phone")}>
            <Input
              id={id("phone")}
              name="phone"
              type="tel"
              autoComplete="tel"
              required
              defaultValue={valueOf(values, "phone")}
              {...controlAria(id("phone"), err("phone"))}
            />
          </Field>
          <Field label="E-mail" htmlFor={id("email")} required error={err("email")} className="sm:col-span-2">
            <Input
              id={id("email")}
              name="email"
              type="email"
              autoComplete="email"
              required
              defaultValue={valueOf(values, "email")}
              {...controlAria(id("email"), err("email"))}
            />
          </Field>
        </div>
        <Field label="Besked" htmlFor={id("message")} error={err("message")}>
          <Textarea
            id={id("message")}
            name="message"
            defaultValue={valueOf(values, "message")}
            className="min-h-28"
            {...controlAria(id("message"), err("message"))}
          />
        </Field>
      </FormGroup>

      <Honeypot />

      <div className="flex flex-col gap-4 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="tnum text-ink" aria-live="polite">
          {total ? (
            <>
              I alt <span className="font-semibold">{total}</span>
              <span className="text-muted">
                {" "}
                ({count} × {formatPrice(unitOere)})
              </span>
            </>
          ) : (
            <span className="text-muted">{formatPrice(unitOere)} pr. person</span>
          )}
        </p>
        <SubmitButton pending={pending}>Gå til betaling</SubmitButton>
      </div>
    </form>
  );
}
