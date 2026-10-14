// Tests for the study cost planner (Ver.1.6): calculation rules, currencies, sliders, official data, storage, texts.
// Local tests only (no network). Run: npm test
import assert from "node:assert/strict";
import { applyCandidate, candidatesFor, cityCandidates, schoolCandidates } from "../data/official/planner";
import { officialData } from "../data/official";
import { calcPlan, changeCity, changeCurrency, changeUnit, cleanPlan, cleanStore, ITEM_IDS, ONE_OFF, RECURRING, addPlan, deletePlan, duplicatePlan, emptyStore, newPlan, niceNumber, planFromProfile, quantity, rangeFor, renamePlan, setDisplayCurrency, setItem, setRate, setValue, stayWeeks, updatePlan, weeksToMonths, WEEKS_PER_MONTH, CURRENCIES, CITIES, type Plan, type Ccy, type ItemId } from "../lib/planner";
import { emptyProfile } from "../lib/profile";
import { pt } from "../locales/planner";
import { fmtMoney, tpl } from "../components/planner/format";

let n = 0; const t = (name: string, fn: () => void) => { fn(); n++; console.log("ok", name); };
const near = (a: number, b: number, eps = 1e-6) => assert.ok(Math.abs(a - b) < eps, `${a} ≉ ${b}`);
const mk = (o: Parameters<typeof newPlan>[0] = {}) => newPlan({ now: "2026-10-14T00:00:00.000Z", ...o });

t("weeks ↔ months rule: 1 month = 52/12 weeks, explicit and consistent", () => {
  near(WEEKS_PER_MONTH, 52 / 12); near(weeksToMonths(52), 12); near(weeksToMonths(13), 3);
  near(stayWeeks({ duration: { value: 3, unit: "months" } }), 13); near(stayWeeks({ duration: { value: 12, unit: "weeks" } }), 12);
});

t("quantities: weekly × weeks, monthly × months, per-term × whole terms (rounded up), yearly × whole years, one-off × 1", () => {
  near(quantity("week", 12, 12), 12); near(quantity("month", 13, 12), 3); near(quantity("month", 12, 12), 12 / WEEKS_PER_MONTH);
  assert.equal(quantity("term", 12, 12), 1); assert.equal(quantity("term", 12.5, 12), 2); assert.equal(quantity("term", 1, 12), 1); assert.equal(quantity("term", 36, 12), 3);
  assert.equal(quantity("year", 52, 12), 1); assert.equal(quantity("year", 53, 12), 2); assert.equal(quantity("once", 99, 12), 1);
});

t("every example from the brief: weekly tuition, weekly housing, monthly food, one-off flight", () => {
  let p = mk({ duration: { value: 12, unit: "weeks" } });
  p = setItem(p, "tuition", { value: 190, per: "week" }); p = setItem(p, "housing", { value: 150, per: "week" }); p = setItem(p, "food", { value: 250, per: "month" });
  p = setItem(p, "flights", { value: 120000, currency: "JPY" });
  const c = calcPlan(p);
  assert.equal((c.items.tuition as { total: number }).total, 190 * 12); assert.equal((c.items.housing as { total: number }).total, 150 * 12);
  near((c.items.food as { total: number }).total, 250 * (12 / WEEKS_PER_MONTH)); assert.equal((c.items.flights as { total: number }).total, 120000);
  near(c.total.byCurrency.GBP!, 190 * 12 + 150 * 12 + 250 * (12 / WEEKS_PER_MONTH)); assert.equal(c.total.byCurrency.JPY, 120000);
});

t("unset items are not counted and not zero; an explicit 0 is counted as set", () => {
  let p = mk(); p = setItem(p, "tuition", { value: 100, per: "week" });
  let c = calcPlan(p); assert.equal(c.total.byCurrency.GBP, 1200); assert.equal(c.unset.length, ITEM_IDS.length - 1); assert.ok(!c.unset.includes("tuition")); assert.equal(c.complete, false);
  assert.equal(c.items.housing.state, "unset"); assert.ok(c.unset.includes("housing"));
  p = setValue(p, "housing", 0); c = calcPlan(p); assert.equal(c.items.housing.state, "ok"); assert.equal(c.unset.length, ITEM_IDS.length - 2); assert.equal(c.total.byCurrency.GBP, 1200);
  assert.equal(setValue(p, "food", -5), p); assert.equal(setValue(p, "food", NaN), p); // invalid values are ignored
  p = setValue(p, "housing", null); assert.equal(calcPlan(p).items.housing.state, "unset"); // clearing returns to "not set", never 0
  const all = ITEM_IDS.reduce((q, id) => setValue(q, id, 1), mk()); assert.equal(calcPlan(all).complete, true); assert.equal(calcPlan(all).unset.length, 0);
});

