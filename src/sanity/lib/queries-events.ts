/**
 * GROQ for the events façade (src/lib/cms/events-sanity.ts). Hidden events
 * are filtered out here, so they never reach a page. Images come back with
 * the asset's URL, size and blur placeholder plus Kristine's hotspot and
 * crop, the same shape as in queries.ts. Owned by the events lane.
 */
import { defineQuery } from "next-sanity";

const IMAGE = /* groq */ `{
  alt,
  hotspot { x, y, width, height },
  crop { top, bottom, left, right },
  asset->{ _id, url, metadata { lqip, dimensions { width, height } } }
}`;

const CATEGORY = /* groq */ `{
  _id,
  title,
  "slug": slug.current,
  intro,
  sort
}`;

const EVENT = /* groq */ `{
  _id,
  title,
  "slug": slug.current,
  summary,
  description,
  "image": image ${IMAGE},
  start,
  end,
  place,
  priceOere,
  signup,
  payment,
  signupDeadline,
  capacity,
  "category": category->${CATEGORY}
}`;

/** Every subcategory of Arrangementer, in Kristine's order. */
export const EVENT_CATEGORY_LIST_QUERY = defineQuery(
  /* groq */ `*[_type == "eventCategory" && defined(slug.current)] | order(coalesce(sort, 100) asc, title asc) ${CATEGORY}`,
);

/** Every visible event, past ones included (their pages stay up), oldest first. */
export const EVENT_LIST_QUERY = defineQuery(
  /* groq */ `*[_type == "event" && defined(slug.current) && defined(start) && hidden != true] | order(start asc) ${EVENT}`,
);
