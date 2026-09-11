import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { altFor } from "@/components/home/photo";

/**
 * The hand-drawn logo next to two sentences and a link. A flex row from sm,
 * stacked below with the logo on top. Not a photo split: the logo is a mark.
 */
export function AboutTeaser() {
  return (
    <Section className="border-t border-line">
      <Container size="narrow">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-center sm:gap-12">
          <Image
            src="/images/logo-640.png"
            alt={altFor("/images/logo.png", "Det lille hus på landet, håndtegnet logo")}
            width={208}
            height={175}
            className="w-40 shrink-0 sm:w-52"
          />
          <div>
            <h2 className="text-title font-semibold">Familien på Torpevej</h2>
            <p className="mt-4 text-ink-2">
              Vi er Kristine og Nicolas. Det lille hus på landet startede i 2009 og er i dag en gård ved
              Herlufmagle med bageri, køkkenhave og en stenovn på hjul.
            </p>
            <p className="mt-6">
              <Link
                href="/om-os"
                className="font-medium text-rust underline decoration-1 underline-offset-[3px] hover:text-rust-deep"
              >
                Læs mere om os
              </Link>
            </p>
          </div>
        </div>
      </Container>
    </Section>
  );
}
