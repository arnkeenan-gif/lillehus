import { Hr, Text } from "@react-email/components";
import { EmailLayout, EmailRow, emailStyles } from "@/emails/_layout";
import { site } from "@/lib/site";
import { cakeRows, type CakeEmailData } from "@/emails/cake-kristine";

export const CAKE_NEXT_STEPS =
  "Det er en forespørgsel, ikke en bestilling. Kristine svarer, når hun har set den, og bekræfter, om kagen kan laves til den dato, og hvad den koster.";

const pre = { whiteSpace: "pre-line" as const };

export function CakeCustomerEmail({ data }: { data: CakeEmailData }) {
  return (
    <EmailLayout preview="Vi har fået din kageforespørgsel" title="Tak for din forespørgsel">
      <Text style={emailStyles.text}>Hej {data.name}</Text>
      <Text style={emailStyles.text}>
        Vi har fået din forespørgsel på {data.cake.toLowerCase()} til {data.date}. {CAKE_NEXT_STEPS}
      </Text>
      <Text style={emailStyles.text}>
        Har du spørgsmål i mellemtiden, så svar på denne mail eller ring på {site.phone}.
      </Text>
      <Hr style={emailStyles.hr} />
      <Text style={emailStyles.small}>Det har du sendt:</Text>
      {cakeRows(data)
        .filter(([, value]) => value !== "" && value !== undefined)
        .map(([label, value]) => (
          <EmailRow key={label} label={label} value={<span style={pre}>{String(value)}</span>} />
        ))}
      <Hr style={emailStyles.hr} />
      <Text style={emailStyles.text}>Kristine</Text>
    </EmailLayout>
  );
}
