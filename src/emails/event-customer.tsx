import { Hr, Text } from "@react-email/components";
import { EmailLayout, EmailRow, emailStyles } from "@/emails/_layout";
import { formatPrice } from "@/lib/format";
import { site } from "@/lib/site";
import { eventSignupRows, filledRows, type EventSignupEmailData } from "@/emails/event-kristine";
import { EVENT_NEXT_STEPS } from "@/lib/events/copy";

export { EVENT_NEXT_STEPS };

const pre = { whiteSpace: "pre-line" as const };

/** The confirmation the guest gets: after the free form, or after paying through Stripe. */
export function EventSignupCustomerEmail({ data }: { data: EventSignupEmailData }) {
  const intro = introText(data);

  return (
    <EmailLayout preview={`Din tilmelding til ${data.eventTitle}`} title="Tak for din tilmelding">
      <Text style={emailStyles.text}>Hej {data.name}</Text>
      <Text style={emailStyles.text}>{intro}</Text>
      <Text style={emailStyles.text}>
        Har du spørgsmål, så svar på denne mail eller ring på {site.phone}.
      </Text>
      <Hr style={emailStyles.hr} />
      <Text style={emailStyles.small}>Din tilmelding:</Text>
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
      <Hr style={emailStyles.hr} />
      <Text style={emailStyles.text}>Vi glæder os til at se dig.</Text>
      <Text style={emailStyles.text}>Kristine</Text>
    </EmailLayout>
  );
}

/** The same message as plain text, for clients that do not show HTML. */
export function eventSignupCustomerText(data: EventSignupEmailData): string {
  const intro = introText(data);
  return [
    `Hej ${data.name}`,
    "",
    intro,
    `Har du spørgsmål, så svar på denne mail eller ring på ${site.phone}.`,
    "",
    ...filledRows(eventSignupRows(data)).map(([label, value]) => `${label}: ${value}`),
    ...(data.eventUrl ? ["", data.eventUrl] : []),
    "",
    "Vi glæder os til at se dig.",
    "Kristine",
  ].join("\n");
}

function lowerFirst(s: string): string {
  return s.charAt(0).toLowerCase() + s.slice(1);
}

/** "Du er tilmeldt Brødkursus, lørdag den 7. november. Du har betalt 900 kr. for 2 personer." */
function introText(data: EventSignupEmailData): string {
  const what = `${data.eventTitle}, ${lowerFirst(data.eventDate)}`;
  if (!data.paid) return `Vi har fået din tilmelding til ${what}. ${EVENT_NEXT_STEPS}`;
  const who = data.persons === 1 ? "1 person" : `${data.persons} personer`;
  return `Du er tilmeldt ${what}. Du har betalt ${formatPrice(data.paid.totalOere)} for ${who}.`;
}
