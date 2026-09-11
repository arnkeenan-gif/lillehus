# DESIGN.md

Design rules for the Det lille hus på landet website, second pass. Read this before touching any UI. The first pass was correct but anonymous: a stack of equally tall sections, a text-left / photo-right hero, bordered tiles, facts tables, tinted bands. That is the rhythm every template and every language model produces. This pass replaces it. The rules come from studying current Danish bakery sites that feel real (Hart, Juno, Lille, Andersen & Maillard) and from the anti-slop taste skill; where the two disagree, this file wins.

## 1. What the real ones do

- Photography carries the page. Big, candid, imperfect photos, edge to edge. The interface is nearly invisible around them.
- One plain grotesk used with confidence. No "artisan" display fonts, no scripts, no serif-for-warmth. Warmth comes from the pictures and the words.
- One brand colour used flat and boldly: a whole section in it, not just buttons.
- Practical facts everywhere: hours in the hero copy, in the footer, on the contact page. Nobody has to hunt for when the freezer is open.
- Fewer boxes. Product tiles are photo, name, price. Lists are lists. Nothing is wrapped in a card unless it has a button in it.

## 2. Design read

Reading this as: a countryside bakery and pizza-wagon site for local Danish families, in the register of a good Copenhagen bakery site but with a farm's warmth and a hand-drawn logo. Photographic, plain-spoken, trust-first commerce. Native CSS through Tailwind v4 tokens. Everything editable in Sanity.

Dials: DESIGN_VARIANCE 6, MOTION_INTENSITY 2, VISUAL_DENSITY 3.

## 3. Palette

Tokens live in `src/app/globals.css`. Only these exist.

| token | hex | use |
|---|---|---|
| paper | #fafaf8 | page background |
| paper-2 | #f1f0ec | the one tinted surface (footer, form fields on rust, disabled) |
| line | #d9d7d0 | hairlines, input borders |
| ink | #1d1d1b | text, the logo |
| ink-2 | #3d3d39 | body paragraphs |
| muted | #626360 | captions, helper text |
| rust | #a9522b | the brand colour: primary buttons, links, and ONE full-bleed section per page in solid rust with paper text |
| rust-deep | #8f4322 | hover |
| rust-tint | #f5e9e1 | selected states, the announcement bar |
| danger / danger-tint | #9a3f2e / #f6e9e5 | form errors only |
| white | #ffffff | button labels, controls |

Rules: no gradients, no glass, no glow, no shadows except `shadow-soft` on the cart drawer. Tinted sections are not a rhythm device any more: at most one `paper-2` section per page besides the footer. The rust block is the colour moment; the rest is paper and photographs.

## 4. Type

Familjen Grotesk only (Google, variable 400 to 700, Latin Extended). It stays because it is Scandinavian, unfussy and has enough character in the bold. What changes is how it is used.

| role | utility | notes |
|---|---|---|
| display | `text-display font-semibold tracking-tight` | 36 to 64px (clamp), page openings and the rust block. Two lines max. The cover hero uses 32 to 44px. |
| title | `text-title font-semibold` | 24 to 32px, section headings |
| lead | `text-xl sm:text-2xl text-ink` | the "this week" block and intro sentences: large body, not a heading |
| body | 17px / 1.55, `text-ink-2`, max-w 62ch | |
| ui | 15px | nav, buttons, table cells |
| small | 14px `text-muted` | captions, helper |
| numbers | `tnum` | prices, times |

No uppercase tracking labels anywhere. No italics in headings. Headings are sentences a person would say ("Her får du fat i brødet"), never category labels ("Produkter").

## 5. Layout language

