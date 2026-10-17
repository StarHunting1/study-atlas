// Tests for Ver.1.5.0 (Toronto & London data expansion). Local tests only; the live reads were done by GitHub Actions probes (see RELEASE_DATA_AUDIT.md).
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { getCity } from "../data/cities";
import { listCompareSchools, getCompareSchool } from "../data/languageSchools";
import { officialData, officialSources } from "../data/official";
import { LONDON_RENT_APPROVAL, LONDON_RENT_CANDIDATE, TORONTO_RENTS, TORONTO_RENT_APPROVAL, TORONTO_RENT_CANDIDATES, londonRentPoints, reconcileCollected, reconcileStatic, torontoRentPoints } from "../data/official/cityRents";
import { compareRows, compareIssues, missingReason, pickPoint, rowVerdict } from "../data/official/compare";
import { isFigureShown, rightsOfSource } from "../data/official/rights";
import { checkPoint } from "../data/official/validate";
import { blockedHosts } from "../collector/linkcheck";
import { rentCmp, availability } from "../lib/overview";
import { cu } from "../locales/compareUi";
import type { Key } from "../lib/overview";
import type { DataPoint } from "../data/official/types";

let n = 0; const t = (name: string, fn: () => void) => { fn(); n++; console.log("ok", name); };
const root = path.resolve(__dirname, "..");
const sample = { approvedBy: "Test Reviewer", approvedAt: "2026-10-20", basis: "test: publisher pages compared" };
const key = (p: DataPoint): Key => ({ kind: "point", point: p });

t("reconciliation: every Toronto/London candidate agrees with the source registry, rights record and its own evidence", () => {
  const checks = reconcileStatic(); assert.ok(checks.length > 20);
  assert.ok(checks.every((c) => c.ok), checks.filter((c) => !c.ok).map((c) => `${c.name}: ${c.detail}`).join("; "));
  assert.deepEqual(TORONTO_RENTS.map((r) => r.amount), [1491, 1761, 2045, 2294]); assert.equal(LONDON_RENT_CANDIDATE.value!.amount, 2332);
});

t("before approval nothing is published: no rent points for Toronto or London, no verified claim, and the pages carry conditions and official links instead", () => {
  assert.equal(TORONTO_RENT_APPROVAL, null); assert.equal(LONDON_RENT_APPROVAL, null);
  for (const id of ["toronto", "london"]) {
    const d = officialData(id)!; assert.ok(d, id); assert.equal(d.points.length, 0, `${id}: no numbers before approval`);
    const housing = d.notices!.find((x) => x.topic === "housing")!; const transport = d.notices!.find((x) => x.topic === "transport")!;
    for (const x of [housing, transport]) { assert.ok(x.text.en && x.text.ja && x.links.length >= 1 && x.links.every((l) => l.url.startsWith("https://") && l.label.en && l.label.ja)); }
    assert.match(housing.text.en, /not student housing|not language-school housing/i); assert.match(housing.text.ja, /学生向け住居/);
    assert.match(transport.text.en, /Do not assume that language-school students get a student discount/); assert.match(transport.text.ja, /学生割引を受けられるとは限りません/);
  }
  const toronto = getCity("toronto")!.profile, london = getCity("london")!.profile;
  for (const p of [toronto, london]) { const verified: string[] = []; const walk = (o: unknown, path: string) => { if (!o || typeof o !== "object") return; if ("status" in (o as object)) { if ((o as { status: string }).status === "verified") verified.push(path); return; } for (const [k, v] of Object.entries(o)) walk(v, `${path}.${k}`); }; walk(p, "p"); assert.deepEqual(verified, []); }
  assert.ok(torontoRentPoints().length === 0 && londonRentPoints().length === 0);
});

t("an approval needs a name, a date and what was compared; only then do the points exist, as verified, in the existing housing group (renter audience)", () => {
  assert.throws(() => torontoRentPoints({ ...sample, approvedBy: " " }), /approvedBy/); assert.throws(() => londonRentPoints({ ...sample, approvedAt: "20/10/2026" }), /approvedAt/); assert.throws(() => londonRentPoints({ ...sample, basis: "" }), /basis/);
  const tor = torontoRentPoints(sample), lon = londonRentPoints(sample);
  assert.equal(tor.length, 4); assert.equal(lon.length, 1);
  for (const p of [...tor, ...lon]) { assert.equal(p.status, "verified"); assert.equal(p.checkedAt, "2026-10-20"); assert.equal(p.audience, "renter"); assert.equal(p.topic, "housing"); assert.ok(isFigureShown(p)); assert.deepEqual(checkPoint(p, officialSources), [], p.id); }
  assert.equal(tor.filter((p) => p.highlight).length, 1); assert.match(tor[0].conditions.en, /Not student housing|not student housing/i);
});

