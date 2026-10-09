/**
 * GROQ for ordering: categories, products, cakes, pickup locations and the
 * ordering part of "Bageri og bestilling". Owned by the ordering lane; the
 * façade in src/lib/cms/ordering-sanity.ts runs these and maps the answers.
 * Hidden products and cakes (active == false) never leave Sanity.
 */
import { defineQuery } from "next-sanity";

const IMAGE = /* groq */ `{
  alt,
  hotspot { x, y, width, height },
  crop { top, bottom, left, right },
  asset->{ _id, url, metadata { lqip, dimensions { width, height } } }
}`;

const DEADLINE = /* groq */ `{ daysBefore, hour }`;

export const ORDERING_CATEGORIES_QUERY = defineQuery(/* groq */ `*[_type == "productCategory" && defined(slug.current)] | order(sort asc, title asc){
  _id,
  title,
  "slug": slug.current,
  description,
  sort,
  "deadline": deadline ${DEADLINE}
}`);

export const ORDERING_PRODUCTS_QUERY = defineQuery(/* groq */ `*[_type == "product" && defined(slug.current) && active != false] | order(sort asc, name asc){
  _id,
  name,
  "slug": slug.current,
  "categoryId": category->slug.current,
  description,
  priceOere,
  "image": image ${IMAGE},
  active,
  orderable,
  sort,
  "deadline": deadline ${DEADLINE}
}`);

export const ORDERING_CAKES_QUERY = defineQuery(/* groq */ `*[_type == "cake" && defined(slug.current) && active != false] | order(sort asc, name asc){
  _id,
  name,
  "slug": slug.current,
  intro,
  "images": images[] ${IMAGE},
  basePriceOere,
  optionGroups[]{
    _key,
    title,
    type,
    required,
    helper,
    choices[]{ _key, label, priceOere, isDefault }
  },
  minQuantity,
  maxQuantity,
  "deadline": deadline ${DEADLINE},
  sections[]{ _key, heading, body },
  active,
  sort
}`);

export const ORDERING_LOCATIONS_QUERY = defineQuery(/* groq */ `*[_type == "pickupLocation" && defined(slug.current)] | order(sort asc, name asc){
  _id,
  name,
  "slug": slug.current,
  active,
  address,
  note,
  mapsUrl,
  sort,
  dates[]{ _key, date, open, from, to, note }
}`);

export const ORDERING_SETTINGS_QUERY = defineQuery(/* groq */ `*[_type == "shopSettings" && _id == "shopSettings"][0]{
  "defaultDeadline": defaultDeadline ${DEADLINE},
  minOrderOere,
  notice
}`);
