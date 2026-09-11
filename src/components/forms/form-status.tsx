"use client";

import { useEffect, useId, useRef, useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { HONEYPOT_FIELD } from "@/components/forms/form-state";

/* Pieces every form on the site shares: the class for the form itself, the
   group (a fieldset with an optional legend; a hairline separates one group
   from the next), the success block that replaces the form, the message for
   errors not tied to a field, the honeypot, a fieldset for checkbox and radio
   groups, a radio control and the submit button. No boxes around anything. */

/** Every form: a column of groups with one hairline between consecutive fieldsets. */
export const formClass =
  "relative flex flex-col gap-8 [&>fieldset+fieldset]:border-t [&>fieldset+fieldset]:border-line [&>fieldset+fieldset]:pt-8";

/**
 * A group of fields. The legend is a sentence Kristine would ask ("Hvem skal
 * vi kontakte?"), or nothing. Floating the legend takes it out of the
 * fieldset's border so the hairline above the group stays whole.
 */
export function FormGroup({ legend, children, className }: { legend?: string; children: React.ReactNode; className?: string }) {
  return (
    <fieldset className={cn("flex min-w-0 flex-col gap-6", className)}>
      {legend ? <legend className="float-left w-full font-semibold text-ink">{legend}</legend> : null}
      {children}
    </fieldset>
  );
}

export function FormSuccess({ title, message }: { title: string; message: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref.current?.focus();
  }, []);
  return (
    <div ref={ref} tabIndex={-1} role="status" className="max-w-[60ch] outline-none">
      <p className="text-lead text-ink">{title}</p>
      <p className="mt-4 text-ink-2">{message}</p>
    </div>
  );
}

export function FormMessage({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="rounded-md bg-danger-tint px-4 py-3 text-danger">
      {message}
    </p>
  );
}

/** Off-screen field that must stay empty. Bots fill it in; the action then pretends to succeed. */
export function Honeypot() {
  const id = useId();
  return (
    <div className="absolute -left-[9999px] h-px w-px overflow-hidden" aria-hidden="true">
      <label htmlFor={id}>Lad dette felt stå tomt</label>
      <input id={id} name={HONEYPOT_FIELD} type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
    </div>
  );
}

type FieldsetProps = {
  id: string;
  legend: string;
  required?: boolean;
  helper?: string;
  error?: string;
  children: React.ReactNode;
};

/** Group of checkboxes or radios. Same label, helper and error placement as Field; rows are 44px. */
export function Fieldset({ id, legend, required, helper, error, children }: FieldsetProps) {
  return (
    <fieldset
      className="flex min-w-0 flex-col gap-2"
      aria-describedby={error ? `${id}-error` : helper ? `${id}-helper` : undefined}
    >
      <legend className="float-left w-full text-sm font-medium text-ink">
        {legend}
        {required ? <span aria-hidden="true"> *</span> : null}
      </legend>
      <div className="flex flex-col">{children}</div>
      {helper && !error ? (
        <p id={`${id}-helper`} className="text-sm text-muted">
          {helper}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-sm text-danger">
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}

/** One row of a radio group: a 44px target, the dot and the label on one line. */
export function Radio({
  label,
  id,
  className,
  ...rest
}: React.InputHTMLAttributes<HTMLInputElement> & { label: React.ReactNode; id: string }) {
  return (
    <label htmlFor={id} className={cn("flex min-h-11 cursor-pointer items-center gap-3 py-1 text-base text-ink", className)}>
      <input id={id} type="radio" className="size-5 shrink-0 accent-rust" {...rest} />
      <span>{label}</span>
    </label>
  );
}

/** The one primary button of a form: full width on phones. */
export function SubmitButton({ pending, children }: { pending: boolean; children: React.ReactNode }) {
  return (
    <Button type="submit" size="lg" disabled={pending} className="w-full sm:w-auto sm:min-w-48">
      {pending ? "Sender..." : children}
    </Button>
  );
}

/* Dates in the visitor's browser, for the `min` attribute on date inputs.
   Undefined during server rendering so the hydrated markup matches. */

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export function localIso(daysAhead = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

const subscribeNoop = () => () => {};

export function useTodayIso(): string | undefined {
  return useSyncExternalStore(subscribeNoop, () => localIso(), () => undefined);
}
