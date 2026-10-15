// Smart Planner 3.0 (Ver.1.3): hand-entered living costs per week or per month, summed over the stay, kept in the saved data.
import "./_react";
import assert from "node:assert/strict";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement as h } from "react";
import { I18nProvider } from "@/lib/i18n";
import { WEEKS_PER_MONTH } from "@/lib/planner";
import { MANUAL_COSTS, cleanEasy, cleanSaved, defaultEasy, emptySaved, generate, groupPlans, savePlan, type Easy } from "@/lib/smart";
import PlanCard from "@/components/planner/easy/PlanCard";
import { st } from "@/locales/smart";
let n = 0; const t = (name: string, f: () => void) => { f(); n++; console.log("ok", name); };
const NOW = "2026-10-15T00:00:00.000Z";
const lang = (o: Partial<Easy> = {}): Easy => ({ ...defaultEasy({ cityId: "manchester", studyType: "language", duration: { value: 12, unit: "weeks" } }), ...o });
const withCosts = (costs: NonNullable<Easy["assume"]["costs"]>, o: Partial<Easy> = {}): Easy => { const e = lang(o); return { ...e, assume: { ...e.assume, costs } }; };
const first = (e: Easy) => generate(e, { now: NOW })[0];
const near = (a: number, b: number) => assert.ok(Math.abs(a - b) < 1e-6, `${a} ≉ ${b}`);
const text = (s: string) => s.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
const total = (e: Easy) => first(e).calc.total.converted;

