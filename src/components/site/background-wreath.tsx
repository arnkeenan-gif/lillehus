/**
 * Two long laurel branches, drawn in the thin ink line of the wreath around
 * Kristine's logo, standing along the left and right edges of the window.
 * Fixed, so they stay put while the page scrolls past; faint enough that
 * text and photos always win. Ornament only: hidden from screen readers and
 * from clicks. Only on wide screens, where the margins have room for them.
 */

/** A leaf at (x, y) pointing at `angle` degrees, `size` long. */
function leaf(x: number, y: number, angle: number, size: number): string {
  const r = (angle * Math.PI) / 180;
  const tx = x + Math.cos(r) * size;
  const ty = y + Math.sin(r) * size;
  // Control points either side of the midrib give the almond shape.
  const nx = -Math.sin(r) * size * 0.32;
  const ny = Math.cos(r) * size * 0.32;
  const mx = x + Math.cos(r) * size * 0.5;
  const my = y + Math.sin(r) * size * 0.5;
  const f = (n: number) => n.toFixed(1);
  return `M${f(x)} ${f(y)} Q${f(mx + nx)} ${f(my + ny)} ${f(tx)} ${f(ty)} Q${f(mx - nx)} ${f(my - ny)} ${f(x)} ${f(y)} Z`;
}

/** A branch curving up from the bottom: the stem and leaves in pairs along it, smaller towards the tip. */
function branch(): { stem: string; leaves: string[] } {
  const points: [number, number][] = [];
  const steps = 22;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    // A gentle bow, like one side of the logo's wreath.
    const y = 1000 - t * 960;
    const x = 40 + Math.sin(t * Math.PI) * 70;
    points.push([x, y]);
  }
  const stem = points.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
  const leaves: string[] = [];
  for (let i = 1; i < steps; i++) {
    const [x, y] = points[i];
    const [px, py] = points[i - 1];
    const dir = (Math.atan2(y - py, x - px) * 180) / Math.PI;
    const size = 46 - i * 1.3;
    leaves.push(leaf(x, y, dir - 38, size), leaf(x, y, dir + 38, size));
  }
  const [tx, ty] = points[steps];
  const [px, py] = points[steps - 1];
  leaves.push(leaf(tx, ty, (Math.atan2(ty - py, tx - px) * 180) / Math.PI, 26));
  return { stem, leaves };
}

const { stem, leaves } = branch();

function Branch({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 200 1040" preserveAspectRatio="xMidYMax meet" className={className} focusable="false">
      <g fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <path d={stem} />
        {leaves.map((d, i) => (
          <path key={i} d={d} />
        ))}
      </g>
    </svg>
  );
}

export function BackgroundWreath() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 hidden text-ink/[0.07] xl:block">
      <Branch className="absolute bottom-0 left-2 h-[92vh] w-auto" />
      <Branch className="absolute bottom-0 right-2 h-[92vh] w-auto -scale-x-100" />
    </div>
  );
}
