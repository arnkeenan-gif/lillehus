"use client";

import { useActionState, useId } from "react";
import { Field, Input } from "@/components/ui/field";
import { submitEventSignup } from "@/app/actions/event-signup";
import { INITIAL_FORM_STATE, controlAria, fieldError, formValues, valueOf } from "@/components/forms/form-state";
import { FormMessage, FormSuccess, Honeypot, SubmitButton } from "@/components/forms/form-status";

/** Several of these can sit on one page, so ids come from useId. */
export function EventSignupForm({ eventId, eventTitle }: { eventId: string; eventTitle: string }) {
  const [state, formAction, pending] = useActionState(submitEventSignup, INITIAL_FORM_STATE);
  const uid = useId();
  const id = (name: string) => `${uid}-${name}`;

  if (state.ok) {
    return <FormSuccess title="Tilmeldingen er sendt" message={state.message} />;
  }

  const values = formValues(state);
  const err = (name: string) => fieldError(state, name);

  return (
    <form action={formAction} noValidate className="relative flex flex-col gap-6" aria-label={`Tilmeld dig ${eventTitle}`}>
      <FormMessage message={state.message} />
      <input type="hidden" name="eventId" value={eventId} />

      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="Antal personer" htmlFor={id("persons")} required error={err("persons")}>
          <Input
            id={id("persons")}
            name="persons"
            type="number"
            inputMode="numeric"
            min={1}
            required
            defaultValue={valueOf(values, "persons") || "1"}
            {...controlAria(id("persons"), err("persons"))}
          />
        </Field>
        <Field label="Navn" htmlFor={id("name")} required error={err("name")}>
          <Input
            id={id("name")}
            name="name"
            autoComplete="name"
            required
            defaultValue={valueOf(values, "name")}
            {...controlAria(id("name"), err("name"))}
          />
        </Field>
        <Field label="E-mail" htmlFor={id("email")} required error={err("email")}>
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
      </div>

      <Honeypot />

      <div>
        <SubmitButton pending={pending}>Tilmeld dig</SubmitButton>
      </div>
    </form>
  );
}
