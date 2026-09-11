"use client";

import { useEffect, useState, type RefObject } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

interface Props {
  /** The form block. The bar hides while any part of it is on screen. */
  target: RefObject<HTMLElement | null>;
  /** Where the button goes, "#book". */
  href: string;
  /** Two short lines: the price, then what comes on top of it. */
  lines: [string, string];
}

/**
 * On phones, a 56px bar along the bottom of the screen with the price line
 * and a link to the form, so the visitor can jump to it from anywhere on
 * the page. Shown only while the form is off screen, and not over the
 * footer. Hidden entirely from lg, where the estimate sits beside the form.
 */
export function PizzaStickyBar({ target, href, lines }: Props) {
  const [formInView, setFormInView] = useState(true);
  const [footerInView, setFooterInView] = useState(false);

  useEffect(() => {
    const element = target.current;
    if (!element || typeof IntersectionObserver === "undefined") return;

    const form = new IntersectionObserver(([entry]) => setFormInView(entry.isIntersecting));
    form.observe(element);

    const footerElement = document.querySelector("footer");
    const footer = footerElement
      ? new IntersectionObserver(([entry]) => setFooterInView(entry.isIntersecting), { rootMargin: "0px 0px -40% 0px" })
      : null;
    if (footerElement) footer?.observe(footerElement);

    return () => {
      form.disconnect();
      footer?.disconnect();
    };
  }, [target]);

  const visible = !formInView && !footerInView;

  return (
    <div
      inert={!visible}
      aria-hidden={!visible}
      className={cn(
        "no-print fixed inset-x-0 bottom-0 z-30 border-t border-line bg-paper pb-[env(safe-area-inset-bottom)] transition-transform duration-150 ease-out-quart lg:hidden",
        visible ? "translate-y-0" : "translate-y-full",
      )}
    >
      <div className="flex h-14 items-center justify-between gap-4 px-5 sm:px-8">
        <p className="tnum min-w-0 text-[13px] leading-snug text-ink">
          <span className="block truncate font-medium">{lines[0]}</span>
          <span className="block truncate text-muted">{lines[1]}</span>
        </p>
        <Button href={href} className="shrink-0 px-4">
          Book pizzavognen
        </Button>
      </div>
    </div>
  );
}
