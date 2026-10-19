import "./_react";
// Tests for Ver.1.5.2 (Toronto & London rent official release): the five approved figures are verified and shown; nothing else changed. Local tests only.
import assert from "node:assert/strict";
import { getCity, cities } from "../data/cities";
import { allClaims } from "../data/approvalSheet";
import { officialData } from "../data/official";
import { ALL_RENT_CANDIDATES, LONDON_RENT_CANDIDATE, RENT_APPROVALS, TORONTO_RENT_CANDIDATES, approvedRentPoints, londonRentPoints, pendingRentIds, rentDigest, torontoRentPoints } from "../data/official/cityRents";
import { compareRows, pickPoint, rowVerdict, missingReason } from "../data/official/compare";
import { displayModeOf, isFigureShown, rightsOfPoint } from "../data/official/rights";
import { rentBasisDiff, rentBasisOf } from "../data/official/rentBasis";
import { availability, keyFigure, rentCmp, rentKey } from "../lib/overview";
import { CLIMATE_APPROVALS } from "../data/approvals";
import { cityCandidates } from "../data/official/planner";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement as h } from "react";
import { I18nProvider } from "@/lib/i18n";
import QuickCompare from "@/components/overview/QuickCompare";
import { rentDiffFields, type RentBasis } from "../data/official/rentBasis";
import { cu } from "../locales/compareUi";

let n = 0; const t = (name: string, fn: () => void) => { fn(); n++; console.log("ok", name); };
const city = (id: string) => getCity(id)!;
const restore = (target: any, source: any) => { for (const k of Object.keys(source)) { if (source[k] && typeof source[k] === "object") restore(target[k], source[k]); else target[k] = source[k]; } };
const mutate = <T,>(obj: T, f: (o: T) => void, g: () => void) => { const copy = structuredClone(obj); f(obj); try { g(); } finally { restore(obj, copy); } };

t("exactly the five approved figures are verified: Toronto 4 (CAD/month, CMA 535, 2025) and London 1 (GBP/month, E12000007, 2026-08)", () => {
  const tor = officialData("toronto")!.points.filter((p) => p.audience === "renter"), lon = officialData("london")!.points.filter((p) => p.audience === "renter");
  assert.deepEqual(tor.map((p) => [p.id, p.value!.amount, p.value!.currency, p.value!.per, p.status]), [["tor-cmhc-rent-bachelor", 1491, "CAD", "month", "verified"], ["tor-cmhc-rent-1br", 1761, "CAD", "month", "verified"], ["tor-cmhc-rent-2br", 2045, "CAD", "month", "verified"], ["tor-cmhc-rent-3br", 2294, "CAD", "month", "verified"]]);
  assert.deepEqual(lon.map((p) => [p.id, p.value!.amount, p.value!.currency, p.value!.per, p.status]), [["lon-ons-pipr-private-rent-region-month", 2332, "GBP", "month", "verified"]]);
  for (const p of [...tor, ...lon]) { assert.equal(p.checkedAt, "2026-10-17"); assert.equal(p.topic, "housing"); assert.ok(!p.housing); assert.ok(isFigureShown(p)); assert.equal(displayModeOf(p), "full"); }
  assert.equal(officialData("toronto")!.points.length, 4); assert.equal(officialData("london")!.points.length, 1);
  assert.ok(tor.every((p) => p.validFor.startsWith("2025") && p.evidence[0].url.includes("pid=3410013301"))); assert.ok(lon[0].validFor.startsWith("2026-08") && lon[0].evidence[0].url.includes("priceindexofprivaterents"));
});

t("the approval records: StarHunting1, 2026-10-17, the explicit-approval basis, and the content digest of the figure that was verified in PR #50", () => {
  assert.deepEqual(Object.keys(RENT_APPROVALS).sort(), ALL_RENT_CANDIDATES.map((c) => c.id).sort(), "the five Ver.1.5.2 figures and the two Ver.1.6.1 figures are approved, nothing else");
  for (const c of ALL_RENT_CANDIDATES.filter((x) => x.cityId === "toronto" || x.cityId === "london")) { const a = RENT_APPROVALS[c.id]; assert.equal(a.approvedBy, "StarHunting1"); assert.equal(a.approvedAt, "2026-10-17"); assert.match(a.basis, /明示的な公開承認/); assert.match(a.basis, /run 39065320556/); assert.equal(a.digest, rentDigest(c)); }
  const PR50 = { "tor-cmhc-rent-bachelor": "4a79633baf6e7b89bdd7e14393229e1674567a418856ca355e824e5739eab8cf", "tor-cmhc-rent-1br": "abbbf002fa77176f0b4b2c9fc214de335c9faefd166c739b4fbf153f180185c1", "tor-cmhc-rent-2br": "5085d74860e41547259c36aeb9e6a911d5b64b6a444ba58427f0429c13f08381", "tor-cmhc-rent-3br": "923365e8fe0775666ae8e0f82f996234670d48cdb7c8f912a37392859361fdb0", "lon-ons-pipr-private-rent-region-month": "8122055734968c0c56c89125164f69d6ca1650924078dc93cb5710c026cdda09" };
  for (const [id, d] of Object.entries(PR50)) assert.equal(RENT_APPROVALS[id].digest, d, `${id}: identical to what PR #50 prepared`);
  assert.deepEqual([...pendingRentIds("toronto"), ...pendingRentIds("london")], []);
});

