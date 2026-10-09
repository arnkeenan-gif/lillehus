import { Hr, Text } from "@react-email/components";
import { EmailLayout, EmailRow, emailStyles } from "@/emails/_layout";
import { formatPrice } from "@/lib/format";
import type { TextRow } from "@/lib/forms";

/* Notifications to Kristine: a sign-up for an event (free, or paid through
   Stripe), and an interest in a course that has no date yet. */

export interface EventSignupEmailData {
  eventTitle: string;
  /** "Lørdag den 14. november 2026, kl. 10.00 til 14.00" */
  eventDate: string;
  eventPlace: string;
  /** Link to the event's page. */
  eventUrl?: string;
  persons: number;
  name: string;
  email: string;
  phone: string;
  message: string;
  /** "150 kr. pr. person" when the event has a price that is not paid on the site. */
  priceNote?: string;
  /** Set when the guest has paid on the site. */
  paid?: { totalOere: number; reference: string };
}

export function eventSignupRows(d: EventSignupEmailData): TextRow[] {
  return [
    ["Arrangement", d.eventTitle],
    ["Dato", d.eventDate],
    ["Sted", d.eventPlace],
    ["Antal personer", d.persons],
    ["Pris", d.paid ? undefined : d.priceNote],
    ["Betalt", d.paid ? formatPrice(d.paid.totalOere) : undefined],
    ["Navn", d.name],
    ["E-mail", d.email],
    ["Telefon", d.phone],
    ["Besked", d.message],
  ];
}

/** The rows that have a value, for the HTML and the plain-text version alike. */
export function filledRows(rows: TextRow[]): [string, string][] {
  return rows
    .filter(([, v]) => v !== undefined && v !== null && String(v).trim() !== "")
    .map(([label, v]) => [label, String(v).trim()]);
}

export interface CourseInterestEmailData {
  course: string;
  persons: number;
  period: string;
  name: string;
  email: string;
  phone: string;
  message: string;
}

export function courseInterestRows(d: CourseInterestEmailData): TextRow[] {
  return [
    ["Kursus", d.course],
    ["Antal personer", d.persons],
    ["Ønsket periode", d.period],
    ["Navn", d.name],
    ["E-mail", d.email],
    ["Telefon", d.phone],
    ["Besked", d.message],
  ];
}

const pre = { whiteSpace: "pre-line" as const };

export function EventSignupKristineEmail({ data }: { data: EventSignupEmailData }) {
  const title = data.paid ? `Betalt tilmelding: ${data.eventTitle}` : `Tilmelding: ${data.eventTitle}`;
  return (
    <EmailLayout preview={`${data.name}, ${data.persons} til ${data.eventTitle}`} title={title}>
      <Text style={emailStyles.text}>
        {data.paid
          ? `${data.name} har tilmeldt sig og betalt ${formatPrice(data.paid.totalOere)} på siden. Betalingen ligger i Stripe under ${data.paid.reference}.`
          : "Ny tilmelding fra hjemmesiden."}{" "}
        Svar på denne mail, så går svaret direkte til {data.name}.
      </Text>
      <Hr style={emailStyles.hr} />
      {filledRows(eventSignupRows(data)).map(([label, value]) => (
        <EmailRow key={label} label={label} value={<span style={pre}>{value}</span>} />
      ))}
      {data.eventUrl ? (
        <Text style={{ ...emailStyles.small, marginTop: 24 }}>
          <a href={data.eventUrl} style={emailStyles.link}>
            Se arrangementet på siden
          </a>
        </Text>
      ) : null}
    </EmailLayout>
  );
}

export function CourseInterestKristineEmail({ data }: { data: CourseInterestEmailData }) {
  return (
    <EmailLayout preview={`${data.name}, ${data.persons} personer, ${data.course}`} title="Interesse i et kursus">
      <Text style={emailStyles.text}>
        Nogen vil gerne på kursus. Svar på denne mail, så går svaret direkte til {data.name}.
      </Text>
      <Hr style={emailStyles.hr} />
      {courseInterestRows(data)
        .filter(([, value]) => value !== "" && value !== undefined)
        .map(([label, value]) => (
          <EmailRow key={label} label={label} value={<span style={pre}>{String(value)}</span>} />
        ))}
    </EmailLayout>
  );
}
