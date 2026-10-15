// Tests for the smart planner (Ver.1.7): plan generation, budget verdicts, flights, currencies, saving, texts.
// Local tests only (no network, no flight API). Run: npm test
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { DESTINATIONS, ORIGINS, isIata } from "../data/airports";
import { schoolCandidates } from "../data/official/planner";
import { FLIGHT_PROVIDERS, PRICE_BASES, SKYSCANNER_FORMATS, SKYSCANNER_HOME, departureDate, fetchQuotes, isValidQuote, returnDate, skyscannerIndicative, skyscannerLink, type FlightQuote } from "../lib/flights";
import { VERSION, parseVersion, versionLabel } from "../lib/version";
import { ITEM_IDS, calcPlan, stayWeeks, WEEKS_PER_MONTH, type ItemId } from "../lib/planner";
import { MAIN_ITEMS, MAX_COMPARE, MAX_SAVED, TIERS, cleanEasy, cleanSaved, defaultEasy, deleteSaved, emptySaved, generate, generateOne, renameSaved, savePlan, toggleCompare, type Easy } from "../lib/smart";
import { st } from "../locales/smart";

let n = 0; const t = (name: string, fn: () => void | Promise<void>) => { const r = fn(); n++; return Promise.resolve(r).then(() => console.log("ok", name)); };
const NOW = "2026-10-14T00:00:00.000Z";
const gen = (e: Easy, o: { allowSample?: boolean } = {}) => generate(e, { now: NOW, ...o });
const man = (o: Partial<Easy> = {}): Easy => ({ ...defaultEasy({ cityId: "manchester", studyType: "university" }), ...o });
const near = (a: number, b: number, eps = 1e-6) => assert.ok(Math.abs(a - b) < eps, `${a} ≉ ${b}`);
// fills in every assumption that was not given (flight prices are in the budget currency)
const full = (e: Easy): Easy => ({ ...e, assume: { tuitionWeek: e.assume.tuitionWeek ?? 250, visa: e.assume.visa ?? 490, insurance: e.assume.insurance ?? 300, flight: { round: e.assume.flight.round ?? 700, oneway: e.assume.flight.oneway ?? 400 } } });

