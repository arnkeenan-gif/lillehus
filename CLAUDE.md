# Det lille hus på landet

Danish-only website for a small farm bakery, pizza wagon and café in Herlufmagle (South Zealand), run by Kristine Kjær Schmeling. Next.js 16 App Router, React 19, TypeScript, Tailwind v4. Deployed on Vercel from github.com/arnkeenan-gif/lillehus.

## Read first

1. `DESIGN.md`: the design rules. Not optional.
2. `content/site.json`: the business facts (address, hours, phone, CVR, socials).
3. `src/lib/cms/types.ts`, `src/lib/cms/ordering-types.ts` and `src/lib/cms/events-types.ts`: the typed shapes pages receive from the CMS façade.
4. `content/images.json`: what every photo in `public/images` shows and where it fits.

## Commands

```bash
npm run dev          # http://localhost:3000
npm run build
npm run lint
npx tsc --noEmit
```

Before you report a task as done: `npx tsc --noEmit && npm run lint && npm run build` must all pass with no errors.

## Structure

```
src/app                 routes with Danish slugs (bagvaerk, kager, fryser, pizza, arrangementer, find-os, om-os, kontakt, ...)
src/components/ui       primitives: Button, Field/Input/Select/Textarea/Checkbox, Container, Section
src/components/site     header, footer, mobile nav
src/components/shop     bakery shop UI (cart, product tiles, checkout)
src/components/forms    booking, request, contact and newsletter forms
src/components/home     forside sections
src/lib                 site.ts, content.ts, format.ts, cn.ts, plus stripe/resend helpers
src/emails              React Email templates; shared shell in src/emails/_layout.tsx
content                 JSON and markdown that Kristine can edit
public/images           real photos (see content/images.json)
```

## Content comes from the CMS

Kristine edits everything in Sanity Studio at `/studio`. Pages read content through the façade in `src/lib/cms` (`getPage(slug)`, `getSiteSettings()`, `getLocations()`, `getPizzaSettings()`, `getFaq()`, `getInstagramImages()`, `getNavigation()`; ordering: `getPickupLocations()`, `getOrderingSettings()`, `getBakeryCategories()`, `getBakeryProducts()`, `getCakeProducts()`, `getCakeProduct(id)`; events: `getEvents()`, `getEvent(slug)`, `getEventCategories()`, `getEventCategory(slug)`), which returns Sanity data when `NEXT_PUBLIC_SANITY_PROJECT_ID` is set and otherwise the JSON in `content/` and `content/cms-fallback/pages/`. Never read `content/*.json` directly from a page; go through the façade so both sources render the same. Pages are lists of sections (`Section` union in `src/lib/cms/types.ts`) rendered by `src/components/sections/render.tsx`.

## Ownership lanes (third pass: Kristine's arbejdsbeskrivelse of 6 October 2026)

Three lanes work in parallel. Edit only files in your lane; if you need a change elsewhere, write it in your report. Never run git. Import icons from `@sanity/icons` directly instead of editing `src/sanity/icons.ts`. Do not edit `src/lib/content.ts`, `src/lib/cms/{from-sanity}.ts` or another lane's files.