t("course / contract length different from the stay: own billed weeks, with a clear warning", () => {
  let p = mk({ duration: { value: 20, unit: "weeks" } });
  p = setItem(p, "tuition", { value: 200, per: "week", coverageWeeks: 12 }); p = setItem(p, "housing", { value: 100, per: "week", coverageWeeks: 41 });
  const c = calcPlan(p); const tu = c.items.tuition as { total: number; warn?: string; gapWeeks?: number }, ho = c.items.housing as { total: number; warn?: string; gapWeeks?: number };
  assert.equal(tu.total, 2400); assert.equal(tu.warn, "coverageShorter"); assert.equal(tu.gapWeeks, 8);
  assert.equal(ho.total, 4100); assert.equal(ho.warn, "coverageLonger"); assert.equal(ho.gapWeeks, 21);
  const same = calcPlan(setItem(p, "tuition", { coverageWeeks: 20 })).items.tuition as { warn?: string }; assert.equal(same.warn, undefined);
  const monthly = calcPlan(setItem(mk({ duration: { value: 4, unit: "months" } }), "housing", { value: 800, per: "month", coverageWeeks: 41 })).items.housing as { total: number };
  near(monthly.total, 800 * (41 / WEEKS_PER_MONTH)); // a 41-week contract billed monthly
  const termP = setItem(mk({ duration: { value: 30, unit: "weeks" } }), "tuition", { value: 3000, per: "term" }); assert.equal((calcPlan(termP).items.tuition as { total: number; qty: number }).qty, 3); // 30 weeks, 12-week terms
});

t("different currencies: never added without a manual rate; with a rate the conversion is shown as approximate", () => {
  let p = mk({ displayCurrency: "JPY" }); p = setItem(p, "tuition", { value: 200, per: "week", currency: "GBP" }); p = setItem(p, "flights", { value: 150000, currency: "JPY" });
  let c = calcPlan(p);
  assert.equal(c.total.converted, 150000); assert.deepEqual(c.total.byCurrency, { GBP: 2400, JPY: 150000 }); assert.deepEqual(c.total.unconverted, { GBP: 2400 }); assert.deepEqual(c.missingRates, ["GBP"]); assert.equal(c.usedRates.length, 0);
  p = setRate(p, "GBP", 190, "2026-10-14"); c = calcPlan(p);
  near(c.total.converted, 2400 * 190 + 150000); assert.deepEqual(c.total.unconverted, {}); assert.deepEqual(c.missingRates, []);
  assert.equal(c.usedRates.length, 1); assert.equal(c.usedRates[0].rate, 190); assert.equal(c.usedRates[0].date, "2026-10-14"); assert.match(c.usedRates[0].publisher, /Manual/);
  p = setRate(p, "GBP", null, ""); assert.deepEqual(calcPlan(p).total.unconverted, { GBP: 2400 }); // removing the rate un-merges the currencies again
  assert.equal(setRate(p, "GBP", -3, "x").rates.GBP, undefined); assert.equal(setRate(p, "GBP", 0, "x").rates.GBP, undefined);
  // the display currency itself needs no rate and a rate for it is dropped
  const q = setDisplayCurrency(setRate(mk(), "JPY", 1.2, "2026-10-14"), "JPY"); assert.equal(q.rates.JPY, undefined);
  // changing the display currency changes no item value
  const before = mk(); const after = setDisplayCurrency(setItem(before, "food", { value: 250, per: "month" }), "CAD"); assert.equal(after.items.food.value, 250); assert.equal(after.items.food.currency, "GBP");
});

