# DESIGN.md

Design rules for the Det lille hus på landet website. Read this before touching any UI. These rules are distilled from the anti-slop taste skill, Emil Kowalski's design-engineering notes and Vercel's web interface guidelines, then fitted to this one client. They are not suggestions.

## 1. Design read

Reading this as: a rebuild of a countryside bakery, pizza-wagon and farm-café site for local Danish families who order bread for pickup and book the pizza wagon for a christening or a birthday. Plain-spoken, warm, trust-first small-business commerce. Native CSS through Tailwind v4 tokens, one sans-serif family, real photography, no component library.

Dials: DESIGN_VARIANCE 5, MOTION_INTENSITY 2, VISUAL_DENSITY 4.

Mode: redesign, overhaul. The Wix site was an untouched template ("Bump & Beyond", teal accent, "Minhjemmeside" title). What we preserve from the client: the name, the hand-drawn logo, the rust colour from her printed loyalty and business cards, her voice, and every real photo.

Who it is for: people around Herlufmagle and Næstved on their phones, often early in the morning, often not young. Somebody who has never bought anything online should be able to order rugbrød for Thursday on the first try. Mobile is the primary view.

## 2. Palette

All tokens live in `src/app/globals.css`. Use only these; the Tailwind default palette is disabled.

| token | hex | use |
|---|---|---|
| paper | #fafaf8 | page background. Near-white like her printed cards. Not cream. |
| paper-2 | #f1f0ec | tinted sections, footer, disabled inputs |
| paper-3 | #e6e4de | hover on tinted surfaces |
| line | #d9d7d0 | hairlines, input borders |
| ink | #1d1d1b | headings, primary text, the logo |
| ink-2 | #3d3d39 | body paragraphs |
| muted | #626360 | captions, helper text (5.9:1 on paper) |
| rust | #a9522b | THE accent. Primary buttons, prose links, focus rings, selected states |
| rust-deep | #8f4322 | hover |
| rust-tint | #f5e9e1 | selection, notices, selected pickup day |
| danger / danger-tint | #9a3f2e / #f6e9e5 | form errors only |
| white | #ffffff | button labels, form controls |

Rules
- One accent. Rust is justified because it is on the loyalty card in every regular's wallet; it is not a mood choice. Do not add a green, a gold or a second warm colour to the UI. The photographs bring the greens and browns.
- No gradients, no glows, no glass, no pure black, no coloured shadows. `shadow-soft` (ink-tinted) only on floating UI: the cart drawer, a popover, a sticky order summary.
- Section backgrounds: `paper` by default, `paper-2` to separate a neighbour at most twice per page, `ink` never for a whole section.

## 3. Type

Familjen Grotesk (Google Fonts, variable 400 to 700, Latin Extended so æ ø å are native). Loaded with next/font in `layout.tsx`. One family for everything; no serif, no mono.

| role | utility | notes |
|---|---|---|
| display | `text-display font-semibold` | hero headline only, max 2 lines |
| title | `text-title font-semibold` | page and section headings |
| body | default 16px / 1.55, `text-ink-2` | paragraphs, max-w 65ch |
| ui | `text-[0.95rem]` | nav, buttons, table cells |
| small | `text-sm text-muted` | helper, captions, meta |
| numbers | add `tnum` | prices, times, order numbers |

Emphasis is weight or ink vs ink-2, never colour, never italic in headlines.

Danish typography
- Prices: `formatPrice()` gives "45 kr." and "45,50 kr.". Never "DKK 45.00" in the UI.
- Times: "kl. 9 til 14" or "9-14" in tables. Dates: "fredag den 11. september". Weekdays are lowercase mid-sentence.
- No em-dash or en-dash characters anywhere: not in copy, labels, alt text or comments that could render. Use a comma, a period, a colon or a hyphen.
- Quotation marks: "such" with straight double quotes, sparingly.

## 4. Shape and surfaces

- `rounded-md` (6px) for every button, input, image and card. `rounded-lg` (10px) only for the cart drawer and full-width photo bands. Never pills, never sharp corners.
- Prefer hairlines and whitespace over cards. A bordered card is allowed only when it groups one interactive unit: a product tile with its add button, an order summary, an event with its sign-up.
- Hairlines: `border-line`. One divider between rows, never top and bottom on every row.
- Touch targets 44px minimum (`size-11`, `h-11`).

## 5. Layout

- `Container` 1200px (narrow 760 for prose). `Section` gives 56px / 80px vertical rhythm.
- Hero: split at lg (text left, photo right), stacked below. Fits the first viewport. Max four text elements: headline, one sentence, one primary and one secondary button. Top padding never more than 6rem.
- Navigation is one line at lg, 72px tall, sticky, seven items plus cart. Below lg: hamburger to a full-screen list.
- Layout families available: split text and photo; full-bleed photo band with caption below; product grid (2 / 3 / 4 columns); two-column facts list (hours, locations); single-column prose; photo strip (Instagram); accordion (FAQ); form with a side summary.
- Use each family at most once per page. Never three identical cards in a row as the "what we offer" move. Never more than two consecutive text-and-photo splits.
- No eyebrows (small uppercase tracked labels above headings) except at most one per page, and none on the forside.
- Every multi-column layout declares its mobile fallback in the same component.

