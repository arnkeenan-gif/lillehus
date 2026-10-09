# Det lille hus på landet

Hjemmesiden for bagværket, pizzavognen og gården på Torpevej 10 i Herlufmagle. Den første del af denne fil er til Kristine. Den sidste del er til den, der vedligeholder koden.

## Sådan er siden bygget op

| Side | Hvad den gør |
|---|---|
| Forsiden | Billeder i toppen, de tre indgange (Bagværk og fryser, Pizzavogn, Arrangementer), bagværk med priser, pizzavognen, det sker, Instagram |
| Bagværk | Kunden vælger først afhentningssted, så en af stedets åbne datoer, lægger varer i kurven og betaler med kort eller MobilePay. Kagerne står nederst |
| Kager | Hver kage har sin egen side med valg (fx smag, størrelse, tilvalg, tekst på kagen), antal, afhentningssted og dato. Har kagen en pris, lægges den i kurven. Står prisen på 0, skriver siden Pris aftales, og kunden sender en forespørgsel |
| Fryser | Frostsalg på gården: åbningstider og billeder af, hvordan man finder fryseren. Teksten om fryseren skriver du selv i Studio |
| Pizzavogn | Billede, tekst, priser, pizzaer og desserter, steder og datoer, og en forespørgsel (ingen betaling, før du har sagt ja) |
| Arrangementer | Kategorier, en kalender og en side for hvert arrangement med tilmelding og eventuelt betaling |
| Find os, Om os, Kontakt, Firmaaftaler, Levering, Spørgsmål og svar, Handelsbetingelser, Privatlivspolitik | Tekstsider |

Bestillingsfristen er kl. 18 to dage før afhentning, dansk tid. Når fristen for en dato er gået, kan datoen ikke længere vælges, og kassen tjekker fristen igen, lige før kunden betaler. Du kan give en kategori, en vare eller en kage sin egen frist.

Alle formularer sender en mail til dig og en kvittering til kunden. Bestillinger af bagværk betales med det samme, og du får bestillingen på mail med afhentningssted og dato.

## Redigér siden i Studio

Du retter alt på siden i Studio: gå til `https://www.detlillehuspaalandet.net/studio` og log ind med den mail, du er inviteret med. Studio er på dansk. Det, du udgiver, er på siden inden for et minut. (Indtil Sanity er sat op, se udviklerdelen, kommer indholdet fra filerne i `content/`.)

Menuen til venstre har disse punkter:

| I menuen | Hvad det er |
|---|---|
| Forside | Forsiden, bygget af afsnit: toppen med billeder, Tre indgange, bagværk med priser, pizzavognen, det sker, Instagram |
| Indstillinger | Navn, telefon, mail, adresse, logo og logo i hvidt (det hvide står oven på billederne i toppen), links til Facebook og Instagram, en besked øverst på siden (fx "Lukket i uge 42"), tekst i sidefoden, og hvilken mail bestillingerne sendes til |
| Åbningstider og steder | Gården med fryseren og torvedagen: dage, klokkeslæt og bemærkninger. Vises på forsiden, under Find os, på kontaktsiden og i sidefoden |
| Bageri og bestilling | Den almindelige bestillingsfrist, mindste bestilling, en besked øverst i bagværket, og levering, når I begynder på det |
| Pizzavogn | Indledning, tilbud og priser, pizzaer, desserter, steder og datoer, og det praktiske |
| Sider | Alle andre sider (Bagværk, Fryser, Kager, Pizzavogn, Arrangementer, Om os, Find os, Kontakt, Firmaaftaler, Levering, Spørgsmål og svar, Handelsbetingelser, Privatlivspolitik). Hver side er en liste af afsnit, du kan skrive i, bytte om på, slette og lægge til. Under Menu og søgning bestemmer du, om siden er i menuen, hvad den hedder der, og hvad Google viser |
| Afhentningssteder | Gården, Næstved Torv, Sorø, Ringsted og Haslev. Hvert sted har sine egne datoer og tider. Kun aktive steder kan vælges; ved start er det kun Gården |
| Bagværk | Alle varer, varer efter kategori, og kategorierne (brød, rugbrød, boller, sødt bagværk, croissanter og wienerbrød, cookies og andet sødt) |
| Kager | Kagerne med billeder, pris, valgmuligheder, antal og afsnit som beskrivelse og allergener |
| Arrangementer | Kommende og tidligere arrangementer, alle arrangementer, arrangementer efter kategori, og kategorierne |
| Spørgsmål og svar | Spørgsmålene på siden Spørgsmål og svar, samlet i grupper |
| Instagram-billeder | Striben af billeder på forsiden. Instagram lader os ikke hente dem automatisk, så du lægger selv de nyeste ind |