t("target budget: difference only when it can be stated in one currency", () => {
  let p = mk({ goal: { amount: 5000, currency: "GBP" } }); p = setItem(p, "tuition", { value: 200, per: "week" });
  assert.deepEqual([calcPlan(p).goal!.state, calcPlan(p).goal!.diff], ["under", 2600]);
  p = setItem(p, "housing", { value: 300, per: "week" }); const o = calcPlan(p).goal!; assert.equal(o.state, "over"); near(o.diff!, -1000);
  assert.equal(calcPlan(setItem(p, "housing", { value: 0 })).goal!.state, "under");
  assert.equal(calcPlan({ ...p, goal: { amount: 6000, currency: "GBP" } }).goal!.state, "equal"); // 2400 + 3600 = 6000
  // goal in JPY, items in GBP, no rate → no difference is invented
  const q = { ...p, displayCurrency: "JPY" as Ccy, goal: { amount: 1000000, currency: "JPY" as Ccy } }; assert.equal(calcPlan(q).goal!.state, "noRate"); assert.equal(calcPlan(q).goal!.diff, null);
  assert.equal(calcPlan(setRate(q, "GBP", 190, "2026-10-14")).goal!.state, "over"); // 6,000 GBP × 190 = 1,140,000 JPY > 1,000,000
  assert.equal(calcPlan(setRate({ ...q, goal: { amount: 2000000, currency: "JPY" } }, "GBP", 190, "2026-10-14")).goal!.state, "under");
  assert.equal(calcPlan(mk()).goal, null);
});

t("monthly living cost excludes tuition and start-up costs and unset items", () => {
  let p = mk({ duration: { value: 13, unit: "weeks" } }); // exactly 3 months
  p = setItem(p, "housing", { value: 150, per: "week" }); p = setItem(p, "food", { value: 250, per: "month" }); p = setItem(p, "tuition", { value: 400, per: "week" }); p = setItem(p, "flights", { value: 900, currency: "GBP" });
  const c = calcPlan(p); near(c.monthlyLiving!.converted, (150 * 13 + 250 * 3) / 3); assert.equal(calcPlan(mk()).monthlyLiving, null);
  near(c.groups.housing.converted, 1950); near(c.groups.tuition.converted, 5200); near(c.groups.initial.converted, 900);
});

t("the total always equals the sum of its parts (what the sliders show is what is added up)", () => {
  let p = setItem(mk({ duration: { value: 9, unit: "months" } }), "flights", { currency: "GBP" }); const vals: [ItemId, number][] = [["tuition", 210], ["housing", 140], ["food", 55], ["transport", 20], ["phone", 8], ["leisure", 30], ["otherLiving", 12], ["flights", 1500], ["registration", 80], ["materials", 120], ["visa", 490], ["insurance", 600], ["otherInitial", 40]];
  for (const [id, v] of vals) { const r = rangeFor(id, p.items[id].per, p.items[id].currency); assert.ok(v <= r.max); p = setValue(p, id, v); }
  const c = calcPlan(p); let sum = 0; for (const id of ITEM_IDS) { const r = c.items[id]; if (r.state === "ok") sum += r.total; }
  near(c.total.converted, sum); near(c.total.converted, Object.values(c.groups).reduce((a, g) => a + g.converted, 0));
  const moved = calcPlan(setValue(p, "food", 85)); near(moved.total.converted - c.total.converted, 30 * weeksToMonths(stayWeeks(p)));
});

t("slider ranges: sensible per item, unit and currency; steps divide the range; big amounts stay adjustable", () => {
  assert.equal(niceNumber(190), 200); assert.equal(niceNumber(2400), 2500); assert.equal(niceNumber(0.7), 1);
  for (const id of ITEM_IDS) for (const per of (id === "tuition" || id === "housing" ? ["week", "month", "term", "once", "year"] : RECURRING.includes(id as never) ? ["week", "month", "term", "once"] : ["once"]) as ("week" | "month" | "term" | "once" | "year")[]) for (const c of CURRENCIES) {
    const r = rangeFor(id, per, c); assert.equal(r.min, 0); assert.ok(r.max > 0 && r.step > 0 && r.fine > 0 && r.fine <= r.step, `${id}/${per}/${c}`);
    const steps = r.max / r.step; assert.ok(steps >= 8 && steps <= 400, `${id}/${per}/${c}: ${steps} steps`); // neither too coarse nor too many
  }
  assert.ok(rangeFor("flights", "once", "JPY").max >= 500000); assert.ok(rangeFor("flights", "once", "JPY").step >= 5000); assert.ok(rangeFor("tuition", "week", "GBP").max >= 400);
  assert.ok(rangeFor("phone", "month", "JPY").max > rangeFor("phone", "month", "GBP").max * 50);
});