t("weekly and monthly entries are summed over the stay: week × weeks, month × weeks ÷ (52/12); one-off items are not multiplied", () => {
  const base = total(lang());   // other living costs has no table figure, so an entry there is purely additive
  const w = first(withCosts({ otherLiving: { amount: 5, per: "week" } })); near(w.calc.total.converted - base, 5 * 12);
  const m = first(withCosts({ otherLiving: { amount: 20, per: "month" } })); near(m.calc.total.converted - base, 20 * 12 / WEEKS_PER_MONTH);
  const m24 = first(withCosts({ otherLiving: { amount: 20, per: "month" } }, { duration: { value: 24, unit: "weeks" } })); const b24 = total(lang({ duration: { value: 24, unit: "weeks" } })); near(m24.calc.total.converted - b24, 20 * 24 / WEEKS_PER_MONTH);
  const inMonths = first(withCosts({ otherLiving: { amount: 50, per: "month" } }, { duration: { value: 3, unit: "months" } })); const c = inMonths.calc.items.otherLiving; assert.equal(c.state, "ok"); if (c.state === "ok") near(c.total, 50 * 3);
  const visa = first({ ...lang(), assume: { ...lang().assume, visa: 490 } }).calc.items.visa; if (visa.state === "ok") near(visa.total, 490);
});
t("all four items can be entered; each is marked as the user's entry and the total updates at once", () => {
  const e = withCosts({ food: { amount: 40, per: "week" }, transport: { amount: 60, per: "month" }, phone: { amount: 15, per: "month" }, otherLiving: { amount: 25, per: "week" } });
  const sp = first(e); for (const k of MANUAL_COSTS) assert.equal(sp.picks[k].status, "assumption", k);
  const only = (k: (typeof MANUAL_COSTS)[number]) => first(withCosts({ [k]: e.assume.costs![k]! })).calc.total.converted;
  assert.ok(total(e) > only("food")); assert.ok(only("food") !== total(lang()));
});
t("a manual figure replaces the table figure (never added on top); an empty item is not counted as 0", () => {
  const auto = first(lang()); assert.equal(auto.picks.food.status, "official"); const official = auto.calc.items.food; assert.equal(official.state, "ok");
  const man = first(withCosts({ food: { amount: 10, per: "week" } })); assert.equal(man.picks.food.status, "assumption"); const c = man.calc.items.food; if (c.state === "ok") near(c.total, 10 * 12);
  const none = first(lang({ cityId: "vancouver" })); assert.equal(none.calc.items.otherLiving.state, "unset"); assert.equal(none.picks.otherLiving.status, "unset");   // no table figure, nothing entered: not counted
  assert.equal(first(withCosts({ otherLiving: { amount: null, per: "week" } })).calc.items.otherLiving.state, "unset", "an empty entry is not 0");
});
t("an explicit 0 is the user's own figure, an empty field is not", () => {
  const z = first(withCosts({ transport: { amount: 0, per: "month" } })); assert.equal(z.picks.transport.status, "assumption"); const c = z.calc.items.transport; assert.equal(c.state, "ok"); if (c.state === "ok") assert.equal(c.total, 0);
});
t("completeness: the estimate stays 'incomplete' while a main item is missing and only judges the budget once all are counted", () => {
  const fill = (e: Easy): Easy => ({ ...e, assume: { ...e.assume, tuitionWeek: 200, visa: 490, insurance: 300, flight: { round: 700, oneway: 400 }, housing: { amount: 150, per: "week" } } });
  const some = first(fill(withCosts({ phone: { amount: 20, per: "month" } }, { cityId: "vancouver" }))); assert.ok(some.provisional && some.mainMissing.includes("food") && some.mainMissing.includes("transport")); assert.notEqual(some.verdict, "within");
  const all = first(fill(withCosts({ food: { amount: 250, per: "month" }, transport: { amount: 80, per: "month" } }, { cityId: "vancouver", budget: { amount: 20000, currency: "CAD" } })));
  assert.equal(all.provisional, false, "all main items are counted"); assert.ok(["within", "over"].includes(all.verdict));
});
t("tiers: manual figures are identical in every tier, so identical plans are merged and Budget/Balanced/Comfort logic is unchanged", () => {
  const groups = groupPlans(generate(withCosts({ food: { amount: 40, per: "week" } }), { now: NOW })); assert.equal(groups.length, 1);
  const uni = lang({ studyType: "university", housing: "dorm", duration: { value: 41, unit: "weeks" } }); assert.equal(generate(uni, { now: NOW }).length, 3);
  const sameCosts = generate({ ...uni, assume: { ...uni.assume, costs: { phone: { amount: 20, per: "month" } } } }, { now: NOW });
  const plain = generate(uni, { now: NOW }); for (let i = 0; i < 3; i++) assert.equal(sameCosts[i].picks.housing.cand?.id, plain[i].picks.housing.cand?.id);
});
t("saving: all new inputs survive a save/load round trip; old data without them loads; bad values are dropped", () => {
  const e = withCosts({ food: { amount: 45.5, per: "week" }, transport: { amount: 70, per: "month" }, phone: { amount: null, per: "week" } });
  const back = cleanEasy(JSON.parse(JSON.stringify(e)))!; assert.deepEqual(back.assume.costs, e.assume.costs);
  const old = cleanEasy({ ...lang(), assume: { tuitionWeek: 90, visa: null, insurance: null, flight: { round: null, oneway: null } } })!; assert.equal(old.assume.costs, undefined); assert.equal(old.assume.tuitionWeek, 90);
  const bad = cleanEasy({ ...lang(), assume: { ...lang().assume, costs: { food: { amount: -3, per: "week" }, transport: { amount: "x", per: "year" }, bogus: { amount: 5, per: "week" }, phone: { amount: 12, per: "year" } } } })!;
  assert.deepEqual(bad.assume.costs, { food: { amount: null, per: "week" }, phone: { amount: 12, per: "month" } }, "a negative amount is dropped (only the unit choice stays, no figure); non-numeric entries and unknown keys vanish; an unknown unit falls back to month");
  const store = savePlan(emptySaved(), first(e), e, "mine", NOW); const loaded = cleanSaved(JSON.parse(JSON.stringify(store)))!; assert.deepEqual(loaded.saved[0].easy.assume.costs, e.assume.costs);
  assert.equal(loaded.saved[0].plan.items.food.value, 45.5);
});
t("the conversion method is stated on the card (1 month = 52 ÷ 12 weeks) with the note that billing can differ", () => {
  const e = withCosts({ food: { amount: 40, per: "month" } }); const g = groupPlans(generate(e, { now: NOW }))[0];
  const out = renderToStaticMarkup(h(I18nProvider, null, h(PlanCard, { g, easy: e, onSave() {}, onOpenAdvanced() {}, onSetRate() {}, onEnter() {} }) as never)); const tx = text(out);
  assert.ok(out.includes('data-testid="breakdown-')); assert.ok(st.convNote.ja.includes("52÷12") && st.convNote.ja.includes("請求") && st.convNote.en.includes("52 ÷ 12") && st.convNote.en.includes("billed"));
  assert.ok(tx.includes("見積もり未完成"));
});
console.log(n, "smart planner 3.0 tests passed");