## 6. Motion (level 2)

- Hover and active: 150ms `ease-out-quart` on colour and transform; buttons `active:scale-[0.98]`.
- Cart drawer and mobile menu: 240ms slide or fade with `motion` (`import { motion, AnimatePresence } from "motion/react"`), in a `"use client"` leaf.
- Sections: no scroll animation by default. If a page really benefits, one 12px fade-up on first view with `whileInView` and `viewport={{ once: true }}`; it must be disabled under `prefers-reduced-motion` (`useReducedMotion`).
- Nothing loops, nothing parallaxes, no marquee, no counters, no cursor effects, no `window.addEventListener("scroll")`.

## 7. Imagery

- Only real photographs from `public/images`. `content/images.json` describes each one; read it before choosing. No stock, no generated images, no illustrations, no decorative SVGs, no icons as decoration.
- `next/image` with `sizes`; fixed aspect ratios so nothing jumps: 4/5 for product tiles, 3/2 for editorial photos, 16/9 for wide bands, 1/1 for the Instagram strip.
- Nothing over a photo: no text, no pills, no badges, no gradients. Captions go below in `text-sm text-muted`.
- Alt text is a plain Danish description of what is in the picture.
- Icons: `@phosphor-icons/react` only, weight regular, 20 to 24px, always with visible or sr-only text. Server components import from `@phosphor-icons/react/dist/ssr`.
- The logo (`/images/logo.png`, transparent, ink-coloured) is used large: hero, footer, about. The header uses the text wordmark.

## 8. Copy

All user-facing text is Danish, "du"-form, in Kristine's voice: short, warm, concrete, a little dry ("Klar, parat..... Bag!", "Vi glæder os til at hygge om jer"). Write it as she would say it across the counter.

- Headlines up to 8 words. Sub-paragraphs up to 25 words. No exclamation-mark marketing.
- Banned words: oplev, unik, eksklusiv, passion, lækkerier as a noun for everything, skræddersyet, "en verden af", plus English filler (elevate, seamless, next-gen).
- No emojis in the UI. No fake reviews, fake quotes or invented numbers. Real quotes only with permission.
- One label per intent, everywhere on the site:

| intent | label |
|---|---|
| order bread | Bestil brød |
| cake request | Forespørg på kage |
| pizza booking | Book pizzavognen |
| event sign-up | Tilmeld dig |
| contact | Skriv til os |
| newsletter | Tilmeld |
| cart | Kurv |
| checkout | Gå til betaling |
| back to shop | Tilbage til bageriet |

- Before finishing, read every visible string aloud. If it sounds like an advert, rewrite it as a sentence.

## 9. Forms

- Use `Field`, `Input`, `Select`, `Textarea`, `Checkbox` from `src/components/ui/field.tsx`. Label above, helper text in markup, error below in `danger`, `aria-invalid` on the control, `aria-describedby` pointing at the error.
- Required fields marked with `*` and validated with zod in a server action. Show the first error per field, inline. Keep what the user typed.
- A hidden honeypot field on every public form. Rate-limit by IP in memory.
- Submit button shows a pending state ("Sender...") and is disabled while pending.
- Success replaces the form with a plain confirmation that says what happens next and when ("Kristine vender tilbage inden for to hverdage").
- Missing configuration (no Resend key, no Stripe key) must fail gracefully with a Danish message, never a stack trace.

## 10. Print

`/bageri/tak` (order confirmation) prints on one A4 page: header, footer and buttons carry `no-print`; black on white; order number, pickup day, the lines with quantities and prices, total, customer name and phone, note. Kristine prints these as her baking list.

## 11. Accessibility

`lang="da"`; visible focus ring on everything focusable; every icon-only control has sr-only text; contrast AA or better; reduced motion honoured; forms fully operable by keyboard; headings in order; one h1 per page; `min-h-[100dvh]` never `h-screen`.

## 12. Forbidden list

Em-dashes; eyebrows above every heading; section numbering ("01 / Om os"); three equal feature cards; gradient or blob heroes; glassmorphism; neon, glows or purple; Inter, Geist, Fraunces, Instrument Serif, Playfair; text or labels over photos; decorative dots; scroll cues; "trusted by" strips; fake testimonials; fake precision; version labels; Lorem ipsum; placeholder as label; emoji; `h-screen`; scroll listeners; hand-drawn SVG icons; div-built fake screenshots; dark-mode sections inside a light page.
