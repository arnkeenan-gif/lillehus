import { CaretDown } from "@phosphor-icons/react/dist/ssr";
import { cn } from "@/lib/cn";

/*
  Form primitives. Label above, helper text in markup, error below. Controls
  are 48px tall with 16px text, so phones do not zoom in on focus; the focus
  ring is rust. Never use placeholder as the label.
*/

/** The shared look of every text control. Add a height (h-12) or a min-height. */
export const controlClass =
  "w-full rounded-md border border-line bg-white px-3.5 text-base text-ink placeholder:text-muted/70 transition-[border-color,box-shadow] duration-150 ease-out-quart focus:border-rust focus:outline-none focus:ring-2 focus:ring-rust/25 disabled:bg-paper-2 disabled:text-muted aria-[invalid=true]:border-danger";

type FieldProps = {
  label: string;
  htmlFor: string;
  helper?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
};

export function Field({ label, htmlFor, helper, error, required, children, className }: FieldProps) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-2", className)}>
      <label htmlFor={htmlFor} className="text-sm font-medium text-ink">
        {label}
        {required ? <span aria-hidden="true"> *</span> : null}
      </label>
      {children}
      {helper && !error ? (
        <p id={`${htmlFor}-helper`} className="text-sm text-muted">
          {helper}
        </p>
      ) : null}
      {error ? (
        <p id={`${htmlFor}-error`} role="alert" className="text-sm text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function Input({ className, ...rest }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(controlClass, "h-12", className)} {...rest} />;
}

export function Textarea({ className, ...rest }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(controlClass, "min-h-32 resize-y py-3", className)} {...rest} />;
}

export function Select({ className, children, ...rest }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select className={cn(controlClass, "h-12 appearance-none pr-10", className)} {...rest}>
        {children}
      </select>
      <CaretDown
        size={20}
        aria-hidden="true"
        className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-muted"
      />
    </div>
  );
}

/** One row of a checkbox group: a 44px target, the box and the label on one line. */
export function Checkbox({
  label,
  id,
  className,
  ...rest
}: React.InputHTMLAttributes<HTMLInputElement> & { label: React.ReactNode; id: string }) {
  return (
    <label htmlFor={id} className={cn("flex min-h-11 cursor-pointer items-center gap-3 py-1 text-base text-ink", className)}>
      <input id={id} type="checkbox" className="size-5 shrink-0 accent-rust" {...rest} />
      <span>{label}</span>
    </label>
  );
}
