"use client";

import { useActionState } from "react";
import { Field, Input, Textarea } from "@/components/ui/field";
import { submitCourseInterest } from "@/app/actions/course-interest";
import { INITIAL_FORM_STATE, controlAria, fieldError, formValues, valueOf } from "@/components/forms/form-state";
import { FormGroup, FormMessage, FormSuccess, Honeypot, SubmitButton, formClass } from "@/components/forms/form-status";

export function CourseInterestForm() {
  const [state, formAction, pending] = useActionState(submitCourseInterest, INITIAL_FORM_STATE);

  if (state.ok) {
    return <FormSuccess title="Tak, vi har fået den" message={state.message} />;
  }

  const values = formValues(state);
  const err = (name: string) => fieldError(state, name);
  const periodHelper = "For eksempel en lørdag i november, eller en hverdagsaften efter nytår.";
  const courseHelper = "Skriv, hvilket kursus du er interesseret i.";

  return (
    <form action={formAction} noValidate className={formClass}>
      <FormMessage message={state.message} />

      <FormGroup legend="Hvad vil I gerne lære?">
        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="Kursus" htmlFor="kursus-course" required helper={courseHelper} error={err("course")}>
            <Input
              id="kursus-course"
              name="course"
              required
              defaultValue={valueOf(values, "course")}
              {...controlAria("kursus-course", err("course"), courseHelper)}
            />
          </Field>
          <Field label="Hvor mange er I?" htmlFor="kursus-persons" required error={err("persons")}>
            <Input
              id="kursus-persons"
              name="persons"
              type="number"
              inputMode="numeric"
              min={1}
              required
              defaultValue={valueOf(values, "persons")}
              {...controlAria("kursus-persons", err("persons"))}
            />
          </Field>
          <Field
            label="Hvornår kunne det passe?"
            htmlFor="kursus-period"
            required
            helper={periodHelper}
            error={err("period")}
            className="sm:col-span-2"
          >
            <Input
              id="kursus-period"
              name="period"
              required
              defaultValue={valueOf(values, "period")}
              {...controlAria("kursus-period", err("period"), periodHelper)}
            />
          </Field>
        </div>
      </FormGroup>

      <FormGroup legend="Hvem skal vi kontakte?">
        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="Navn" htmlFor="kursus-name" required error={err("name")}>
            <Input
              id="kursus-name"
              name="name"
              autoComplete="name"
              required
              defaultValue={valueOf(values, "name")}
              {...controlAria("kursus-name", err("name"))}
            />
          </Field>
          <Field label="E-mail" htmlFor="kursus-email" required error={err("email")}>
            <Input
              id="kursus-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              defaultValue={valueOf(values, "email")}
              {...controlAria("kursus-email", err("email"))}
            />
          </Field>
          <Field label="Telefon" htmlFor="kursus-phone" required error={err("phone")}>
            <Input
              id="kursus-phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              required
              defaultValue={valueOf(values, "phone")}
              {...controlAria("kursus-phone", err("phone"))}
            />
          </Field>
        </div>

        <Field label="Besked" htmlFor="kursus-message" error={err("message")}>
          <Textarea
            id="kursus-message"
            name="message"
            defaultValue={valueOf(values, "message")}
            {...controlAria("kursus-message", err("message"))}
          />
        </Field>
      </FormGroup>

      <Honeypot />

      <div>
        <SubmitButton pending={pending}>Send forespørgsel</SubmitButton>
      </div>
    </form>
  );
}
