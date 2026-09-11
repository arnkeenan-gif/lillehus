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

## Ownership lanes

Several people work in parallel. Stay inside your lane; if you need a change elsewhere, write it in your final report instead of editing.

- Foundation (done): `src/app/layout.tsx`, `globals.css`, `not-found.tsx`, `src/components/ui/**`, `src/components/site/**`, `src/lib/{site,content,format,cn,resend}.ts`, `src/emails/_layout.tsx`, `content/site.json`, `content/images.json`, `content/shop.json` (shop lane may edit values), `DESIGN.md`, this file.
- Shop lane: `src/app/bageri/**`, `src/app/api/stripe/**`, `src/lib/{stripe,products,cart}*`, `src/components/shop/**` (replace the placeholder `cart-button.tsx`), `src/emails/order-*.tsx`, `content/products.json`.
- Forms lane: `src/app/{pizza,kager,arrangementer,kontakt,firmaaftaler}/**`, `src/app/actions/**`, `src/lib/rate-limit.ts`, `src/emails/{booking,cake,contact,event,newsletter}-*.tsx`, `src/components/forms/**` (replace the placeholder `newsletter-form.tsx`), `content/{cakes,events,pizza}.json`.
- Pages lane: `src/app/page.tsx`, `src/app/{om-os,find-os,faq,levering,handelsbetingelser,privatlivspolitik}/**`, `src/components/home/**`, `content/faq.json`, `content/pages/**`.

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