t("changing an approved figure, source, period or definition after approval is detected (the build would fail)", () => {
  for (const c of TORONTO_RENT_CANDIDATES) {
    mutate(c, (o) => { o.value!.amount += 1; }, () => assert.throws(() => torontoRentPoints(), /digest mismatch/));
    mutate(c, (o) => { o.validFor = "2024"; }, () => assert.throws(() => torontoRentPoints(), /digest mismatch/));
    mutate(c, (o) => { o.evidence[0].url += "&x"; }, () => assert.throws(() => torontoRentPoints(), /digest mismatch/));
    mutate(c, (o) => { o.conditions.en = o.conditions.en.replace("census metropolitan area", "city"); }, () => assert.throws(() => torontoRentPoints(), /digest mismatch/));
  }
  mutate(LONDON_RENT_CANDIDATE, (o) => { o.value!.amount = 2333; }, () => assert.throws(() => londonRentPoints(), /digest mismatch/));
  mutate(LONDON_RENT_CANDIDATE, (o) => { o.validFor = "2026-09"; }, () => assert.throws(() => londonRentPoints(), /digest mismatch/));
  mutate(LONDON_RENT_CANDIDATE, (o) => { o.conditions.ja = o.conditions.ja.replace("地域全体", "区"); }, () => assert.throws(() => approvedRentPoints(ALL_RENT_CANDIDATES), /digest mismatch/));
  assert.equal(torontoRentPoints().length, 4); assert.equal(londonRentPoints().length, 1);
});

t("comparison with the real data: Toronto and Vancouver share one definition and are 'same basis'; London and Manchester differ in area kind and stay reference only; nothing is ranked", () => {
  const tr = rentKey(city("toronto")), vr = rentKey(city("vancouver")); assert.ok(tr.kind === "point" && vr.kind === "point");
  assert.equal(tr.point.metric, "housing.marketRent.1br"); assert.equal(tr.point.value!.amount, 1761); assert.deepEqual(rentBasisDiff(rentBasisOf(tr.point)!, rentBasisOf(vr.point)!), []);
  assert.equal(rentCmp([tr, vr]), "same"); assert.equal(availability([tr, vr], "same"), "comparable");
  const lr = rentKey(city("london")), mr = rentKey(city("manchester")); assert.ok(lr.kind === "point" && mr.kind === "point");
  assert.equal(lr.point.value!.amount, 2332); assert.deepEqual(rentBasisDiff(rentBasisOf(lr.point)!, rentBasisOf(mr.point)!), ["area"]);
  assert.equal(rentCmp([lr, mr]), "differ"); assert.equal(availability([lr, mr], "differ"), "reference");
  assert.equal(rentCmp([tr, mr]), "differ"); assert.equal(rentCmp([lr, vr]), "differ");
  const row = compareRows.find((r) => r.id === "marketRent")!; const P = (id: string) => pickPoint(id, row);
  assert.equal(rowVerdict(row, [P("toronto"), P("vancouver")]).verdict, "sameBasis"); assert.equal(rowVerdict(row, [P("london"), P("manchester")]).verdict, "notDirect"); assert.equal(rowVerdict(row, [P("toronto"), P("london")]).verdict, "notDirect");
  assert.equal(rowVerdict(row, [P("toronto"), P("london")]).currenciesDiffer, true, "different currencies are never converted or ordered");
  // a different bedroom size is a different statistic even within the same table
  const t2 = officialData("toronto")!.points.find((p) => p.metric === "housing.marketRent.2br")!; assert.equal(rentCmp([{ kind: "point", point: t2 }, vr]), "differ");
});

t("the housing rows stay apart: no city's student-housing row holds a market rent, and a market rent never shows as a university price", () => {
  for (const id of ["toronto", "london"]) { const h = keyFigure(city(id), "housing"); assert.notEqual(h.kind === "point" ? h.point.audience : "", "renter", `${id}: student row`); assert.equal(missingReason(id, compareRows.find((r) => r.id === "uniHalls")!), undefined); }
  for (const id of ["toronto", "london"]) for (const p of officialData(id)!.points) { assert.equal(p.audience, "renter"); assert.ok(!p.housing); assert.match(p.conditions.en, /not student housing/i); assert.match(p.conditions.en, /not language-school housing/i); assert.match(p.conditions.ja, /学生向け住居ではありません|学生寮・語学学校の滞在先の料金・留学生の平均ではなく/); }
});

