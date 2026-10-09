"use client";

import { useEffect, useRef, type RefObject } from "react";

/*
  Behaviour shared by the cart drawer and the pickup dialog: Escape closes,
  Tab stays inside the panel, the page behind does not scroll, focus moves
  into the panel when it opens and back to whatever opened it afterwards.
  The scroll lock is counted, so one panel closing while another opens
  never leaves the page locked or unlocked by mistake.
*/

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

let locks = 0;
let overflowBefore = "";

function lockScroll() {
  if (locks === 0) {
    overflowBefore = document.body.style.overflow;
    document.body.style.overflow = "hidden";
  }
  locks += 1;
}

function unlockScroll() {
  locks = Math.max(0, locks - 1);
  if (locks === 0) document.body.style.overflow = overflowBefore;
}

function trapTab(e: KeyboardEvent, root: HTMLElement | null) {
  if (!root) return;
  const focusable = Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (el) => el.getClientRects().length > 0 || el === document.activeElement,
  );
  if (focusable.length === 0) {
    e.preventDefault();
    return;
  }
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  const active = document.activeElement;
  if (e.shiftKey && (active === first || active === root)) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && active === last) {
    e.preventDefault();
    first.focus();
  }
}

export function useModal(open: boolean, onClose: () => void, panelRef: RefObject<HTMLElement | null>) {
  const returnFocusTo = useRef<HTMLElement | null>(null);
  const closeRef = useRef(onClose);

  useEffect(() => {
    closeRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    returnFocusTo.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closeRef.current();
      } else if (e.key === "Tab") {
        trapTab(e, panelRef.current);
      }
    };
    document.addEventListener("keydown", onKey);
    lockScroll();
    const frame = window.requestAnimationFrame(() => panelRef.current?.focus());
    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener("keydown", onKey);
      unlockScroll();
      const target = returnFocusTo.current;
      if (target && document.contains(target) && !document.querySelector('[aria-modal="true"]:focus-within')) target.focus();
    };
  }, [open, panelRef]);
}
