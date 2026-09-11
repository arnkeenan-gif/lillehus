import { Hr, Text } from "@react-email/components";
import { EmailLayout, EmailRow, emailStyles } from "@/emails/_layout";
import { site } from "@/lib/site";
import { eventSignupRows, type EventSignupEmailData } from "@/emails/event-kristine";

export const EVENT_NEXT_STEPS =
  "Kristine bekræfter din plads inden for to hverdage. Er der noget, der skal betales, står det i hendes svar.";

export function EventSignupCustomerEmail({ data }: { data: EventSignupEmailData }) {
  return (
    <EmailLayout preview={`Vi har fået din tilmelding til ${data.eventTitle}`} title="Tak for din tilmelding">
      <Text style={emailStyles.text}>Hej {data.name}</Text>
      <Text style={emailStyles.text}>
        Vi har fået din tilmelding til {data.eventTitle} {data.eventDate}. {EVENT_NEXT_STEPS}
      </Text>
      <Text style={emailStyles.text}>
        Har du spørgsmål i mellemtiden, så svar på denne mail eller ring på {site.phone}.
      </Text>
      <Hr style={emailStyles.hr} />
      <Text style={emailStyles.small}>Det har du sendt:</Text>
      {eventSignupRows(data).map(([label, value]) => (
        <EmailRow key={label} label={label} value={String(value)} />
      ))}
      <Hr style={emailStyles.hr} />
      <Text style={emailStyles.text}>Vi glæder os til at se dig.</Text>
      <Text style={emailStyles.text}>Kristine</Text>
    </EmailLayout>
  );
}