async function main() {
await t("airports: valid unique IATA codes, supported destinations", () => {
  const codes = ORIGINS.map((a) => a.code); assert.equal(new Set(codes).size, codes.length); assert.ok(codes.every(isIata));
  assert.equal(DESTINATIONS.manchester.code, "MAN"); assert.equal(DESTINATIONS.vancouver.code, "YVR"); assert.ok(isIata("HND") && !isIata("hnd") && !isIata("HNDX"));
});

await t("flights: no provider is connected – nothing is fetched or pretended to be", async () => {
  const q = { origin: "HND", destination: "MAN", month: 9, trip: "round" as const, currency: "JPY" as const };
  const r = await skyscannerIndicative.quote(q); assert.equal(r.status, "not-connected");
  const all = await fetchQuotes(q); assert.equal(all.quotes.length, 0); assert.equal(all.failures.length, FLIGHT_PROVIDERS.length);
  // a connected provider can be swapped in; every price keeps its type, and inconsistent quotes are dropped
  const good: FlightQuote = { basis: "observed", bookable: false, amount: 1, currency: "JPY", trip: "round", provider: "X", observedAt: "2026-10-14T00:00:00Z" };
  const range: FlightQuote = { basis: "range", bookable: false, low: 80_000, high: 160_000, currency: "JPY", trip: "round", provider: "X" };
  const bad: FlightQuote = { basis: "user", bookable: true, amount: 5, currency: "JPY", trip: "round", provider: "X" };
  const fake = { id: "x", name: "X", quote: async () => ({ status: "ok" as const, quotes: [good, range, bad, { ...range, low: 9, high: 1 }] }) };
  const swapped = await fetchQuotes(q, [fake, { ...fake, quote: async () => { throw new Error("boom"); } }]); assert.deepEqual(swapped.quotes.map((x) => x.basis), ["observed", "range"]); assert.equal(swapped.failures[0].status, "error");
});

await t("price types: observed / average / reference range / user budget are distinct and validated", () => {
  assert.deepEqual([...PRICE_BASES], ["observed", "average", "range", "user"]);
  const base = { bookable: false, currency: "JPY" as const, trip: "oneway" as const, provider: "p" };
  assert.ok(isValidQuote({ ...base, basis: "average", amount: 100 })); assert.ok(isValidQuote({ ...base, basis: "user", amount: 0 })); assert.ok(isValidQuote({ ...base, basis: "range", low: 1, high: 1 }));
  assert.ok(!isValidQuote({ ...base, basis: "range", low: 5, high: 1 })); assert.ok(!isValidQuote({ ...base, basis: "average", amount: -1 })); assert.ok(!isValidQuote({ ...base, basis: "observed", amount: NaN }));
  assert.ok(!isValidQuote({ ...base, bookable: true, basis: "user", amount: 1 }), "a user's budget is never a bookable fare"); assert.ok(isValidQuote({ ...base, bookable: true, basis: "observed", amount: 1 }));
});

await t("flights: departure month → date (never in the past); undecided month works", () => {
  const now = new Date("2026-10-14T00:00:00Z");
  assert.equal(departureDate(11, now), "2026-11-01"); assert.equal(departureDate(10, now), "2026-10-01"); assert.equal(departureDate(9, now), "2027-09-01"); assert.equal(departureDate(null, now), null); assert.equal(departureDate(13, now), null);
  assert.equal(returnDate("2026-11-01", 4), "2026-11-29"); assert.equal(returnDate(null, 4), null);
});

await t("Skyscanner link: only Skyscanner's own site; route and dates are not carried over an unverified format", () => {
  const q = { origin: "HND", destination: "MAN", currency: "JPY" as const, now: new Date("2026-10-14T00:00:00Z"), stayWeeks: 12 };
  assert.ok(SKYSCANNER_FORMATS.every((f) => f.verified === false && f.source), "no URL format is verified today");
  for (const month of [null, 11]) for (const trip of ["round", "oneway"] as const) {
    const ja = skyscannerLink({ ...q, month, trip }, "ja"); const en = skyscannerLink({ ...q, month, trip }, "en");
    assert.equal(ja.url, SKYSCANNER_HOME.ja); assert.equal(en.url, SKYSCANNER_HOME.en); assert.equal(ja.carriesRoute, false); assert.ok(!/hnd|man|2611/i.test(ja.url));
  }
  assert.ok(/^https:\/\/www\.skyscanner\.(jp|net)\/$/.test(SKYSCANNER_HOME.ja) && /^https:\/\/www\.skyscanner\.(jp|net)\/$/.test(SKYSCANNER_HOME.en));
  // once a format is verified it is used; a result that is not a Skyscanner https URL is refused
  const verified = [{ id: "t", verified: true, source: "test", build: (x: { origin: string; destination: string }) => `https://www.skyscanner.net/x/${x.origin}/${x.destination}/` }];
  const v = skyscannerLink({ ...q, month: null, trip: "round" }, "en", verified); assert.equal(v.carriesRoute, true); assert.equal(v.url, "https://www.skyscanner.net/x/HND/MAN/");
  const evil = skyscannerLink({ ...q, month: null, trip: "round" }, "en", [{ ...verified[0], build: () => "https://evil.example/skyscanner.net/" }]); assert.equal(evil.carriesRoute, false); assert.equal(evil.url, SKYSCANNER_HOME.en);
  const http = skyscannerLink({ ...q, month: null, trip: "round" }, "en", [{ ...verified[0], build: () => "http://www.skyscanner.net/" }]); assert.equal(http.carriesRoute, false);
});

await t("version scheme: Major.Phase.Update, this release is Ver.1.1.9", () => {
  assert.equal(VERSION, "1.1.9"); assert.equal(versionLabel, "Ver.1.1.9"); assert.deepEqual(parseVersion("Ver.1.1.9"), [1, 1, 9]); assert.deepEqual(parseVersion("1.1.10"), [1, 1, 10]);
  assert.equal(parseVersion("Ver.1.8"), undefined, "the old two-part names are not rewritten");
  const pkg = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8")); assert.equal(pkg.version, VERSION);
});

await t("three plans are generated for every supported city / study type, in the same order", () => {
  for (const cityId of ["manchester", "vancouver"] as const) for (const studyType of ["language", "university"] as const) {
    const ps = gen(defaultEasy({ cityId, studyType })); assert.deepEqual(ps.map((p) => p.tier), [...TIERS]);
  }
});

await t("Budget ≤ Balanced ≤ Comfort in counted cost (same currency, same inputs)", () => {
  for (const e of [man(), man({ housing: "dorm" }), man({ housing: "share" }), defaultEasy({ cityId: "vancouver", studyType: "university" }), defaultEasy({ cityId: "vancouver", studyType: "language" })]) {
    const [b, m, c] = gen(e).map((p) => p.calc.total.converted); assert.ok(b <= m + 1e-9 && m <= c + 1e-9, `${e.cityId} ${e.studyType} ${e.housing}: ${b} ${m} ${c}`);
  }
});

await t("determinism: the same input gives the same plans", () => { assert.equal(JSON.stringify(gen(man())), JSON.stringify(gen(man()))); });

await t("no invented prices: every official item value is a verified candidate figure; unset items are not counted as 0", () => {
  for (const sp of gen(man())) {
    let sum = 0;
    for (const id of ITEM_IDS) {
      const it = sp.plan.items[id]; const r = sp.calc.items[id]; const p = sp.picks[id];
      if (p.status === "official") { assert.equal(it.source.kind, "official"); assert.equal(it.value, p.cand!.value); assert.equal(p.cand!.status, "verified"); assert.ok(it.source.kind === "official" && it.source.url?.startsWith("https://")); }
      if (p.status === "unset") { assert.equal(it.value, null); assert.equal(r.state, "unset"); assert.ok(p.why); }
      if (r.state === "ok") sum += r.total;
    }
    near(sum, sp.calc.total.byCurrency.GBP ?? 0, 1e-6);
  }
  const sp = gen(man())[0]; for (const id of ["tuition", "visa", "insurance", "flights"] as ItemId[]) assert.equal(sp.picks[id].status, "unset");
});

await t("fictional sample schools are never used unless explicitly allowed (tests only)", () => {
  const e = man({ studyType: "language", housing: "share" });
  assert.equal(gen(e)[0].picks.tuition.status, "unset"); assert.equal(schoolCandidates("manchester", "tuition", "language").length, 0);
  const s = gen(e, { allowSample: true }); assert.equal(s[0].picks.tuition.status, "official"); assert.equal(s[0].picks.tuition.cand!.origin, "school");
  const t1 = s.map((p) => (p.calc.items.tuition as { total: number }).total); assert.ok(t1[0] <= t1[1] && t1[1] <= t1[2]);
});

await t("eligibility: language students get no university halls / U-Pass; university students do", () => {
  const lang = gen(man({ studyType: "language", housing: "dorm" }))[0];
  assert.equal(lang.picks.housing.status, "unset"); assert.equal(lang.picks.housing.why, "ineligible"); assert.ok(lang.excluded.some((x) => x.itemId === "housing" && x.kind === "eligibility"));
  const manLang = gen(man({ studyType: "language", housing: null }))[0]; assert.ok(manLang.excluded.some((x) => x.cand.id === "man-bus-allterms-student" && x.kind === "eligibility")); assert.notEqual(manLang.picks.transport.cand?.id, "man-bus-allterms-student");
  const manUni = gen(man({ studyType: "university", housing: null }))[2]; assert.ok([manUni.picks.transport.cand?.id, ...manUni.excluded.map((x) => x.cand.id)].includes("man-bus-allterms-student") || manUni.picks.transport.status === "official");
  // Vancouver: the TransLink fares are held back (rights review), so transport has no official figure for either study type
  for (const studyType of ["language", "university"] as const) { const v = gen(defaultEasy({ cityId: "vancouver", studyType }))[0]; assert.equal(v.picks.transport.status, "unset"); assert.ok(v.mainMissing.includes("transport")); }
  // Ver.1.2.5: the University of Manchester house-share figure is an estimate for its own undergraduates (term not stated), so it is offered by hand but never picked automatically
  const anyLang = gen(man({ studyType: "language", housing: null }))[0]; assert.equal(anyLang.picks.housing.status, "unset"); assert.ok(anyLang.mainMissing.includes("housing"));
});

await t("contract terms: a 41-week hall contract is only used for a stay of about 41 weeks", () => {
  const short = gen(man({ housing: "dorm", duration: { value: 12, unit: "weeks" } }))[2]; assert.ok(short.excluded.some((x) => x.kind === "contract" && x.cand.coverageWeeks === 41));
  assert.ok(short.calc.items.housing.state !== "ok" || !("warn" in short.calc.items.housing) || !short.calc.items.housing.warn);
  const long = gen(man({ housing: "dorm", duration: { value: 41, unit: "weeks" } })); assert.ok(long.every((p) => !p.excluded.some((x) => x.kind === "contract")));
  assert.ok(long.some((p) => p.picks.housing.cand?.coverageWeeks === 41));
  for (const p of long) { const r = p.calc.items.housing; if (r.state === "ok") assert.equal(r.warn, undefined); }
});

await t("single rooms only: a whole-flat average is never picked automatically", () => {
  const sp = gen({ ...defaultEasy({ cityId: "vancouver", studyType: "language" }), housing: "other" }); assert.ok(sp.every((p) => p.picks.housing.cand?.id !== "van-cmhc-rent-2br")); assert.ok(sp[2].excluded.some((x) => x.kind === "scope"));
  // Ver.1.2.5: the CMHC averages describe the whole rental market, not what a student pays per person: offered by hand, never picked automatically
  assert.ok(sp.every((p) => p.picks.housing.cand === undefined || !p.picks.housing.cand.id.startsWith("van-cmhc-rent")), "no whole-market average is adopted"); assert.equal(sp[2].picks.housing.status, "unset");
});

await t("data gaps: vancouver dorm / homestay have no verified figure → unset with a reason, never 0", () => {
  for (const housing of ["dorm", "homestay", "share"] as const) { const sp = gen({ ...defaultEasy({ cityId: "vancouver", studyType: "university" }), housing })[0]; assert.equal(sp.picks.housing.status, "unset"); assert.equal(sp.calc.items.housing.state, "unset"); assert.ok(sp.mainMissing.includes("housing")); }
});

await t("provisional: main items missing → 暫定, no 'within budget' verdict, remaining budget shown", () => {
  const sp = gen(man({ budget: { amount: 100_000, currency: "GBP" } }))[0];
  assert.equal(sp.provisional, true); assert.ok(sp.mainMissing.includes("tuition") && sp.mainMissing.includes("flights")); assert.equal(sp.verdict, "undetermined"); assert.ok(sp.remaining! > 0);
  near(sp.remaining!, 100_000 - sp.calc.total.converted, 1e-6); assert.equal(sp.setCount, ITEM_IDS.length - sp.calc.unset.length);
});

await t("verdicts: within / over (all main items present) and overAlready (items missing but already over)", () => {
  // (41 weeks = the stated hall contract; weekly "from" prices without a contract are no longer picked automatically, Ver.1.2.5)
  const e = full(man({ housing: "dorm", duration: { value: 41, unit: "weeks" }, budget: { amount: 8_000, currency: "GBP" }, rates: { JPY: { rate: 0.005, date: "2026-10-14" } } }));
  const ok = gen({ ...e, budget: { amount: 100_000, currency: "GBP" } }); assert.ok(ok.every((p) => p.mainMissing.length === 0 || p.mainMissing.every((i) => MAIN_ITEMS.includes(i))));
  // JPY flight needs a JPY→GBP rate here (flight currency = budget currency, so it is GBP and needs none)
  const e2 = { ...e, assume: { ...e.assume, flight: { round: 700, oneway: 400 } } };
  const within = gen({ ...e2, budget: { amount: 100_000, currency: "GBP" } }); assert.ok(within.every((p) => !p.provisional && p.verdict === "within"), within.map((p) => p.verdict + p.mainMissing).join());
  const over = gen({ ...e2, budget: { amount: 3_000, currency: "GBP" } }); assert.ok(over.every((p) => !p.provisional && p.verdict === "over" && p.remaining! < 0));
  const already = gen(man({ budget: { amount: 500, currency: "GBP" } })); assert.ok(already.every((p) => p.provisional && p.verdict === "overAlready"));
  near(over[0].remaining!, 3_000 - over[0].calc.total.converted, 1e-6);
});

await t("equal to budget counts as within; remaining 0", () => {
  const e = full(man({ housing: "dorm", duration: { value: 41, unit: "weeks" }, assume: { tuitionWeek: 250, visa: 490, insurance: 300, flight: { round: 700, oneway: 400 } } }));
  const total = gen({ ...e, budget: { amount: 1e9, currency: "GBP" } })[0].calc.total.converted; const sp = gen({ ...e, budget: { amount: total, currency: "GBP" } })[0]; assert.equal(sp.verdict, "within"); near(sp.remaining!, 0, 1e-6);
});

await t("slider ↔ amount: tuition assumption feeds the plan total exactly (per week × weeks)", () => {
  const e = man({ housing: "share", duration: { value: 12, unit: "weeks" } }); const a = gen(e)[0]; const b = gen({ ...e, assume: { ...e.assume, tuitionWeek: 300 } })[0];
  near(b.calc.total.converted - a.calc.total.converted, 300 * 12); assert.equal(b.picks.tuition.status, "assumption"); assert.equal(b.plan.items.tuition.source.kind, "user");
  const c = gen({ ...e, assume: { ...e.assume, tuitionWeek: 310 } })[0]; near(c.calc.total.converted - b.calc.total.converted, 10 * 12);
  const z = gen({ ...e, assume: { ...e.assume, tuitionWeek: 0 } })[0]; assert.equal(z.picks.tuition.status, "assumption"); near(z.calc.total.converted, a.calc.total.converted); assert.ok(!z.mainMissing.includes("tuition"));
});

await t("duration change recalculates: weeks, months (1 month = 52/12 weeks) and the weekly/monthly items", () => {
  const e = man({ housing: "share", assume: { tuitionWeek: 100, visa: null, insurance: null, flight: { round: null, oneway: null } } });
  const w12 = gen({ ...e, duration: { value: 12, unit: "weeks" } })[0]; const w24 = gen({ ...e, duration: { value: 24, unit: "weeks" } })[0];
  near((w24.calc.items.tuition as { total: number }).total, 2400); near((w24.calc.items.food as { total: number }).total, 2 * (w12.calc.items.food as { total: number }).total); // a monthly item (housing has no automatic monthly figure for a short stay since Ver.1.2.5)
  const m3 = gen({ ...e, duration: { value: 3, unit: "months" } })[0]; near(stayWeeks(m3.plan), 13); near((m3.calc.items.tuition as { total: number }).total, 1300);
  near(m3.calc.months, 3); near(m3.calc.monthlyLiving!.converted, gen({ ...e, duration: { value: 13, unit: "weeks" } })[0].calc.monthlyLiving!.converted);
  assert.ok(w24.calc.total.converted > w12.calc.total.converted); near(WEEKS_PER_MONTH, 52 / 12);
});

await t("round trip vs one way: separate prices, the plan uses the selected one, switching changes the total", () => {
  const e = man({ housing: "share", assume: { tuitionWeek: null, visa: null, insurance: null, flight: { round: 1000, oneway: 600 } } });
  const r = gen({ ...e, trip: "round", budget: { amount: 50_000, currency: "GBP" } })[0]; const o = gen({ ...e, trip: "oneway", budget: { amount: 50_000, currency: "GBP" } })[0];
  assert.equal(r.plan.items.flights.value, 1000); assert.equal(o.plan.items.flights.value, 600); near(r.calc.total.converted - o.calc.total.converted, 400); assert.equal(r.picks.flights.status, "assumption");
  const none = gen({ ...e, trip: "oneway", assume: { ...e.assume, flight: { round: 1000, oneway: null } } })[0]; assert.equal(none.picks.flights.status, "unset"); assert.ok(none.notes.some((x) => x.code === "flightMissing"));
});

await t("currency: no rate → not merged and verdict asks for a rate; manual rate → converted and compared", () => {
  const e = full(man({ housing: "dorm", duration: { value: 41, unit: "weeks" }, budget: { amount: 2_000_000, currency: "JPY" }, assume: { tuitionWeek: 250, visa: 490, insurance: 300, flight: { round: 150_000, oneway: 0 } } }));
  const a = gen(e)[0]; assert.equal(a.verdict, "needsRate"); assert.ok(Object.keys(a.calc.total.unconverted).includes("GBP")); assert.equal(a.remaining, null); assert.ok(a.notes.some((x) => x.code === "noRate"));
  assert.ok(a.calc.total.byCurrency.GBP! > 0 && a.calc.total.byCurrency.JPY === 150_000);
  const b = gen({ ...e, rates: { GBP: { rate: 190, date: "2026-10-14" } } })[0]; assert.notEqual(b.verdict, "needsRate"); assert.deepEqual(b.calc.total.unconverted, {});
  near(b.calc.total.converted, b.calc.total.byCurrency.GBP! * 190 + 150_000, 0.5); near(b.remaining!, 2_000_000 - b.calc.total.converted, 1e-6);
  // a rate to the budget currency itself is ignored
  const c = gen({ ...e, rates: { JPY: { rate: 5, date: "x" }, GBP: { rate: 190, date: "2026-10-14" } } })[0]; near(c.calc.total.converted, b.calc.total.converted, 1e-6);
  // vancouver: no verified per-person student price and no TransLink fare are adopted (Ver.1.2.5), so there is no CAD figure to convert and the verdict stays undetermined
  const v = gen({ ...defaultEasy({ cityId: "vancouver", studyType: "university" }), budget: { amount: 10_000, currency: "GBP" } })[0]; assert.equal(v.verdict, "undetermined"); assert.ok(v.mainMissing.includes("housing"));
});

await t("budget-aware: a tight budget lowers Balanced / Comfort step by step and says so", () => {
  const e = man({ housing: null, budget: { amount: 1e9, currency: "GBP" } }); const [b, , c] = gen(e); assert.ok(c.calc.total.converted > b.calc.total.converted);
  const tight = { ...e, budget: { amount: Math.ceil(b.calc.total.converted) + 10, currency: "GBP" as const } }; const ps = gen(tight);
  assert.ok(ps[2].calc.total.converted <= tight.budget.amount + 1e-6, "comfort lowered to the budget"); assert.ok(ps[2].notes.some((x) => x.code === "adjusted")); assert.ok(ps[2].calc.total.converted >= ps[0].calc.total.converted - 1e-6);
  const roomy = gen({ ...e, budget: { amount: c.calc.total.converted + 100, currency: "GBP" } }); assert.ok(roomy[2].notes.every((x) => x.code !== "adjusted")); near(roomy[2].calc.total.converted, c.calc.total.converted);
});

await t("over budget: suggestions are computed (the duration fits and is the longest that does)", () => {
  const base = full(man({ housing: null, duration: { value: 40, unit: "weeks" }, assume: { tuitionWeek: 250, visa: 490, insurance: 300, flight: { round: 700, oneway: 400 } } }));
  const sp = gen({ ...base, budget: { amount: 12_000, currency: "GBP" } })[2]; assert.equal(sp.verdict, "over");
  const dur = sp.suggestions.find((s) => s.kind === "duration"); assert.ok(dur && dur.kind === "duration");
  const at = (w: number) => calcPlan({ ...sp.plan, duration: { value: w, unit: "weeks" } }).total.converted;
  assert.ok(at(dur.weeks) <= 12_000 && at(dur.weeks + 1) > 12_000, `${dur.weeks}: ${at(dur.weeks)} / ${at(dur.weeks + 1)}`);
  assert.ok(sp.notes.some((x) => x.code === "adjusted"), "Comfort was already lowered as far as the verified figures allow");
  // one-off costs alone exceed the budget → shortening cannot help, and the plan says it cannot be optimised
  const hopeless = gen({ ...base, budget: { amount: 1_000, currency: "GBP" } })[0]; assert.ok(hopeless.suggestions.some((s) => s.kind === "durationNotEnough")); assert.ok(hopeless.notes.some((x) => x.code === "cannotFit"));
  // within budget → no suggestions
  assert.equal(gen({ ...base, budget: { amount: 1e6, currency: "GBP" } })[0].suggestions.length, 0);
});

await t("housing suggestion: another verified housing type that is cheaper is offered with its exact saving", () => {
  const base = full(man({ housing: "dorm", duration: { value: 41, unit: "weeks" }, assume: { tuitionWeek: 100, visa: 0, insurance: 0, flight: { round: 700, oneway: 400 } } }));
  const sp = gen({ ...base, budget: { amount: 5_000, currency: "GBP" } })[2]; const h = sp.suggestions.find((s) => s.kind === "housing");
  if (h && h.kind === "housing") { assert.notEqual(h.housing, "dorm"); assert.ok(h.saving > 0); const alt = generateOne({ ...base, housing: h.housing, budget: { amount: 5_000, currency: "GBP" } }, "budget", { now: NOW }); near(sp.calc.total.converted - alt.calc.total.converted, h.saving, 1e-6); }
  else assert.ok(sp.suggestions.length > 0);
});

await t("saving: save, rename, delete, restore easy conditions, compare max 3", () => {
  const e = full(man({ housing: "share" })); const ps = gen(e); let s = emptySaved();
  s = savePlan(s, ps[0], e, "A", NOW); s = savePlan(s, ps[1], e, "B", NOW); s = savePlan(s, ps[2], e, "C", NOW); s = savePlan(s, ps[0], e, "D", NOW);
  assert.equal(s.saved.length, 4); assert.deepEqual(s.saved.map((x) => x.name), ["A", "B", "C", "D"]); assert.equal(new Set(s.saved.map((x) => x.id)).size, 4);
  assert.deepEqual(s.saved[1].easy, e); assert.equal(s.saved[1].tier, "balanced"); near(calcPlan(s.saved[1].plan).total.converted, ps[1].calc.total.converted);
  for (const x of s.saved.slice(0, 3)) s = toggleCompare(s, x.id); assert.equal(s.compare.length, MAX_COMPARE);
  const before = s; s = toggleCompare(s, s.saved[3].id); assert.equal(s, before, "a 4th plan is refused"); s = toggleCompare(s, s.saved[0].id); assert.equal(s.compare.length, 2); s = toggleCompare(s, s.saved[3].id); assert.equal(s.compare.length, 3);
  s = renameSaved(s, s.saved[0].id, "Renamed"); assert.equal(s.saved[0].name, "Renamed"); assert.equal(s.saved[0].plan.name, "Renamed");
  const id = s.saved[3].id; s = deleteSaved(s, id); assert.equal(s.saved.length, 3); assert.ok(!s.compare.includes(id));
  const round = cleanSaved(JSON.parse(JSON.stringify(s)))!; assert.deepEqual(round.saved.map((x) => x.id), s.saved.map((x) => x.id)); assert.deepEqual(round.compare, s.compare); near(calcPlan(round.saved[0].plan).total.converted, calcPlan(s.saved[0].plan).total.converted);
  let big = emptySaved(); for (let i = 0; i < MAX_SAVED + 5; i++) big = savePlan(big, ps[0], e, `p${i}`, NOW); assert.equal(big.saved.length, MAX_SAVED);
});

await t("stored data is validated: garbage, wrong types and tampered values fall back safely", () => {
  assert.equal(cleanSaved(null), undefined); assert.equal(cleanSaved("x"), undefined); assert.deepEqual(cleanSaved({ saved: [1, null, {}, { id: "z" }], compare: ["nope"] }), { version: 1, saved: [], compare: [] });
  const c = cleanEasy({ origin: { country: "JP", airport: "xx!", custom: "a1" }, cityId: "paris", studyType: "x", duration: { unit: "years", value: 9999 }, month: 13, budget: { amount: -5, currency: "EUR" }, housing: "castle", trip: "sideways", rates: { GBP: { rate: -1 } }, assume: { tuitionWeek: "abc", visa: -3, flight: { round: NaN } } })!;
  assert.equal(c.cityId, "manchester"); assert.equal(c.origin.airport, "HND"); assert.equal(c.origin.custom, ""); assert.equal(c.duration.unit, "weeks"); assert.equal(c.duration.value, 104); assert.equal(c.month, null);
  assert.equal(c.budget.currency, "GBP"); assert.ok(c.budget.amount > 0); assert.equal(cleanEasy({ budget: { amount: 0, currency: "GBP" } })!.budget.amount > 0, true); assert.equal(c.housing, null); assert.equal(c.trip, "round"); assert.deepEqual(c.rates, {}); assert.equal(c.assume.tuitionWeek, null); assert.equal(c.assume.visa, null); assert.equal(c.assume.flight.round, null);
  assert.equal(cleanEasy(undefined), undefined); const ok = cleanEasy(JSON.parse(JSON.stringify(man({ month: 9 }))))!; assert.equal(ok.month, 9);
});

await t("texts: every smart-planner string has Japanese and English with the same placeholders", () => {
  const ph = (s: string) => (s.match(/\{\w+\}/g) ?? []).sort().join(","); let count = 0;
  const walk = (v: unknown, path: string) => {
    if (v && typeof v === "object" && "en" in v && "ja" in v) { const x = v as { en: string; ja: string }; assert.ok(x.en.trim() && x.ja.trim(), path); assert.equal(ph(x.en), ph(x.ja), path); count++; return; }
    assert.ok(v && typeof v === "object", `${path} must be a localized string or a group`); for (const [k, c] of Object.entries(v as object)) walk(c, `${path}.${k}`);
  };
  walk(st, "st"); assert.ok(count > 80);
  for (const k of Object.keys(st.verdict)) assert.ok(k); for (const code of ["adjusted", "cannotFit", "noRate", "fewFigures", "flightMissing"]) assert.ok((st.notes as Record<string, unknown>)[code], code);
});

console.log(`\n${n} smart planner tests passed`);
}
main().catch((e) => { console.error(e); process.exit(1); });
