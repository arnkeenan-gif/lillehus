"use client";

import { Printer } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

/** Prints the order confirmation. Kristine uses the print as her baking list. */
export function PrintButton() {
  return (
    <Button type="button" onClick={() => window.print()}>
      <Printer size={20} aria-hidden="true" />
      Udskriv
    </Button>
  );
}
