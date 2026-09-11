/**
 * In-memory sliding window per form and IP: 5 requests per 10 minutes.
 *
 * Good enough for a small site. On serverless each warm instance keeps its
 * own counters, so treat this as a speed bump together with the honeypot,
 * not as a wall.
 */

const DEFAULT_LIMIT = 5;
const DEFAULT_WINDOW_MS = 10 * 60 * 1000;
const SWEEP_EVERY_MS = 5 * 60 * 1000;

const buckets = new Map<string, number[]>();
let lastSweep = 0;

function sweep(now: number, windowMs: number) {
  if (now - lastSweep < SWEEP_EVERY_MS) return;
  lastSweep = now;
  for (const [key, hits] of buckets) {
    const fresh = hits.filter((t) => now - t < windowMs);
    if (fresh.length === 0) buckets.delete(key);
    else buckets.set(key, fresh);
  }
}

export type RateLimitResult = { ok: true; remaining: number } | { ok: false; retryAfterSec: number };

export function rateLimit(
  form: string,
  ip: string,
  { limit = DEFAULT_LIMIT, windowMs = DEFAULT_WINDOW_MS }: { limit?: number; windowMs?: number } = {},
): RateLimitResult {
  const now = Date.now();
  sweep(now, windowMs);

  const key = `${form}:${ip}`;
  const hits = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);

  if (hits.length >= limit) {
    buckets.set(key, hits);
    return { ok: false, retryAfterSec: Math.max(1, Math.ceil((hits[0] + windowMs - now) / 1000)) };
  }

  hits.push(now);
  buckets.set(key, hits);
  return { ok: true, remaining: limit - hits.length };
}
