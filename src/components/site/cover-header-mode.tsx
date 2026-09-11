"use client";

import { useEffect, useRef } from "react";

/*
  Rendered inside a full-image hero. It marks <html> so the header goes
  transparent over the photo, and flips a second attribute once the photo has
  scrolled past the header so the header turns to paper again. The inline
  script sets the first attribute during HTML parsing, before the first
  paint, so there is no flash of a paper header over the photo on load.
*/
const BOOT = 'document.documentElement.setAttribute("data-hero-cover","true");';

export function CoverHeaderMode() {
  const marker = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const html = document.documentElement;
    html.setAttribute("data-hero-cover", "true");
    const hero = marker.current?.parentElement;
    let observer: IntersectionObserver | null = null;
    if (hero) {
      observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) html.removeAttribute("data-hero-scrolled");
          else html.setAttribute("data-hero-scrolled", "true");
        },
        { rootMargin: "-72px 0px 0px 0px", threshold: 0 },
      );
      observer.observe(hero);
    }
    return () => {
      observer?.disconnect();
      html.removeAttribute("data-hero-cover");
      html.removeAttribute("data-hero-scrolled");
    };
  }, []);

  return (
    <>
      <div ref={marker} hidden />
      <script dangerouslySetInnerHTML={{ __html: BOOT }} />
    </>
  );
}