t("rent definitions are kept apart: Toronto and Vancouver share one CMHC definition and year; London (region) and Manchester (local authority) are never the same statistic; no cross-pair is comparable", () => {
  const tor = torontoRentPoints(sample).find((p) => p.metric === "housing.marketRent.1br")!; const van = officialData("vancouver")!.points.find((p) => p.metric === "housing.marketRent.1br")!;
  const lon = londonRentPoints(sample)[0]; const man = { ...lon, id: "x-man", cityId: "manchester", metric: "housing.privateRent.average", conditions: lon.conditions } as DataPoint;
  assert.equal(rentCmp([key(tor), key(van)]), "same", "same table, structure type, year and kind of area");
  assert.equal(tor.validFor, van.validFor); assert.equal(tor.value!.currency, van.value!.currency);
  assert.equal(rentCmp([key(lon), key(man)]), "differ", "London region vs one local authority");
  assert.equal(lon.metric, "housing.privateRent.regionAverage"); assert.notEqual(lon.metric, "housing.privateRent.average");
  assert.equal(rentCmp([key(lon), key(van)]), "differ"); assert.equal(rentCmp([key(tor), key(man)]), "differ");
  assert.equal(availability([key(lon), key(man)], rentCmp([key(lon), key(man)])), "reference");
  // the detailed compare row never calls any pair "same basis" or ranks it: it is always flagged as not directly comparable
  const row = compareRows.find((r) => r.id === "marketRent")!; assert.ok(row.metrics.includes("housing.privateRent.regionAverage") && row.metrics.includes("housing.marketRent.1br"));
  for (const [a, b] of [[tor, van], [lon, man], [lon, tor]]) assert.equal(rowVerdict(row, [a, b]).verdict, "notDirect");
  assert.match(row.hint!.en, /whole London region/); assert.match(row.hint!.ja, /ロンドン地域全体/);
  assert.equal(compareIssues([tor, van]).length, 0);
  // one-line basis per city so the cards say which area they mean
  assert.ok(cu.rentBasis["housing.marketRent.1br@toronto"].en.includes("Toronto") && cu.rentBasis["housing.privateRent.regionAverage"].ja.includes("ロンドン地域全体"));
  // ONS London says which area it is, and that it is not a borough
  assert.match(lon.conditions.en, /E12000007/); assert.match(lon.conditions.en, /region-wide average/); assert.match(lon.conditions.ja, /地域全体の平均/);
  assert.match(tor.conditions.en, /census metropolitan area/); assert.match(tor.conditions.en, /much wider than the City of Toronto/);
});

t("held rent: while unapproved, the comparison names the topic as held with official links (not as 'no data') and shows no number", () => {
  const row = compareRows.find((r) => r.id === "marketRent")!;
  for (const id of ["toronto", "london"]) { assert.equal(pickPoint(id, row), undefined); const r = missingReason(id, row)!; assert.equal(r.kind, "notice"); assert.ok(r.kind === "notice" && r.links.length >= 1); }
});

t("collected records: a missing record is reported, never assumed; matching records reconcile; a disagreeing one fails", () => {
  const empty = reconcileCollected({}); assert.equal(empty.length, 5); assert.ok(empty.every((r) => !r.collected));
  const rec = (c: Omit<DataPoint, "status" | "checkedAt">, period: string, n: number) => ({ id: c.collectedId!, cityId: c.cityId, sourceId: c.sourceId, value: { number: n, currency: c.value!.currency, unit: "month" }, period, licence: rightsOfSource(c.sourceId).licence, evidence: { quote: c.evidence[0].quote }, status: "unverified" }) as never;
  const ok = reconcileCollected(Object.fromEntries([...TORONTO_RENT_CANDIDATES.map((c) => [c.collectedId!, rec(c, "2025", c.value!.amount)]), [LONDON_RENT_CANDIDATE.collectedId!, rec(LONDON_RENT_CANDIDATE, "2026-08", 2332)]]));
  assert.ok(ok.every((r) => r.collected && r.checks.every((c) => c.ok)));
  const bad = reconcileCollected({ [LONDON_RENT_CANDIDATE.collectedId!]: rec(LONDON_RENT_CANDIDATE, "2026-09", 2340) }); assert.ok(bad.find((r) => r.collected)!.checks.some((c) => !c.ok));
});

