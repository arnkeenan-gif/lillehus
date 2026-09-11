"use client";

import { useEffect, useId, useRef, useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { HONEYPOT_FIELD } from "@/components/forms/form-state";

/* Pieces every form on the site shares: the success block that replaces the
   form, the message for errors not tied to a field, the honeypot, a fieldset
   for checkbox and radio groups, a radio control and the submit button. */

export function FormSuccess({ title, message }: { title: string; message: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref.current?.focus();
  }, []);
  return (
    <div
      ref={ref}
      tabIndex={-1}
      role="status"
      className="rounded-md bg-rust-tint px-6 py-6 outline-none sm:px-8 sm:py-8"
    >
      <p className="text-lg font-semibold text-ink">{title}</p>
      <p className="mt-3 max-w-[60ch] text-ink-2">{message}</p>
    </div>
  );
}

export function FormMessage({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="rounded-md bg-danger-tint px-4 py-3 text-[0.95rem] text-danger">
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

/** Group of checkboxes or radios. Same label, helper and error placement as Field. */
export function Fieldset({ id, legend, required, helper, error, children }: FieldsetProps) {
  return (
    <fieldset
      className="flex flex-col gap-3"
      aria-describedby={error ? `${id}-error` : helper ? `${id}-helper` : undefined}
    >
      <legend className="text-sm font-medium text-ink">
        {legend}
        {required ? <span aria-hidden="true"> *</span> : null}
      </legend>
      <div className="flex flex-col gap-2.5">{children}</div>
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

export function Radio({
  label,
  id,
  className,
  ...rest
}: React.InputHTMLAttributes<HTMLInputElement> & { label: React.ReactNode; id: string }) {
  return (
    <label htmlFor={id} className={cn("flex cursor-pointer items-start gap-3 text-[0.95rem] text-ink-2", className)}>
      <input id={id} type="radio" className="mt-1 size-4 shrink-0 border-line accent-rust" {...rest} />
      <span>{label}</span>
    </label>
  );
}

export function SubmitButton({ pending, children }: { pending: boolean; children: React.ReactNode }) {
  return (
    <Button type="submit" size="lg" disabled={pending} className="min-w-48">
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
