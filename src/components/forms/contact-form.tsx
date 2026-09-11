"use client";

import { useActionState } from "react";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { submitContact } from "@/app/actions/contact";
import { INITIAL_FORM_STATE, controlAria, fieldError, formValues, valueOf } from "@/components/forms/form-state";
import { CONTACT_SUBJECTS } from "@/components/forms/options";
import { FormGroup, FormMessage, FormSuccess, Honeypot, SubmitButton, formClass } from "@/components/forms/form-status";

export function ContactForm({ defaultSubject }: { defaultSubject?: string }) {
  const [state, formAction, pending] = useActionState(submitContact, INITIAL_FORM_STATE);

  if (state.ok) {
    return <FormSuccess title="Beskeden er sendt" message={state.message} />;
  }

  const values = formValues(state);
  const err = (name: string) => fieldError(state, name);

  return (
    <form action={formAction} noValidate className={formClass}>
      <FormMessage message={state.message} />

      <FormGroup>
        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="Navn" htmlFor="kontakt-name" required error={err("name")}>
            <Input
              id="kontakt-name"
              name="name"
              autoComplete="name"
              required
              defaultValue={valueOf(values, "name")}
              {...controlAria("kontakt-name", err("name"))}
            />
          </Field>
          <Field label="E-mail" htmlFor="kontakt-email" required error={err("email")}>
            <Input
              id="kontakt-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              defaultValue={valueOf(values, "email")}
              {...controlAria("kontakt-email", err("email"))}
            />
          </Field>
          <Field label="Telefon" htmlFor="kontakt-phone" error={err("phone")}>
            <Input
              id="kontakt-phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              defaultValue={valueOf(values, "phone")}
              {...controlAria("kontakt-phone", err("phone"))}
            />
          </Field>
          <Field label="Hvad drejer det sig om?" htmlFor="kontakt-subject" required error={err("subject")}>
            <Select
              id="kontakt-subject"
              name="subject"
              required
              defaultValue={valueOf(values, "subject") || defaultSubject || ""}
              {...controlAria("kontakt-subject", err("subject"))}
            >
              <option value="">Vælg</option>
              {CONTACT_SUBJECTS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <Field label="Besked" htmlFor="kontakt-message" required error={err("message")}>
          <Textarea
            id="kontakt-message"
            name="message"
            required
            defaultValue={valueOf(values, "message")}
            {...controlAria("kontakt-message", err("message"))}
          />
        </Field>
      </FormGroup>

      <Honeypot />

      <div>
        <SubmitButton pending={pending}>Skriv til os</SubmitButton>
      </div>
    </form>
  );
}
