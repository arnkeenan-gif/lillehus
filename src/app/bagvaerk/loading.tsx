import { Container } from "@/components/ui/container";

const TILES = [0, 1, 2, 3, 4, 5];

/** Skeleton in the shape of the bagværk page: title, the allergen line, the button, a grid. Static blocks, nothing pulses. */
export default function Loading() {
  return (
    <Container className="pb-24 pt-12 sm:pb-32 sm:pt-20" aria-busy="true">
      <span className="sr-only">Henter bagværket</span>
      <div aria-hidden="true">
        <div className="h-10 w-56 max-w-full rounded-md bg-paper-2 sm:h-14 sm:w-72" />
        <div className="mt-6 h-7 w-full max-w-[40ch] rounded-md bg-paper-2" />
        <div className="mt-8 h-13 w-full rounded-md bg-paper-2 sm:w-56" />
        <div className="mt-20 h-8 w-24 rounded-md bg-paper-2" />
        <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-5 md:grid-cols-3 lg:gap-x-6">
          {TILES.map((i) => (
            <div key={i} className="flex flex-col">
              <div className="aspect-[4/5] rounded-md bg-paper-2" />
              <div className="mt-3 h-5 w-3/4 rounded-md bg-paper-2" />
              <div className="mt-2 h-5 w-14 rounded-md bg-paper-2" />
              <div className="mt-5 h-11 w-full rounded-md bg-paper-2" />
            </div>
          ))}
        </div>
      </div>
    </Container>
  );
}
