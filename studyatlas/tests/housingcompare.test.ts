// Tests for Ver.1.2.4 (Vancouver housing + Manchester/Vancouver comparison). Local tests only.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { officialConsistency } from "../collector/consistency";
import * as compareModule from "../data/official/compare";
import { compareIssues, compareRows, pickPoint, rowVerdict } from "../data/official/compare";
import { officialData, pointsOf } from "../data/official";
import { displayModeOf, isFigureShown, rightsOfSource } from "../data/official/rights";
import { cardPeriod, validForShort } from "../data/official/validFor";
import { keyPoint } from "../lib/overview";
import type { Snapshot } from "../collector/types";

let n = 0; const t = (name: string, fn: () => void) => { fn(); n++; console.log("ok", name); };
const root = path.resolve(__dirname, "..");
const snapshot = JSON.parse(readFileSync(path.join(root, "data/collected/snapshot.json"), "utf8")) as Snapshot;
const rent = pointsOf("vancouver", "housing").filter((p) => p.metric.startsWith("housing.marketRent"));
const row = compareRows.find((r) => r.id === "marketRent")!;

t("Vancouver's four CMHC rents: verified, shown in full under the licence, CAD per month, whole market, never student housing", () => {
  assert.equal(rent.length, 4); assert.deepEqual(rent.map((p) => p.value!.amount), [1667, 1807, 2364, 2820]);
  const r = rightsOfSource("statcan-cmhc-rents"); assert.equal(r.reuseStatus, "permitted"); assert.ok(r.attribution && r.licenseUrl);
  for (const p of rent) {
    assert.equal(p.status, "verified"); assert.ok(p.checkedAt); assert.equal(displayModeOf(p), "full"); assert.ok(isFigureShown(p));
    assert.equal(p.value!.currency, "CAD"); assert.equal(p.value!.per, "month"); assert.equal(p.audience, "renter"); assert.equal(p.housing, undefined);
    assert.ok(p.validFor.startsWith("2025")); assert.match(p.conditions.en, /not student housing/i); assert.match(p.conditions.ja, /学生/);
    assert.equal(p.evidence[0].url, "https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=3410013301");
  }
});

t("the published Vancouver figures agree with the collector's stored records (nothing to re-approve, nothing changed to verified)", () => {
  const res = officialConsistency(snapshot).filter((c) => c.id.startsWith("van-cmhc-rent"));
  assert.equal(res.length, 4); for (const c of res) assert.equal(c.result, "match", `${c.id}: ${c.detail}`);
  for (const p of rent) { const rec = snapshot.records[p.collectedId!]; assert.equal(rec.status, "unverified", "the collector never verifies"); assert.equal(rec.value.number, p.value!.amount); assert.equal(rec.period, "2025"); }
});

t("the card shows the reference period for market statistics (Vancouver 2025, Manchester 2026-08); other figures are unchanged", () => {
  assert.equal(cardPeriod(rent[0], "en"), "2025"); assert.equal(cardPeriod(rent[0], "ja"), "2025年");
  const man = pointsOf("manchester", "housing").find((p) => p.audience === "renter")!; assert.equal(cardPeriod(man, "en"), "2026-08"); assert.equal(cardPeriod(man, "ja"), "2026年8月");
  const halls = pointsOf("manchester", "housing").find((p) => p.housing)!; assert.equal(cardPeriod(halls, "en"), undefined);
  assert.equal(validForShort(rent[0].validFor, "en"), "2025");
});

t("compare: Manchester's ONS rent sits beside Vancouver's CMHC rent, and the row says they are not directly comparable", () => {
  const m = pickPoint("manchester", row)!, v = pickPoint("vancouver", row)!;
  assert.equal(m.metric, "housing.privateRent.average"); assert.equal(m.value!.currency, "GBP"); assert.ok(m.validFor.startsWith("2026-08"));
  assert.equal(v.metric, "housing.marketRent.1br"); assert.equal(v.value!.currency, "CAD"); assert.ok(v.validFor.startsWith("2025"));
  assert.deepEqual(compareIssues([m, v]), []);                                        // both verified, both per month, both whole-market renters
  const r = rowVerdict(row, [m, v]); assert.equal(r.verdict, "notDirect"); assert.equal(r.currenciesDiffer, true);
  assert.match(row.basis!.en, /Not directly comparable/); assert.match(row.basis!.en, /currency/); assert.match(row.basis!.en, /not converted/i);
  assert.match(row.basis!.ja, /直接は比較できません/); assert.match(row.basis!.ja, /換算なし/); assert.match(row.basis!.ja, /判定しません/);
  assert.match(row.hint!.en, /Neither is student housing/); assert.match(row.hint!.ja, /学生向け住居ではありません/);
});

t("no verdict is ever 'cheaper': the row logic returns only missing / issues / notDirect / sameBasis", () => {
  const m = pickPoint("manchester", row)!, v = pickPoint("vancouver", row)!;
  for (const pts of [[m, v], [m, undefined], [undefined, v], [m, { ...v, status: "unverified" as const }], [m, { ...v, value: { ...v.value!, per: "week" as const } }]]) assert.ok(["missing", "issues", "notDirect", "sameBasis"].includes(rowVerdict(row, pts).verdict));
  assert.equal(rowVerdict(row, [m, undefined]).verdict, "missing"); assert.equal(rowVerdict(row, [m, { ...v, status: "unverified" }]).verdict, "issues");
  // other rows keep their behaviour: a row without `basis` is "same basis" when nothing differs
  const fare = compareRows.find((r) => r.id === "single")!; assert.equal(fare.basis, undefined);
  // the comparison module exposes no function that orders or ranks amounts
  assert.ok(!Object.keys(compareModule).some((k) => /cheap|dear|rank|order|sort|winner|lower|higher/i.test(k)), Object.keys(compareModule).join(", "));
});

t("the Manchester ONS figure stays as approved, and the Vancouver key figure is still the CMHC 1-bedroom rent", () => {
  const m = officialData("manchester")!.points.find((p) => p.id === "man-ons-pipr-private-rent-month")!; assert.equal(m.value!.amount, 1373); assert.equal(m.status, "verified");
  assert.equal(keyPoint("vancouver", "housing")!.metric, "housing.marketRent.1br");
});

console.log(`${n} housing compare tests passed`);