t("official figures: only verified data points become candidates; source, year and conditions travel with them", () => {
  const man = candidatesFor("manchester", "housing", { studyType: "university", housingType: "dorm" });
  assert.ok(man.length >= 4 && man.every((c) => c.status === "verified" && c.currency === "GBP" && /^https:\/\//.test(c.url) && c.validFor && c.audience.en && c.audience.ja));
  assert.ok(man.some((c) => c.per === "week" && c.value === 119)); const catered = man.filter((c) => c.id.startsWith("man-uom-halls-catered-month")); assert.deepEqual(catered.map((c) => c.value), [555, 982]); assert.ok(catered.every((c) => c.coverageWeeks === 41));
  const van = candidatesFor("vancouver", "housing", { studyType: "university", housingType: "dorm" }); assert.equal(van.length, 0); // UBC residence fees are not republished
  const vanOther = candidatesFor("vancouver", "housing", { studyType: "university", housingType: "other" }); assert.ok(vanOther.length === 3 && vanOther.every((c) => c.caution && /not student housing|学生寮ではありません|whole unit|住戸全体/.test(`${c.caution.en}${c.caution.ja}`)));
  for (const id of ["flights", "visa", "insurance", "registration", "otherInitial"] as ItemId[]) assert.equal(candidatesFor("manchester", id, { studyType: "university", housingType: "dorm" }).length, 0);
  // eligibility mismatch is flagged (U-Pass BC is for students of participating public institutions, not language schools)
  const up = candidatesFor("vancouver", "transport", { studyType: "language", housingType: "other" }).find((c) => c.id === "van-upass")!; assert.ok(up.caution!.en.startsWith("Not meant for your study type"));
  assert.ok(!candidatesFor("manchester", "housing", { studyType: "university", housingType: "homestay" }).length);
  // terms-unconfirmed sources are marked; open-licence sources are not
  assert.ok(cityCandidates("manchester", "food", { studyType: "university", housingType: "dorm" }).every((c) => c.termsUnconfirmed)); assert.ok(candidatesFor("vancouver", "housing", { studyType: "university", housingType: "other" }).every((c) => !c.termsUnconfirmed));
  // an unverified data point is never offered
  const pts = officialData("manchester")!.points; const p = pts.find((x) => x.id === "man-uom-ug-groceries")!; const saved = p.status; (p as { status: string }).status = "unverified";
  assert.equal(cityCandidates("manchester", "food", { studyType: "university", housingType: "dorm" }).length, 0); (p as { status: string }).status = saved;
});

t("official vs own values: the source is kept until the user changes the number, then it becomes the user's own", () => {
  let p = mk({ cityId: "manchester" }); const c = candidatesFor("manchester", "housing", { studyType: "university", housingType: "dorm" }).find((x) => x.value === 175)!;
  p = applyCandidate(p, c); assert.equal(p.items.housing.source.kind, "official"); assert.equal(p.items.housing.value, 175); assert.equal(p.items.housing.per, "week"); assert.equal(calcPlan(p).sources.official, 1);
  const src = p.items.housing.source; assert.ok(src.kind === "official" && src.ref === c.id && src.url!.startsWith("https://") && !!src.validFor);
  const moved = setValue(p, "housing", 180); assert.equal(moved.items.housing.source.kind, "user"); assert.deepEqual([calcPlan(moved).sources.official, calcPlan(moved).sources.user], [0, 1]);
  assert.equal(changeUnit(p, "housing", "month").items.housing.source.kind, "user"); assert.equal(changeUnit(p, "housing", "week").items.housing.source.kind, "official");
  const cc = changeCurrency(p, "housing", "JPY"); assert.equal(cc.items.housing.value, null); assert.equal(cc.items.housing.source.kind, "user"); // an official GBP number is not reinterpreted as yen
  const cov = applyCandidate(mk(), candidatesFor("manchester", "housing", { studyType: "university", housingType: "dorm" }).find((x) => x.id.endsWith(":max"))!); assert.equal(cov.items.housing.coverageWeeks, 41); assert.equal(cov.items.housing.value, 982);
  const city = changeCity(p, "vancouver"); assert.equal(city.items.housing.value, null); assert.equal(city.items.food.currency, "CAD"); assert.equal(city.items.flights.currency, "JPY"); // official values of the old city are dropped
  const keep = changeCity(setValue(mk(), "food", 99), "vancouver"); assert.equal(keep.items.food.value, 99); // the user's own numbers are kept
});

t("school fees (future data): choosing a verified school fills tuition; today none is offered, samples are never offered by default", () => {
  assert.equal(schoolCandidates("manchester", "tuition", "language").length, 0); assert.equal(schoolCandidates("vancouver", "tuition", "university").length, 0);
  const demo = [...schoolCandidates("manchester", "tuition", "language", { allowSample: true }), ...schoolCandidates("vancouver", "tuition", "language", { allowSample: true })];
  assert.ok(demo.length > 0 && demo.every((c) => c.origin === "school" && c.status === "sample" && c.caution && /sample|サンプル/.test(c.caution.en + c.caution.ja)));
  const reg = [...schoolCandidates("manchester", "registration", "language", { allowSample: true }), ...schoolCandidates("vancouver", "registration", "language", { allowSample: true })]; assert.ok(reg.every((c) => c.per === "once"));
  assert.equal(schoolCandidates("manchester", "food", "language", { allowSample: true }).length, 0);
  const c = demo[0]; const p = applyCandidate(mk({ cityId: c.currency === "GBP" ? "manchester" : "vancouver" }), c); assert.equal(p.items.tuition.value, c.value); assert.equal(p.items.tuition.source.kind, "official");
});

t("My Study profile is reused for a new plan", () => {
  const pr = { ...emptyProfile(), destCity: "vancouver", studyType: "language" as const, duration: { value: 1, unit: "years" as const }, budget: { amount: 3000000, currency: "JPY" }, currency: "JPY", nationality: "JP" };
  const p = planFromProfile(pr, "2026-10-14T00:00:00.000Z"); assert.deepEqual([p.cityId, p.studyType, p.displayCurrency, p.fromProfile], ["vancouver", "language", "JPY", true]);
  assert.deepEqual(p.duration, { value: 12, unit: "months" }); assert.deepEqual(p.goal, { amount: 3000000, currency: "JPY" });
  const w = planFromProfile({ ...pr, destCity: "toronto", duration: { value: 20, unit: "weeks" }, currency: "EUR", budget: { amount: null, currency: "EUR" } }); assert.equal(w.cityId, "manchester"); assert.deepEqual(w.duration, { value: 20, unit: "weeks" }); assert.equal(w.displayCurrency, "GBP"); // unsupported city / currency fall back
  assert.equal(planFromProfile(emptyProfile()).duration.value, 12);
});

t("saving: store round trip, rename, edit, duplicate, delete, delete all; damaged data is cleaned", () => {
  let s = emptyStore(); const a = mk({ cityId: "manchester", name: "A" }), b = mk({ cityId: "vancouver", name: "B" });
  s = addPlan(addPlan(s, a), b); assert.equal(s.activeId, b.id); s = renamePlan(s, a.id, "Manchester 12 weeks"); assert.equal(s.plans[0].name, "Manchester 12 weeks");
  s = updatePlan(s, setItem(s.plans[0], "food", { value: 250, per: "month" }));
  const back = cleanStore(JSON.parse(JSON.stringify(s)))!; assert.deepEqual(back.plans.map((p) => [p.name, p.cityId, p.items.food.value]), [["Manchester 12 weeks", "manchester", 250], ["B", "vancouver", null]]);
  assert.deepEqual(calcPlan(back.plans[0]).total.byCurrency, calcPlan(s.plans[0]).total.byCurrency); // same numbers after reload
  s = duplicatePlan(s, a.id, "copy"); assert.equal(s.plans.length, 3); assert.notEqual(s.plans[2].id, a.id); assert.equal(s.plans[2].items.food.value, 250);
  s = deletePlan(s, s.activeId!); assert.equal(s.plans.length, 2); assert.ok(s.plans.some((p) => p.id === s.activeId));
  s = deletePlan(deletePlan(s, s.plans[0].id), s.plans[1]?.id ?? s.plans[0].id); assert.equal(s.plans.length, 0); assert.equal(s.activeId, null);
  const bad = cleanStore({ plans: [{ id: "x", cityId: "paris", studyType: "nope", duration: { value: -5, unit: "years" }, items: { food: { value: -1, currency: "EUR", per: "day" }, tuition: { value: "12" } }, rates: { GBP: { rate: -2 } } }, 5, null], activeId: "zzz", compare: ["x", "nope"] })!;
  assert.equal(bad.plans.length, 1); const q = bad.plans[0]; assert.deepEqual([q.cityId, q.studyType, q.duration.unit, q.duration.value], ["manchester", "university", "weeks", 1]); assert.equal(q.items.food.value, null); assert.equal(q.items.tuition.value, null); assert.equal(q.rates.GBP, undefined); assert.equal(bad.activeId, "x"); assert.deepEqual(bad.compare, ["x", null]);
  assert.equal(cleanStore("nope"), undefined); assert.equal(cleanPlan(null), undefined); assert.equal(cleanPlan({ items: { food: { source: { kind: "official", ref: 3 } } } })!.items.food.source.kind, "user");
  assert.equal(cleanStore({ plans: Array.from({ length: 50 }, (_, i) => ({ id: `p${i}` })) })!.plans.length, 30); // bounded
});

t("compare plans: same display currency can be differenced, otherwise only side by side", () => {
  let a = setItem(setItem(mk({ cityId: "manchester", duration: { value: 12, unit: "weeks" } }), "tuition", { value: 200, per: "week" }), "housing", { value: 150, per: "week" });
  let b = setItem(setItem(mk({ cityId: "vancouver", duration: { value: 12, unit: "weeks" } }), "tuition", { value: 300, per: "week" }), "housing", { value: 250, per: "week" });
  const ca = calcPlan(a), cb = calcPlan(b); assert.equal(ca.total.byCurrency.GBP, 4200); assert.equal(cb.total.byCurrency.CAD, 6600);
  assert.notEqual(a.displayCurrency, b.displayCurrency); // GBP vs CAD: no difference is computed
  b = setDisplayCurrency(setRate(b, "CAD", 0.55, "2026-10-14"), "GBP"); near(calcPlan(b).total.converted, 6600 * 0.55); assert.equal(calcPlan(b).usedRates.length, 1);
});

t("number formatting: symbol and thousands separators in both languages", () => {
  assert.equal(fmtMoney(1234, "GBP", "en"), "£1,234"); assert.equal(fmtMoney(2.85, "GBP", "en"), "£2.85"); assert.match(fmtMoney(150000, "JPY", "ja"), /^[¥￥]150,000$/); assert.match(fmtMoney(1807, "CAD", "ja"), /CA\$1,807/); assert.match(fmtMoney(1807.5, "CAD", "en"), /CA\$1,807\.50/);
  assert.equal(tpl("{a} and {b}", { a: 1, b: "x" }), "1 and x");
});

t("every planner text exists in Japanese and English", () => {
  const miss: string[] = [];
  const walk = (o: unknown, path: string) => {
    if (Array.isArray(o)) return o.forEach((x, i) => walk(x, `${path}[${i}]`));
    if (o && typeof o === "object") { const r = o as Record<string, unknown>; if (typeof r.en === "string" || typeof r.ja === "string") { if (!r.en || !r.ja) miss.push(path); return; } for (const [k, v] of Object.entries(r)) walk(v, `${path}.${k}`); }
  };
  walk(pt, "pt"); assert.deepEqual(miss, []);
  for (const id of ITEM_IDS) assert.ok(pt.items[id].en && pt.items[id].ja); for (const per of ["week", "month", "term", "once", "year"] as const) assert.ok(pt.per[per].ja && pt.perUnit[per].ja);
  for (const k of ["fWeek", "fMonth", "fTerm", "fYear", "fOnce"] as const) for (const l of ["en", "ja"] as const) assert.ok(pt[k][l].includes("{rate}")); // formulas show the rate they multiply
  // placeholders in both languages match
  const ph = (s: string) => (s.match(/\{\w+\}/g) ?? []).sort().join(","); for (const [k, v] of Object.entries(pt)) if (v && typeof v === "object" && "en" in v && "ja" in v) assert.equal(ph((v as { en: string }).en), ph((v as { ja: string }).ja), k);
  assert.equal(CITIES.length, 2); assert.equal(ONE_OFF.length, 6); assert.equal(RECURRING.length, 7);
});

console.log(`${n} planner tests passed`);
