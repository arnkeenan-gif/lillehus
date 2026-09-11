import { Column, Hr, Row, Section, Text } from "@react-email/components";
import { EmailLayout, EmailRow, emailStyles } from "@/emails/_layout";
import type { OrderDetails } from "@/lib/cart-order";
import { pickupDayLabel, pickupHours, type ShopConfig } from "@/lib/cart-pickup";
import { formatPrice } from "@/lib/format";
import { site } from "@/lib/site";

/* The customer's receipt: what, when and where, in that order. The pickup
   facts come from getShop() in the webhook, so they match the site. */

const line = {
  row: { borderBottom: "1px solid #d9d7d0" },
  qty: { width: 40, fontSize: 15, color: "#1d1d1b", padding: "8px 8px 8px 0", verticalAlign: "top" as const, ...emailStyles.tnum },
  name: { fontSize: 15, color: "#1d1d1b", padding: "8px 8px 8px 0", verticalAlign: "top" as const },
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

type Props = { order: OrderDetails; shop: ShopConfig };

function whenAndWhere(order: OrderDetails, shop: ShopConfig): { day: string; place: string } {
  const day = order.pickupDate ? pickupDayLabel(order.pickupDate) : "den aftalte dag";
  const place = order.fulfilment === "delivery" ? shop.delivery.note : `${shop.pickupPlace}, kl. ${shop.pickupWindow}`;
  return { day, place };
}

export function OrderCustomerEmail({ order, shop }: Props) {
  const { day, place } = whenAndWhere(order, shop);
  const isDelivery = order.fulfilment === "delivery";

  return (
    <EmailLayout preview={`Ordre ${order.orderNo}, ${day}`} title="Tak for din bestilling">
      <Text style={emailStyles.text}>
        Vi har modtaget din betaling.{" "}
        {isDelivery
          ? `Vi leverer ${day}. ${shop.delivery.note}`
          : `Du henter dine varer ${day} i ${shop.pickupPlace}, mellem kl. ${pickupHours(shop.pickupWindow)}.`}
      </Text>
      <Section style={{ marginTop: 16 }}>
        {order.lines.map((l, i) => (
          <Row key={i} style={line.row}>
            <Column style={line.qty}>{l.qty}</Column>
            <Column style={line.name}>{l.name}</Column>
            <Column style={line.price}>{formatPrice(l.totalOere)}</Column>
          </Row>
        ))}
        {order.deliveryOere !== null ? (
          <Row style={line.row}>
            <Column style={line.qty} />
            <Column style={line.name}>Levering</Column>
            <Column style={line.price}>{formatPrice(order.deliveryOere)}</Column>
          </Row>
        ) : null}
      </Section>
      <Text style={{ ...emailStyles.text, marginTop: 12, fontWeight: 600, color: "#1d1d1b" }}>
        I alt, betalt: <span style={emailStyles.tnum}>{formatPrice(order.totalOere)}</span>
      </Text>
      <Hr style={emailStyles.hr} />
      <EmailRow label="Ordrenummer" value={order.orderNo} />
      <EmailRow label={isDelivery ? "Levering" : "Afhentning"} value={day} />
      <EmailRow label="Sted" value={place} />
      {order.note ? <EmailRow label="Din besked" value={order.note} /> : null}
      <Text style={{ ...emailStyles.text, marginTop: 24 }}>
        Er der noget, så ring på {site.phone} eller svar på denne mail. Vi glæder os til at se dig.
      </Text>
    </EmailLayout>
  );
}

export function orderCustomerText(order: OrderDetails, shop: ShopConfig): string {
  const { day, place } = whenAndWhere(order, shop);
  const isDelivery = order.fulfilment === "delivery";
  const out: string[] = ["Tak for din bestilling", ""];
  out.push(
    isDelivery
      ? `Vi har modtaget din betaling. Vi leverer ${day}. ${shop.delivery.note}`
      : `Vi har modtaget din betaling. Du henter dine varer ${day} i ${shop.pickupPlace}, mellem kl. ${pickupHours(shop.pickupWindow)}.`,
  );
  out.push("");
  for (const l of order.lines) out.push(`${l.qty} x ${l.name}   ${formatPrice(l.totalOere)}`);
  if (order.deliveryOere !== null) out.push(`Levering   ${formatPrice(order.deliveryOere)}`);
  out.push("", `I alt, betalt: ${formatPrice(order.totalOere)}`, "");
  out.push(`Ordrenummer: ${order.orderNo}`);
  out.push(`${isDelivery ? "Levering" : "Afhentning"}: ${day}`);
  out.push(`Sted: ${place}`);
  if (order.note) out.push(`Din besked: ${order.note}`);
  out.push("", `Er der noget, så ring på ${site.phone} eller svar på denne mail. Vi glæder os til at se dig.`);
  out.push("", site.name, `${site.address.street}, ${site.address.postalCode} ${site.address.city}. CVR ${site.cvr}`);
  return out.join("\n");
}
