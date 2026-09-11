/**
 * Types and small helpers shared by the server actions and the client forms.
 * Nothing server-side is imported here: this file ends up in the browser bundle.
 */

export type FormValues = Record<string, string | string[]>;

/**
 * Every server action returns this. On failure the values the visitor typed
 * are echoed back so the form can keep them (React resets a form after an
 * action completes, and the inputs read their defaults from `values`).
 */
export type FormState =
  | { ok: true; message: string }
  | { ok: false; errors: Record<string, string>; message?: string; values?: FormValues };

export const INITIAL_FORM_STATE: FormState = { ok: false, errors: {} };

/** Name of the visually hidden field that must stay empty. Bots fill it in. */
export const HONEYPOT_FIELD = "website";

export function fieldError(state: FormState, name: string): string | undefined {
  return state.ok ? undefined : state.errors[name];
}

export function formValues(state: FormState): FormValues {
  return state.ok ? {} : (state.values ?? {});
}

export function valueOf(values: FormValues, name: string): string {
  const v = values[name];
  return Array.isArray(v) ? (v[0] ?? "") : (v ?? "");
}

export function listOf(values: FormValues, name: string): string[] {
  const v = values[name];
  if (Array.isArray(v)) return v;
  return v ? [v] : [];
}

/** aria attributes that tie a control to the helper or error text its Field renders. */
export function controlAria(id: string, error?: string, helper?: string) {
  return {
    "aria-invalid": error ? true : undefined,
    "aria-describedby": error ? `${id}-error` : helper ? `${id}-helper` : undefined,
  } as const;
}
