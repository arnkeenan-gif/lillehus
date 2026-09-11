"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Pause, Play } from "@phosphor-icons/react";
import type { CmsImage } from "@/lib/cms";

function position(image: CmsImage): string {
  return image.hotspot ? `${Math.round(image.hotspot.x * 100)}% ${Math.round(image.hotspot.y * 100)}%` : "50% 50%";
}

/**
 * The cover hero's photographs, crossfading every few seconds while the
 * words stay put. Stops under reduced motion and while the tab is hidden,
 * and carries a small pause button so nobody has to watch it move.
 */
export function HeroSlideshow({ slides, intervalSeconds }: { slides: CmsImage[]; intervalSeconds: number }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduceMotion(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (slides.length < 2 || paused || reduceMotion) return;
    const id = window.setInterval(() => {
      if (document.hidden) return;
      setIndex((i) => (i + 1) % slides.length);
    }, intervalSeconds * 1000);
    return () => window.clearInterval(id);
  }, [slides.length, intervalSeconds, paused, reduceMotion]);

  const rotating = slides.length > 1 && !reduceMotion;

  return (
    <>
      {slides.map((slide, i) => (
        <Image
          key={`${slide.src}-${i}`}
          src={slide.src}
          alt={slide.alt}
          fill
          priority={i === 0}
          quality={90}
          sizes="100vw"
          aria-hidden={i !== index}
          className={`object-cover transition-opacity duration-1000 ease-linear ${i === index ? "opacity-100" : "opacity-0"}`}
          style={{ objectPosition: position(slide) }}
          placeholder={slide.lqip ? "blur" : "empty"}
          blurDataURL={slide.lqip}
        />
      ))}
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