t("London shows ONS's status ('official statistics in development') and its scope; Toronto says it is the metropolitan area, not the City of Toronto", () => {
  const lon = officialData("london")!.points[0]; assert.match(lon.conditions.en, /official statistics in development/); assert.match(lon.conditions.ja, /開発中の公式統計/); assert.match(lon.conditions.en, /new and existing tenancies/); assert.match(lon.conditions.en, /region-wide average/);
  for (const p of officialData("toronto")!.points) { assert.match(p.label.en, /Toronto metropolitan area/); assert.match(p.label.ja, /トロント都市圏/); assert.match(p.conditions.en, /much wider than the City of Toronto/); assert.match(p.conditions.en, /CMHC Rental Market Survey, reference year 2025/); }
});

t("sources and licences: reuse is 'permitted' for both (kept apart from the verified status), attribution text and licence URL are shown with each figure", () => {
  for (const p of [...officialData("toronto")!.points, ...officialData("london")!.points]) { const r = rightsOfPoint(p); assert.equal(r.reuseStatus, "permitted"); assert.ok(r.attribution && r.licenseUrl && r.licence && r.lastReviewedAt === "2026-10-17"); assert.ok(p.evidence[0].url.startsWith("https://")); }
  assert.match(rightsOfPoint(officialData("toronto")!.points[0]).attribution!, /Canada Mortgage and Housing Corporation \(CMHC\)/); assert.match(rightsOfPoint(officialData("london")!.points[0]).attribution!, /Open Government Licence v3\.0/);
});

t("nothing else changed: Vancouver and Manchester rents, the five UK government claims, Vancouver's approved climate, and the Planner", () => {
  const van = officialData("vancouver")!.points.filter((p) => p.audience === "renter"); assert.deepEqual(van.map((p) => [p.value!.amount, p.status]), [[1667, "verified"], [1807, "verified"], [2364, "verified"], [2820, "verified"]]);
  const man = officialData("manchester")!.points.find((p) => p.audience === "renter")!; assert.equal(man.value!.amount, 1373); assert.equal(man.status, "verified");
  assert.deepEqual(allClaims().filter((c) => c.status === "verified").map((c) => c.id).sort(), ["U1", "U2", "U3", "U5b", "U6"]);
  assert.ok(Object.keys(CLIMATE_APPROVALS).length >= 1 && officialData("vancouver")!.climate!.status === "verified"); assert.equal(officialData("toronto")!.climate, undefined); assert.equal(officialData("london")!.climate, undefined);
  for (const c of ["toronto", "london"] as const) for (const item of ["housing", "food", "transport", "phone", "leisure"] as const) assert.deepEqual(cityCandidates(c as never, item as never, { studyType: "language", housingType: "other" } as never), [], `${c}/${item}: nothing is added to the Planner`);
  assert.equal(cities.length, 6);
});

t("the comparison page names what really differs (area kind for London/Manchester) and does not claim a currency or year difference that does not exist", () => {
  const P = (id: string) => officialData(id)!.points.find((p) => p.audience === "renter")!;
  assert.deepEqual(rentDiffFields([P("toronto"), P("vancouver")]), []); assert.deepEqual(rentDiffFields([P("london"), P("manchester")]), ["area"]);
  const tl = rentDiffFields([P("toronto"), P("london")])!; for (const k of ["publisher", "area", "currency"]) assert.ok(tl.includes(k as keyof RentBasis), k);
  for (const k of Object.keys(rentBasisOf(P("toronto"))!)) { assert.ok(cu.rentDiff.fields[k].en && cu.rentDiff.fields[k].ja, k); }
  assert.ok(cu.rentDiff.why.en.includes("{fields}") && cu.rentDiff.why.ja.includes("{fields}") && cu.rentDiff.note.en.includes("{fields}") && cu.rentDiff.note.ja.includes("{fields}"));
  const render = (ids: string[]) => renderToStaticMarkup(h(I18nProvider, null, h(QuickCompare, { ids }))).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
  const lm = render(["london", "manchester"]); assert.ok(lm.includes("同じ統計ではないため参考比較です：対象地域の単位が違います（ロンドン：地域全体、マンチェスター：1つの地方自治体）"), "London/Manchester: the area kind is named, with each city's value (Ver.1.6.2 wording)"); assert.ok(!lm.includes("統計の種類（発表元・地域・住居タイプ・年・通貨）が異なる"), "no generic claim of a year or currency difference");
  const tv = render(["toronto", "vancouver"]); assert.ok(tv.includes("いずれも2025年の、都市圏")); assert.ok(tv.includes("比較可能"));
});

console.log(n, "Ver.1.5.2 release tests passed");
