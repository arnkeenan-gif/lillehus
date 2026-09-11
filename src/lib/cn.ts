/** Tiny class joiner. No tailwind-merge: keep class lists small and unambiguous. */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}
