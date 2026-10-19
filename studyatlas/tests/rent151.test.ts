import "./_react";
// Tests for Ver.1.5.1 (Toronto & London rent verification and approval readiness). Local tests only; the live re-read of the official data was done by GitHub Actions run 39065320556.
import assert from "node:assert/strict";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement as h } from "react";
import { I18nProvider } from "@/lib/i18n";
import DataCard from "@/components/official/DataCard";
import { officialData } from "../data/official";
import { torontoData } from "../data/official/toronto";
import { londonData } from "../data/official/london";
import { ALL_RENT_CANDIDATES, LONDON_RENT_CANDIDATE, RENT_APPROVALS, TORONTO_RENT_CANDIDATES, approvalProblem, approvedRentPoints, londonRentPoints, pendingRentIds, rentDigest, torontoRentPoints, type RentApproval } from "../data/official/cityRents";
import { sha256 } from "../data/official/rentDigest";
import { rentBasisDiff, rentBasisOf, sameRentBasis } from "../data/official/rentBasis";
import { RIGHTS } from "../data/official/rights.data";
import { rentCmp, type Key } from "../lib/overview";
import { cityCandidates } from "../data/official/planner";
import { approvalSheet } from "../data/approvalSheet";
import type { DataPoint } from "../data/official/types";

let n = 0; const t = (name: string, fn: () => void) => { fn(); n++; console.log("ok", name); };
const ap = (c: { id: string }, patch: Partial<RentApproval> = {}): RentApproval => ({ approvedBy: "Test Reviewer", approvedAt: "2026-10-20", basis: "test: official table and licence compared", digest: rentDigest(c as never), ...patch });
const all = (list = ALL_RENT_CANDIDATES) => Object.fromEntries(list.map((c) => [c.id, ap(c)]));
const key = (p: DataPoint): Key => ({ kind: "point", point: p });
const restore = (target: any, source: any) => { for (const k of Object.keys(source)) { if (source[k] && typeof source[k] === "object") restore(target[k], source[k]); else target[k] = source[k]; } };
const mutate = <T,>(obj: T, f: (o: T) => void, g: (o: T) => void) => { const copy = structuredClone(obj); f(obj); try { g(obj); } finally { restore(obj, copy); } };

t("SHA-256 is correct (so the digest is a real content hash, also in the browser bundle)", () => {
  assert.equal(sha256("abc"), "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad"); assert.equal(sha256(""), "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855");
  assert.equal(sha256("abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopq"), "248d6a61d20638b8e5c026930c3e6039a33ce45964ff2167f6ecedd419db06c1");
  assert.equal(sha256("日本語 £2,332"), sha256("日本語 £2,332")); assert.notEqual(sha256("a"), sha256("b"));
});

