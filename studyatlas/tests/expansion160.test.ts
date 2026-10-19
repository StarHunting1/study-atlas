import "./_react";
// Tests for Ver.1.6.0 (Sydney & Melbourne data expansion). Local tests only. Approvals used below are in-memory test inputs; the real RENT_APPROVALS file is never touched.
import assert from "node:assert/strict";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement as h } from "react";
import { I18nProvider } from "@/lib/i18n";
import { countries, getCity } from "@/data/cities";
import { officialData, officialSources } from "@/data/official";
import CityOverview from "@/components/overview/CityOverview";
import { keyFigure, rentCheckingKey, rentCmp, transportLinkKey, type Key } from "@/lib/overview";
import { ux } from "@/locales/ux";
import { getCompareSchool, listCompareSchools } from "@/data/languageSchools";
import { ALL_RENT_CANDIDATES, AU_RENT_CANDIDATES_FOR_TEST, RENT_APPROVALS, approvalProblem, melbourneRentPoints, pendingRentIds, rentDigest, sydneyRentPoints, reconcileStatic, type RentApproval } from "../data/official/cityRents";
import { MELBOURNE_RENT_CANDIDATE, SYDNEY_RENT_CANDIDATE } from "../data/official/auRents";
import { sydneyData } from "../data/official/sydney";
import { melbourneData } from "../data/official/melbourne";
import { rentBasisDiff, rentBasisOf, sameRentBasis } from "../data/official/rentBasis";
import { RIGHTS } from "../data/official/rights.data";
import { displayModeOf } from "../data/official/rights";
import { compareRows, missingReason, pickPoint, rowVerdict } from "../data/official/compare";
import { cityCandidates } from "../data/official/planner";
import { healthLinks, visaLinks } from "../data/visa";
import { blockedHosts, expectFor, linkTargets } from "../collector/linkcheck";
import { countries as countryList } from "../data/countries";
import QuickCompare from "@/components/overview/QuickCompare";

let n = 0; const t = (name: string, fn: () => void) => { fn(); n++; console.log("ok", name); };
const city = (id: string) => getCity(id)!;
const page = (id: string, data = officialData(id)) => { const c = city(id); return renderToStaticMarkup(h(I18nProvider, null, h(CityOverview, { city: c, country: countries.find((x) => x.code === c.country)!, data }))); };
const text = (s: string) => s.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
const keyOf = (html: string, topic: string) => { const i = html.indexOf(`data-testid="key-${topic}"`); const j = html.indexOf("<button", i); return html.slice(i, j > i ? j : i + 3000); };
const ap = (c: { id: string }): RentApproval => ({ approvedBy: "Test Reviewer", approvedAt: "2026-10-20", basis: "test input only", digest: rentDigest(c as never) });
const both = { "syd-abs-census-median-weekly-rent": ap(SYDNEY_RENT_CANDIDATE), "mel-abs-census-median-weekly-rent": ap(MELBOURNE_RENT_CANDIDATE) };
const key = (p: ReturnType<typeof sydneyRentPoints>[number]): Key => ({ kind: "point", point: p });

