import type { Metadata, Viewport } from "next";
import { NextStudio, metadata as studioMetadata, viewport as studioViewport } from "next-sanity/studio";
import config from "../../../../sanity.config";
import { isSanityConfigured } from "@/sanity/env";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";

/** The Studio is a client app; nothing here depends on the request. */
export const dynamic = "force-static";

export const metadata: Metadata = { ...studioMetadata, title: "Studio" };
export const viewport: Viewport = { ...studioViewport };

/*
  The root layout wraps every route in the site's header and footer. The
  Studio needs the whole window, so it hides them while it is open. Nothing
  else on the site is affected: the style only exists on this route.
*/
const hideSiteChrome = `
  body > header, body > footer, body > a[href="#indhold"] { display: none !important; }
`;

export default function StudioPage() {
  if (!isSanityConfigured) return <StudioNotConfigured />;
  return (
    <>
      <style>{hideSiteChrome}</style>
      <NextStudio config={config} />
    </>
  );
}

/** Shown until the owner has created the Sanity project and set the project id. */
function StudioNotConfigured() {
  return (
    <Section>
      <Container size="narrow">
        <h1 className="text-title font-semibold">Studio er ikke sat op endnu</h1>
        <p className="mt-4 max-w-[60ch] text-lg text-ink-2">
          Her kommer redigeringsværktøjet, hvor du retter tekster, billeder, priser og åbningstider. Indtil det er sat
          op, læser siden fra filerne i mappen content.
        </p>
        <p className="mt-8 font-medium text-ink">Den, der passer koden, skal gøre tre ting:</p>
        <ol className="mt-3 max-w-[65ch] list-decimal space-y-3 pl-5 text-ink-2 marker:text-muted">
          <li>
            Log ind hos Sanity og opret projektet: <code>npx sanity login</code> og derefter{" "}
            <code>npx sanity projects create &quot;Det lille hus på landet&quot; --dataset production --dataset-visibility public</code>.
          </li>
          <li>
            Skriv projektets id i <code>NEXT_PUBLIC_SANITY_PROJECT_ID</code> i <code>.env.local</code> og i Vercel, og udrul
            siden igen.
          </li>
          <li>
            Kør <code>npm run seed:sanity</code> med en skrivenøgle i <code>SANITY_API_WRITE_TOKEN</code>, så alt indholdet
            fra filerne bliver lagt ind i Sanity.
          </li>
        </ol>
        <p className="mt-6 max-w-[60ch] text-sm text-muted">Hele opskriften står i README.md under Redigér siden i Studio.</p>
        <div className="mt-8">
          <Button href="/" variant="secondary">
            Til forsiden
          </Button>
        </div>
      </Container>
    </Section>
  );
}
