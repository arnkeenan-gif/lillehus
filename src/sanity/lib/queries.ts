/**
 * GROQ for every façade function. Images always come back with the asset's
 * URL, size and blur placeholder plus the hotspot and crop Kristine set.
 * The client runs with perspective "published", so drafts never leak.
 */
import { defineQuery } from "next-sanity";

const IMAGE = /* groq */ `{
  alt,
  hotspot { x, y, width, height },
  crop { top, bottom, left, right },
  asset->{ _id, url, metadata { lqip, dimensions { width, height } } }
}`;

const LINK = /* groq */ `{ label, href }`;

const PRODUCT = /* groq */ `{
  _id,
  "slug": slug.current,
  name,
  description,
  priceOere,
  "image": image ${IMAGE},
  category,
  days,
  allergens,
  active,
  sort,
  stripePriceId
}`;

const CAKE = /* groq */ `{
  _id,
  "slug": slug.current,
  name,
  description,
  fromPriceOere,
  priceNote,
  servings,
  leadTimeDays,
  "image": image ${IMAGE},
  options,
  sort
}`;

const EVENT = /* groq */ `{
  _id,
  "slug": slug.current,
  title,
  kind,
  start,
  end,
  place,
  description,
  priceOere,
  signup,
  capacity,
  "image": image ${IMAGE}
}`;

const FAQ = /* groq */ `{ _id, question, answer, group, sort }`;

/** Every section field, with images resolved and references followed. Fields a section does not have come back null. */
const SECTIONS = /* groq */ `sections[]{
  ...,
  "image": image ${IMAGE},
  "images": images[]{ _key, caption, "image": image ${IMAGE} },
  "primaryLink": primaryLink ${LINK},
  "secondaryLink": secondaryLink ${LINK},
  "link": link ${LINK},
  "products": products[]->${PRODUCT},
  "items": items[]->${FAQ}
}`;

export const SITE_SETTINGS_QUERY = defineQuery(/* groq */ `*[_type == "siteSettings" && _id == "siteSettings"][0]{
  ...,
  "logo": logo ${IMAGE}
}`);

export const HOURS_QUERY = defineQuery(/* groq */ `*[_type == "hours" && _id == "hours"][0]{
  locations[]{ id, name, subtitle, address, mapsUrl, hours[]{ days, time, note }, pickup, notes }
}`);

export const SHOP_SETTINGS_QUERY = defineQuery(/* groq */ `*[_type == "shopSettings" && _id == "shopSettings"][0]{ ... }`);

export const PIZZA_SETTINGS_QUERY = defineQuery(/* groq */ `*[_type == "pizzaSettings" && _id == "pizzaSettings"][0]{ ... }`);

export const PAGE_QUERY = defineQuery(/* groq */ `*[_type == "page" && slug.current == $slug][0]{
  _id,
  title,
  "slug": slug.current,
  seo { title, description, "image": image ${IMAGE} },
  showInNav,
  navLabel,
  navOrder,
  hidden,
  ${SECTIONS}
}`);

export const PAGES_QUERY = defineQuery(/* groq */ `*[_type == "page" && defined(slug.current)] | order(navOrder asc, title asc){
  _id,
  title,
  "slug": slug.current,
  showInNav,
  navLabel,
  navOrder,
  hidden
}`);

export const PRODUCTS_QUERY = defineQuery(/* groq */ `*[_type == "product" && active == true && defined(slug.current)] | order(sort asc, name asc) ${PRODUCT}`);

export const PRODUCT_QUERY = defineQuery(/* groq */ `*[_type == "product" && active == true && slug.current == $slug][0] ${PRODUCT}`);

export const CAKES_QUERY = defineQuery(/* groq */ `*[_type == "cake" && defined(slug.current)] | order(sort asc, name asc) ${CAKE}`);

export const EVENTS_QUERY = defineQuery(/* groq */ `*[_type == "event" && defined(start)] | order(start asc) ${EVENT}`);

export const FAQ_QUERY = defineQuery(/* groq */ `*[_type == "faqItem"] | order(sort asc, question asc) ${FAQ}`);

export const INSTAGRAM_QUERY = defineQuery(/* groq */ `*[_type == "instagramPost" && defined(image.asset)] | order(sort asc, _createdAt desc){
  _id,
  "image": image ${IMAGE},
  url,
  sort
}`);