t("approved (Ver.1.6.1): exactly the two ABS figures are verified, with StarHunting1's records and digests; the unapproved state still hides the number (builders with no approvals)", () => {
  for (const [id, amount, aid] of [["sydney", 470, "syd-abs-census-median-weekly-rent"], ["melbourne", 390, "mel-abs-census-median-weekly-rent"]] as const) {
    const a = RENT_APPROVALS[aid]; assert.equal(a.approvedBy, "StarHunting1"); assert.equal(a.approvedAt, "2026-10-19"); assert.match(a.basis, /明示的な公開承認/); assert.match(a.basis, /39292612214/); assert.match(a.basis, /Greater Capital City Statistical Area/);
    assert.equal(a.digest, rentDigest(ALL_RENT_CANDIDATES.find((c) => c.id === aid)!));
    const pts = officialData(id)!.points; assert.equal(pts.length, 1); const p = pts[0]; assert.deepEqual([p.id, p.value!.amount, p.value!.currency, p.value!.per, p.status, p.checkedAt, p.audience, p.topic], [aid, amount, "AUD", "week", "verified", "2026-10-19", "renter", "housing"]);
    assert.ok(!p.housing && displayModeOf(p) === "full"); assert.equal(pendingRentIds(id as never).length, 0); assert.ok(!(officialData(id)!.notices ?? []).some((n) => n.why === "awaiting-approval"));
    // the same data with no approval: the number disappears and the 'awaiting approval' notice returns
    const none = id === "sydney" ? sydneyData({}) : melbourneData({}); assert.equal(none.points.length, 0); assert.ok(none.notices!.some((n) => n.why === "awaiting-approval"));
  }
  assert.deepEqual(Object.keys(RENT_APPROVALS).sort(), ["lon-ons-pipr-private-rent-region-month", "mel-abs-census-median-weekly-rent", "syd-abs-census-median-weekly-rent", "tor-cmhc-rent-1br", "tor-cmhc-rent-2br", "tor-cmhc-rent-3br", "tor-cmhc-rent-bachelor"].sort(), "exactly seven approvals");
  assert.equal(RENT_APPROVALS["tor-cmhc-rent-1br"].digest, "abbbf002fa77176f0b4b2c9fc214de335c9faefd166c739b4fbf153f180185c1", "the 1.5.2 approvals are untouched");
});
t("housing headline now: the approved median with its area, year, unit and the two explicit disclaimers (not today's asking rent, not an international student's own housing cost); no 'being checked' placeholder", () => {
  for (const [id, amount, area] of [["sydney", "470", "グレーター・シドニー"], ["melbourne", "390", "グレーター・メルボルン"]] as const) {
    const html = page(id); const k = keyOf(html, "housing"); const tx = text(k);
    assert.match(k, /data-testid="key-market-rent"/); assert.ok(tx.includes(amount) && tx.includes("AUD") && tx.includes("週") && tx.includes("2021") && tx.includes("中央値") && tx.includes(area), tx);
    assert.ok(tx.includes("現在の募集家賃ではなく") && tx.includes("留学生個人の住居費でもありません") && tx.includes("学生向けの料金ではありません"), tx); assert.match(k, /data-testid="key-market-old"/);
    assert.ok(!k.includes('data-testid="key-rent-checking"') && !k.includes('data-testid="key-prep"')); assert.equal(rentCheckingKey(city(id)), undefined);
    assert.ok(ux.marketKeyOld.en.includes("not today's (2026) advertised rents") && ux.marketKeyOld.en.includes("not an international student's own housing cost") && ux.marketKeyTitleMedian.en.startsWith("Median weekly rent"));
  }
  assert.equal(rentCheckingKey(city("toronto")), undefined); assert.equal(rentCheckingKey(city("manchester")), undefined);
});
t("rights: ABS is CC BY 4.0 (permitted, shown in full, attribution); Transport for NSW and Transport Victoria are link-only and never requested; nothing is 'permitted' by assumption", () => {
  const abs = RIGHTS["abs-census-rent"]; assert.equal(abs.reuseStatus, "permitted"); assert.match(abs.licence!, /Creative Commons Attribution 4\.0/); assert.ok(abs.attribution!.includes("Australian Bureau of Statistics")); assert.equal(abs.lastReviewedAt, "2026-10-19");
  assert.equal(displayModeOf({ sourceId: "abs-census-rent", value: SYDNEY_RENT_CANDIDATE.value }), "full");
  for (const id of ["tfnsw-fares", "ptv-fares"]) { const r = RIGHTS[id]; assert.equal(r.reuseStatus, "unknown"); assert.equal(r.display, "link-only"); assert.equal(r.automation, "blocked"); assert.equal(r.lastReviewedAt, null); }
  assert.ok(blockedHosts().has("transportnsw.info") && blockedHosts().has("transport.vic.gov.au"));
  for (const s of ["abs-census-rent", "tfnsw-fares", "ptv-fares"]) assert.ok(officialSources.some((x) => x.id === s && x.country === "AUS"), s);
});

