import { Column, Hr, Row, Section, Text } from "@react-email/components";
import { EmailLayout, EmailRow, emailStyles } from "@/emails/_layout";
import type { OrderDetails } from "@/lib/cart-order";
import { formatPrice } from "@/lib/format";
import { formatDayDate, pickupTimeText } from "@/lib/ordering/dates";
import { site } from "@/lib/site";

/* The customer's receipt: what, when and where, in that order. The pickup
   (place, date, time window) comes from the Checkout Session's metadata,
   the place's address from the pickup locations, so it matches the site. */

const line = {
  row: { borderBottom: "1px solid #d9d7d0" },
  qty: { width: 40, fontSize: 15, color: "#1d1d1b", padding: "8px 8px 8px 0", verticalAlign: "top" as const, ...emailStyles.tnum },
  name: { fontSize: 15, color: "#1d1d1b", padding: "8px 8px 8px 0", verticalAlign: "top" as const },
  options: { display: "block", fontSize: 13, color: "#626360", marginTop: 2 },
  price: {
    fontSize: 15,
    color: "#1d1d1b",
    padding: "8px 0",
    textAlign: "right" as const,
    verticalAlign: "top" as const,
    whiteSpace: "nowrap" as const,
    ...emailStyles.tnum,
  },
};

type Props = { order: OrderDetails; address: string };

function pickupParts(order: OrderDetails, address: string) {
  const day = order.pickupDate ? formatDayDate(order.pickupDate, { year: true }) : "den valgte dag";
  const time = pickupTimeText(order.pickupFrom, order.pickupTo);
  const placeName = order.locationName || "det valgte sted";
  const place = address ? `${placeName}, ${address}` : placeName;
  return { day, time, place };
}

export function OrderCustomerEmail({ order, address }: Props) {
  const { day, time, place } = pickupParts(order, address);

  return (
    <EmailLayout preview={`Ordre ${order.orderNo}, ${day}`} title="Tak for din bestilling">
      <Text style={emailStyles.text}>
        Vi har modtaget din betaling. Du henter din bestilling {day}
        {time ? `, ${time}` : ""}. Afhentningssted: {place}.
      </Text>
      <Section style={{ marginTop: 16 }}>
        {order.lines.map((l, i) => (
          <Row key={i} style={line.row}>
            <Column style={line.qty}>{l.qty}</Column>
            <Column style={line.name}>
              {l.name}
              {l.options.length > 0 ? <span style={line.options}>{l.options.join(". ")}</span> : null}
            </Column>
            <Column style={line.price}>{formatPrice(l.totalOere)}</Column>
          </Row>
        ))}
      </Section>
      <Text style={{ ...emailStyles.text, marginTop: 12, fontWeight: 600, color: "#1d1d1b" }}>
        I alt, betalt: <span style={emailStyles.tnum}>{formatPrice(order.totalOere)}</span>
      </Text>
      <Hr style={emailStyles.hr} />
      <EmailRow label="Ordrenummer" value={order.orderNo} />
      <EmailRow label="Afhentning" value={day} />
      {time ? <EmailRow label="Tidspunkt" value={time} /> : null}
      <EmailRow label="Sted" value={place} />
      {order.note ? <EmailRow label="Din besked" value={order.note} /> : null}
      <Text style={{ ...emailStyles.text, marginTop: 24 }}>
        Er der noget, så ring på {site.phone} eller svar på denne mail. Vi glæder os til at se dig.
      </Text>
    </EmailLayout>
  );
}

export function orderCustomerText(order: OrderDetails, address: string): string {
  const { day, time, place } = pickupParts(order, address);
  const out: string[] = ["Tak for din bestilling", ""];
  out.push(`Vi har modtaget din betaling. Du henter din bestilling ${day}${time ? `, ${time}` : ""}. Afhentningssted: ${place}.`);
  out.push("");
  for (const l of order.lines) {
    out.push(`${l.qty} x ${l.name}   ${formatPrice(l.totalOere)}`);
    for (const option of l.options) out.push(`    ${option}`);
  }
  out.push("", `I alt, betalt: ${formatPrice(order.totalOere)}`, "");
  out.push(`Ordrenummer: ${order.orderNo}`);
  out.push(`Afhentning: ${day}`);
  if (time) out.push(`Tidspunkt: ${time}`);
  out.push(`Sted: ${place}`);
  if (order.note) out.push(`Din besked: ${order.note}`);
  out.push("", `Er der noget, så ring på ${site.phone} eller svar på denne mail. Vi glæder os til at se dig.`);
  out.push("", site.name, `${site.address.street}, ${site.address.postalCode} ${site.address.city}. CVR ${site.cvr}`);
  return out.join("\n");
}
