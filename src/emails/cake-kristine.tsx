import { Hr, Text } from "@react-email/components";
import { EmailLayout, EmailRow, emailStyles } from "@/emails/_layout";
import type { TextRow } from "@/lib/forms";

export interface CakeEmailData {
  cake: string;
  date: string;
  persons: number;
  wishes: string;
  cakeText: string;
  allergies: string;
  delivery: string;
  name: string;
  email: string;
  phone: string;
  message: string;
}

export function cakeRows(d: CakeEmailData): TextRow[] {
  return [
    ["Kage", d.cake],
    ["Skal bruges", d.date],
    ["Antal personer", d.persons],
    ["Smag og ønsker", d.wishes],
    ["Tekst på kagen", d.cakeText],
    ["Allergier", d.allergies],
    ["Afhentning eller levering", d.delivery],
    ["Navn", d.name],
    ["E-mail", d.email],
    ["Telefon", d.phone],
    ["Besked", d.message],
  ];
}

const pre = { whiteSpace: "pre-line" as const };

export function CakeKristineEmail({ data }: { data: CakeEmailData }) {
  return (
    <EmailLayout preview={`${data.cake} til ${data.date}, ${data.name}`} title="Forespørgsel på kage">
      <Text style={emailStyles.text}>
        Ny kageforespørgsel fra hjemmesiden. Svar på denne mail, så går svaret direkte til {data.name}.
      </Text>
      <Hr style={emailStyles.hr} />
      {cakeRows(data)
        .filter(([, value]) => value !== "" && value !== undefined)
        .map(([label, value]) => (
          <EmailRow key={label} label={label} value={<span style={pre}>{String(value)}</span>} />
        ))}
    </EmailLayout>
  );
}
