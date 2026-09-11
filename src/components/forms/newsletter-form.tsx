"use client";

import { useActionState, useId } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/field";
import { subscribeNewsletter } from "@/app/actions/newsletter";
import { INITIAL_FORM_STATE, fieldError, formValues, valueOf } from "@/components/forms/form-state";
import { Honeypot } from "@/components/forms/form-status";

/**
 * Compact sign-up rendered in the footer on every page: one email input and
 * a "Tilmeld" button, stacked on small screens. The action adds the address to
 * the Resend audience, or emails Kristine when no audience is configured.
 */
export function NewsletterForm() {
  const [state, formAction, pending] = useActionState(subscribeNewsletter, INITIAL_FORM_STATE);
  const uid = useId();
  const inputId = `${uid}-email`;
  const errorId = `${uid}-error`;

  if (state.ok) {
    return (
      <p role="status" className="text-[0.95rem] text-ink">
        {state.message}
      </p>
    );
  }

  const error = fieldError(state, "email") ?? state.message;

  return (
    <form action={formAction} noValidate className="relative flex flex-col gap-2">
      <div className="flex flex-col gap-3 sm:flex-row">
        <label htmlFor={inputId} className="sr-only">
          Din e-mail
        </label>
        <Input
          id={inputId}
          type="email"
          name="email"
          placeholder="din@mail.dk"
          autoComplete="email"
          required
          defaultValue={valueOf(formValues(state), "email")}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
        />
        <Button type="submit" variant="secondary" className="shrink-0" disabled={pending}>
          {pending ? "Sender..." : "Tilmeld"}
        </Button>
      </div>
      {error ? (
        <p id={errorId} role="alert" className="text-sm text-danger">
          {error}
        </p>
      ) : null}
      <Honeypot />
    </form>
  );
}
