import { Hr, Text } from "@react-email/components";
import { EmailLayout, EmailRow, emailStyles } from "@/emails/_layout";
import type { TextRow } from "@/lib/forms";

/** Display-ready values: dates, times and prices are formatted by the action. Empty folded fields say "Ikke udfyldt". */
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
  /** "Cirka 12.100 kr. plus kørsel 4 kr. pr. km", from the same calculation the form shows. */
  estimate: string;
  /** "Depositum en tredjedel: cirka 4.033 kr." */
  deposit: string;
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
    ["Ønsket spisetid", d.time],
    ["Arrangement", d.eventType],
    ["Antal voksne", d.belowMinimum ? `${d.adults} (under de sædvanlige 40)` : d.adults],
    ["Børn 0 til 7 år", d.children],
    ["Adresse", d.address],
    ["Pizzaer", d.pizzas.join("\n")],
    ["Veganske eller glutenfri kuverter", d.specialDiet],
    ["Dessert", d.dessert],
    ["Cirkapris", d.estimate],
    ["Depositum", d.deposit],
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
      <Text style={emailStyles.text}>Cirkaprisen er regnet fra priserne på siden, uden kørsel.</Text>
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
