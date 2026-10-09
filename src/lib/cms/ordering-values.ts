/**
 * Small value readers shared by the Sanity and JSON sides of the ordering
 * façade. Owned by the ordering lane.
 */
import type { DeadlineRule } from "./ordering-types";

/** A deadline override, or undefined unless both whole numbers are filled in and make sense. */
export function mapDeadlineValue(value: unknown): DeadlineRule | undefined {
  if (!value || typeof value !== "object") return undefined;
  const { daysBefore, hour } = value as Record<string, unknown>;
  if (typeof daysBefore !== "number" || typeof hour !== "number") return undefined;
  if (!Number.isInteger(daysBefore) || !Number.isInteger(hour)) return undefined;
  if (daysBefore < 0 || daysBefore > 60 || hour < 0 || hour > 23) return undefined;
  return { daysBefore, hour };
}
