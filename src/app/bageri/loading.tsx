import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";

const TILES = [0, 1, 2, 3, 4, 5, 6, 7];

/** Skeleton in the shape of the product grid. Static blocks, nothing pulses. */
export default function Loading() {
  return (
    <Section aria-busy="true">
      <Container>
        <span className="sr-only">Henter varerne</span>
        <div className="max-w-[65ch]" aria-hidden="true">
          <div className="h-9 w-72 max-w-full rounded-md bg-paper-2" />
          <div className="mt-5 h-4 w-full rounded-md bg-paper-2" />
          <div className="mt-2 h-4 w-4/5 rounded-md bg-paper-2" />
        </div>
        <div className="mt-12 h-7 w-24 rounded-md bg-paper-2 sm:mt-16" aria-hidden="true" />
        <div className="mt-5 grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 xl:grid-cols-4" aria-hidden="true">
          {TILES.map((i) => (
            <div key={i} className="flex flex-col rounded-md border border-line p-3 sm:p-4">
              <div className="aspect-[4/5] rounded-md bg-paper-2" />
              <div className="mt-3 h-5 w-3/4 rounded-md bg-paper-2" />
              <div className="mt-2 h-4 w-full rounded-md bg-paper-2" />
              <div className="mt-2 h-5 w-16 rounded-md bg-paper-2" />
              <div className="mt-4 h-11 w-[8.25rem] rounded-md bg-paper-2" />
              <div className="mt-2 h-11 w-full rounded-md bg-paper-2" />
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}
