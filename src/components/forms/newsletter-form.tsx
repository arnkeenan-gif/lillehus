import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/field";

/**
 * Placeholder. The forms lane replaces this with a working sign-up that
 * adds the address to the Resend audience.
 */
export function NewsletterForm() {
  return (
    <form className="flex flex-col gap-3 sm:flex-row" action="#" method="post">
      <label htmlFor="nyhedsbrev-email" className="sr-only">
        Din e-mail
      </label>
      <Input id="nyhedsbrev-email" type="email" name="email" placeholder="din@mail.dk" autoComplete="email" />
      <Button type="submit" variant="secondary" className="shrink-0">
        Tilmeld
      </Button>
    </form>
  );
}
