"use client";

import { useActionState, useId } from "react";
import { Field, Input, Textarea } from "@/components/ui/field";
import { submitEventSignup } from "@/app/actions/event-signup";
import { INITIAL_FORM_STATE, controlAria, fieldError, formValues, valueOf } from "@/components/forms/form-state";
import { FormGroup, FormMessage, FormSuccess, Honeypot, SubmitButton, formClass } from "@/components/forms/form-status";

/**
 * The free sign-up for one event: number of people, name, e-mail, phone and
 * a message. Kristine gets it by mail and the guest a copy. Several of these
 * can sit on one page, so ids come from useId.
 */
export function EventSignupForm({
  eventId,
  eventTitle,
  maxPersons = 50,
}: {
  eventId: string;
  eventTitle: string;
  /** The most people one sign-up may cover: the event's capacity, at most 50. */
  maxPersons?: number;
}) {
  const [state, formAction, pending] = useActionState(submitEventSignup, INITIAL_FORM_STATE);
  const uid = useId();
  const id = (name: string) => `${uid}-${name}`;

  if (state.ok) {
    return <FormSuccess title="Tilmeldingen er sendt" message={state.message} />;
  }

  const values = formValues(state);
  const err = (name: string) => fieldError(state, name);

  return (
    <form action={formAction} noValidate className={formClass} aria-label={`Tilmeld dig ${eventTitle}`}>
      <FormMessage message={state.message} />
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
              defaultValue={"persons" in values ? valueOf(values, "persons") : "1"}
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

      <div>
        <SubmitButton pending={pending}>Tilmeld dig</SubmitButton>
      </div>
    </form>
  );
}