- **Ordering lane (Bestilling):** `src/app/bagvaerk/**`, `src/app/kager/**`, `src/app/api/stripe/**`, `src/lib/{stripe,products,cart,cart-pickup,cart-order}.ts`, `src/lib/ordering/**`, `src/components/shop/**`, `src/components/ordering/**`, `src/components/sections/{product-strip,cake-list}.tsx`, `src/components/forms/cake-request-form.tsx`, `src/app/actions/cake-request.ts`, `src/emails/{order,cake}-*.tsx`, `src/lib/cms/ordering.ts`, `src/lib/cms/ordering-*.ts` (may ADD to `ordering-types.ts`, never rename or remove), `src/sanity/schemas/ordering.ts`, `src/sanity/schemas/documents/{product,cake,shopSettings}.ts`, `src/sanity/schemas/ordering/**`, `src/sanity/desk/ordering.ts`, `src/sanity/actions/**`, `src/sanity/lib/queries-ordering.ts`, `sanity.config.ts` (document actions only), `scripts/seed-ordering.ts`, `content/shop.json`, `content/ordering/**`, `content/cms-fallback/pages/{bagvaerk,kager}.json`, `next.config.ts` (redirects only).
- **Events lane (Arrangementer):** `src/app/arrangementer/**`, `src/components/events/**`, `src/components/sections/events.tsx`, `src/components/forms/{event-signup-form,course-interest-form}.tsx`, `src/app/actions/{event-signup,course-interest}.ts`, `src/emails/event-*.tsx`, `src/lib/events/**`, `src/lib/cms/events.ts`, `src/lib/cms/events-*.ts`, `src/sanity/schemas/events.ts`, `src/sanity/schemas/events/**`, `src/sanity/desk/events.ts`, `src/sanity/lib/queries-events.ts`, `scripts/seed-events.ts`, `content/events.json`, `content/events/**`, `content/cms-fallback/pages/arrangementer.json`.
- **Content lane (Indhold):** everything about pages and the shared CMS core not listed above: `src/components/sections/**` (except the two ordering files and events.tsx), `src/components/cms/**`, `src/components/site/**`, `src/app/page.tsx`, `src/app/{om-os,find-os,faq,levering,handelsbetingelser,privatlivspolitik,kontakt,pizza,firmaaftaler,fryser,aabningstider}/**`, `src/app/not-found.tsx`, `src/lib/cms/{index,types,sections,sanity,fallback,fallback-pages,blocks}.ts`, `src/lib/cms/portable-text.tsx`, `src/sanity/schemas/{index,objects,sections,helpers,constants}.ts`, `src/sanity/schemas/documents/{siteSettings,hours,pizzaSettings,page,faqItem,instagramPost}.ts`, `src/sanity/structure.ts`, `src/sanity/lib/queries.ts`, the pizza, contact, company and newsletter forms, actions and emails plus `form-status.tsx`, `form-state.ts`, `options.ts` and `src/emails/_layout.tsx`, `content/{site,pizza,faq,images}.json`, `content/pages/**`, `content/cms-fallback/pages/*.json` (except bagvaerk, kager, arrangementer), `scripts/seed-sanity.ts`, `public/images/**`.
- **Foundation (integrator):** `src/app/layout.tsx`, `globals.css`, `src/components/ui/**`, `src/lib/{site,content,format,cn,resend}.ts`, `src/lib/cms/from-sanity.ts`, `DESIGN.md`, this file.

Cross-lane contracts: the content lane reads pickup locations only through `getPickupLocations()` and `getOrderingSettings()` from `@/lib/cms` (types in `src/lib/cms/ordering-types.ts`). The Stripe webhook (ordering lane) calls `handleEventCheckoutCompleted()` from `src/lib/events/stripe.ts` (events lane) for sessions with `metadata.kind === "event"`. Each lane writes its own seed script; the integrator wires them into `npm run seed:sanity`.

## Rules

- Server Components by default. `"use client"` only in leaf components that need state, effects or browser APIs.
- Every user-facing string in Danish. Prices are integers in øre; format with `formatPrice()`.
- No em-dashes or en-dashes anywhere in the repo's visible text.
- Icons from `@phosphor-icons/react` only (`/dist/ssr` entry in server components).
- Images through `next/image` from `/public/images` with Danish alt text.
- Do not add dependencies without listing them in your report. Available: `motion`, `@phosphor-icons/react`, `stripe`, `resend`, `@react-email/components`, `zod`.
- Environment variables are documented in `.env.example`. Every integration must degrade gracefully when its key is missing: the shop still lists products, forms still validate and show a clear Danish message.
- Never commit secrets. Never run git commands; the integrator commits.
- Kristine must be able to change content without touching TypeScript: keep copy in `content/` where the lane defines it, and keep image paths in JSON.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
