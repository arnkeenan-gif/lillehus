import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Photo } from "@/components/home/photo";
import forside from "@content/pages/forside.json";

/**
 * Layout family: split text and photo. Text left and photo right from lg;
 * below lg the photo stacks under the buttons, capped at 28rem so a tablet
 * does not get a 700px square. Four text elements, nothing else.
 */
export function Hero() {
  return (
    <section className="pt-10 pb-14 sm:pt-16 sm:pb-20">
      <Container className="grid gap-10 lg:grid-cols-12 lg:items-center lg:gap-12">
        <div className="lg:col-span-7">
          <h1 className="text-display font-semibold">Brød fra gården ved Herlufmagle</h1>
          <p className="mt-6 max-w-[44ch] text-lg text-ink-2">
            Vi bager surdejsbrød, rugbrød og kanelsnegle på gården og sælger dem på Torvedag i Næstved
            onsdag og lørdag.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button href="/bageri" size="lg">
              Bestil brød
            </Button>
            <Button href="/pizza" size="lg" variant="secondary">
              Book pizzavognen
            </Button>
          </div>
        </div>
        <div className="w-full max-w-md lg:col-span-5 lg:max-w-none">
          <Photo
            src={forside.heroImage}
            ratio="1/1"
            priority
            sizes="(min-width: 1024px) 40vw, (min-width: 640px) 448px, 100vw"
          />
        </div>
      </Container>
    </section>
  );
}
