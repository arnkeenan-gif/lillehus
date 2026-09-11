"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Pause, Play } from "@phosphor-icons/react";
import type { CmsImage } from "@/lib/cms";

function position(image: CmsImage): string {
  return image.hotspot ? `${Math.round(image.hotspot.x * 100)}% ${Math.round(image.hotspot.y * 100)}%` : "50% 50%";
}

/** Phone photos are square or portrait; a wide band would stretch and crop them. */
function isLandscape(image: CmsImage): boolean {
  return (image.width ?? 1) / (image.height ?? 1) >= 1.3;
}

function Panel({ slides, current, priorityIndex }: { slides: CmsImage[]; current: number; priorityIndex: number }) {
  return (
    <div className="relative h-full w-full overflow-hidden">
      {slides.map((slide, i) => (
        <Image
          key={`${slide.src}-${i}`}
          src={slide.src}
          alt={slide.alt}
          fill
          priority={i === priorityIndex}
          quality={90}
          sizes="(min-width: 1024px) 50vw, 100vw"
          aria-hidden={i !== current}
          className={`object-cover transition-opacity duration-1000 ease-linear ${i === current ? "opacity-100" : "opacity-0"}`}
          style={{ objectPosition: position(slide) }}
          placeholder={slide.lqip ? "blur" : "empty"}
          blurDataURL={slide.lqip}
        />
      ))}
    </div>
  );
}

/**
 * The cover hero's photographs, crossfading every few seconds while the
 * words stay put. Square and portrait photos are shown two at a time on
 * wide screens, side by side and edge to edge, so nothing is stretched;
 * a landscape photo fills the band alone. Stops under reduced motion and
 * while the tab is hidden, and carries a small pause button.
 */
export function HeroSlideshow({ slides, intervalSeconds }: { slides: CmsImage[]; intervalSeconds: number }) {
  const [tick, setTick] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const n = slides.length;
  const split = n >= 2 && !isLandscape(slides[0]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduceMotion(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (n < 2 || paused || reduceMotion) return;
    // Two panels take turns, so each photo still stays a full interval.
    const step = split && n >= 3 ? intervalSeconds / 2 : intervalSeconds;
    const id = window.setInterval(() => {
      if (document.hidden) return;
      setTick((t) => t + 1);
    }, step * 1000);
    return () => window.clearInterval(id);
  }, [n, intervalSeconds, paused, reduceMotion, split]);

  // Left changes on odd ticks, right on even ticks; with three or more
  // slides the two panels never show the same photo.
  let left: number;
  let right: number;
  if (split && n >= 3) {
    left = Math.floor((tick + 1) / 2) % n;
    right = (Math.floor(tick / 2) + n - 1) % n;
  } else {
    left = tick % n;
    right = (left + 1) % n;
  }
  const rotating = n > 1 && !reduceMotion;

  return (
    <>
      {split ? (
        <>
          <div className="absolute inset-0 lg:hidden">
            <Panel slides={slides} current={left} priorityIndex={0} />
          </div>
          <div className="absolute inset-0 hidden lg:grid lg:grid-cols-2">
            <Panel slides={slides} current={left} priorityIndex={0} />
            <Panel slides={slides} current={right} priorityIndex={n - 1} />
          </div>
        </>
      ) : (
        <div className="absolute inset-0">
          <Panel slides={slides} current={left} priorityIndex={0} />
        </div>
      )}
      {rotating ? (
        <button
          type="button"
          onClick={() => setPaused((p) => !p)}
          aria-pressed={paused}
          className="absolute bottom-5 right-5 z-10 flex size-11 items-center justify-center rounded-full bg-black/35 text-white transition-colors duration-150 ease-out-quart hover:bg-black/55 sm:bottom-6 sm:right-6"
        >
          {paused ? <Play size={18} weight="fill" aria-hidden="true" /> : <Pause size={18} weight="fill" aria-hidden="true" />}
          <span className="sr-only">{paused ? "Start billedskift" : "Stop billedskift"}</span>
        </button>
      ) : null}
    </>
  );
}
