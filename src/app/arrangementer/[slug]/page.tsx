import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CmsPhoto, fitsWidth } from "@/components/cms/photo";
import { EventFacts } from "@/components/events/event-facts";
import { EventSignup } from "@/components/events/event-signup";
import { textLink } from "@/components/sections/heading";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { RichText, getEvent, getEvents, getSiteSettings, plainText, type CmsImage } from "@/lib/cms";
import { renderTime } from "@/lib/events/dates";
import { isSignupOpen, signupState } from "@/lib/events/status";
import { isStripeConfigured } from "@/lib/stripe";

type Props = { params: Promise<{ slug: string }> };

/** Sign-up opens and closes by the clock; render the page again at least every ten minutes. */
export const revalidate = 600;

/** Every visible event, past ones too: their pages stay up and say the event has taken place. */
export async function generateStaticParams() {
  return (await getEvents({ upcomingOnly: false })).map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEvent(slug);
  if (!event) return { title: "Arrangementet findes ikke" };
  const description = (event.summary || plainText(event.body)).slice(0, 200) || undefined;
  const image = event.photo;
  return {
    title: event.title,
    description,
    openGraph: image
      ? {
          type: "website",
          locale: "da_DK",
          title: event.title,
          description,
          images: [{ url: image.src, width: image.width, height: image.height, alt: image.alt }],
        }
      : undefined,
  };
}

/** The photo fills the column (1136px on a desktop) when the file is big enough; a small file keeps a smaller frame. */
function EventPhoto({ image }: { image: CmsImage }) {
  if (!fitsWidth(image, 1136)) {
    return (
      <CmsPhoto image={image} ratio="4/5" priority sizes="(min-width: 640px) 448px, 100vw" className="max-w-md" />
    );
  }
  return (
    <CmsPhoto
      image={image}
      ratio="4/5"
      smRatio="3/2"
      priority
      sizes="(min-width: 1264px) 1136px, 100vw"
      className="lg:max-h-[68vh]"
    />
  );
}

export default async function EventPage({ params }: Props) {
  const { slug } = await params;
  const [event, settings] = await Promise.all([getEvent(slug), getSiteSettings()]);
  if (!event) notFound();

  const state = signupState(event, { now: renderTime(), stripe: isStripeConfigured() });
  const open = isSignupOpen(state);

  return (
    <article className="pb-24 sm:pb-32">
      {event.photo ? (
        <Container className="pt-4 sm:pt-6">
          <EventPhoto image={event.photo} />
        </Container>
      ) : null}

      <Container className={event.photo ? "pt-8 sm:pt-10" : "pt-12 sm:pt-20"}>
        <h1 className="max-w-[20ch] text-balance text-display font-semibold tracking-tight text-ink">{event.title}</h1>
        {event.summary ? <p className="mt-5 max-w-[46ch] text-lead text-ink-2">{event.summary}</p> : null}

        {state.kind === "past" ? (
          <p className="mt-6 max-w-[46ch] text-lead text-ink">Arrangementet har fundet sted.</p>
        ) : null}

        <EventFacts event={event} showDeadline={open || state.kind === "closed"} className="mt-10 border-t border-line pt-6" />

        {open ? (
          <div className="mt-8">
            <Button href="#tilmeld" size="lg">
              Tilmeld dig
            </Button>
          </div>
        ) : null}

        <RichText value={event.body} className="mt-12" />

        <EventSignup event={event} state={state} settings={settings} className="mt-16 sm:mt-20" />

        <p className="mt-16">
          <Link href="/arrangementer#kalender" className={textLink}>
            Se alle arrangementer
          </Link>
        </p>
      </Container>
    </article>
  );
}
