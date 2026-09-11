import { Hr, Text } from "@react-email/components";
import { EmailLayout, EmailRow, emailStyles } from "@/emails/_layout";
import type { TextRow } from "@/lib/forms";

export interface CompanyEmailData {
  company: string;
  cvr: string;
  contact: string;
  email: string;
  phone: string;
  wants: string[];
  frequency: string;
  people: string;
  message: string;
}

export function companyRows(d: CompanyEmailData): TextRow[] {
  return [
    ["Virksomhed", d.company],
    ["CVR", d.cvr],
    ["Kontaktperson", d.contact],
    ["E-mail", d.email],
    ["Telefon", d.phone],
    ["Ønsker", d.wants.join("\n")],
    ["Hvor ofte", d.frequency],
    ["Cirka antal personer", d.people],
    ["Besked", d.message],
  ];
}

const pre = { whiteSpace: "pre-line" as const };

export function CompanyKristineEmail({ data }: { data: CompanyEmailData }) {
  return (
    <EmailLayout preview={`${data.company}, ${data.contact}`} title={`Firmaforespørgsel: ${data.company}`}>
      <Text style={emailStyles.text}>
        Ny forespørgsel om en firmaaftale. Svar på denne mail, så går svaret direkte til {data.contact}.
      </Text>
      <Hr style={emailStyles.hr} />
      {companyRows(data)
        .filter(([, value]) => value !== "" && value !== undefined)
        .map(([label, value]) => (
          <EmailRow key={label} label={label} value={<span style={pre}>{String(value)}</span>} />
        ))}
    </EmailLayout>
  );
}
