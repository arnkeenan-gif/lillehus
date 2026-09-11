import { Hr, Text } from "@react-email/components";
import { EmailLayout, EmailRow, emailStyles } from "@/emails/_layout";
import type { TextRow } from "@/lib/forms";

/** Display-ready values: dates, times and prices are formatted by the action. */
export interface BookingEmailData {
  date: string;
  time: string;
  eventType: string;
  adults: number;
  children: number;
  address: string;
  pizzas: string[];
  specialDiet: number;
  dessert: string;
  name: string;
  email: string;
  phone: string;
  source: string;
  message: string;
  /** Fewer than the usual minimum of adults; Kristine decides. */
  belowMinimum: boolean;
}

export function bookingRows(d: BookingEmailData): TextRow[] {
  return [
    ["Dato", d.date],
    ["Ønsket spisetid", `kl. ${d.time}`],
    ["Arrangement", d.eventType],
    ["Antal voksne", d.belowMinimum ? `${d.adults} (under de sædvanlige 40)` : d.adults],
    ["Børn 0 til 7 år", d.children],
    ["Adresse", d.address],
    ["Pizzaer", d.pizzas.join("\n")],
    ["Veganske eller glutenfri kuverter", d.specialDiet],
    ["Dessert", d.dessert],
    ["Navn", d.name],
    ["E-mail", d.email],
    ["Telefon", d.phone],
    ["Hørte om os via", d.source],
    ["Besked og plads til vognen", d.message],
  ];
}

const pre = { whiteSpace: "pre-line" as const };

export function BookingKristineEmail({ data }: { data: BookingEmailData }) {
  return (
    <EmailLayout
      preview={`Pizzavognen ${data.date}, ${data.adults} voksne, ${data.name}`}
      title="Forespørgsel på pizzavognen"
    >
      <Text style={emailStyles.text}>
        Ny forespørgsel fra hjemmesiden. Svar på denne mail, så går svaret direkte til {data.name}.
      </Text>
      {data.belowMinimum ? (
        <Text style={emailStyles.text}>Bemærk: selskabet er under de sædvanlige 40 voksne.</Text>
      ) : null}
      <Hr style={emailStyles.hr} />
      {bookingRows(data).map(([label, value]) => (
        <EmailRow key={label} label={label} value={<span style={pre}>{String(value)}</span>} />
      ))}
    </EmailLayout>
  );
}
