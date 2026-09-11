import { Hr, Text } from "@react-email/components";
import { EmailLayout, EmailRow, emailStyles } from "@/emails/_layout";
import type { TextRow } from "@/lib/forms";

/* Two notifications live here: a sign-up for a listed event, and an
   interest in a course that has no date yet. */

export interface EventSignupEmailData {
  eventTitle: string;
  eventDate: string;
  persons: number;
  name: string;
  email: string;
  phone: string;
}

export function eventSignupRows(d: EventSignupEmailData): TextRow[] {
  return [
    ["Arrangement", d.eventTitle],
    ["Dato", d.eventDate],
    ["Antal personer", d.persons],
    ["Navn", d.name],
    ["E-mail", d.email],
    ["Telefon", d.phone],
  ];
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
  return (
    <EmailLayout
      preview={`${data.name}, ${data.persons} til ${data.eventTitle}`}
      title={`Tilmelding: ${data.eventTitle}`}
    >
      <Text style={emailStyles.text}>
        Ny tilmelding fra hjemmesiden. Svar på denne mail, så går svaret direkte til {data.name}.
      </Text>
      <Hr style={emailStyles.hr} />
      {eventSignupRows(data).map(([label, value]) => (
        <EmailRow key={label} label={label} value={String(value)} />
      ))}
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
