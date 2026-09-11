# Det lille hus på landet

Hjemmesiden for bageriet, pizzavognen og gården på Torpevej 10 i Herlufmagle. Den første del af denne fil er til Kristine. Den sidste del er til den, der vedligeholder koden.

## Sådan er siden bygget op

| Side | Hvad den gør |
|---|---|
| Forsiden | Brød, torvedag, pizzavogn, det sker, Instagram |
| Bageri | Bestil brød til afhentning i Hønsehuset, betal med kort eller MobilePay, udskriv bestillingen |
| Kager | Kagetyper med fra-priser og en forespørgselsformular (du bekræfter pris og dato) |
| Pizzavogn | Priser, pizzaer, praktisk og en bookingformular (ingen betaling før du har sagt ja) |
| Arrangementer | Åbent hus, torvedag, kurser efter aftale, tilmelding til kommende arrangementer |
| Find os | Åbningstider, adresser, afhentning, kalender |
| Om os, Kontakt, Firmaaftaler, Levering, Spørgsmål og svar, Handelsbetingelser, Privatlivspolitik | Tekstsider |

Alle formularer sender en mail til dig og en kvittering til kunden. Brødbestillinger betales med det samme, og du får bestillingen som en bageliste på mail.

## Sådan retter du selv

Al tekst, der ændrer sig tit, ligger i mappen `content/` som små tekstfiler. Du retter dem direkte på GitHub: åbn filen, tryk på blyanten, ret, tryk "Commit changes". Cirka et minut senere er siden opdateret.

| Vil du ændre | Ret filen |
|---|---|
| Åbningstider, adresse, telefon, mail, links til Facebook og Instagram | `content/site.json` |
| Brød og priser i bageriet | `content/products.json` (eller i Stripe, se nedenfor) |
| Afhentningsdage, bestillingsfrist, lukkedage, levering, en besked øverst i bageriet | `content/shop.json` |
| Kagetyper, fra-priser, varsel | `content/cakes.json` |
| Pizzavognens priser, pizzaer, desserter og betingelser | `content/pizza.json` |
| Kommende arrangementer og kurser | `content/events.json` |
| Spørgsmål og svar | `content/faq.json` |
| Hvilke billeder forsiden og om os bruger | `content/pages/forside.json` og `content/pages/om-os.json` |

Priser skrives i øre uden komma: `5500` er 55 kr., `4550` er 45,50 kr.

Ugedage skrives `man`, `tir`, `ons`, `tor`, `fre`, `lør`, `søn`.

### Et arrangement

Sæt det ind i `content/events.json` mellem de firkantede klammer. Flere arrangementer adskilles med komma.

```json
{
  "id": "aabent-hus-oktober",
  "slug": "aabent-hus-oktober",
  "title": "Åbent hus i haven og huset",
  "start": "2026-10-03T11:00:00+02:00",
  "end": "2026-10-03T16:00:00+02:00",
  "place": "Torpevej 10, Herlufmagle",
  "description": "Pizza fra ovnen, kager og kaffe. Kom som du er.",
  "signup": false,
  "kind": "arrangement"
}
```

Sæt `"signup": true` og evt. `"priceOere": 15000` og `"capacity": 20`, så kan folk tilmelde sig direkte på siden.

### Billeder

Billederne ligger i `public/images/`. Skift et billede ved at lægge et nyt ind med samme filnavn. Læg et nyt billede til ved at uploade det og skrive en linje om det i `content/images.json` (hvad billedet viser, på dansk, til dem der ikke kan se det). Brug jpg, gerne 1600 til 2400 pixels på den lange led. Instagram-billeder ligger i `public/images/instagram/`, de små fra Facebook i `public/images/facebook/`.

### Brød og priser i Stripe i stedet for i filen

Når Stripe er sat op, kan du oprette brødene som produkter i Stripes kontrolpanel, så du aldrig rører filen. Så viser bageriet det, der ligger i Stripe. På hvert produkt kan du under "metadata" skrive `category` (brød, boller, kager, andet), `days` (fx `tir,fre`), `allergens` (fx `gluten,sesam`) og `slug`. Er der ingen produkter i Stripe endnu, bruger siden filen.

## Til udvikleren

Next.js 16 (App Router), React 19, TypeScript, Tailwind v4. Hostet på Vercel fra `main` i `github.com/arnkeenan-gif/lillehus`. Læs `CLAUDE.md` (struktur og regler) og `DESIGN.md` (designreglerne) før du ændrer noget.

```bash
npm install
cp .env.example .env.local   # udfyld nøgler
npm run dev                  # http://localhost:3000
npm run build && npm run lint && npx tsc --noEmit
```

Nøgler (sættes i Vercel under Settings, Environment Variables):

- `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`. Slå MobilePay og kort til under Settings, Payment methods. Opret en webhook til `https://<domæne>/api/stripe/webhook` med `checkout.session.completed` og `checkout.session.async_payment_succeeded`.
- `RESEND_API_KEY`, `EMAIL_FROM` (kræver et verificeret domæne hos Resend), `EMAIL_TO` (Kristines mail), evt. `RESEND_AUDIENCE_ID` til nyhedsbrevet.
- `NEXT_PUBLIC_SITE_URL`, fx `https://www.detlillehuspaalandet.net`.

Uden nøgler virker hele siden stadig: bageriet viser brødene og forklarer at betaling ikke er sat op, og formularerne viser succes og logger mailen i konsollen i udvikling.
