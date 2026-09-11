import type { Metadata } from "next";
import { Plus } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import faqJson from "@content/faq.json";

export const metadata: Metadata = {
  title: "Spørgsmål og svar",
  description:
    "Svar på det, vi oftest bliver spurgt om: bestilling, afhentning i Hønsehuset, fryseren og MobilePay, Torvedag i Næstved, allergener, pizzavognen og kager.",
};

type FaqEntry = { q: string; a: string; group?: string };

/** Questions grouped under their `group` heading, in the order they appear in content/faq.json. */
const groups: { name: string; items: FaqEntry[] }[] = [];
for (const item of faqJson as FaqEntry[]) {
  const name = item.group ?? "Andet";
  let group = groups.find((g) => g.name === name);
  if (!group) {
    group = { name, items: [] };
    groups.push(group);
  }
  group.items.push(item);
}

/** Native details/summary accordion with hairlines. No JavaScript. */
export default function FaqPage() {
  return (
    <Section>
      <Container size="narrow">
        <h1 className="text-title font-semibold">Spørgsmål og svar</h1>
        <p className="mt-4 text-lg text-ink-2">
          Det, vi oftest bliver spurgt om ved fryseren og på torvet. Mangler dit spørgsmål, så skriv til os.
        </p>

        {groups.map((group) => (
          <section key={group.name} className="mt-14">
            <h2 className="text-xl font-semibold">{group.name}</h2>
            <div className="mt-4 border-t border-line">
              {group.items.map((item) => (
                <details key={item.q} className="group border-b border-line">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-4 text-left font-medium text-ink [&::-webkit-details-marker]:hidden">
                    <span>{item.q}</span>
                    <Plus
                      size={20}
                      aria-hidden="true"
                      className="shrink-0 text-muted transition-transform duration-150 ease-out-quart group-open:rotate-45"
                    />
                  </summary>
                  <p className="max-w-[60ch] pb-5 text-ink-2">{item.a}</p>
                </details>
              ))}
            </div>
          </section>
        ))}

        <div className="mt-14">
          <Button href="/kontakt" variant="secondary">
            Skriv til os
          </Button>
        </div>
      </Container>
    </Section>
  );
}
