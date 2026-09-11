/**
 * Sanity webhook: when Kristine publishes, Sanity POSTs {_type, slug} here and
 * we clear the cache for that document type and every page.
 *
 * Set up in sanity.io/manage under API, Webhooks (see README): URL
 * https://<domain>/api/revalidate, trigger on create, update and delete,
 * projection {_type, "slug": slug.current}, secret = SANITY_REVALIDATE_SECRET.
 */
import { revalidatePath, revalidateTag } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";
import { parseBody } from "next-sanity/webhook";

type WebhookPayload = {
  _type: string;
  slug?: string | null;
};

export async function POST(req: NextRequest) {
  const secret = process.env.SANITY_REVALIDATE_SECRET?.trim();
  if (!secret) {
    return NextResponse.json({ message: "SANITY_REVALIDATE_SECRET mangler i miljøet." }, { status: 500 });
  }

  try {
    // The third argument waits for Sanity's Content Lake to settle so the next fetch is not stale.
    const { isValidSignature, body } = await parseBody<WebhookPayload>(req, secret, true);

    if (!isValidSignature) {
      return NextResponse.json({ message: "Ugyldig signatur." }, { status: 401 });
    }
    if (!body?._type) {
      return NextResponse.json({ message: "Der mangler _type i webhookens payload." }, { status: 400 });
    }

    // Expire immediately so the next visit blocks for fresh data instead of serving the old page.
    revalidateTag(body._type, { expire: 0 });
    revalidatePath("/", "layout");

    return NextResponse.json({ revalidated: true, type: body._type, slug: body.slug ?? null, now: Date.now() });
  } catch (error) {
    console.error("[revalidate] webhook fejlede", error);
    const message = error instanceof Error ? error.message : "Ukendt fejl";
    return NextResponse.json({ message }, { status: 500 });
  }
}

/** Lets you check the URL in a browser; the webhook itself must POST. */
export async function GET() {
  return NextResponse.json({
    ok: true,
    message: "Sanity-webhook. Send en POST med signatur fra sanity.io/manage for at opdatere siden.",
  });
}