t("official re-check (Actions run 39065320556, 2026-10-17): the five candidates equal the official values and carry the official definitions", () => {
  assert.deepEqual(TORONTO_RENT_CANDIDATES.map((c) => [c.metric, c.value!.amount, c.value!.currency, c.value!.per]), [["housing.marketRent.bachelor", 1491, "CAD", "month"], ["housing.marketRent.1br", 1761, "CAD", "month"], ["housing.marketRent.2br", 2045, "CAD", "month"], ["housing.marketRent.3br", 2294, "CAD", "month"]]);
  for (const c of TORONTO_RENT_CANDIDATES) { assert.ok(c.validFor.startsWith("2025")); assert.match(c.conditions.en, /census metropolitan area, code 535/); assert.match(c.conditions.en, /much wider than the City of Toronto/); assert.match(c.conditions.en, /three units and over/); assert.match(c.conditions.en, /not student housing/i); assert.match(c.evidence[0].quote, /^Toronto, Ontario; Row and apartment structures of three units and over; /); assert.ok(c.evidence[0].quote.endsWith(`2025: ${c.value!.amount}`)); assert.match(c.conditions.ja, /535/); assert.match(c.conditions.ja, /トロント市より大きく広い/); }
  assert.deepEqual([LONDON_RENT_CANDIDATE.value!.amount, LONDON_RENT_CANDIDATE.value!.currency, LONDON_RENT_CANDIDATE.value!.per], [2332, "GBP", "month"]);
  assert.ok(LONDON_RENT_CANDIDATE.validFor.startsWith("2026-08")); assert.equal(LONDON_RENT_CANDIDATE.evidence[0].quote, "London E12000007 2026-08-01 Rental price 2332");
  assert.match(LONDON_RENT_CANDIDATE.conditions.en, /London region \(ONS code E12000007/); assert.match(LONDON_RENT_CANDIDATE.conditions.en, /region-wide average/); assert.match(LONDON_RENT_CANDIDATE.conditions.en, /not student housing/i); assert.match(LONDON_RENT_CANDIDATE.conditions.ja, /地域全体の平均/); assert.match(LONDON_RENT_CANDIDATE.conditions.en, /new and existing tenancies/);
});

t("licences are recorded apart from verification: commercial reuse permitted, attribution, licence URL, review date 2026-10-17", () => {
  const sc = RIGHTS["statcan-cmhc-rents"], on = RIGHTS["ons-private-rents"];
  for (const r of [sc, on]) { assert.equal(r.reuseStatus, "permitted"); assert.equal(r.automation, "allowed"); assert.equal(r.lastReviewedAt, "2026-10-17"); assert.ok(r.licenseUrl && r.attribution && r.licence); assert.ok(r.reviewed.some((p) => p.reviewedAt === "2026-10-17")); }
  assert.match(sc.reviewNotes.en, /commercial reuse is therefore permitted/i); assert.match(sc.attribution!, /CMHC/); assert.match(sc.attribution!, /as is/); assert.match(sc.reviewNotes.en, /revocable/); assert.match(sc.reviewNotes.ja, /取消可能/);
  assert.match(on.reviewNotes.en, /exploit the Information commercially/); assert.match(on.attribution!, /Open Government Licence v3\.0/); assert.match(on.licence!, /Open Government Licence v3\.0/);
  assert.ok(RIGHTS["language-school-fees"].display === "link-only", "an approval of a rent figure never changes the school-fee rules");
});

t("the digest binds the approval to the figure, unit, period, source, quote and definition; notes and retrieval dates are not part of it", () => {
  const base = TORONTO_RENT_CANDIDATES[1]; const d = rentDigest(base); assert.match(d, /^[0-9a-f]{64}$/); assert.equal(rentDigest(structuredClone(base)), d);
  const changes: [string, (c: typeof base) => void][] = [
    ["amount", (c) => { c.value!.amount = 1762; }], ["currency", (c) => { c.value!.currency = "USD"; }], ["per", (c) => { c.value!.per = "week"; }], ["period", (c) => { c.validFor = "2024 (latest reference year)"; }],
    ["quote", (c) => { c.evidence[0].quote += " "; }], ["source url", (c) => { c.evidence[0].url += "&x=1"; }], ["source id", (c) => { c.sourceId = "ons-private-rents"; }], ["definition (en)", (c) => { c.conditions.en += " "; }],
    ["definition (ja)", (c) => { c.conditions.ja += " "; }], ["metric", (c) => { c.metric = "housing.marketRent.2br"; }], ["label", (c) => { c.label.en += "!"; }], ["audience", (c) => { c.audience = "student"; }], ["city", (c) => { c.cityId = "vancouver"; }],
  ];
  for (const [name, f] of changes) { const c = structuredClone(base); f(c); assert.notEqual(rentDigest(c), d, name); }
  const c2 = structuredClone(base); c2.retrievedAt = "2030-01-01"; c2.note = { en: "x", ja: "y" }; assert.equal(rentDigest(c2), d, "retrieval date and notes are not part of the approval");
});

t("every figure is approved on its own: one Toronto value publishes only that value; London's approval never publishes Toronto and the reverse", () => {
  const one = { [TORONTO_RENT_CANDIDATES[1].id]: ap(TORONTO_RENT_CANDIDATES[1]) };
  const t1 = torontoRentPoints(one); assert.deepEqual(t1.map((p) => p.id), ["tor-cmhc-rent-1br"]); assert.equal(t1[0].status, "verified"); assert.equal(t1[0].checkedAt, "2026-10-20"); assert.equal(londonRentPoints(one).length, 0);
  assert.deepEqual(pendingRentIds("toronto", one), ["tor-cmhc-rent-bachelor", "tor-cmhc-rent-2br", "tor-cmhc-rent-3br"]); assert.equal(pendingRentIds("london", one).length, 1);
  const lon = { [LONDON_RENT_CANDIDATE.id]: ap(LONDON_RENT_CANDIDATE) }; assert.equal(torontoRentPoints(lon).length, 0); assert.equal(londonRentPoints(lon).length, 1); assert.equal(pendingRentIds("london", lon).length, 0); assert.equal(pendingRentIds("toronto", lon).length, 4);
  assert.equal(torontoRentPoints(all()).length, 4); assert.equal(londonRentPoints(all()).length, 1); assert.equal(torontoRentPoints({}).length, 0);
});

t("no approval, no verified (empty approval map); a bad, incomplete or stray approval is rejected", () => {
  for (const d of [torontoData({}), londonData({})]) assert.equal(d.points.length, 0, "an empty approval map publishes nothing");
  assert.equal(approvalProblem(LONDON_RENT_CANDIDATE, undefined), "not approved");
  const L = LONDON_RENT_CANDIDATE; const wrap = (a: RentApproval) => ({ [L.id]: a });
  assert.throws(() => londonRentPoints(wrap(ap(L, { approvedBy: " " }))), /approvedBy/); assert.throws(() => londonRentPoints(wrap(ap(L, { approvedAt: "2026/10/20" }))), /approvedAt/); assert.throws(() => londonRentPoints(wrap(ap(L, { basis: "" }))), /basis/); assert.throws(() => londonRentPoints(wrap(ap(L, { digest: "" }))), /digest/);
  assert.throws(() => londonRentPoints(wrap(ap(L, { digest: sha256("something else") }))), /digest mismatch/);
  assert.throws(() => londonRentPoints({ "lon-unknown": ap(L) }), /unknown figure/);
  assert.throws(() => approvedRentPoints(ALL_RENT_CANDIDATES, { "tor-cmhc-rent-4br": ap(L) }), /unknown figure/);
});

t("changing an approved figure, source, period or definition is detected and the load fails (Toronto and London)", () => {
  const approvals = all();
  for (const c of TORONTO_RENT_CANDIDATES) for (const f of [(o: typeof c) => { o.value!.amount += 1; }, (o: typeof c) => { o.validFor = "2024"; }, (o: typeof c) => { o.evidence[0].quote = o.evidence[0].quote.replace("Toronto, Ontario", "London, Ontario"); }, (o: typeof c) => { o.conditions.en = o.conditions.en.replace("census metropolitan area", "city"); }])
    mutate(c, f, () => assert.throws(() => torontoRentPoints(approvals), new RegExp(`${c.id}.*digest mismatch|rent cannot be approved`)));
  mutate(LONDON_RENT_CANDIDATE, (o) => { o.value!.amount = 2333; }, () => assert.throws(() => londonRentPoints(approvals), /digest mismatch/));
  mutate(LONDON_RENT_CANDIDATE, (o) => { o.validFor = "2026-09"; }, () => assert.throws(() => londonRentPoints(approvals), /digest mismatch/));
  mutate(LONDON_RENT_CANDIDATE, (o) => { o.conditions.en = o.conditions.en.replace("London region", "Camden"); }, () => assert.throws(() => londonRentPoints(approvals), /digest mismatch/));
  assert.equal(londonRentPoints(approvals).length, 1, "restored after the checks");
});

t("comparison: Toronto and Vancouver are 'same' only when every part of the definition matches; London and Manchester differ in area kind", () => {
  const tor = torontoRentPoints(all()).find((p) => p.metric === "housing.marketRent.1br")!; const van = officialData("vancouver")!.points.find((p) => p.metric === "housing.marketRent.1br")!;
  const bt = rentBasisOf(tor)!, bv = rentBasisOf(van)!; assert.deepEqual(rentBasisDiff(bt, bv), []); assert.equal(bt.area, "census metropolitan area"); assert.equal(bt.structure, "Row and apartment structures of three units and over"); assert.equal(bt.year, "2025"); assert.equal(bt.currency, "CAD");
  assert.equal(rentCmp([key(tor), key(van)]), "same"); assert.ok(sameRentBasis([tor, van]));
  const variants: [string, (p: DataPoint) => void][] = [["year", (p) => { p.validFor = "2024 (latest)"; }], ["structure", (p) => { p.evidence = [{ ...p.evidence[0], quote: p.evidence[0].quote.replace("Row and apartment structures of three units and over", "Apartment structures of six units and over") }]; }], ["unit", (p) => { p.evidence = [{ ...p.evidence[0], quote: p.evidence[0].quote.replace("One bedroom units", "Two bedroom units") }]; }], ["currency", (p) => { p.value = { ...p.value!, currency: "USD" }; }], ["per", (p) => { p.value = { ...p.value!, per: "year" }; }]];
  for (const [name, f] of variants) { const x = structuredClone(tor); f(x); assert.equal(rentCmp([key(x), key(van)]), "differ", name); assert.notEqual(rentBasisKey2(x), rentBasisKey2(van), name); }
  const x = structuredClone(tor); x.cityId = "somewhere"; assert.equal(rentBasisOf(x), undefined, "an unrecorded city is never comparable"); assert.equal(rentCmp([key(x), key(van)]), "differ");
  const unver = { ...tor, status: "unverified" as const }; assert.equal(rentCmp([key(unver), key(van)]), "unverified");
  const lon = londonRentPoints(all())[0]; const man = officialData("manchester")!.points.find((p) => p.metric === "housing.privateRent.average"); 
  const manPoint = man ?? ({ ...lon, id: "x-man", cityId: "manchester", metric: "housing.privateRent.average" } as DataPoint);
  assert.deepEqual(rentBasisDiff(rentBasisOf(lon)!, rentBasisOf(manPoint)!), ["area"], "same statistic and month, but a region vs a local authority"); assert.equal(rentCmp([key(lon), key(manPoint)]), "differ");
  assert.equal(rentCmp([key(lon), key(van)]), "differ"); assert.equal(rentCmp([key(tor), key(manPoint)]), "differ");
});
function rentBasisKey2(p: DataPoint) { const b = rentBasisOf(p); return b ? JSON.stringify(b) : "none"; }

t("preview after approval (existing card): area, year, unit, scope, source, check date and licence shown; not a student price; Japanese", () => {
  const html = (p: DataPoint) => renderToStaticMarkup(h(I18nProvider, null, h(DataCard, { p }))); const text = (s: string) => s.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
  const tor = torontoRentPoints(all()).find((p) => p.metric === "housing.marketRent.1br")!; const tx = text(html(tor));
  for (const w of ["$1,761", "CAD", "2025", "トロント都市圏", "市場全体"]) assert.ok(tx.includes(w), `Toronto card: ${w}`);
  // level 3 ("出典・適用条件を見る") holds the definition, sources, check date and licence; check its content from the data the card renders
  assert.match(tor.conditions.ja, /コード535/); assert.match(tor.conditions.ja, /学生寮・語学学校の滞在先の料金・留学生の平均ではなく/); assert.equal(tor.checkedAt, "2026-10-20"); assert.equal(tor.evidence[0].publisher, "Statistics Canada (CMHC data)");
  const lon = londonRentPoints(all())[0]; const lx = text(html(lon));
  for (const w of ["2,332", "GBP", "2026年8月", "ロンドン地域全域", "市場全体"]) assert.ok(lx.includes(w), `London card: ${w}`);
  assert.match(lon.conditions.ja, /E12000007/); assert.match(lon.conditions.ja, /地域全体の平均/); assert.match(lon.conditions.ja, /新規契約と既存契約/); assert.match(lon.conditions.ja, /大学寮・語学学校の滞在先の料金・留学生の平均ではなく/); assert.equal(lon.checkedAt, "2026-10-20"); assert.equal(lon.evidence[0].publisher, "Office for National Statistics");
  assert.ok(!/確認済みの学生/.test(tx + lx));
});

t("the Smart Planner takes nothing: neither city has a planner rule, even with every figure approved", () => {
  for (const city of ["toronto", "london"] as const) for (const item of ["housing", "food", "transport", "phone", "leisure"] as const) assert.deepEqual(cityCandidates(city as never, item as never, { studyType: "language", housingType: "other" } as never), [], `${city}/${item}`);
});

t("the approval sheet lists the digests of all five figures, says 'not approved' for each, and gives the steps (it is regenerated by npm run approvals)", () => {
  const s = approvalSheet(); assert.match(s, /## 6\. Toronto・London の家賃統計/);
  for (const c of ALL_RENT_CANDIDATES) { assert.ok(s.includes(rentDigest(c)), c.id); assert.ok(s.includes(c.id)); }
  assert.equal((s.match(/\*\*未承認\*\*（非表示）/g) ?? []).length, 2, "only the two Ver.1.6.0 Sydney/Melbourne candidates are unapproved"); assert.equal((s.match(/承認済み（StarHunting1・2026-10-17）/g) ?? []).length, 5); assert.match(s, /39065320556/); assert.match(s, /RENT_APPROVALS/); assert.match(s, /商用利用可/);
});

console.log(n, "Ver.1.5.1 rent verification tests passed");
