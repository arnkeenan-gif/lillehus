"use client";

import { useActionState, useState } from "react";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { submitCakeRequest } from "@/app/actions/cake-request";
import { INITIAL_FORM_STATE, controlAria, fieldError, formValues, valueOf } from "@/components/forms/form-state";
import { CAKE_DELIVERY } from "@/components/forms/options";
import {
  Fieldset,
  FormGroup,
  FormMessage,
  FormSuccess,
  Honeypot,
  Radio,
  SubmitButton,
  formClass,
  localIso,
  useTodayIso,
} from "@/components/forms/form-status";

export interface CakeChoice {
  id: string;
  name: string;
  leadTimeDays: number;
}

export function CakeRequestForm({ cakes, defaultCakeId }: { cakes: CakeChoice[]; defaultCakeId?: string }) {
  const [state, formAction, pending] = useActionState(submitCakeRequest, INITIAL_FORM_STATE);
  const [cakeId, setCakeId] = useState(defaultCakeId ?? cakes[0]?.id ?? "");
  const today = useTodayIso();

  if (state.ok) {
    return <FormSuccess title="Forespørgslen er sendt" message={state.message} />;
  }

  const values = formValues(state);
  const err = (name: string) => fieldError(state, name);
  const cake = cakes.find((c) => c.id === cakeId);
  const lead = cake?.leadTimeDays ?? 5;
  const earliest = today ? localIso(lead) : undefined;
  const dateHelper = "Kristine bekræfter, om datoen kan lade sig gøre.";

  return (
    <form action={formAction} noValidate className={formClass}>
      <FormMessage message={state.message} />

      <FormGroup legend="Hvilken kage, og hvornår?">
        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="Hvilken kage?" htmlFor="kage-cakeId" required error={err("cakeId")}>
            <Select
              id="kage-cakeId"
              name="cakeId"
              required
              value={cakeId}
              onChange={(e) => setCakeId(e.currentTarget.value)}
              {...controlAria("kage-cakeId", err("cakeId"))}
            >
              {cakes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Hvornår skal den bruges?" htmlFor="kage-date" required helper={dateHelper} error={err("date")}>
            <Input
              id="kage-date"
              name="date"
              type="date"
              required
              min={earliest}
              defaultValue={valueOf(values, "date")}
              {...controlAria("kage-date", err("date"), dateHelper)}
            />
          </Field>
          <Field label="Antal personer" htmlFor="kage-persons" required error={err("persons")}>
            <Input
              id="kage-persons"
              name="persons"
              type="number"
              inputMode="numeric"
              min={1}
              required
              defaultValue={valueOf(values, "persons")}
              {...controlAria("kage-persons", err("persons"))}
            />
          </Field>
        </div>

        <Field label="Smag og ønsker" htmlFor="kage-wishes" required error={err("wishes")}>
          <Textarea
            id="kage-wishes"
            name="wishes"
            required
            defaultValue={valueOf(values, "wishes")}
            {...controlAria("kage-wishes", err("wishes"))}
          />
        </Field>

        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="Tekst på kagen" htmlFor="kage-cakeText" error={err("cakeText")}>
            <Input
              id="kage-cakeText"
              name="cakeText"
              defaultValue={valueOf(values, "cakeText")}
              {...controlAria("kage-cakeText", err("cakeText"))}
            />
          </Field>
          <Field label="Allergier" htmlFor="kage-allergies" error={err("allergies")}>
            <Input
              id="kage-allergies"
              name="allergies"
              defaultValue={valueOf(values, "allergies")}
              {...controlAria("kage-allergies", err("allergies"))}
            />
          </Field>
        </div>

        <Fieldset id="kage-delivery" legend="Afhentning eller levering" required error={err("delivery")}>
          {CAKE_DELIVERY.map((o, i) => (
            <Radio
              key={o.value}
              id={`kage-delivery-${o.value}`}
              name="delivery"
              value={o.value}
              label={o.label}
              required
              defaultChecked={values.delivery ? values.delivery === o.value : i === 0}
            />
          ))}
        </Fieldset>
      </FormGroup>

      <FormGroup legend="Hvem skal vi kontakte?">
        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="Navn" htmlFor="kage-name" required error={err("name")}>
            <Input
              id="kage-name"
              name="name"
              autoComplete="name"
              required
              defaultValue={valueOf(values, "name")}
              {...controlAria("kage-name", err("name"))}
            />
          </Field>
          <Field label="E-mail" htmlFor="kage-email" required error={err("email")}>
            <Input
              id="kage-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              defaultValue={valueOf(values, "email")}
              {...controlAria("kage-email", err("email"))}
            />
          </Field>
          <Field label="Telefon" htmlFor="kage-phone" required error={err("phone")}>
            <Input
              id="kage-phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              required
              defaultValue={valueOf(values, "phone")}
              {...controlAria("kage-phone", err("phone"))}
            />
          </Field>
        </div>

        <Field label="Besked" htmlFor="kage-message" error={err("message")}>
          <Textarea
            id="kage-message"
            name="message"
            defaultValue={valueOf(values, "message")}
            {...controlAria("kage-message", err("message"))}
          />
        </Field>
      </FormGroup>

      <Honeypot />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <SubmitButton pending={pending}>Forespørg på kage</SubmitButton>
        <p className="text-sm text-muted">Kristine bekræfter pris og dato, før noget er aftalt.</p>
      </div>
    </form>
  );
}