t("the candidates pass every static check (source, evidence page, quote, AUD per week, licence, student-housing disclaimer, area named) and each digest is stable", () => {
  const bad = reconcileStatic().filter((c) => !c.ok); assert.deepEqual(bad, []);
  for (const c of [SYDNEY_RENT_CANDIDATE, MELBOURNE_RENT_CANDIDATE]) { assert.equal(c.value!.currency, "AUD"); assert.equal(c.value!.per, "week"); assert.equal(rentDigest(c), rentDigest({ ...c })); assert.match(c.conditions.en, /not student housing/i); assert.match(c.conditions.en, /median/i); assert.match(c.conditions.en, /2021/); assert.match(c.conditions.ja, /中央値/); assert.match(c.conditions.ja, /学生向け住居/); assert.match(c.conditions.en, /NOT today.s \(2026\) advertised asking rents/); assert.match(c.conditions.en, /Greater Capital City Statistical Area/); assert.match(c.conditions.en, /NOT an international student.s own housing cost/); assert.match(c.conditions.ja, /募集家賃ではありません/); assert.match(c.conditions.ja, /留学生個人の住居費ではなく/); }
  assert.equal(SYDNEY_RENT_CANDIDATE.value!.amount, 470); assert.equal(MELBOURNE_RENT_CANDIDATE.value!.amount, 390);
  assert.notEqual(rentDigest(SYDNEY_RENT_CANDIDATE), rentDigest(MELBOURNE_RENT_CANDIDATE));
  assert.ok(ALL_RENT_CANDIDATES.length === 7 && AU_RENT_CANDIDATES_FOR_TEST === 2);
});

t("a person's approval makes ONLY that figure appear (test input): Sydney alone, then both; editing the figure breaks the digest; a wrong digest is refused", () => {
  const onlySyd = { "syd-abs-census-median-weekly-rent": both["syd-abs-census-median-weekly-rent"] };
  assert.equal(sydneyRentPoints(onlySyd).length, 1); assert.equal(melbourneRentPoints(onlySyd).length, 0); assert.equal(sydneyData(onlySyd).points[0].status, "verified"); assert.equal(melbourneData(onlySyd).points.length, 0);
  assert.ok(melbourneData(onlySyd).notices!.some((x) => x.why === "awaiting-approval"), "Melbourne still says 'awaiting approval'"); assert.ok(!sydneyData(onlySyd).notices!.some((x) => x.why === "awaiting-approval"));
  assert.equal(approvalProblem(SYDNEY_RENT_CANDIDATE, { ...both["syd-abs-census-median-weekly-rent"], digest: "0".repeat(64) }).includes("digest"), true);
  assert.throws(() => sydneyRentPoints({ "syd-abs-census-median-weekly-rent": { ...both["syd-abs-census-median-weekly-rent"], digest: "bad" } }), /rent approval rejected/);
  assert.throws(() => sydneyRentPoints({ "syd-xxx": ap(SYDNEY_RENT_CANDIDATE) }), /unknown figure/);
});

