"use client";

import { Minus, Plus } from "@phosphor-icons/react";
import { cn } from "@/lib/cn";
import { MAX_QTY } from "@/lib/cart";

type Props = {
  value: number;
  onChange: (next: number) => void;
  /** Name of the item, for the group label. */
  label: string;
  min?: number;
  max?: number;
  className?: string;
};

const stepButton =
  "flex size-11 shrink-0 items-center justify-center text-ink transition-[background-color,transform] duration-150 ease-out-quart hover:bg-paper-2 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40";

/** Minus / count / plus with 44px targets. The count is a live region so screen readers hear changes. */
export function QuantityStepper({ value, onChange, label, min = 1, max = MAX_QTY, className }: Props) {
  return (
    <div
      role="group"
      aria-label={`Antal, ${label}`}
      className={cn("inline-flex h-11 items-stretch rounded-md border border-line bg-white", className)}
    >
      <button
        type="button"
        className={cn(stepButton, "rounded-l-md")}
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
      >
        <Minus size={18} aria-hidden="true" />
        <span className="sr-only">En mindre</span>
      </button>
      <output aria-live="polite" className="tnum flex min-w-9 items-center justify-center px-1 text-[0.95rem] font-medium text-ink">
        {value}
      </output>
      <button
        type="button"
        className={cn(stepButton, "rounded-r-md")}
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
      >
        <Plus size={18} aria-hidden="true" />
        <span className="sr-only">En mere</span>
      </button>
    </div>
  );
}
