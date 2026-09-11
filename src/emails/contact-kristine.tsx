import { Hr, Text } from "@react-email/components";
import { EmailLayout, EmailRow, emailStyles } from "@/emails/_layout";
import type { TextRow } from "@/lib/forms";

export interface ContactEmailData {
  subject: string;
  name: string;
  email: string;
  phone: string;
  message: string;
}

export function contactRows(d: ContactEmailData): TextRow[] {
  return [
    ["Emne", d.subject],
    ["Navn", d.name],
    ["E-mail", d.email],
    ["Telefon", d.phone],
    ["Besked", d.message],
  ];
}

const pre = { whiteSpace: "pre-line" as const };

export function ContactKristineEmail({ data }: { data: ContactEmailData }) {
  return (
    <EmailLayout preview={`${data.name}: ${data.subject}`} title={`Besked fra hjemmesiden: ${data.subject}`}>
      <Text style={emailStyles.text}>Svar på denne mail, så går svaret direkte til {data.name}.</Text>
      <Hr style={emailStyles.hr} />
      {contactRows(data)
        .filter(([, value]) => value !== "" && value !== undefined)
        .map(([label, value]) => (
          <EmailRow key={label} label={label} value={<span style={pre}>{String(value)}</span>} />
        ))}
    </EmailLayout>
  );
}