t("comparison: Sydney vs Melbourne is 'same basis' because every part of the statistic matches; against any other city it is never 'same' (reference only); a changed definition or unit breaks it", () => {
  const s = officialData("sydney")!.points[0], m = officialData("melbourne")!.points[0];
  assert.ok(sameRentBasis([s, m])); assert.deepEqual(rentBasisDiff(rentBasisOf(s)!, rentBasisOf(m)!), []); assert.equal(rentCmp([key(s), key(m)]), "same"); assert.equal(rentBasisOf(s)!.area, "ABS Greater Capital City Statistical Area");
  const tor = officialData("toronto")!.points.find((p) => p.highlight)!, lon = officialData("london")!.points[0], man = officialData("manchester")!.points.find((p) => p.metric === "housing.privateRent.average")!;
  for (const o of [tor, lon, man]) { assert.equal(rentCmp([key(s), key(o)]), "differ"); assert.ok(rentBasisDiff(rentBasisOf(s)!, rentBasisOf(o)!).length > 0); }
  const row = compareRows.find((r) => r.id === "marketRent")!; assert.ok(row.metrics.includes(s.metric));
  assert.equal(pickPoint("sydney", row)!.id, s.id); assert.equal(pickPoint("melbourne", row)!.id, m.id); assert.equal(rowVerdict(row, [s, m]).verdict, "sameBasis"); assert.ok(["notDirect", "issues"].includes(rowVerdict(row, [s, tor]).verdict));
  const m2 = { ...m, validFor: "2016 (Census)" }; assert.ok(!sameRentBasis([s, m2])); const m3 = { ...m, value: { ...m.value!, per: "month" as const } }; assert.ok(!sameRentBasis([s, m3]));
  const m4 = { ...m, value: { ...m.value!, currency: "NZD" } }; assert.ok(!sameRentBasis([s, m4]) || rentCmp([key(s), key(m4)]) !== "same");
});
t("transport: the official fares link is on the first screen, no fare amount or concession is stated, and no concession is promised to international students", () => {
  for (const [id, host, other] of [["sydney", "transportnsw.info/tickets-fares/fares", "eligibility-concessions"], ["melbourne", "transport.vic.gov.au/tickets-and-myki/fares", "myki"]] as const) {
    const html = page(id); const k = keyOf(html, "transport"); assert.match(k, new RegExp(`href="https://${host.replace(/\./g, "\\.")}"`)); assert.ok(text(k).includes("運賃の金額は転載していません"), id);
    assert.ok(!/A\$\s?\d|AUD\s?\d|\$\s?\d/.test(text(k)), `${id}: no fare amount in the transport card`); assert.ok(transportLinkKey(city(id))); assert.ok(officialData(id)!.notices!.find((x) => x.topic === "transport")!.links.some((l) => l.url.includes(other)));
    const tr = officialData(id)!.notices!.find((x) => x.topic === "transport")!; assert.ok(/Do not assume|not assume|limited/i.test(tr.text.en) || /do not assume/i.test(tr.text.en)); assert.ok(/とは限りません|思い込まず/.test(tr.text.ja));
    assert.ok(!/international students? (get|receive|are eligible)/i.test(tr.text.en.replace(/do not assume[^.]*\./i, "")), "no promise");
  }
  assert.ok(RIGHTS["ptv-fares"].reviewNotes.en.includes("403"), "the bot-check page is recorded, not worked around");
  assert.equal(cityCandidates("sydney" as never, "transport" as never, { studyType: "language", housingType: "other" } as never).length, 0);
});

t("the Planner takes nothing from Sydney/Melbourne: no rule exists for any item, even with both rents approved (visa, insurance and rent are never auto-added)", () => {
  for (const c of ["sydney", "melbourne"]) for (const item of ["housing", "food", "transport", "phone", "leisure", "visa", "insurance"]) assert.deepEqual(cityCandidates(c as never, item as never, { studyType: "language", housingType: "other" } as never), [], `${c}/${item}`);
});

