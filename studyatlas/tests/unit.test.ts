// Unit tests for the budget engine, period conversion, fee comparability, sample-data handling and stored-data cleaning.
// Run: npm test
import assert from "node:assert/strict";
import { calculate, newPlan, cleanPlan, type Plan } from "@/lib/budget";
import { totalFor, WEEKS_PER_MONTH } from "@/lib/money";
import { priceIssues } from "@/data/comparability";
import { getSchool, listSchools } from "@/data/schools";
import { cleanProfile } from "@/lib/profile";
import { knowledgeDocuments } from "@/data/knowledge";
let n = 0; const t = (name: string, fn: () => void) => { fn(); n++; console.log("ok", name); };
t("period conversion", () => {
  assert.equal(totalFor(100, "week", 10), 1000);
  assert.equal(totalFor(1300, "month", 52), 1300 * 12);
  assert.equal(totalFor(26000, "year", 26), 13000);
  assert.equal(totalFor(500, "once", null), 500);
  assert.equal(totalFor(100, "week", null), null);
  assert.ok(Math.abs(totalFor(1000, "month", WEEKS_PER_MONTH)! - 1000) < 1e-9);
});
t("empty plan is incomplete, not zero-complete", () => {
  const r = calculate(newPlan("JPY", 12)); assert.equal(r.complete, false); assert.equal(r.missing.length, 11); assert.equal(r.total, 0);
});
t("explicit 0 counts as entered", () => {
  const p = newPlan("JPY", 4); for (const id of Object.keys(p.items) as (keyof Plan["items"])[]) p.items[id].amount = 0;
  const r = calculate(p); assert.equal(r.complete, true); assert.equal(r.total, 0);
});
t("foreign currency needs a rate, then converts with recorded rate", () => {
  const p = newPlan("JPY", 10); p.items.housing = { amount: 200, currency: "GBP", per: "week" };
  assert.equal(calculate(p).items.housing.state, "noRate");
  p.rates.GBP = { rate: 190, date: "2026-10-13" }; const r = calculate(p);
  assert.deepEqual([r.items.housing.state, r.items.housing.state === "ok" && r.items.housing.converted], ["ok", 200 * 10 * 190]);
  assert.deepEqual(r.usedRates, ["GBP"]);
});
t("periodic item without length of stay", () => { const p = newPlan("JPY", null); p.items.food = { amount: 300, currency: "JPY", per: "month" }; assert.equal(calculate(p).items.food.state, "noWeeks"); });
t("contingency percent of other items", () => {
  const p = newPlan("JPY", 1); p.items.flights = { amount: 200000, currency: "JPY", per: "once" }; p.items.contingency = { amount: 10, currency: "JPY", per: "percent" };
  const r = calculate(p); assert.equal(r.items.contingency.state === "ok" && r.items.contingency.converted, 20000); assert.equal(r.total, 220000);
});
t("school link reads sample fee live; unverified/pending stays missing", () => {
  const p = newPlan("CAD", 12); p.items.tuition = { amount: null, currency: "CAD", per: "once", link: { schoolId: "demo-maple", optionId: "general", field: "tuition" } };
  const r = calculate(p); assert.equal(r.items.tuition.state === "ok" && r.items.tuition.original, 400 * 12); assert.equal(r.items.tuition.sourceStatus, "sample");
  p.items.registration = { amount: null, currency: "CAD", per: "once", link: { schoolId: "ubc", optionId: "none", field: "tuitionInternational" } };
  assert.equal(calculate(p).items.registration.state, "pendingSource");
});
t("course-priced fee counted once and flagged", () => {
  const p = newPlan("GBP", 12); p.items.tuition = { amount: null, currency: "GBP", per: "once", link: { schoolId: "demo-canal", optionId: "term12", field: "tuition" } };
  const r = calculate(p).items.tuition; assert.equal(r.state === "ok" && r.original, 3300); assert.equal(r.termOrCourse, true);
});
t("price comparability reasons", () => {
  const maple = getSchool("demo-maple")!, red = getSchool("demo-redbrick")!, canal = getSchool("demo-canal")!;
  if (maple.kind !== "language" || red.kind !== "language" || canal.kind !== "language") throw 0;
  const i1 = priceIssues([maple.courses[0].tuition, red.courses[0].tuition]);
  assert.ok(i1.includes("notVerified") && i1.includes("currency") && i1.includes("tax") && i1.includes("includes"));
  const i2 = priceIssues([red.courses[0].tuition, canal.courses[0].tuition], [red.courses[0].duration, canal.courses[0].duration]);
  assert.ok(i2.includes("unit") && i2.includes("feeYear") && i2.includes("duration") && !i2.includes("currency"));
  const v = (amount: number) => ({ status: "verified" as const, value: { amount, currency: "GBP", unit: "week" as const, feeYear: "2026", tax: "included" as const }, sources: [{ url: "https://x", publisher: "x" }], period: "2026", checkedAt: "2026-10-13" });
  assert.deepEqual(priceIssues([v(1), v(2)]), []);
});
t("sample schools hidden unless requested", () => {
  assert.ok(listSchools("language", { includeSamples: false }).length === 0);
  assert.ok(listSchools("language", { includeSamples: true }).every((s) => s.demo));
  assert.ok(listSchools("university", { includeSamples: false }).every((s) => !s.demo));
});
t("stored data is cleaned", () => {
  assert.equal(cleanPlan("x"), undefined); assert.equal(cleanPlan({ displayCurrency: "JPY", items: { food: { amount: "1", currency: "JPY", per: "week" } } })!.items.food.amount, null);
  const pr = cleanProfile({ nationality: "JP", ageGroup: "bogus", departure: "2027-04", duration: { value: 6, unit: "months" } })!;
  assert.deepEqual([pr.nationality, pr.ageGroup, pr.departure, pr.duration.unit], ["JP", "", "2027-04", "months"]);
});
t("knowledge registry: visa pages stay unverified; verified documents come only from checked official data", () => {
  const d = knowledgeDocuments(); assert.ok(d.length >= 4);
  const visa = d.filter((x) => x.topics.includes("visa")); assert.ok(visa.length >= 3 && visa.every((x) => x.status !== "verified"));
  const verified = d.filter((x) => x.status === "verified"); assert.ok(verified.length > 0);
  assert.ok(verified.every((x) => x.checkedAt && /^https:\/\//.test(x.url)));
});
console.log(`${n} unit tests passed`);
