// Tests for Ver.1.2.3 (Manchester ONS rent display): the figure is prepared, reconciled and held back until a person approves it. Local tests only.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { officialData, officialSources, pointsOf } from "../data/official";
import { ONS_RENT_APPROVAL, ONS_RENT_CANDIDATE, ONS_RENT_ID, onsRentPoints, reconcileCollected, reconcileStatic } from "../data/official/onsRent";
import { displayModeOf, isFigureShown } from "../data/official/rights";
import { checkPoint } from "../data/official/validate";
import type { Snapshot } from "../collector/types";

let n = 0; const t = (name: string, fn: () => void) => { fn(); n++; console.log("ok", name); };
const root = path.resolve(__dirname, "..");
const snapshot = JSON.parse(readFileSync(path.join(root, "data/collected/snapshot.json"), "utf8")) as Snapshot;
const sample = { approvedBy: "Test Reviewer", approvedAt: "2026-10-20", basis: "test: ONS Manchester page and PIPR workbook compared" };

t("reconciliation 1/2: the candidate agrees with the source registry, the rights record and its own evidence (ONS page + workbook)", () => {
  const checks = reconcileStatic(); for (const c of checks) console.log(`   ${c.ok ? "✓" : "✗"} ${c.name} – ${c.detail}`);
  assert.ok(checks.every((c) => c.ok), checks.filter((c) => !c.ok).map((c) => c.name).join(", "));
});

t("reconciliation 2/2: the collected record (snapshot on main) agrees on source, unit, month, area code and value – while it is the same month", () => {
  const rec = snapshot.records["ons-private-rents:manchester:rental-price"]; assert.ok(rec, "the collector's ONS record is in the snapshot");
  const r = reconcileCollected(rec); for (const c of r.checks) console.log(`   ${c.ok ? "✓" : "✗"} ${c.name} – ${c.detail}`);
  if (r.current) assert.ok(r.checks.every((c) => c.ok), r.checks.filter((c) => !c.ok).map((c) => c.name).join(", "));
  else { console.log(`   (the snapshot now holds ${rec.period}; the August 2026 candidate is older and a new month needs its own review – not a failure)`); assert.equal(r.checks.find((c) => c.name === "same month")!.ok, false); }
  assert.equal(reconcileCollected(undefined).checks[0].ok, false);
});

t("a record that disagrees fails the reconciliation (value, unit, month, area, unconfirmed, status)", () => {
  const rec = structuredClone(snapshot.records["ons-private-rents:manchester:rental-price"]);
  const bad = (patch: (r: typeof rec) => void) => { const x = structuredClone(rec); patch(x); return reconcileCollected(x).checks.some((c) => !c.ok); };
  assert.equal(bad(() => undefined), rec.period !== "2026-08");
  assert.ok(bad((x) => { x.value.number = 1380; })); assert.ok(bad((x) => { x.value.currency = "USD"; })); assert.ok(bad((x) => { x.value.unit = "week"; }));
  assert.ok(bad((x) => { (x.meta as { areaCode: string }).areaCode = "E08000002"; })); assert.ok(bad((x) => { (x.meta as { unconfirmed: string[] }).unconfirmed = ["unit"]; }));
  assert.ok(bad((x) => { (x as { status: string }).status = "verified"; })); assert.ok(bad((x) => { x.sourcePublishedAt = "2026-08-19"; }));
});

t("before approval nothing is published: no ONS figure in Manchester's data, nothing is marked verified, no key figure", () => {
  const man = officialData("manchester")!; const hasIt = man.points.some((p) => p.id === ONS_RENT_ID || p.sourceId === "ons-private-rents");
  assert.equal(hasIt, ONS_RENT_APPROVAL !== null, "the figure is present exactly when a person has approved it");
  if (ONS_RENT_APPROVAL === null) { assert.deepEqual(onsRentPoints(), []); assert.equal(pointsOf("manchester", "housing").some((p) => p.audience === "renter"), false); }
  assert.ok(!ONS_RENT_CANDIDATE.hasOwnProperty("status"), "the candidate carries no verification status");
});

t("after approval the figure becomes ONE verified card in the existing 'City rental market' group (all renters), never in the university halls group", () => {
  const [p] = onsRentPoints(sample); assert.equal(onsRentPoints(sample).length, 1);
  assert.equal(p.status, "verified"); assert.equal(p.checkedAt, "2026-10-20"); assert.equal(p.audience, "renter"); assert.equal(p.housing, undefined); assert.equal(p.topic, "housing"); assert.equal(p.highlight, undefined);
  assert.deepEqual(checkPoint(p, officialSources), []); assert.equal(displayModeOf(p), "full"); assert.ok(isFigureShown(p));
  assert.equal(p.value!.amount, 1373); assert.equal(p.value!.currency, "GBP"); assert.equal(p.value!.per, "month"); assert.ok(p.validFor.startsWith("2026-08"));
  // the housing card puts `p.housing` figures under "University halls" and `audience === "renter"` figures under "City rental market (all renters – not student housing)"
  assert.equal(!!p.housing, false); assert.equal(p.audience === "renter", true);
});

t("the sources and conditions behind 「出典・適用条件を見る」: both ONS pages, area code, month, unit, licence and 'not student housing' in en and ja", () => {
  const [p] = onsRentPoints(sample);
  assert.equal(p.evidence.length, 2); assert.ok(p.evidence.every((e) => e.publisher === "Office for National Statistics" && e.url.startsWith("https://www.ons.gov.uk/")));
  assert.ok(p.evidence[0].url.endsWith("E08000003")); assert.ok(p.evidence[1].quote.includes("E08000003"));
  for (const lang of ["en", "ja"] as const) assert.ok(p.conditions[lang].length > 60);
  assert.match(p.conditions.en, /Not student housing/); assert.match(p.conditions.en, /not university halls/i); assert.match(p.conditions.en, /international students/); assert.match(p.conditions.en, /E08000003/);
  assert.match(p.conditions.ja, /学生向け住居ではありません/); assert.match(p.conditions.ja, /留学生/); assert.match(p.conditions.ja, /E08000003/);
  assert.match(p.label.en, /whole market/); assert.match(p.label.ja, /市場全体/);
});

t("an approval needs a name, a date and what was compared; a candidate that fails its own checks cannot be approved", () => {
  assert.throws(() => onsRentPoints({ ...sample, approvedBy: " " }), /approvedBy/); assert.throws(() => onsRentPoints({ ...sample, approvedAt: "20/10/2026" }), /approvedAt/); assert.throws(() => onsRentPoints({ ...sample, basis: "" }), /basis/);
  const e = ONS_RENT_CANDIDATE.evidence[1]; const q = e.quote; e.quote = "Manchester E08000003 2026-08-01 Rental price 1380";
  try { assert.throws(() => onsRentPoints(sample), /cannot be approved/); } finally { e.quote = q; }
  assert.equal(onsRentPoints(sample).length, 1);
});

t("the Planner, the compare table and the key figures do not read this metric (other cities and the Planner are untouched)", () => {
  for (const f of ["data/official/planner.ts", "data/official/compare.ts", "lib/overview.ts"]) { const s = readFileSync(path.join(root, f), "utf8"); assert.ok(!s.includes("privateRent.average") && !s.includes(ONS_RENT_ID), f); }
  assert.equal(pointsOf("vancouver").some((p) => p.sourceId === "ons-private-rents"), false);
});

console.log(`${n} ONS rent display tests passed`);