### Sådan gør du

**Åbne afhentningsdatoer.** Gå til Afhentningssteder og vælg stedet. Tryk på pilen ved siden af Udgiv og vælg Åbn datoer. Vælg ugedage, klokkeslæt for afhentning og hvor mange uger frem, og tryk Læg datoer ind. Tryk derefter Udgiv. Datoer, der allerede står der, rører den ikke. Du kan også lægge en enkelt dato til under fanen Datoer.

**Lukke en dato** (ferie, helligdag): åbn stedet, find datoen under Datoer, og fjern fluebenet ved Åben for bestilling. Tryk Udgiv. Datoen bliver stående, så du kan åbne den igen.

**Tage et nyt afhentningssted i brug:** åbn stedet, skriv adressen, slå Aktiv til, åbn datoer for det, og tryk Udgiv. Så kan kunderne vælge det.

**Ny vare:** Bagværk, Alle varer, og tryk på blyanten øverst for at lave en ny. Skriv navn, vælg kategori, skriv prisen i øre, en kort beskrivelse og træk et billede ind. Tryk Generer ved Adresse, og tryk Udgiv. Slå Vis på siden fra for at skjule en vare uden at slette den. Slå Kan bestilles på siden fra, hvis varen skal stå med pris, men ikke kan bestilles lige nu.

**Ny kategori:** Bagværk, Kategorier. Rækkefølgen styrer du med tallet i Rækkefølge (10, 20, 30 giver plads til at skyde en ny ind). En kategori uden varer vises ikke.

**Egen bestillingsfrist:** på en kategori, en vare eller en kage kan du sætte en frist, der gælder i stedet for den almindelige, fx tre dage før til en kage.

**Kager med valg:** åbn kagen og gå til Valgmuligheder. Hver valgmulighed har en overskrift (fx Smag, Størrelse, Tekst på kagen) og en slags: rullemenu, knapper, tilvalg (kunden kan vælge flere) eller tekstfelt. Hvert valg kan have et pristillæg i øre, som lægges oven i kagens pris. Under Afsnit under kagen skriver du beskrivelse, ingredienser og allergener.

**Arrangementer:** Arrangementer, og lav et nyt. Skriv navn, vælg kategori, start, slut og sted. Under Tilmelding og betaling slår du Tilmelding på siden til, hvis gæsterne skal melde sig. Skriv en pris pr. person og slå Betaling ved tilmelding til, hvis de skal betale med det samme. Antal pladser og sidste frist kan udelades. Et arrangement forsvinder selv fra kalenderen, når det er slut.

**Pizzavognens steder og datoer:** Pizzavogn, Steder og datoer.

**Fryseren:** Sider, Fryser. Teksten og billederne retter du som på de andre sider.

**Logo:** Indstillinger, Logo og Logo i hvidt. Træk den nye fil ind og tryk Udgiv.

### Gode ting at vide

- Priser skrives i øre uden komma: `5500` er 55 kr., `4550` er 45,50 kr. Det står ved hvert prisfelt.
- Billeder trækker du ind fra skrivebordet. Tryk på billedet og vælg Rediger for at sætte punktet, der altid skal med i udsnittet, og skriv i feltet under billedet, hvad det viser. Brug jpg, gerne 1600 til 2400 pixels på den lange led.
- Intet er ude på siden, før du trykker Udgiv. Tryk på de tre prikker for at fortryde ændringer, du ikke har udgivet.
- Indstillinger, Åbningstider og steder, Bageri og bestilling og Pizzavogn findes kun i et eksemplar og kan ikke slettes.
- Handelsbetingelserne og Spørgsmål og svar nævner afhentning og frist i selve teksten. Ændrer du fristen eller stederne, så ret også teksten der.

