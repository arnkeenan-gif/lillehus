/**
 * Checks the deadline engine against Kristine's examples and the summer time
 * changes. Run it in any time zone; the answers must not change:
 *
 *   npx tsx src/lib/ordering/deadline.check.ts
 *   TZ=UTC npx tsx src/lib/ordering/deadline.check.ts
 *   TZ=America/Los_Angeles npx tsx src/lib/ordering/deadline.check.ts
 */
import assert from "node:assert/strict";
import { addDays, chipParts, copenhagenDate, formatDayDate, normalizeClock, pickupTimeText, weekdayOf } from "./dates";
import {
  DEFAULT_DEADLINE,
  copenhagenInstant,
  deadlineFor,
  deadlineText,
  effectiveRule,
  generalRule,
  isBeforeDeadline,
  isDeadlineRule,
  ruleText,
  shownDeadline,
} from "./deadline";
import { defaultSelections, evaluateCake, selectionsKey } from "./cake-options";

let passed = 0;
function check(name: string, fn: () => void) {
  fn();
  passed += 1;
  console.log(`  ok  ${name}`);
}

console.log(`Tidszone på maskinen: ${Intl.DateTimeFormat().resolvedOptions().timeZone}`);

check("onsdag lukker mandag kl. 18 (sommertid, UTC+2)", () => {
  assert.equal(weekdayOf("2026-10-14"), 3);
  assert.equal(deadlineFor("2026-10-14", DEFAULT_DEADLINE).toISOString(), "2026-10-12T16:00:00.000Z");
  assert.equal(deadlineText("2026-10-14", DEFAULT_DEADLINE), "mandag den 12. oktober kl. 18");
});

check("lørdag lukker torsdag kl. 18 (sommertid, UTC+2)", () => {
  assert.equal(weekdayOf("2026-10-17"), 6);
  assert.equal(deadlineFor("2026-10-17", DEFAULT_DEADLINE).toISOString(), "2026-10-15T16:00:00.000Z");
  assert.equal(deadlineText("2026-10-17", DEFAULT_DEADLINE), "torsdag den 15. oktober kl. 18");
});

check("sidste søndag i oktober: lørdag før skiftet lukker torsdag kl. 18 sommertid", () => {
  // Summer time ends Sunday 25 October 2026 at 03.00 (01.00 UTC).
  assert.equal(deadlineFor("2026-10-24", DEFAULT_DEADLINE).toISOString(), "2026-10-22T16:00:00.000Z");
});

check("tirsdag efter skiftet lukker søndag 25. oktober kl. 18 vintertid (UTC+1)", () => {
  assert.equal(deadlineFor("2026-10-27", DEFAULT_DEADLINE).toISOString(), "2026-10-25T17:00:00.000Z");
  assert.equal(deadlineText("2026-10-27", DEFAULT_DEADLINE), "søndag den 25. oktober kl. 18");
});

check("onsdag efter skiftet lukker mandag kl. 18 vintertid", () => {
  assert.equal(deadlineFor("2026-10-28", DEFAULT_DEADLINE).toISOString(), "2026-10-26T17:00:00.000Z");
});

check("sidste søndag i marts: lørdag før lukker torsdag kl. 18 vintertid, onsdag efter mandag kl. 18 sommertid", () => {
  // Summer time starts Sunday 28 March 2027 at 02.00 (01.00 UTC).
  assert.equal(deadlineFor("2027-03-27", DEFAULT_DEADLINE).toISOString(), "2027-03-25T17:00:00.000Z");
  assert.equal(deadlineFor("2027-03-30", DEFAULT_DEADLINE).toISOString(), "2027-03-28T16:00:00.000Z");
  assert.equal(deadlineFor("2027-03-31", DEFAULT_DEADLINE).toISOString(), "2027-03-29T16:00:00.000Z");
});

check("lige før fristen er der åbent, på slaget 18 er der lukket", () => {
  const deadline = deadlineFor("2026-10-14", DEFAULT_DEADLINE).getTime();
  assert.equal(isBeforeDeadline("2026-10-14", DEFAULT_DEADLINE, deadline - 1000), true);
  assert.equal(isBeforeDeadline("2026-10-14", DEFAULT_DEADLINE, deadline), false);
  assert.equal(isBeforeDeadline("2026-10-14", DEFAULT_DEADLINE, deadline + 1), false);
});

check("klokken midt om natten på skiftedagen giver et rigtigt tidspunkt", () => {
  // 02.30 happens twice on 25 October; either instant is 02.30 on the Danish clock.
  const ambiguous = copenhagenInstant("2026-10-25", 2, 30).toISOString();
  assert.ok(["2026-10-25T00:30:00.000Z", "2026-10-25T01:30:00.000Z"].includes(ambiguous), ambiguous);
  assert.equal(copenhagenInstant("2026-10-25", 18).toISOString(), "2026-10-25T17:00:00.000Z");
  assert.equal(copenhagenInstant("2027-03-28", 18).toISOString(), "2027-03-28T16:00:00.000Z");
});

