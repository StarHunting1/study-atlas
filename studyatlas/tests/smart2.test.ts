// Smart Planner 2.0 (Ver.1.2.9): an incomplete estimate is labelled as such, counted costs are not a total, housing can be entered by hand.
import "./_react";
import assert from "node:assert/strict";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement as h } from "react";
import { I18nProvider } from "@/lib/i18n";
import { WEEKS_PER_MONTH } from "@/lib/planner";
import { cleanEasy, defaultEasy, generate, groupPlans, type Easy } from "@/lib/smart";
import PlanCard from "@/components/planner/easy/PlanCard";
import { st } from "@/locales/smart";
let n = 0; const t = (name: string, f: () => void) => { f(); n++; console.log("ok", name); };
const NOW = "2026-10-15T00:00:00.000Z";
const lang = (o: Partial<Easy> = {}): Easy => ({ ...defaultEasy({ cityId: "manchester", studyType: "language", duration: { value: 12, unit: "weeks" } }), ...o });
const first = (e: Easy) => generate(e, { now: NOW })[0];
const near = (a: number, b: number) => assert.ok(Math.abs(a - b) < 1e-6, `${a} ≉ ${b}`);
const card = (e: Easy, lng: "ja" | "en" = "ja") => { const g = groupPlans(generate(e, { now: NOW }))[0]; return renderToStaticMarkup(h(I18nProvider, null, h(PlanCard, { g, easy: e, onSave() {}, onOpenAdvanced() {}, onSetRate() {}, onEnter() {} }) as never)); };
const text = (s: string) => s.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");

t("nothing entered: the plan is incomplete, nothing is invented and nothing unset is counted as 0", () => {
  const sp = first(lang());
  assert.ok(sp.provisional && sp.mainMissing.includes("tuition") && sp.mainMissing.includes("housing") && sp.mainMissing.includes("flights"));
  for (const id of ["tuition", "housing", "flights", "insurance", "visa"] as const) { assert.equal(sp.calc.items[id].state, "unset", id); assert.equal(sp.picks[id].status, "unset", id); }
  assert.notEqual(sp.verdict, "within");
});
t("manual housing per week is multiplied by the stay; per month by the stay in months; units are never mixed", () => {
  const w = first(lang({ assume: { ...lang().assume, housing: { amount: 200, per: "week" } } }));
  assert.equal(w.picks.housing.status, "assumption"); const cw = w.calc.items.housing; assert.equal(cw.state, "ok"); if (cw.state === "ok") { assert.equal(cw.per, "week"); near(cw.total, 200 * 12); }
  const m = first(lang({ assume: { ...lang().assume, housing: { amount: 800, per: "month" } } })); const cm = m.calc.items.housing;
  assert.equal(cm.state, "ok"); if (cm.state === "ok") { assert.equal(cm.per, "month"); near(cm.total, 800 * (12 / WEEKS_PER_MONTH)); }
  const one = first(lang({ assume: { ...lang().assume, visa: 490 } })).calc.items.visa; assert.equal(one.state, "ok"); if (one.state === "ok") { assert.equal(one.per, "once"); near(one.total, 490); }   // one-off: counted once
  const six = first(lang({ duration: { value: 24, unit: "weeks" }, assume: { ...lang().assume, housing: { amount: 200, per: "week" } } })).calc.items.housing; if (six.state === "ok") near(six.total, 200 * 24);
});
t("a manual housing figure wins over a table figure and is marked as the user's own entry; tuition/visa/insurance/flights keep working", () => {
  const e = { ...lang({ studyType: "university", housing: "dorm" }), duration: { value: 41, unit: "weeks" as const } };
  const auto = first(e); assert.equal(auto.picks.housing.status, "official");
  const man = first({ ...e, assume: { ...e.assume, housing: { amount: 250, per: "week" } } }); assert.equal(man.picks.housing.status, "assumption"); const c = man.calc.items.housing; if (c.state === "ok") near(c.total, 250 * 41);
  const all = first(lang({ trip: "round", assume: { tuitionWeek: 250, visa: 490, insurance: 300, flight: { round: 700, oneway: null }, housing: { amount: 200, per: "week" } } }));
  for (const id of ["tuition", "housing", "visa", "insurance", "flights"] as const) assert.equal(all.picks[id].status, "assumption", id);
});
t("no 'within budget' verdict while a main item is missing; a verdict is possible only when every main item is counted", () => {
  const partial = first(lang({ budget: { amount: 100000, currency: "GBP" }, assume: { ...lang().assume, housing: { amount: 100, per: "week" }, tuitionWeek: 100 } }));
  assert.ok(partial.provisional); assert.notEqual(partial.verdict, "within"); assert.equal(partial.verdict, "undetermined");
});
t("saved drafts stay valid: older data without a housing entry loads unchanged; bad values are dropped; the unit choice survives", () => {
  const old = cleanEasy({ ...lang(), assume: { tuitionWeek: 120, visa: null, insurance: null, flight: { round: null, oneway: null } } })!;
  assert.equal(old.assume.tuitionWeek, 120); assert.equal(old.assume.housing, undefined);
  assert.equal(cleanEasy({ ...lang(), assume: { ...lang().assume, housing: { amount: -5, per: "week" } } })!.assume.housing, undefined);
  assert.deepEqual(cleanEasy({ ...lang(), assume: { ...lang().assume, housing: { amount: 650, per: "month" } } })!.assume.housing, { amount: 650, per: "month" });
  assert.deepEqual(cleanEasy({ ...lang(), assume: { ...lang().assume, housing: { amount: null, per: "month" } } })!.assume.housing, { amount: null, per: "month" });
});
t("card (ja): 'estimate incomplete', counted costs are not a total, the balance is provisional, no budget verdict, a button to enter the missing costs", () => {
  const out = card(lang({ assume: { ...lang().assume, tuitionWeek: 100, housing: { amount: 150, per: "week" } } })); const tx = text(out);
  assert.ok(tx.includes("見積もり未完成") && tx.includes("計上済みの費用（留学の総費用ではありません）"));
  assert.ok(tx.includes("暫定額（未計上の費用を差し引く前）") && tx.includes("実際の残りではありません"));
  assert.ok(!tx.includes("予算内に収まります") && !tx.includes("概算総費用") && !tx.includes("Within budget"));
  assert.ok(tx.includes("未計上：") && out.includes('data-testid="enter-balanced"') || out.includes("data-testid=\"enter-"));
  assert.ok(out.includes('data-verdict="undetermined"'));
});
t("card (en strings): the same wording exists in English", () => {
  for (const k of ["provisional", "countedSoFar", "leftAfter", "provBalNote", "enterCosts", "statusManual", "statusNone", "unitsLegend", "assumeHousing", "diffProv", "merged"] as const) { assert.ok(st[k].en.length > 2 && st[k].ja.length > 2, k); }
  assert.ok(st.countedSoFar.en.includes("not your total") && st.provisional.en === "Estimate incomplete");
});
t("identical Budget / Balanced / Comfort are shown once with a plain note that conditions make no difference", () => {
  const groups = groupPlans(generate(lang(), { now: NOW }));
  assert.equal(groups.length, 1, "with no verified language-student figures the three tiers are the same");
  assert.deepEqual(groups[0].tiers, ["budget", "balanced", "comfort"]);
  const tx = text(card(lang())); assert.ok(tx.includes("差がないため、1つにまとめて表示しています"));
});
console.log(n, "smart planner 2.0 tests passed");