## Til udvikleren

Next.js 16 (App Router), React 19, TypeScript, Tailwind v4, Sanity. Hostet på Vercel fra `main` i `github.com/arnkeenan-gif/lillehus`. Læs `CLAUDE.md` (struktur og regler) og `DESIGN.md` (designreglerne), før du ændrer noget.

```bash
npm install
cp .env.example .env.local   # udfyld nøgler
npm run dev                  # http://localhost:3000
npm run build && npm run lint && npx tsc --noEmit
```

Nøgler (sættes i Vercel under Settings, Environment Variables):

- `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`. Slå MobilePay og kort til under Settings, Payment methods. Opret en webhook til `https://<domæne>/api/stripe/webhook` med `checkout.session.completed` og `checkout.session.async_payment_succeeded`. Webhooken håndterer både bestillinger af bagværk og betalte tilmeldinger til arrangementer.
- `RESEND_API_KEY`, `EMAIL_FROM` (kræver et verificeret domæne hos Resend), `EMAIL_TO` (Kristines mail), evt. `RESEND_AUDIENCE_ID` til nyhedsbrevet.
- `NEXT_PUBLIC_SITE_URL`, fx `https://www.detlillehuspaalandet.net`.

Uden nøgler virker hele siden stadig: bagværket viser varerne og forklarer, at betaling ikke er sat op, og formularerne viser succes og logger mailen i konsollen i udvikling.

### Indhold uden Sanity

Mangler `NEXT_PUBLIC_SANITY_PROJECT_ID`, læser siden alt fra filerne i `content/`. Funktionerne, siderne bruger, ligger i `src/lib/cms` og er de samme uanset kilde. Hver fil har et `_readme`-felt, der forklarer felterne.

| Indhold | Fil |
|---|---|
| Navn, telefon, mail, adresse, logo, åbningstider og steder | `content/site.json` |
| Bestillingsfrist, mindste bestilling, besked øverst i bagværket | `content/shop.json` |
| Afhentningssteder og deres datoer (et aktivt sted uden datoer får onsdage og lørdage fire uger frem) | `content/ordering/pickup-locations.json` |
| Kategorier i bagværket | `content/ordering/categories.json` |
| Varer i bagværket | `content/ordering/products.json` |
| Kager med valgmuligheder | `content/ordering/cakes.json` |
| Pizzavognen | `content/pizza.json` |
| Arrangementer og deres kategorier | `content/events.json`, `content/events/categories.json` |
| Spørgsmål og svar | `content/faq.json` |
| Siderne og deres afsnit | `content/cms-fallback/pages/*.json` |
| Billedtekster og mål for billederne i `public/images` | `content/images.json` |

### Sådan sættes Sanity op

Sanity-delen ligger i `src/sanity` (skemaer, menu, handlinger, klient, forespørgsler) og `sanity.config.ts`. Uden projekt-id viser `/studio` en side om, at Studio ikke er sat op.

1. Log ind og opret projektet (gratisplanen rækker til dette site):

   ```bash
   npx sanity login
   npx sanity projects create "Det lille hus på landet" --dataset production --dataset-visibility public
   ```

   Projektets id står i svaret og i adressen på sanity.io/manage. Findes projektet allerede, spring dette over.

2. Skriv id'et i `.env.local` (kopier fra `.env.example`): `NEXT_PUBLIC_SANITY_PROJECT_ID=<id>` og `NEXT_PUBLIC_SANITY_DATASET=production`. `sanity.cli.ts` læser `.env.local`, så `npx sanity ...` kender projektet herefter.

