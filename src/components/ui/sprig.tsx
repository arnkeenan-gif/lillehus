import { cn } from "@/lib/cn";

/**
 * A thin line-drawn laurel sprig, the same hand as the wreath around
 * Kristine's logo. Pure ornament: ink at low contrast, no fill, hidden
 * from screen readers. `wide` mirrors two sprigs from a small centre dot,
 * for a divider; the default is one sprig for a corner or a title.
 */
function Branch() {
  return (
    <g fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 20 C 30 18, 56 13, 86 4" />
      <path d="M18 18.6 C 15 13, 18 9, 23 7.5 C 24 12, 22 16, 18 18.6 Z" />
      <path d="M20 19 C 24 23.5, 29 24.5, 33 22.5 C 30 19, 25 18, 20 19 Z" />
      <path d="M38 15.8 C 36 10, 39 6, 44 4.6 C 45 9.4, 43 13.4, 38 15.8 Z" />
      <path d="M40 16.3 C 45 20.5, 50 21, 54 18.6 C 50.6 15.4, 45.6 14.8, 40 16.3 Z" />
      <path d="M58 11.6 C 57 6.4, 60 3, 64.6 2 C 65.2 6.4, 63 9.8, 58 11.6 Z" />
      <path d="M60.4 12 C 65 15.4, 69.6 15.6, 73.2 13.2 C 70 10.6, 65.4 10.4, 60.4 12 Z" />
      <path d="M86 4 C 82 1.6, 78 2, 75.4 4.8 C 79 6.6, 83 6.4, 86 4 Z" />
    </g>
  );
}

export function Sprig({ wide = false, className }: { wide?: boolean; className?: string }) {
  if (!wide) {
    return (
      <svg viewBox="0 0 90 26" aria-hidden="true" focusable="false" className={cn("h-6 w-auto text-ink/35", className)}>
        <Branch />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 196 26" aria-hidden="true" focusable="false" className={cn("h-6 w-auto text-ink/35", className)}>
      <g transform="translate(90 0) scale(-1 1)">
        <Branch />
      </g>
      <circle cx="98" cy="20" r="1.6" fill="currentColor" />
      <g transform="translate(106 0)">
        <Branch />
      </g>
    </svg>
  );
}