check("varens frist går forud for kategoriens, som går forud for standarden", () => {
  const product = { daysBefore: 4, hour: 12 };
  const category = { daysBefore: 3, hour: 18 };
  const fallback = { daysBefore: 2, hour: 18 };
  assert.deepEqual(effectiveRule(product, category, fallback), product);
  assert.deepEqual(effectiveRule(undefined, category, fallback), category);
  assert.deepEqual(effectiveRule(undefined, undefined, fallback), fallback);
  assert.deepEqual(effectiveRule({ daysBefore: 2 } as never, undefined, fallback), fallback);
  assert.deepEqual(effectiveRule(), DEFAULT_DEADLINE);
  assert.equal(isDeadlineRule({ daysBefore: 1.5, hour: 18 }), false);
  assert.equal(isDeadlineRule({ daysBefore: 2, hour: 24 }), false);
});

check("den viste frist for en dato følger den regel, de fleste varer har", () => {
  const rules = [DEFAULT_DEADLINE, DEFAULT_DEADLINE, { daysBefore: 4, hour: 18 }];
  const general = generalRule(rules, DEFAULT_DEADLINE);
  assert.deepEqual(general, DEFAULT_DEADLINE);
  const saturday = "2026-10-17";
  const early = Date.parse("2026-10-10T08:00:00Z");
  assert.equal(shownDeadline(saturday, rules, general, early)?.at.toISOString(), "2026-10-15T16:00:00.000Z");
  const tooLate = Date.parse("2026-10-15T16:00:00Z");
  assert.equal(shownDeadline(saturday, rules, general, tooLate), null);
  const shortNotice = [DEFAULT_DEADLINE, { daysBefore: 1, hour: 12 }];
  const between = Date.parse("2026-10-15T17:00:00Z");
  assert.equal(shownDeadline(saturday, shortNotice, DEFAULT_DEADLINE, between)?.at.toISOString(), "2026-10-16T10:00:00.000Z");
});

check("datoer på dansk", () => {
  assert.equal(formatDayDate("2026-10-17"), "lørdag den 17. oktober");
  assert.equal(formatDayDate("2026-10-17", { year: true }), "lørdag den 17. oktober 2026");
  assert.deepEqual(chipParts("2026-10-14"), { weekday: "onsdag", date: "14. okt." });
  assert.equal(addDays("2026-03-01", -2), "2026-02-27");
  assert.equal(copenhagenDate(Date.parse("2026-10-16T22:30:00Z")), "2026-10-17");
  assert.equal(copenhagenDate(Date.parse("2026-12-31T23:30:00Z")), "2027-01-01");
  assert.equal(ruleText(DEFAULT_DEADLINE), "kl. 18 to dage før afhentning");
  assert.equal(ruleText({ daysBefore: 1, hour: 12 }), "kl. 12 dagen før afhentning");
});

check("klokkeslæt", () => {
  assert.equal(normalizeClock("09:00"), "9.00");
  assert.equal(normalizeClock("14.30"), "14.30");
  assert.equal(normalizeClock("9"), "9.00");
  assert.equal(normalizeClock("25.00"), "");
  assert.equal(pickupTimeText("9.00", "12.00"), "kl. 9.00 til 12.00");
  assert.equal(pickupTimeText("", ""), "");
});

check("kagens valg prissættes og tjekkes", () => {
  const cake = {
    basePriceOere: 49500,
    optionGroups: [
      { id: "figur", title: "Kagemand eller kagekone", type: "dropdown" as const, required: true, choices: [
        { id: "mand", label: "Kagemand", priceOere: 0, isDefault: false },
        { id: "kone", label: "Kagekone", priceOere: 0, isDefault: false },
      ] },
      { id: "str", title: "Størrelse", type: "radio" as const, required: true, choices: [
        { id: "lille", label: "Lille", priceOere: 0, isDefault: true },
        { id: "stor", label: "Stor", priceOere: 15000, isDefault: false },
      ] },
      { id: "ekstra", title: "Tilvalg", type: "addons" as const, required: false, choices: [
        { id: "flag", label: "Flag", priceOere: 2500, isDefault: false },
        { id: "lys", label: "Lys", priceOere: 1000, isDefault: false },
      ] },
      { id: "tekst", title: "Tekst på kagen", type: "text" as const, required: false, choices: [] },
    ],
  };
  assert.deepEqual(defaultSelections(cake.optionGroups), { str: "lille" });
  const empty = evaluateCake(cake, {});
  assert.deepEqual(Object.keys(empty.errors).sort(), ["figur", "str"]);
  assert.equal(empty.errors.figur, "Vælg kagemand eller kagekone.");
  const full = evaluateCake(cake, { figur: "kone", str: "stor", ekstra: ["lys", "flag", "ukendt"], tekst: "  Tillykke  Ida ", fremmed: "x" });
  assert.deepEqual(full.errors, {});
  assert.equal(full.unitOere, 49500 + 15000 + 2500 + 1000);
  assert.deepEqual(full.lines, ["Kagemand eller kagekone: Kagekone", "Størrelse: Stor", "Tilvalg: Flag, Lys", "Tekst på kagen: Tillykke Ida"]);
  assert.equal(selectionsKey(full.clean), selectionsKey({ tekst: "Tillykke Ida", ekstra: ["lys", "flag"], str: "stor", figur: "kone" }));
});

console.log(`\n${passed} tjek bestået.`);
