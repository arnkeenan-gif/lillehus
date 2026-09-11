import { cn } from "@/lib/cn";

/*
  Form primitives. Label above, helper text in markup, error below.
  Never use placeholder as the label.
*/

const control =
  "w-full rounded-md border border-line bg-white px-3.5 py-2.5 text-ink placeholder:text-muted/70 transition-colors focus:border-rust focus:outline-none focus-visible:ring-2 focus-visible:ring-rust/30 disabled:bg-paper-2 aria-[invalid=true]:border-danger";

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
    <div className={cn("flex flex-col gap-2", className)}>
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
  return <input className={cn(control, className)} {...rest} />;
}

export function Textarea({ className, ...rest }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(control, "min-h-32 resize-y", className)} {...rest} />;
}

export function Select({ className, children, ...rest }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cn(control, "appearance-none bg-no-repeat pr-10", className)} {...rest}>
      {children}
    </select>
  );
}

export function Checkbox({
  label,
  id,
  className,
  ...rest
}: React.InputHTMLAttributes<HTMLInputElement> & { label: React.ReactNode; id: string }) {
  return (
    <label htmlFor={id} className={cn("flex cursor-pointer items-start gap-3 text-[0.95rem] text-ink-2", className)}>
      <input
        id={id}
        type="checkbox"
        className="mt-1 size-4 shrink-0 rounded-sm border-line accent-rust"
        {...rest}
      />
      <span>{label}</span>
    </label>
  );
}
