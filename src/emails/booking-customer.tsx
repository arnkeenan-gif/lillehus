import { Hr, Text } from "@react-email/components";
import { EmailLayout, EmailRow, emailStyles } from "@/emails/_layout";
import { site } from "@/lib/site";
import { bookingRows, type BookingEmailData } from "@/emails/booking-kristine";

/** Same wording in the email and in the plain-text body. */
export const BOOKING_NEXT_STEPS =
  "Det er en forespørgsel, ikke en endelig booking. Kristine vender tilbage og bekræfter pris og dato og sender oplysninger til betaling af depositum. Bookingen er først endelig, når depositum er betalt.";

const pre = { whiteSpace: "pre-line" as const };

export function BookingCustomerEmail({ data }: { data: BookingEmailData }) {
  return (
    <EmailLayout preview="Vi har fået din forespørgsel på pizzavognen" title="Tak for din forespørgsel">
      <Text style={emailStyles.text}>Hej {data.name}</Text>
      <Text style={emailStyles.text}>
        Vi har fået din forespørgsel på pizzavognen til {data.date}. {BOOKING_NEXT_STEPS}
      </Text>
      <Text style={emailStyles.text}>
        Har du spørgsmål i mellemtiden, så svar på denne mail eller ring på {site.phone}.
      </Text>
      <Hr style={emailStyles.hr} />
      <Text style={emailStyles.small}>Det har du sendt:</Text>
      {bookingRows(data).map(([label, value]) => (
        <EmailRow key={label} label={label} value={<span style={pre}>{String(value)}</span>} />
      ))}
      <Hr style={emailStyles.hr} />
      <Text style={emailStyles.text}>Vi glæder os til at hygge om jer.</Text>
      <Text style={emailStyles.text}>Kristine og Nicolas</Text>
    </EmailLayout>
  );
}