t("language schools: four schools (ILSC and Navitas in Sydney; ILSC and City Language Centre in Melbourne), all unverified, with address, CRICOS and a link to the school's own page; no price, no NEAS claim", () => {
  const ids = listCompareSchools().filter((s) => /^(syd|mel)-/.test(s.id)).map((s) => s.id).sort(); assert.deepEqual(ids, ["mel-city-language-centre", "mel-ilsc", "syd-ilsc", "syd-navitas"]);
  const addr: Record<string, RegExp> = { "syd-ilsc": /540 George Street.*NSW 2000/, "syd-navitas": /255 Elizabeth Street.*NSW 2000/, "mel-ilsc": /120 Spencer Street.*VIC 3000/, "mel-city-language-centre": /343 Little Collins Street.*VIC 3000/ };
  const code: Record<string, RegExp> = { "syd-ilsc": /02137M/, "syd-navitas": /00289M/, "mel-ilsc": /02137M/, "mel-city-language-centre": /03893M/ };
  for (const id of ids) {
    const s = getCompareSchool(id)!; assert.equal(s.status, "unverified"); assert.equal(s.cityId, id.startsWith("syd") ? "sydney" : "melbourne"); assert.ok(s.inst.url!.startsWith("https://") && s.inst.feesUrl!.startsWith("https://"));
    assert.match(s.inst.where!.en, addr[id]); assert.match(s.inst.note!.en, code[id]); assert.ok(s.inst.where!.ja.length > 10 && s.inst.courses!.ja.length > 10);
    const all = JSON.stringify(s.inst); assert.ok(!/NEAS[- ]accredited|accredited by NEAS|NEAS認定校/i.test(all.replace(/NEAS accreditation was not confirmed/gi, "")), `${id}: no NEAS claim`); assert.match(s.inst.note!.en, /NEAS accreditation was not confirmed|NEAS accreditation/); assert.ok(!/(A\$|AUD|\$)\s?\d/.test(all), `${id}: no fee copied`);
    assert.ok(expectFor(s.inst.url!) && expectFor(s.inst.feesUrl!) && expectFor(s.inst.source!.url), `${id}: link-check words`);
  }
  assert.match(getCompareSchool("syd-navitas")!.inst.note!.en, /register match is NOT done/); assert.match(getCompareSchool("mel-city-language-centre")!.inst.note!.en, /same CRICOS code \(03893M\)/);
  for (const c of ["sydney", "melbourne"]) { const f = city(c).profile.education.languageSchools; assert.equal(f.status, "unverified"); assert.equal(f.checkedAt, "2026-10-19"); assert.ok(!f.value!.some((i) => i.hidden)); assert.ok(f.sources!.some((x) => /cricos\.education\.gov\.au/.test(x.url))); assert.match(f.note!.en, /not universities|language schools, not universities/); }
  assert.ok(!listCompareSchools().some((s) => /^(syd|mel)-/.test(s.id) && /universit/i.test(s.inst.name)), "universities are not offered as language schools");
});

t("school headline on the city page: the count of language schools and a path to the list/compare; the existing cities' schools are unchanged", () => {
  for (const [id, count] of [["sydney", 2], ["melbourne", 2]] as const) {
    const k = keyOf(page(id), "education"); const kf = keyFigure(city(id), "education"); assert.equal(kf.kind, "schools"); assert.equal((kf as { languageSchools: number }).languageSchools, count);
    assert.match(page(id), /data-testid="key-school-list"/); assert.ok(text(page(id)).includes("語学学校 2校を見る・比較する"), id); assert.ok(page(id).includes(`/schools/compare?a=${id === "sydney" ? "syd-ilsc" : "mel-ilsc"}`), id); void k;
  }
  assert.deepEqual(listCompareSchools().filter((s) => !/^(syd|mel)-/.test(s.id)).map((s) => s.id).sort(), ["lon-frances-king", "lon-kaplan", "man-express-english-college", "man-ih-manchester", "man-kaplan", "tor-ef", "tor-kaplan", "van-ef", "van-international-house"]);
});