- Container 1200px; `size="wide"` 1400px for photo grids; full-bleed for the hero, the rust block and photo bands.
- The forside is a shop window, not a stack. Section order and content come from Sanity; the section components are:
  1. `hero`, variant `cover` (the default, what the Copenhagen sites do): the photograph fills the first screen edge to edge (82svh, min 540px), the header floats transparent over it in white and turns to paper once the photo has scrolled past, and a two-line headline of at most five words with two small underlined uppercase links sits at the bottom left of the photo. A gradient scrim darkens the top and bottom edges only. No paragraph. With two or more slides the photo crossfades to the next every 5 seconds (1 second fade, paused under reduced motion and while the tab is hidden, with a small pause button bottom right); the words stay put. Square and portrait photos (phone shots) are shown two at a time on desktop, side by side edge to edge, so nothing is stretched or cropped to a strip; a landscape photo fills the band alone. Phones always show one portrait crop. Needs a photo at least 1800px wide (2000+ preferred); smaller files use variant `stacked`: the photo in the container, the headline and one sentence on paper below it.
  2. `richText` with `imagePosition`: prose beside a photo; the "this week" block uses this with `lead` size text and no heading.
  3. `priceList`: the chalkboard as typography. A two-column list on desktop, one on phones, each row "Surdejsbrød .......... 55 kr." with dotted leaders (`border-bottom: 1px dotted` on a flex spacer), tabular prices, a footnote. No photos per row. Kristine edits rows freely.
  4. `productStrip`: photo (4/5), name, price, nothing else, four across, no borders, no buttons; the whole tile links to the shop.
  5. `gallery`: a mixed grid, first image spans two columns and two rows, the rest fill (CSS grid, `grid-cols-2 md:grid-cols-4`, `auto-rows`), gap 8px, no captions in the grid, no overlays. This replaces the Instagram strip; Kristine drops in her own photos.
  6. `photoBand`: one photo full width with a caption below.
  7. `cta` with `tone: rust`: the full-bleed rust block, display text in paper, one paper-outline button, optional photo bleeding on the right half.
  8. `hours`: the two locations as large text, not a table: "Torvedag i Næstved, onsdag og lørdag kl. 9 til 14" as a sentence with the hours in bold, then the freezer. A map link each.
  9. `events`: a list of date, title, place with a hairline between; empty state is one sentence.
  10. `faq`: `<details>` accordion, hairlines.
  11. `form`: the booking, request and contact forms.
  12. `quote`: only for real words from real people.
- Section spacing is not uniform: hero to the next block 40px; between text blocks 80 to 120px; photo bands can touch each other with 8px gaps.
- Never two consecutive text-and-photo splits. Never three equal cards. Never a heading on every section: at most half the sections on a page carry a heading.
- Header: 72px, paper, one line, seven items, cart. Below lg: hamburger to a full-screen list. The announcement bar (from Sanity) sits under the header in `rust-tint` when enabled.

## 6. Imagery

- Photos are the design. Use them big. A photo smaller than 320px wide on desktop is a thumbnail and must earn its place.
- Aspect ratios are fixed per slot (hero 16/9 and 4/5, band 21/9 or 3/2, tiles 4/5, gallery cells 1/1 with one 2x2 cell). `next/image` with `sizes`, `priority` only on the hero.
- The hand-drawn logo (`/images/logo.png`) is the one handmade element. It appears large beside the footer address and once inside the om-os story, never as a tiny icon, and never in the section directly above the footer (two big logos next to each other look like a mistake).
- Nothing over photos: no text, pills, gradients or icons. Captions go below in `text-sm text-muted`.
- Real photographs only, ever. Sources: Kristine's own photos uploaded in Sanity, and the real photos already in `public/images` (from her old site, Facebook and Instagram). No generated images, no stock, no illustrations. When a slot has no good photo, the layout drops the photo rather than filling it with something fake.
- Icons: Phosphor regular, 20 to 24px, only where they carry meaning (map pin, external link, cart, menu, close, plus, minus).

## 7. Motion (level 2)

Hover and active transitions 150ms `ease-out-quart`. The cart drawer and the mobile menu slide 240ms with `motion/react`, disabled under reduced motion. No scroll animations, no parallax, no marquee, nothing that loops.

## 8. Copy

Danish, "du"-form, in Kristine's voice: short, warm, dry, concrete ("Klar, parat..... Bag!"). Headlines are things she would say. No "Velkommen til", no "oplev", "unik", "eksklusiv", "passion", "skræddersyet", no exclamation-mark marketing, no emojis, no em-dashes or en-dashes anywhere. One label per intent: Bestil brød, Forespørg på kage, Book pizzavognen, Tilmeld dig, Skriv til os, Tilmeld, Kurv, Gå til betaling, Tilbage til bageriet. Every string that Kristine might want to change lives in Sanity, with the JSON fallback carrying the same words.

## 9. Forms, print, accessibility

Unchanged from the first pass: `Field` primitives, label above, error below, honeypot, pending states, calm Danish success copy; the order confirmation prints on one A4 page; `lang="da"`, visible focus, sr-only text on icon buttons, contrast AA, 44px targets, reduced motion honoured, `min-h-[100dvh]` never `h-screen`.

## 10. Forbidden

Everything in the first pass list, plus: tinted-section alternation as rhythm; facts tables where a sentence would do; bordered product tiles; hairlines under every row; headings on every section; the text-left photo-right hero; eyebrow labels; "artisan" display fonts (Amatic, Caveat, Fraunces, Playfair, Instrument Serif); floating pill navbars; glass; double-bezel cards; blur-fade entrance animations; button-in-button arrows; mesh gradients; anything from the "Awwwards agency" recipe.
