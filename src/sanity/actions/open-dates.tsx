import { useMemo, useState } from "react";
import { useDocumentOperation, type DocumentActionComponent } from "sanity";
import { CalendarIcon } from "@sanity/icons/Calendar";
import { Box, Button, Card, Checkbox, Flex, Grid, Stack, Text, TextInput } from "@sanity/ui";
import { useToast } from "@sanity/ui/toast";
import { addDays, copenhagenDate, formatDayDate, normalizeClock, weekdayOf } from "../../lib/ordering/dates";

/**
 * "Åbn datoer" on a pickup location: pick weekdays (onsdag and lørdag to
 * begin with), a pickup time and how many weeks ahead, and the dates that
 * are not on the list yet are added, open, sorted with the others. Kristine
 * then presses Udgiv. Dates already there, open or closed, are left alone,
 * so a date she closed for a holiday stays closed.
 */

const WEEKDAYS = [
  { day: 1, title: "mandag" },
  { day: 2, title: "tirsdag" },
  { day: 3, title: "onsdag" },
  { day: 4, title: "torsdag" },
  { day: 5, title: "fredag" },
  { day: 6, title: "lørdag" },
  { day: 0, title: "søndag" },
];

interface DateEntry {
  _key: string;
  _type?: string;
  date?: string;
  open?: boolean;
  from?: string;
  to?: string;
  note?: string;
}

function newKey(date: string): string {
  return `d${date.replace(/-/g, "")}${Math.random().toString(36).slice(2, 7)}`;
}

/** The dates to add: the chosen weekdays from today on, for `weeks` weeks, minus those already listed. */
function datesToAdd(weekdays: number[], weeks: number, existing: Set<string>): string[] {
  const today = copenhagenDate();
  const out: string[] = [];
  for (let i = 0; i < weeks * 7; i++) {
    const date = addDays(today, i);
    if (weekdays.includes(weekdayOf(date)) && !existing.has(date)) out.push(date);
  }
  return out;
}

export const OpenDatesAction: DocumentActionComponent = (props) => {
  const { id, type, draft, published } = props;
  const { patch } = useDocumentOperation(id, type);
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [weekdays, setWeekdays] = useState<number[]>([3, 6]);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [weeks, setWeeks] = useState("4");

  const doc = draft ?? published;
  const existing = useMemo(() => ((doc?.dates as DateEntry[] | undefined) ?? []).filter((d) => d && d._key), [doc]);
  const weekCount = Math.min(26, Math.max(1, Math.floor(Number(weeks)) || 0));
  const weeksValid = Number(weeks) >= 1 && Number(weeks) <= 26;
  const toAdd = useMemo(
    () => (weeksValid ? datesToAdd(weekdays, weekCount, new Set(existing.map((d) => d.date ?? ""))) : []),
    [weekdays, weekCount, weeksValid, existing],
  );
  const fromClock = normalizeClock(from);
  const toClock = normalizeClock(to);

  function toggle(day: number, checked: boolean) {
    setWeekdays((prev) => (checked ? [...prev, day] : prev.filter((d) => d !== day)));
  }

  function apply() {
    if (toAdd.length === 0) return;
    const added: DateEntry[] = toAdd.map((date) => ({
      _key: newKey(date),
      _type: "pickupDateEntry",
      date,
      open: true,
      ...(fromClock ? { from: fromClock } : {}),
      ...(toClock ? { to: toClock } : {}),
    }));
    const merged = [...existing, ...added].sort((a, b) => (a.date ?? "").localeCompare(b.date ?? ""));
    patch.execute([{ setIfMissing: { dates: [] } }, { set: { dates: merged } }]);
    toast.push({
      status: "success",
      title: toAdd.length === 1 ? "1 dato er lagt ind" : `${toAdd.length} datoer er lagt ind`,
      description: "Tryk Udgiv for at vise dem på siden.",
    });
    setOpen(false);
  }

  const summary =
    !weeksValid
      ? "Skriv et antal uger fra 1 til 26."
      : weekdays.length === 0
        ? "Vælg mindst én ugedag."
        : toAdd.length === 0
          ? "Alle de datoer står allerede på listen."
          : `${toAdd.length === 1 ? "1 ny dato" : `${toAdd.length} nye datoer`} fra ${formatDayDate(toAdd[0])} til ${formatDayDate(toAdd[toAdd.length - 1], { year: true })}.`;

  return {
    label: "Åbn datoer",
    title: "Læg flere uger med afhentningsdatoer ind på én gang",
    icon: CalendarIcon,
    disabled: Boolean(patch.disabled),
    onHandle: () => setOpen(true),
    dialog: open
      ? {
          type: "dialog",
          header: "Åbn datoer",
          width: "small",
          onClose: () => setOpen(false),
          content: (
            <Stack gap={5}>
              <Text size={1} muted>
                Vælg ugedage, afhentningstid og hvor mange uger frem, du vil åbne fra i dag. Datoer, der allerede står på listen, bliver ikke
                lagt ind igen.
              </Text>

              <Stack gap={3}>
                <Text size={1} weight="semibold">
                  Ugedage
                </Text>
                <Grid gridTemplateColumns={[2, 2, 4]} gap={3}>
                  {WEEKDAYS.map((w) => (
                    <Flex key={w.day} as="label" align="center" gap={2}>
                      <Checkbox checked={weekdays.includes(w.day)} onChange={(e) => toggle(w.day, e.currentTarget.checked)} />
                      <Text size={1}>{w.title}</Text>
                    </Flex>
                  ))}
                </Grid>
              </Stack>

              <Grid gridTemplateColumns={2} gap={3}>
                <Stack gap={2}>
                  <Text as="label" htmlFor="aabn-fra" size={1} weight="semibold">
                    Afhentning fra kl.
                  </Text>
                  <TextInput id="aabn-fra" type="time" value={from} onChange={(e) => setFrom(e.currentTarget.value)} />
                </Stack>
                <Stack gap={2}>
                  <Text as="label" htmlFor="aabn-til" size={1} weight="semibold">
                    Afhentning til kl.
                  </Text>
                  <TextInput id="aabn-til" type="time" value={to} onChange={(e) => setTo(e.currentTarget.value)} />
                </Stack>
              </Grid>
              <Text size={1} muted>
                Tiden kan stå tom og sættes senere på den enkelte dato.
              </Text>

              <Stack gap={2}>
                <Text as="label" htmlFor="aabn-uger" size={1} weight="semibold">
                  Antal uger frem
                </Text>
                <Box style={{ maxWidth: 120 }}>
                  <TextInput id="aabn-uger" type="number" min={1} max={26} value={weeks} onChange={(e) => setWeeks(e.currentTarget.value)} />
                </Box>
              </Stack>

              <Card padding={3} radius={2} tone={toAdd.length > 0 ? "primary" : "caution"}>
                <Text size={1}>{summary}</Text>
              </Card>

              <Flex gap={2} justify="flex-end">
                <Button mode="ghost" text="Annuller" onClick={() => setOpen(false)} />
                <Button
                  tone="primary"
                  text={toAdd.length === 1 ? "Læg 1 dato ind" : `Læg ${toAdd.length} datoer ind`}
                  disabled={toAdd.length === 0}
                  onClick={apply}
                />
              </Flex>
            </Stack>
          ),
        }
      : null,
  };
};

OpenDatesAction.displayName = "OpenDatesAction";
