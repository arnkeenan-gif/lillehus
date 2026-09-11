# Det lille hus på landet

Danish-only website for a small farm bakery, pizza wagon and café in Herlufmagle (South Zealand), run by Kristine Kjær Schmeling. Next.js 16 App Router, React 19, TypeScript, Tailwind v4. Deployed on Vercel from github.com/arnkeenan-gif/lillehus.

## Read first

1. `DESIGN.md`: the design rules. Not optional.
2. `content/site.json`: the business facts (address, hours, phone, CVR, socials).
3. `src/lib/content.ts`: the typed contract for products, cakes, events, FAQ and pizza content.
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
src/app                 routes with Danish slugs (bageri, kager, pizza, arrangementer, find-os, om-os, kontakt, ...)
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

Kristine edits everything in Sanity Studio at `/studio`. Pages read content through the façade in `src/lib/cms` (`getPage(slug)`, `getSiteSettings()`, `getLocations()`, `getShopSettings()`, `getPizzaSettings()`, `getProducts()`, `getCakes()`, `getEvents()`, `getFaq()`, `getInstagramImages()`, `getNavigation()`), which returns Sanity data when `NEXT_PUBLIC_SANITY_PROJECT_ID` is set and otherwise the JSON in `content/` and `content/cms-fallback/pages/`. Never read `content/*.json` directly from a page; go through the façade so both sources render the same. Pages are lists of sections (`Section` union in `src/lib/cms/types.ts`) rendered by `src/components/sections/render.tsx`.

## Ownership lanes (second pass)

- CMS lane (done): `sanity.config.ts`, `sanity.cli.ts`, `src/sanity/**`, `src/app/studio/**`, `src/app/api/revalidate/**`, `src/lib/cms/**`, `scripts/**`, `content/cms-fallback/**`.
- Pages lane: `src/components/sections/**`, `src/components/cms/**`, `src/components/site/**` (header with nav and announcement bar, footer), `src/app/page.tsx`, `src/app/{om-os,find-os,faq,levering,handelsbetingelser,privatlivspolitik,kontakt,pizza,kager,arrangementer,firmaaftaler}/page.tsx`, `src/app/not-found.tsx`, `content/cms-fallback/pages/*.json` (copy and section order), `content/images.json`. Removes `src/components/home/**` once nothing imports it.
- Shop and forms lane: `src/app/bageri/**`, `src/app/api/stripe/**`, `src/lib/{stripe,products,cart*}.ts`, `src/components/shop/**`, `src/components/forms/**` (keep every export name and prop shape; the pages lane renders them from `formSection`), `src/app/actions/**`, `src/emails/**`, `content/{products,cakes,events,pizza,shop}.json`.
- Foundation: `src/app/layout.tsx`, `globals.css`, `src/components/ui/**`, `src/lib/{site,content,format,cn,resend}.ts`, `DESIGN.md`, this file.

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