3. Tillad Studio at logge ind fra siden (CORS), både lokalt og på det rigtige domæne, plus Vercels preview-domæne, hvis I bruger det:

   ```bash
   npx sanity cors add http://localhost:3000 --credentials
   npx sanity cors add https://www.detlillehuspaalandet.net --credentials
   ```

4. Lav en skrivenøgle til seed-scriptet: sanity.io/manage, projektet, API, Tokens, Add API token, rettigheder Editor. Skriv den i `.env.local` som `SANITY_API_WRITE_TOKEN`. Den vises kun en gang, og den skal aldrig i Vercel.

5. Læg alt indholdet fra `content/` ind i Sanity (prøv først med `-- --dry-run`, der ikke skriver noget):

   ```bash
   npm run seed:sanity
   ```

   Scriptet lægger billederne fra `public/images` op (og husker dem i `scripts/.seed-assets.json`, så det ikke sker igen) og opretter indstillinger, åbningstider, pizzavogn, spørgsmål, Instagram-billeder og alle sider. Derefter kører det `scripts/seed-ordering.ts` (kategorier, varer, kager, afhentningssteder og fristen; Gården får onsdage og lørdage fire uger frem, ligesom siden viser uden Sanity) og `scripts/seed-events.ts` (arrangementer og kategorier).

   Kør det kun igen, før Kristine er begyndt at rette: indstillinger, åbningstider, pizzavogn, spørgsmål, Instagram og sider bliver overskrevet fra `content/`. Varer, kager, steder og arrangementer, der allerede findes, bliver ikke rørt. De to scripts kan også køres alene med `npx tsx scripts/seed-ordering.ts` og `npx tsx scripts/seed-events.ts`; begge tager `--dry-run` og `--replace` (overskriv det, der findes), og `seed-ordering` tager `--open-dates`.

6. I Vercel (Settings, Environment Variables): `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET=production` og `SANITY_REVALIDATE_SECRET` (en lang tilfældig streng, fx `openssl rand -hex 32`). Udrul igen. Nu læser siden fra Sanity, og `/studio` viser Studio.

7. Webhook, så siden opdaterer i samme øjeblik, der udgives (ellers går der op til et minut): sanity.io/manage, projektet, API, Webhooks, Create webhook.
   - Name: `Vercel revalidate`
   - URL: `https://www.detlillehuspaalandet.net/api/revalidate`
   - Dataset: `production`
   - Trigger on: Create, Update og Delete
   - Filter: tom (alle dokumenter)
   - Projection: `{_type, "slug": slug.current}`
   - HTTP method: POST, API version: den nyeste
   - Secret: samme værdi som `SANITY_REVALIDATE_SECRET` i Vercel

   Ruten `src/app/api/revalidate/route.ts` tjekker signaturen, kalder `revalidateTag` for dokumenttypen og `revalidatePath("/", "layout")`. En GET på adressen svarer med en lille tekst, så du kan se, at ruten findes.

8. Inviter Kristine: sanity.io/manage, projektet, Members, Invite, rollen Editor. Hun logger ind på `/studio` med den mail.

Andre ting:

- `npx sanity manage` åbner projektet i browseren. `npm run sanity -- datasets list` og lignende bruger `sanity.cli.ts`.
- `SANITY_API_READ_TOKEN` skal kun sættes, hvis datasettet gøres privat. Så går siden uden om Sanitys CDN.
- I udvikling (`npm run dev`) har Studio også fanen Vision til at prøve GROQ-forespørgsler.
- Mangler et af de enkelte dokumenter i Sanity (Indstillinger, Åbningstider og steder, Bageri og bestilling, Pizzavogn eller en side), fx før seed er kørt, bruger siden den tilsvarende fil i `content/` og skriver en advarsel i loggen. Lister (varer, kategorier, kager, steder, arrangementer, spørgsmål, Instagram) kommer altid fra Sanity, når projektet er sat op, så kør seed, før Sanity-nøglerne sættes i Vercel.
- `npx tsx scripts/check-cms.ts` skriver, hvor indholdet kommer fra, og hvor meget der er af hvert slags.
