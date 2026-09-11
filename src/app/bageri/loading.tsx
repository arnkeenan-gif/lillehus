import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";

const TILES = [0, 1, 2, 3, 4, 5, 6, 7];

/** Skeleton in the shape of the product grid. Static blocks, nothing pulses, no borders. */
export default function Loading() {
  return (
    <Section aria-busy="true">
      <Container size="wide">
        <span className="sr-only">Henter varerne</span>
        <div className="max-w-[40rem]" aria-hidden="true">
          <div className="h-10 w-80 max-w-full rounded-md bg-paper-2" />
          <div className="mt-6 h-6 w-full rounded-md bg-paper-2" />
          <div className="mt-2 h-6 w-4/5 rounded-md bg-paper-2" />
        </div>
        <div className="mt-14 h-7 w-20 rounded-md bg-paper-2 sm:mt-20" aria-hidden="true" />
        <div className="mt-6 grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3 xl:grid-cols-4" aria-hidden="true">
          {TILES.map((i) => (
            <div key={i} className="flex flex-col">
              <div className="aspect-[4/5] rounded-md bg-paper-2" />
              <div className="mt-3 h-5 w-3/4 rounded-md bg-paper-2" />
              <div className="mt-2 h-4 w-full rounded-md bg-paper-2" />
              <div className="mt-2 h-5 w-14 rounded-md bg-paper-2" />
              <div className="mt-5 h-11 w-full rounded-md bg-paper-2" />
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}
