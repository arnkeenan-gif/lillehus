import { Column, Hr, Row, Section, Text } from "@react-email/components";
import { EmailLayout, EmailRow, emailStyles } from "@/emails/_layout";
import type { OrderDetails } from "@/lib/cart-order";
import { pickupDayLabel } from "@/lib/cart-pickup";
import { formatPrice } from "@/lib/format";
import { shop } from "@/lib/products";

/*
  The baking list. Lines first, big and tabular, then who and when. Kristine
  reads this on her phone at five in the morning, so the numbers come first.
*/

export function orderDayLabel(order: OrderDetails): string {
  return order.pickupDate ? pickupDayLabel(order.pickupDate) : "ukendt dag";
}

const line = {
  row: { borderBottom: "1px solid #d9d7d0" },
  qty: {
    width: 56,
    fontSize: 24,
    fontWeight: 600,
    color: "#1d1d1b",
    padding: "10px 8px 10px 0",
    verticalAlign: "top" as const,
    ...emailStyles.tnum,
  },
  name: { fontSize: 18, color: "#1d1d1b", padding: "12px 8px 10px 0", verticalAlign: "top" as const },
  price: {
    fontSize: 15,
    color: "#626360",
    padding: "13px 0 10px",
    textAlign: "right" as const,
    verticalAlign: "top" as const,
    whiteSpace: "nowrap" as const,
    ...emailStyles.tnum,
  },
};

export function OrderKristineEmail({ order }: { order: OrderDetails }) {
  const day = orderDayLabel(order);
  const isDelivery = order.fulfilment === "delivery";
  const preview = `${order.customerName || "Ukendt navn"}: ${order.lines.map((l) => `${l.qty} ${l.name}`).join(", ")}`;

  return (
    <EmailLayout preview={preview} title={`Bagesedel til ${day}`}>
      <Section>
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
        Betalt i alt: <span style={emailStyles.tnum}>{formatPrice(order.totalOere)}</span>
      </Text>
      <Hr style={emailStyles.hr} />
      <EmailRow label="Ordrenummer" value={order.orderNo} />
      <EmailRow
        label={isDelivery ? "Levering" : "Afhentning"}
        value={isDelivery ? day : `${day} i Hønsehuset, kl. ${shop.pickupWindow}`}
      />
      <EmailRow label="Navn" value={order.customerName || "Ikke oplyst"} />
      <EmailRow label="Telefon" value={order.phone || "Ikke oplyst"} />
      <EmailRow label="E-mail" value={order.email || "Ikke oplyst"} />
      {order.note ? <EmailRow label="Besked" value={order.note} /> : null}
      <Text style={{ ...emailStyles.small, marginTop: 16 }}>Svar på denne mail, hvis du vil skrive til kunden.</Text>
    </EmailLayout>
  );
}

export function orderKristineText(order: OrderDetails): string {
  const day = orderDayLabel(order);
  const isDelivery = order.fulfilment === "delivery";
  const out: string[] = [`Bagesedel til ${day}`, ""];
  for (const l of order.lines) out.push(`${l.qty} x ${l.name}   ${formatPrice(l.totalOere)}`);
  if (order.deliveryOere !== null) out.push(`Levering   ${formatPrice(order.deliveryOere)}`);
  out.push("", `Betalt i alt: ${formatPrice(order.totalOere)}`, "");
  out.push(`Ordrenummer: ${order.orderNo}`);
  out.push(`${isDelivery ? "Levering" : "Afhentning"}: ${isDelivery ? day : `${day} i Hønsehuset, kl. ${shop.pickupWindow}`}`);
  out.push(`Navn: ${order.customerName || "Ikke oplyst"}`);
  out.push(`Telefon: ${order.phone || "Ikke oplyst"}`);
  out.push(`E-mail: ${order.email || "Ikke oplyst"}`);
  if (order.note) out.push(`Besked: ${order.note}`);
  return out.join("\n");
}
