import { Text } from "@react-email/components";
import { EmailLayout, EmailRow, emailStyles } from "@/emails/_layout";

/** Sent only when no Resend audience is configured, so Kristine keeps the list herself. */
export function NewsletterKristineEmail({ email }: { email: string }) {
  return (
    <EmailLayout preview={`Ny tilmelding: ${email}`} title="Ny tilmelding til nyhedsbrevet">
      <Text style={emailStyles.text}>
        En ny adresse har tilmeldt sig nyhedsbrevet på hjemmesiden. Gem den i din liste.
      </Text>
      <EmailRow label="E-mail" value={email} />
    </EmailLayout>
  );
}