t("jump links and visa/health: schools, housing and transport are one tap away; the Home Affairs / Study Australia pages are listed on the page (not hidden) and say they decide nothing", () => {
  for (const id of ["sydney", "melbourne"]) {
    const html = page(id); for (const k of ["education", "housing", "transport", "living", "climate", "visa-links"]) assert.match(html, new RegExp(`data-testid="jump-${k}"`), `${id}/${k}`);
    const v = html.slice(html.indexOf('data-testid="visa-links"')); const tx = text(v.slice(0, 4500));
    for (const u of ["student-500", "visitor-600", "electronic-travel-authority-601", "your-guide-to-visas", "overseas-student-health-cover-oshc"]) assert.ok(v.includes(u), `${id}: ${u}`);
    assert.ok(tx.includes("StudyAtlasが判定することはありません") && tx.includes("プランナーにも自動では入りません"), tx.slice(0, 300));
  }
  assert.ok(!page("manchester").includes('data-testid="visa-links"') && !page("vancouver").includes('data-testid="visa-links"'), "countries with their own visa guide are unchanged");
  assert.equal(visaLinks.AUS.length, 4); assert.equal(healthLinks.AUS.length, 1);
  for (const l of [...visaLinks.AUS, ...healthLinks.AUS]) { assert.equal(l.link.status, "unverified"); assert.match(l.link.value!, /^https:\/\/(immi\.homeaffairs|www\.studyaustralia)\.gov\.au\//); assert.match(l.link.note!.en, /not copied or summarised/); assert.ok(expectFor(l.link.value!), l.link.value); }
  const aus = countryList.find((c) => c.code === "AUS")!; assert.equal(aus.profile.visa.official.status, "pending", "no Australian visa claim exists, and no UK/Canada claim was reused");
  for (const f of ["U1", "U2", "U3", "U5b", "U6", "C1", "C2", "C3"]) assert.ok(!JSON.stringify(aus.profile.visa).includes(`"${f}"`));
});

t("link check covers Sydney and Melbourne (rent pages, schools, fee pages, visa/OSHC pages); link-only fare pages are skipped", () => {
  const ts = linkTargets(); const by = (re: RegExp) => ts.filter((x) => re.test(x.url));
  assert.ok(by(/abs\.gov\.au\/census/).length === 2 && by(/ilsc\.com/).length >= 2 && by(/navitasenglish/).length >= 2 && by(/cityenglish/).length >= 1 && by(/homeaffairs/).length === 3 && by(/overseas-student-health-cover/).length === 1);
  for (const x of by(/transportnsw\.info|transport\.vic\.gov\.au/)) assert.ok(x.skip, x.url);
});

t("comparison page: Sydney vs Melbourne is 'comparable' for rent with both A$ figures and the same-basis note; Sydney vs Toronto is 'reference only' (never compared, no conversion); existing pairs are unchanged", () => {
  const wrap = (el: ReturnType<typeof h>) => renderToStaticMarkup(h(I18nProvider, null, el));
  const sm = wrap(h(QuickCompare, { ids: ["sydney", "melbourne"] })); const tx = text(sm);
  assert.equal(/data-testid="chip-rent"[^>]*>([^<]*)</.exec(sm)?.[1], "比較可能", "rent chip"); assert.match(sm, /data-testid="cmp-rent"[^>]*data-cmp="same"/);
  assert.ok(tx.includes("470") && tx.includes("390") && tx.includes("同じ統計・同じ期間・同じ通貨です"), "both figures and the same-basis reason");
  assert.ok(!/data-testid="chip-rent"[^>]*>[^<]*確認中/.test(sm));
  const st = wrap(h(QuickCompare, { ids: ["sydney", "toronto"] })); assert.equal(/data-testid="chip-rent"[^>]*>([^<]*)</.exec(st)?.[1], "参考値のみ"); assert.match(st, /data-testid="cmp-rent"[^>]*data-cmp="differ"/); assert.ok(!/cheaper|安い/.test(text(st).replace(/どちらが安いかは判定しません/g, "")), "no verdict on which is cheaper");
  const sl = wrap(h(QuickCompare, { ids: ["sydney", "london"] })); assert.equal(/data-testid="chip-rent"[^>]*>([^<]*)</.exec(sl)?.[1], "参考値のみ");
  const man = wrap(h(QuickCompare, { ids: ["manchester", "vancouver"] })); assert.ok(!/data-testid="chip-rent"[^>]*>[^<]*確認中/.test(man), "existing pairs are not relabelled");
});
console.log(n, "Ver.1.6.0 tests passed");
