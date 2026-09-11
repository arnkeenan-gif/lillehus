import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import { site } from "@/lib/site";

/*
  Shared shell for every email the site sends. Plain, readable, prints well.
  Same palette as the site: paper, ink, rust for the one link colour.
*/

export const emailStyles = {
  body: { backgroundColor: "#fafaf8", fontFamily: "Helvetica, Arial, sans-serif", color: "#1d1d1b", margin: 0, padding: "24px 0" },
  container: { backgroundColor: "#ffffff", border: "1px solid #d9d7d0", borderRadius: 6, padding: "32px", maxWidth: 560 },
  heading: { fontSize: 22, fontWeight: 600, margin: "0 0 16px", letterSpacing: "-0.01em" },
  text: { fontSize: 15, lineHeight: "1.55", color: "#3d3d39", margin: "0 0 12px" },
  small: { fontSize: 13, lineHeight: "1.5", color: "#626360", margin: "0 0 6px" },
  label: { fontSize: 13, color: "#626360", margin: "12px 0 2px" },
  value: { fontSize: 15, color: "#1d1d1b", margin: 0 },
  hr: { borderTop: "1px solid #d9d7d0", margin: "24px 0" },
  link: { color: "#a9522b" },
  tnum: { fontVariantNumeric: "tabular-nums" as const },
} as const;

export function EmailLayout({
  preview,
  title,
  children,
}: {
  preview: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Html lang="da">
      <Head />
      <Preview>{preview}</Preview>
      <Body style={emailStyles.body}>
        <Container style={emailStyles.container}>
          <Heading as="h1" style={emailStyles.heading}>
            {title}
          </Heading>
          {children}
          <Section style={{ marginTop: 32 }}>
            <Text style={emailStyles.small}>{site.name}</Text>
            <Text style={emailStyles.small}>
              {site.address.street}, {site.address.postalCode} {site.address.city}. Tlf. {site.phone}. CVR {site.cvr}
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

/** A label/value pair used in every order and booking email. */
export function EmailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <>
      <Text style={emailStyles.label}>{label}</Text>
      <Text style={emailStyles.value}>{value}</Text>
    </>
  );
}
