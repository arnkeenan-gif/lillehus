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

## Redigér siden i Studio

Når Sanity er sat op (se næste afsnit), retter du alt på siden i Studio: gå til `https://www.detlillehuspaalandet.net/studio` og log ind med den mail, du er inviteret med. Studio er på dansk. Det, du udgiver, er på siden inden for et minut.

Sådan hænger det sammen. Menuen til venstre har disse punkter:

| I menuen | Hvad det er |
|---|---|
| Forside | Forsiden, bygget af afsnit: toppen med billede og knapper, åbningstider, brød fra bageriet, pizzavognen, det sker, Instagram, familien |
| Indstillinger | Navn, telefon, mail, adresse, CVR, logo, links til Facebook og Instagram, en besked øverst på siden (fx "Lukket i uge 42"), tekst i sidefoden |
| Åbningstider og steder | Gården med fryseren og Hønsehuset, og torvedagen i Næstved: dage, klokkeslæt og bemærkninger. Vises på forsiden, under Find os, på kontaktsiden og i sidefoden |
| Bageri, afhentning og levering | Afhentningsdage, bestillingsfrist, hvor mange dage frem man kan bestille, lukkedage, en besked øverst i bageriet, og levering når I begynder på det |
| Pizzavogn | Priser pr. kuvert, pizzaer, desserter, teksten om hvordan dagen foregår, og det praktiske |
| Sider | Alle andre sider (Om os, Find os, Kager, Pizzavogn, Arrangementer, Kontakt, Firmaaftaler, Levering, Spørgsmål og svar, Handelsbetingelser, Privatlivspolitik). Hver side er en liste af afsnit, du kan skrive i, bytte om på, slette og lægge til. Under Menu og søgning bestemmer du, om siden er i menuen, hvad den hedder der, og hvad Google viser |
| Brød og varer | Det, der kan bestilles i bageriet: navn, beskrivelse, pris, billede, kategori, hvilke dage det bages til, allergener, og om det er til salg |
| Kager på bestilling | Kagerne på kagesiden med fra-priser, antal personer og hvor lang tid før man skal bestille |
| Arrangementer og kurser | Åbent hus, kurser og andre datoer. Slå Tilmelding på siden til, så kan folk tilmelde sig direkte |
| Spørgsmål og svar | Spørgsmålene på siden Spørgsmål og svar, samlet i grupper |
| Instagram-billeder | Striben af billeder nederst på forsiden. Instagram lader os ikke hente dem automatisk, så du lægger selv de nyeste ind |

Gode ting at vide:

- Priser skrives i øre uden komma: `5500` er 55 kr., `4550` er 45,50 kr. Det står ved hvert prisfelt.
- Billeder trækker du ind fra skrivebordet. Tryk på billedet og vælg Rediger for at sætte punktet, der altid skal med i udsnittet (fx et ansigt), og skriv i feltet under billedet, hvad det viser. Brug jpg, gerne 1600 til 2400 pixels på den lange led.
- Intet er ude på siden, før du trykker Udgiv. Tryk på de tre prikker for at fortryde ændringer, du ikke har udgivet.
- Indstillinger, Åbningstider, Bageri og Pizzavogn findes kun i et eksemplar og kan ikke slettes.
- Handelsbetingelserne nævner afhentningsdage og frist i selve teksten. Ændrer du dem under Bageri, afhentning og levering, så ret også teksten der.

### Til udvikleren: sådan sættes Sanity op

Siden virker uden Sanity: mangler `NEXT_PUBLIC_SANITY_PROJECT_ID`, læser alt fra filerne i `content/`, og `/studio` viser en side om, at Studio ikke er sat op. Koden, siderne skal bruge, ligger i `src/lib/cms` (samme funktioner uanset kilde). Sanity-delen ligger i `src/sanity` (skemaer, menu, klient, forespørgsler) og `sanity.config.ts`.

1. Log ind og opret projektet (gratisplanen rækker til dette site):

   ```bash
   npx sanity login
   npx sanity projects create "Det lille hus på landet" --dataset production --dataset-visibility public
   ```

   Projektets id står i svaret og i adressen på sanity.io/manage. Findes projektet allerede, spring dette over.

2. Skriv id'et i `.env.local` (kopier fra `.env.example`): `NEXT_PUBLIC_SANITY_PROJECT_ID=<id>` og `NEXT_PUBLIC_SANITY_DATASET=production`. `sanity.cli.ts` læser `.env.local`, så `npx sanity ...` kender projektet herefter.

3. Tillad Studio at logge ind fra siden (CORS). Både lokalt og på det rigtige domæne, plus Vercels preview-domæne hvis I bruger det:

   ```bash
   npx sanity cors add http://localhost:3000 --credentials
   npx sanity cors add https://www.detlillehuspaalandet.net --credentials
   ```

4. Lav en skrivenøgle til seed-scriptet: sanity.io/manage, projektet, API, Tokens, Add API token, rettigheder Editor. Skriv den i `.env.local` som `SANITY_API_WRITE_TOKEN`. Den vises kun en gang, og den skal aldrig i Vercel.

5. Læg alt indholdet fra `content/` ind i Sanity:

   ```bash
   npm run seed:sanity
   ```

   Scriptet lægger billederne fra `public/images` op (og husker dem i `scripts/.seed-assets.json`, så det ikke sker igen), og opretter indstillinger, åbningstider, bageri- og pizzaindstillinger, varer, kager, arrangementer, spørgsmål, Instagram-billeder og alle sider fra `content/cms-fallback/pages`. Det kan køres igen; dokumenterne har faste id'er og bliver overskrevet, ikke fordoblet.

6. I Vercel (Settings, Environment Variables): `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET=production` og `SANITY_REVALIDATE_SECRET` (en lang tilfældig streng, fx `openssl rand -hex 32`). Udrul igen. Nu læser siden fra Sanity, og `/studio` viser Studio.

7. Webhook, så siden opdaterer i samme øjeblik der udgives (ellers går der op til et minut): sanity.io/manage, projektet, API, Webhooks, Create webhook.
   - Name: `Vercel revalidate`
   - URL: `https://www.detlillehuspaalandet.net/api/revalidate`
   - Dataset: `production`
   - Trigger on: Create, Update og Delete
   - Filter: tom (alle dokumenter)
   - Projection: `{_type, "slug": slug.current}`
   - HTTP method: POST, API version: den nyeste
   - Secret: samme værdi som `SANITY_REVALIDATE_SECRET` i Vercel

   Ruten `src/app/api/revalidate/route.ts` tjekker signaturen, kalder `revalidateTag` for dokumenttypen og `revalidatePath("/", "layout")`. En GET på adressen svarer med en lille tekst, så du kan se at ruten findes.

8. Inviter Kristine: sanity.io/manage, projektet, Members, Invite, rollen Editor. Hun logger ind på `/studio` med den mail.

Andre ting:

- `npx sanity manage` åbner projektet i browseren. `npm run sanity -- datasets list` og lignende bruger `sanity.cli.ts`.
- `SANITY_API_READ_TOKEN` skal kun sættes, hvis datasettet gøres privat. Så går siden uden om Sanitys CDN.
- I udvikling (`npm run dev`) har Studio også fanen Vision til at prøve GROQ-forespørgsler.
- Hvis et dokument mangler i Sanity (fx før seed er kørt), bruger siden den tilsvarende fil i `content/` og skriver en advarsel i loggen. Lister (varer, kager, arrangementer, spørgsmål, Instagram) kommer altid fra Sanity, når projektet er sat op.
