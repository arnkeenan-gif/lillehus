import { Hr, Text } from "@react-email/components";
import { EmailLayout, EmailRow, emailStyles } from "@/emails/_layout";
import type { TextRow } from "@/lib/forms";

/**
 * A cake request, from the form at the bottom of /kager (wishes, persons,
 * delivery) or from a cake's own page when its price is "Pris aftales"
 * (quantity, the chosen options and the pickup place and date).
 */
export interface CakeEmailData {
  cake: string;
  /** The date written out, "lørdag den 17. oktober 2026". */
  date: string;
  /** From a cake page: how many, the chosen options and where it is picked up. */
  quantity?: number;
  options?: string[];
  place?: string;
  /** From the form at the bottom of /kager. */
  persons?: number;
  wishes?: string;
  cakeText?: string;
  allergies?: string;
  delivery?: string;
  name: string;
  email: string;
  phone: string;
  message?: string;
}

export function cakeRows(d: CakeEmailData): TextRow[] {
  return [
    ["Kage", d.cake],
    ["Antal", d.quantity],
    ["Valg", d.options && d.options.length > 0 ? d.options.join("\n") : undefined],
    [d.place ? "Afhentning" : "Skal bruges", d.date],
    ["Sted", d.place],
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

/** The rows that have a value. */
export function filledCakeRows(d: CakeEmailData): [string, string][] {
  return cakeRows(d)
    .filter(([, value]) => value !== undefined && value !== null && String(value).trim() !== "")
    .map(([label, value]) => [label, String(value)]);
}

const pre = { whiteSpace: "pre-line" as const };

export function CakeKristineEmail({ data }: { data: CakeEmailData }) {
  return (
    <EmailLayout preview={`${data.cake} til ${data.date}, ${data.name}`} title="Forespørgsel på kage">
      <Text style={emailStyles.text}>
        Ny kageforespørgsel fra hjemmesiden. Svar på denne mail, så går svaret direkte til {data.name}.
      </Text>
      <Hr style={emailStyles.hr} />
      {filledCakeRows(data).map(([label, value]) => (
        <EmailRow key={label} label={label} value={<span style={pre}>{value}</span>} />
      ))}
    </EmailLayout>
  );
}
