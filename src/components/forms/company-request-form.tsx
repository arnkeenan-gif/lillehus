"use client";

import { useActionState } from "react";
import { Checkbox, Field, Input, Select, Textarea } from "@/components/ui/field";
import { submitCompanyRequest } from "@/app/actions/company-request";
import { INITIAL_FORM_STATE, controlAria, fieldError, formValues, listOf, valueOf } from "@/components/forms/form-state";
import { COMPANY_FREQUENCY, COMPANY_WANTS } from "@/components/forms/options";
import { Fieldset, FormMessage, FormSuccess, Honeypot, SubmitButton } from "@/components/forms/form-status";

export function CompanyRequestForm() {
  const [state, formAction, pending] = useActionState(submitCompanyRequest, INITIAL_FORM_STATE);

  if (state.ok) {
    return <FormSuccess title="Forespørgslen er sendt" message={state.message} />;
  }

  const values = formValues(state);
  const err = (name: string) => fieldError(state, name);
  const chosen = listOf(values, "wants");
  const peopleHelper = "Cirka. Skriv gerne et spænd, for eksempel 20 til 30.";

  return (
    <form action={formAction} noValidate className="relative flex flex-col gap-8">
      <FormMessage message={state.message} />

      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="Virksomhed" htmlFor="firma-company" required error={err("company")}>
          <Input
            id="firma-company"
            name="company"
            autoComplete="organization"
            required
            defaultValue={valueOf(values, "company")}
            {...controlAria("firma-company", err("company"))}
          />
        </Field>
        <Field label="CVR-nummer" htmlFor="firma-cvr" error={err("cvr")}>
          <Input
            id="firma-cvr"
            name="cvr"
            inputMode="numeric"
            defaultValue={valueOf(values, "cvr")}
            {...controlAria("firma-cvr", err("cvr"))}
          />
        </Field>
        <Field label="Kontaktperson" htmlFor="firma-contact" required error={err("contact")}>
          <Input
            id="firma-contact"
            name="contact"
            autoComplete="name"
            required
            defaultValue={valueOf(values, "contact")}
            {...controlAria("firma-contact", err("contact"))}
          />
        </Field>
        <Field label="E-mail" htmlFor="firma-email" required error={err("email")}>
          <Input
            id="firma-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            defaultValue={valueOf(values, "email")}
            {...controlAria("firma-email", err("email"))}
          />
        </Field>
        <Field label="Telefon" htmlFor="firma-phone" required error={err("phone")}>
          <Input
            id="firma-phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            required
            defaultValue={valueOf(values, "phone")}
            {...controlAria("firma-phone", err("phone"))}
          />
        </Field>
      </div>

      <Fieldset id="firma-wants" legend="Hvad har I brug for?" required error={err("wants")}>
        {COMPANY_WANTS.map((o) => (
          <Checkbox
            key={o.value}
            id={`firma-wants-${o.value}`}
            name="wants"
            value={o.value}
            label={o.label}
            defaultChecked={chosen.includes(o.value)}
          />
        ))}
      </Fieldset>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="Hvor ofte?" htmlFor="firma-frequency" required error={err("frequency")}>
          <Select
            id="firma-frequency"
            name="frequency"
            required
            defaultValue={valueOf(values, "frequency")}
            {...controlAria("firma-frequency", err("frequency"))}
          >
            <option value="">Vælg</option>
            {COMPANY_FREQUENCY.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Hvor mange personer?" htmlFor="firma-people" required helper={peopleHelper} error={err("people")}>
          <Input
            id="firma-people"
            name="people"
            required
            defaultValue={valueOf(values, "people")}
            {...controlAria("firma-people", err("people"), peopleHelper)}
          />
        </Field>
      </div>

      <Field label="Besked" htmlFor="firma-message" error={err("message")}>
        <Textarea
          id="firma-message"
          name="message"
          defaultValue={valueOf(values, "message")}
          {...controlAria("firma-message", err("message"))}
        />
      </Field>

      <Honeypot />

      <div>
        <SubmitButton pending={pending}>Send forespørgsel</SubmitButton>
      </div>
    </form>
  );
}
