import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EventsOverview } from "@/components/events/events-overview";
import { FormBlock } from "@/components/sections/form";
import { Container } from "@/components/ui/container";
import { getEventCategories, getEventCategory, getEvents, getPage, getSiteSettings } from "@/lib/cms";
import { renderTime } from "@/lib/events/dates";
import { DEFAULT_EMPTY_TEXT, splitEventsPage } from "@/lib/events/page-parts";

type Props = { params: Promise<{ slug: string }> };

/** Events come and go by the clock; render the page again at least every ten minutes. */
export const revalidate = 600;

export async function generateStaticParams() {
  return (await getEventCategories()).map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [category, page] = await Promise.all([getEventCategory(slug), getPage("arrangementer")]);
  if (!category) return { title: "Arrangementer" };
  return { title: category.title, description: category.intro || page?.seo.description || undefined };
}

/**
 * One subcategory of Arrangementer, such as /arrangementer/kategori/kurser:
 * its name and Kristine's short text, the category menu, the calendar and
 * the list with only this category's events, and the course interest form
 * from the arrangementer page at the bottom.
 */
export default async function EventCategoryPage({ params }: Props) {
  const { slug } = await params;
  const [category, categories, events, upcoming, page, settings] = await Promise.all([
    getEventCategory(slug),
    getEventCategories(),
    getEvents({ category: slug }),
    getEvents(),
    getPage("arrangementer"),
    getSiteSettings(),
  ]);
  if (!category) notFound();
  const { course } = splitEventsPage(page);

  return (
    <div className="pb-24 sm:pb-32">
      <Container className="pt-12 sm:pt-20">
        <h1 className="max-w-[18ch] text-balance text-display font-semibold tracking-tight text-ink">{category.title}</h1>
        {category.intro ? <p className="mt-5 max-w-[46ch] text-lead text-ink-2">{category.intro}</p> : null}
      </Container>
      <EventsOverview
        className="mt-8 sm:mt-10"
        events={events}
        categories={categories}
        active={category.slug}
        emptyText={DEFAULT_EMPTY_TEXT}
        allHref={events.length === 0 && upcoming.length > 0 ? "/arrangementer#kalender" : undefined}
        social={settings.social}
        now={renderTime()}
      />
      {course ? <FormBlock section={course} level="h2" className="mt-20 sm:mt-24 lg:mt-32" /> : null}
    </div>
  );
}
