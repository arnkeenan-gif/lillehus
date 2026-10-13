"use client";

import { useEffect, useRef } from "react";

/**
 * Two laurel branches in the thin ink line of the wreath around Kristine's
 * logo, growing along the window edges as the page is read. The left one
 * grows up from the bottom, the right one down from the top; scrolling draws
 * the stem further and opens leaf after leaf, and scrolling back folds them
 * away again. A slow drift (the branches move a little slower than the page)
 * keeps them from feeling pinned. With reduced motion both stand fully grown
 * and still. Ornament only: hidden from screen readers and from clicks, and
 * only where the margins have room (lg and up).
 */

const STEPS = 26;

type Leaf = { d: string; at: number };

/** A leaf at (x, y) pointing at `angle` degrees, `size` long, almond shaped. */
function leafPath(x: number, y: number, angle: number, size: number): string {
  const r = (angle * Math.PI) / 180;
  const tx = x + Math.cos(r) * size;
  const ty = y + Math.sin(r) * size;
  const nx = -Math.sin(r) * size * 0.3;
  const ny = Math.cos(r) * size * 0.3;
  const mx = x + Math.cos(r) * size * 0.5;
  const my = y + Math.sin(r) * size * 0.5;
  const f = (n: number) => n.toFixed(1);
  const vein = `M${f(x)} ${f(y)} L${f(x + Math.cos(r) * size * 0.8)} ${f(y + Math.sin(r) * size * 0.8)}`;
  return `M${f(x)} ${f(y)} Q${f(mx + nx)} ${f(my + ny)} ${f(tx)} ${f(ty)} Q${f(mx - nx)} ${f(my - ny)} ${f(x)} ${f(y)} Z ${vein}`;
}

/** One bowed branch from (40, 1000) up to the top, with paired leaves that shrink towards the tip, and a few berries like the logo's. */
function buildBranch(bow: number): { stem: string; leaves: Leaf[]; berries: { x: number; y: number; at: number }[] } {
  const pts: [number, number][] = [];
  for (let i = 0; i <= STEPS; i++) {
    const t = i / STEPS;
    pts.push([40 + Math.sin(t * Math.PI) * bow + t * 30, 1000 - t * 970]);
  }
  const stem = pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
  const leaves: Leaf[] = [];
  const berries: { x: number; y: number; at: number }[] = [];
  for (let i = 1; i < STEPS; i++) {
    const [x, y] = pts[i];
    const [px, py] = pts[i - 1];
    const dir = (Math.atan2(y - py, x - px) * 180) / Math.PI;
    const size = 50 - i * 1.25;
    const at = i / STEPS;
    // Alternate the pair a little so it reads as drawn by hand.
    leaves.push({ d: leafPath(x, y, dir - 40 - (i % 3) * 4, size), at });
    leaves.push({ d: leafPath(x, y, dir + 36 + (i % 2) * 6, size * 0.94), at: at + 0.012 });
    if (i % 5 === 3) berries.push({ x: x + 16, y: y - 4, at });
  }
  const [tx, ty] = pts[STEPS];
  const [px, py] = pts[STEPS - 1];
  leaves.push({ d: leafPath(tx, ty, (Math.atan2(ty - py, tx - px) * 180) / Math.PI, 28), at: 1 });
  return { stem, leaves, berries };
}

const LEFT = buildBranch(78);
const RIGHT = buildBranch(64);

function Branch({ branch, side }: { branch: ReturnType<typeof buildBranch>; side: "left" | "right" }) {
  return (
    <svg
      data-side={side}
      viewBox="0 0 220 1040"
      preserveAspectRatio="xMidYMax meet"
      focusable="false"
      className={
        side === "left"
          ? "wreath-branch absolute bottom-0 left-3 h-[96vh] w-auto"
          : "wreath-branch absolute top-0 right-3 h-[96vh] w-auto -scale-100"
      }
    >
      <g fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
        <path className="wreath-stem" d={branch.stem} pathLength={1} />
        {branch.leaves.map((leaf, i) => (
          <path key={i} className="wreath-leaf" d={leaf.d} style={{ ["--at" as string]: leaf.at }} />
        ))}
        {branch.berries.map((b, i) => (
          <circle key={i} className="wreath-leaf" cx={b.x} cy={b.y} r={3.2} style={{ ["--at" as string]: b.at }} />
        ))}
      </g>
    </svg>
  );
}

export function BackgroundWreath() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    const update = () => {
      frame = 0;
      if (reduce.matches) {
        el.style.setProperty("--grow", "1");
        el.style.setProperty("--drift", "0px");
        return;
      }
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const p = Math.min(1, Math.max(0, window.scrollY / max));
      // Start a quarter grown so the first screen already has a branch, end fully grown at the footer.
      el.style.setProperty("--grow", (0.22 + p * 0.78).toFixed(4));
      el.style.setProperty("--drift", `${(p * -40).toFixed(1)}px`);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    reduce.addEventListener("change", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      reduce.removeEventListener("change", onScroll);
    };
  }, []);

  return (
    <div ref={ref} aria-hidden="true" className="background-wreath pointer-events-none fixed inset-0 -z-10 hidden text-ink/[0.11] lg:block">
      <Branch branch={LEFT} side="left" />
      <Branch branch={RIGHT} side="right" />
    </div>
  );
}
