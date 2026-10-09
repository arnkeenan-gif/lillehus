"use client";

import { useSyncExternalStore } from "react";

/*
  The clock for deadlines in the browser. During server rendering and
  hydration it returns the time the page was rendered (passed down from the
  server), so the HTML and the first client render agree; right after, it
  switches to the browser's clock and ticks every 30 seconds, so a date
  closes on the page when its deadline passes. The checkout re-checks with
  the server's clock either way.
*/

const TICK_MS = 30_000;
let current = 0;
let timer: number | undefined;
const listeners = new Set<() => void>();

function tick() {
  current = Date.now();
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  if (listeners.size === 1) {
    current = Date.now();
    timer = window.setInterval(tick, TICK_MS);
    window.addEventListener("focus", tick);
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      window.clearInterval(timer);
      window.removeEventListener("focus", tick);
    }
  };
}

function getSnapshot(): number {
  if (current === 0) current = Date.now();
  return current;
}

/** The browser's clock right now, for event handlers (never during render; use useNow there). */
export function currentTime(): number {
  return Date.now();
}

/** Milliseconds since epoch: `renderedAt` on the server and during hydration, the browser's clock afterwards. */
export function useNow(renderedAt: number): number {
  return useSyncExternalStore(subscribe, getSnapshot, () => renderedAt);
}