t("schools: EF Toronto, Kaplan Toronto, Kaplan London and Frances King London are offered to the school comparison; St Giles (accreditation unconfirmed) is kept but hidden; all unverified, link-only fees, no price figure", () => {
  const ids = listCompareSchools().map((s) => s.id);
  for (const id of ["tor-ef", "tor-kaplan", "lon-kaplan", "lon-frances-king"]) { assert.ok(ids.includes(id), id); const s = getCompareSchool(id)!; assert.equal(s.status, "unverified"); assert.ok(s.inst.url!.startsWith("https://") && s.inst.feesUrl!.startsWith("https://") && s.inst.where && s.inst.note, id); }
  assert.equal(getCompareSchool("lon-st-giles-central"), undefined); assert.ok(getCity("london")!.profile.education.languageSchools.value!.some((s) => s.id === "lon-st-giles-central" && s.hidden));
  const all = [...getCity("toronto")!.profile.education.languageSchools.value!, ...getCity("london")!.profile.education.languageSchools.value!];
  for (const s of all) { const text = JSON.stringify([s.where, s.courses, s.stay, s.note]); assert.ok(!/[£$€]\s?\d|\d\s?(GBP|CAD)\b|CAD ?\d|£ ?\d/.test(text), `${s.id}: no fee figure copied`); }
  assert.match(getCity("toronto")!.profile.education.languageSchools.note!.ja, /大学ではなく語学学校/); assert.match(getCity("london")!.profile.education.languageSchools.note!.en, /language schools, not universities/);
  assert.match(getCompareSchool("tor-ef")!.inst.where!.en, /127 Portland Street/); assert.match(getCompareSchool("tor-kaplan")!.inst.where!.en, /35 The Esplanade/); assert.match(getCompareSchool("lon-kaplan")!.inst.where!.en, /WC1A 2DA/); assert.match(getCompareSchool("lon-frances-king")!.inst.where!.en, /SW7 4SS/);
});

t("transport and fees: TTC and TfL are link-only with unknown reuse, blocked for automation, never requested by the link check; school fee pages stay link-only", () => {
  for (const id of ["ttc-fares", "tfl-fares"]) { const r = rightsOfSource(id); assert.equal(r.reuseStatus, "unknown"); assert.equal(r.display, "link-only"); assert.equal(r.automation, "blocked"); assert.equal(r.lastReviewedAt, null); }
  const hosts = blockedHosts(); assert.ok(hosts.has("ttc.ca") && hosts.has("tfl.gov.uk"));
  assert.equal(rightsOfSource("language-school-fees").display, "link-only");
  for (const id of ["statcan-cmhc-rents", "ons-private-rents"]) assert.equal(rightsOfSource(id).reuseStatus, "permitted");
});

t("Manchester and Vancouver approved data are untouched; the Planner has no rule for Toronto or London", () => {
  const van = officialData("vancouver")!, man = officialData("manchester")!;
  assert.equal(van.points.filter((p) => p.sourceId === "statcan-cmhc-rents").length, 4); assert.equal(van.points.find((p) => p.id === "van-cmhc-rent-1br")!.value!.amount, 1807); assert.equal(van.points.find((p) => p.id === "van-cmhc-rent-1br")!.status, "verified");
  assert.equal(man.points.find((p) => p.id === "man-ons-pipr-private-rent-month")!.value!.amount, 1373);
  const planner = readFileSync(path.join(root, "data/official/planner.ts"), "utf8"); assert.ok(!/\btoronto\b|\blondon\b/.test(planner.split("const RULES")[1].split("const audienceOf")[0]), "no planner rules for the new cities");
  assert.equal(officialData("toronto")!.climate, undefined); assert.equal(officialData("london")!.climate, undefined);
});

console.log(n, "Ver.1.5.0 expansion tests passed");
