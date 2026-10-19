import "./_react";
// Tests for Ver.1.6.3 (climate and transport). Local tests only. No climate approval exists for Toronto: the approved state below uses an in-memory test record that is removed again.
import assert from "node:assert/strict";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement as h } from "react";
import { I18nProvider } from "@/lib/i18n";
import { countries, getCity } from "@/data/cities";
import { officialData, officialSources } from "@/data/official";
import CityOverview from "@/components/overview/CityOverview";
import QuickCompare from "@/components/overview/QuickCompare";
import { compareKeys, keyFigure } from "@/lib/overview";
import { CLIMATE_APPROVALS } from "../data/approvals";
import { TORONTO_CLIMATE_CANDIDATE, TORONTO_CLIMATE_ID, approvedClimate, climateCandidateChecks } from "../data/official/cityClimates";
import { torontoData } from "../data/official/toronto";
import { climateCompare, climateIssues, siteKindOf } from "../data/official/compare";
import { RIGHTS } from "../data/official/rights.data";
import { blockedHosts } from "../collector/linkcheck";
import { RENT_APPROVALS } from "../data/official/cityRents";
import { TRANSPORT_GUIDES, guideOf } from "../data/official/transportGuides";
import { TransportGuideCompare } from "@/components/overview/TransportGuide";
import { readFileSync } from "node:fs";

let n = 0; const t = (name: string, fn: () => void) => { fn(); n++; console.log("ok", name); };
const city = (id: string) => getCity(id)!;
const text = (s: string) => s.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
const page = (id: string) => renderToStaticMarkup(h(I18nProvider, null, h(CityOverview, { city: city(id), country: countries.find((x) => x.code === city(id).country)!, data: officialData(id) })));
const wrap = (el: ReturnType<typeof h>) => renderToStaticMarkup(h(I18nProvider, null, el));
const keyOf = (html: string, topic: string) => { const i = html.indexOf(`data-testid="key-${topic}"`); const j = html.indexOf("<button", i); return html.slice(i, j > i ? j : i + 4000); };

t("Toronto candidate: 48 monthly values and the annual values exactly as ECCC publishes them for the downtown station (not the airport), with station, period, location, quality and licence recorded", () => {
  const c = TORONTO_CLIMATE_CANDIDATE;
  assert.deepEqual(c.months.map((m) => m.meanC), [-3.5, -2.7, 1.7, 7.8, 14.5, 19.8, 22.5, 21.9, 17.9, 11.2, 5.2, -0.1]); assert.deepEqual(c.months.map((m) => m.maxC), [-0.3, 0.6, 5.1, 11.7, 18.8, 24.2, 27.0, 26.1, 22.0, 14.6, 8.1, 2.6]);
  assert.deepEqual(c.months.map((m) => m.minC), [-6.7, -6.0, -1.8, 3.9, 10.0, 15.3, 18.1, 17.7, 13.8, 7.7, 2.3, -2.7]); assert.deepEqual(c.months.map((m) => m.precipMm), [64.6, 53.9, 52.8, 78.0, 76.4, 81.6, 76.5, 71.9, 69.4, 69.1, 70.8, 57.8]);
  assert.deepEqual(c.annual, { meanC: 9.7, maxC: 13.4, minC: 6.0, precipMm: 822.7 }); assert.equal(c.months.length * 4, 48);
  assert.equal(c.period, "1991–2020"); assert.equal(c.stationId, "6158350+6158355"); assert.match(c.station, /TORONTO \(CITY\)/); assert.ok(!/PEARSON|INTL A/i.test(c.station)); assert.equal(c.stationInfo!.kind, "city"); assert.equal(c.stationInfo!.elevationM, 112.5);
  assert.match(c.stationInfo!.where.en, /not Toronto Pearson Airport/); assert.match(c.stationInfo!.where.ja, /空港ではありません/); assert.equal(c.retrievedAt, "2026-10-19"); assert.ok(c.evidence[0].url.startsWith("https://climate.weather.gc.ca/")); assert.ok(c.evidence[0].quote.includes("822.7"));
  assert.deepEqual(climateCandidateChecks(c).filter((x) => !x.ok), []); assert.equal(c.status, "unverified"); assert.equal(c.approval, undefined);
  const bad = structuredClone(c); bad.months[0].meanC = 99; assert.ok(climateCandidateChecks(bad).some((x) => !x.ok), "a wrong value is caught by the consistency checks"); const bad2 = structuredClone(c); bad2.annual!.precipMm = 900; assert.ok(climateCandidateChecks(bad2).some((x) => !x.ok && /annual precipitation/.test(x.name)));
  assert.equal(RIGHTS["eccc-climate-normals"].reuseStatus, "permitted"); assert.match(RIGHTS["eccc-climate-normals"].licence!, /v2\.1\.1/); assert.equal(RIGHTS["eccc-climate-normals"].lastReviewedAt, "2026-10-19"); assert.ok(officialSources.find((s) => s.id === "eccc-climate-normals")!.cityIds.includes("toronto"));
});

t("not published: no approval exists, so Toronto has no climate record, the comparison has no Toronto climate, and no Toronto climate number appears on the page; the page says the normals are being checked and links the source and the licence", () => {
  assert.deepEqual(Object.keys(CLIMATE_APPROVALS), ["van-climate-eccc-1991-2020"]); assert.equal(approvedClimate(TORONTO_CLIMATE_CANDIDATE), undefined);
  const d = officialData("toronto")!; assert.equal(d.climate, undefined); assert.equal(climateCompare("toronto"), undefined);
  const nt = d.notices!.find((x) => x.topic === "climate")!; assert.equal(nt.why, "awaiting-approval"); assert.ok(nt.links.some((l) => l.url.includes("climate.weather.gc.ca")) && nt.links.some((l) => l.url.includes("eccc-msc.github.io/open-data/licence"))); assert.match(nt.text.ja, /空港ではありません/);
  const html = page("toronto"); const tx = text(html); const k = text(keyOf(html, "climate"));
  for (const v of ["822.7", "9.7", "13.4", "64.6", "81.6", "27.0", "-3.5", "−3.5", "22.5"]) assert.ok(!tx.includes(v), `number ${v} must not be on the page`);
  assert.match(html, /data-testid="climate-status"[^>]*data-why="awaiting-approval"/); assert.ok(text(html).includes("公式の1991–2020平年値は取得済み・確認中"), "first-screen state"); assert.ok(k.includes("未確認") || k.length > 0);
  const cmp = text(wrap(h(QuickCompare, { ids: ["vancouver", "toronto"] }))); for (const v of ["822.7", "9.7", "64.6", "27.0"]) assert.ok(!cmp.includes(v), `no Toronto number in the comparison: ${v}`);
});

t("approval gate (in-memory test record, removed again): approval makes the candidate verified and visible; a changed value, station or period breaks it; an approval for a changed candidate is never exposed", () => {
  const c = TORONTO_CLIMATE_CANDIDATE; const col = (k: "meanC" | "maxC" | "minC" | "precipMm") => c.months.map((m) => m[k] as number);
  CLIMATE_APPROVALS[TORONTO_CLIMATE_ID] = { approval: { by: "Test Reviewer", at: "2026-10-20", compared: "test input only" }, station: c.station, stationId: c.stationId!, period: c.period, meanC: col("meanC"), maxC: col("maxC"), minC: col("minC"), precipMm: col("precipMm"), annualPrecipMm: 822.7, sources: c.evidence.map((e) => e.url) };
  try {
    const v = approvedClimate(c)!; assert.equal(v.status, "verified"); assert.equal(v.approval!.by, "Test Reviewer"); const d = torontoData(undefined, CLIMATE_APPROVALS); assert.equal(d.climate!.status, "verified"); assert.ok(!d.notices!.some((x) => x.topic === "climate"), "the notice goes away");
    const changed = structuredClone(c); changed.months[3].maxC = 12.0; assert.throws(() => approvedClimate(changed), /changed after its approval/); const st = structuredClone(c); st.period = "1981–2010"; assert.throws(() => approvedClimate(st), /changed after its approval/);
  } finally { delete CLIMATE_APPROVALS[TORONTO_CLIMATE_ID]; }
  assert.equal(approvedClimate(c), undefined); assert.deepEqual(Object.keys(CLIMATE_APPROVALS), ["van-climate-eccc-1991-2020"]);
});

t("comparison: the same period is not enough – an airport station and a city-centre station are 'reference only'; different periods too; the observing site is shown", () => {
  const base = { tmax: [10, 20] as [number, number], station: "X", period: "1991–2020", derived: false, status: "verified" as const };
  assert.deepEqual(climateIssues([{ ...base, site: "airport" }, { ...base, site: "airport" }]), []); assert.deepEqual(climateIssues([{ ...base, site: "airport" }, { ...base, site: "city" }]), ["site"]);
  assert.deepEqual(climateIssues([{ ...base, site: "airport" }, { ...base, period: "1971–2000", site: "airport" }]), ["period"]); assert.deepEqual(climateIssues([{ ...base, site: "airport" }, { ...base, period: "1971–2000", site: "city" }]).sort(), ["period", "site"]);
  assert.equal(siteKindOf({ station: "VANCOUVER INTERNATIONAL (AIRPORT) – composite of 1108447 and 1108395" }), "airport"); assert.equal(siteKindOf({ station: "Ringway (Manchester Airport)" }), "airport"); assert.equal(siteKindOf(TORONTO_CLIMATE_CANDIDATE), "city");
  assert.equal(climateCompare("vancouver")!.site, "airport"); assert.equal(climateCompare("manchester")!.site, "airport");
  const k = (site: string, period = "1991–2020") => ({ kind: "temp" as const, lo: 1, hi: 2, station: "S", period, status: "verified" as const, derived: false, site }); assert.equal(compareKeys([k("airport"), k("airport")]), "same"); assert.equal(compareKeys([k("airport"), k("city")]), "differ");
  assert.ok(keyFigure(city("vancouver"), "climate").kind === "temp" && (keyFigure(city("vancouver"), "climate") as { site?: string }).site === "airport");
});

t("Sydney, Melbourne and London: no climate numbers (BoM answered 403, the Met Office forbids scraping); the pages say so, link the official source where it exists, and the rights records keep them link-only and blocked", () => {
  for (const id of ["sydney", "melbourne", "london"]) { const d = officialData(id)!; assert.equal(d.climate, undefined); assert.equal(climateCompare(id), undefined); const nt = d.notices!.find((x) => x.topic === "climate")!; assert.equal(nt.why, "unreviewed");
    const html = page(id); assert.match(html, /data-testid="climate-status"[^>]*data-why="unreviewed"/); assert.ok(text(html).includes("公式の気候の数値は表示していません")); assert.ok(!/data-testid="key-climate"[^>]*>[^]*?°C/.test(keyOf(html, "climate")), `${id}: no temperature range`); }
  for (const id of ["sydney", "melbourne"]) assert.ok(officialData(id)!.notices!.find((x) => x.topic === "climate")!.links[0].url.startsWith("https://www.bom.gov.au/climate/averages/tables/")); assert.equal(officialData("london")!.notices!.find((x) => x.topic === "climate")!.links.length, 0);
  assert.match(officialData("sydney")!.notices!.find((x) => x.topic === "climate")!.text.en, /HTTP 403/); assert.match(officialData("london")!.notices!.find((x) => x.topic === "climate")!.text.en, /Met Office/);
  const r = RIGHTS["bom-climate"]; assert.equal(r.reuseStatus, "unknown"); assert.equal(r.display, "link-only"); assert.equal(r.automation, "blocked"); assert.equal(r.lastReviewedAt, null); assert.match(r.reviewNotes.en, /HTTP 403/); assert.ok(blockedHosts().has("bom.gov.au"));
  assert.equal(RIGHTS["metoffice-station-data"].automation, "blocked");
});

t("transport guides: Toronto and Sydney summarise what was read on 2026-10-19 (payment options, where student eligibility is decided); London and Melbourne are link-only and say the pages could not be read; no amounts anywhere", () => {
  assert.equal(TRANSPORT_GUIDES.length, 4); for (const id of ["toronto", "sydney"]) { const g = guideOf(id)!; assert.ok(g.read && g.checkedAt === "2026-10-19" && g.payment && g.modes); }
  for (const id of ["london", "melbourne"]) { const g = guideOf(id)!; assert.ok(!g.read && g.checkedAt === null && !g.payment && !g.modes); assert.ok(g.links.every((l) => !l.opened)); }
  assert.match(guideOf("toronto")!.payment!.en, /PRESTO/); assert.match(guideOf("sydney")!.payment!.en, /Opal/); assert.match(guideOf("sydney")!.payment!.en, /tap on/);
  for (const g of TRANSPORT_GUIDES) { const all = JSON.stringify([g.modes, g.payment, g.fareSystem, g.student]); assert.ok(!/[$£€]\s?\d|\d\s?(CAD|AUD|GBP)|\d+\.\d\d/.test(all), `${g.cityId}: no fare amount`); assert.ok(g.links.every((l) => l.url.startsWith("https://")));
    assert.ok(!/(get|receive|are entitled to|qualify for) a student (discount|fare)/i.test(g.student.en.replace(/Do not assume[^.]*\./i, "")), `${g.cityId}: no promised student fare`); assert.ok(/check|confirm|not mentioned|Not confirmed/i.test(g.student.en), `${g.cityId}: eligibility is sent to the official page`); }
  assert.match(guideOf("sydney")!.student.en, /international students only for certain scholarships/); assert.match(guideOf("sydney")!.student.en, /language-school courses are not mentioned/); assert.match(guideOf("toronto")!.student.en, /Language-school students are not mentioned/);
});

t("transport card, first screen: official fares, route map and student-eligibility links are visible for Toronto, London, Sydney and Melbourne; what is missing says 'being checked'; Manchester and Vancouver are unchanged", () => {
  const exp: Record<string, { fares: string; map?: string; student?: string }> = {
    toronto: { fares: "https://www.ttc.ca/fares-and-passes", map: "https://www.ttc.ca/routes-and-schedules", student: "https://www.ttc.ca/Fares-and-passes/Fares-types-and-discounts" },
    sydney: { fares: "https://transportnsw.info/tickets-fares/fares", map: "https://transportnsw.info/document/6027/opal-network-map.pdf", student: "https://transportnsw.info/tickets-fares/eligibility-concessions/tertiary-tafe-students" },
    london: { fares: "https://tfl.gov.uk/fares", map: "https://tfl.gov.uk/maps", student: "https://tfl.gov.uk/fares/free-and-discounted-travel" }, melbourne: { fares: "https://transport.vic.gov.au/tickets-and-myki/fares" } };
  for (const [id, e] of Object.entries(exp)) { const k = keyOf(page(id), "transport"); assert.match(k, new RegExp(`data-testid="guide-fares"[^>]*href="${e.fares.replace(/[.?]/g, "\\$&")}"|href="${e.fares.replace(/[.?]/g, "\\$&")}"[^>]*data-testid="guide-fares"`), `${id} fares`);
    for (const kind of ["map", "student"] as const) { const u = e[kind]; if (u) assert.ok(k.includes(`href="${u}"`), `${id} ${kind}`); else assert.match(k, new RegExp(`data-testid="guide-${kind}-none"`), `${id} ${kind} none`); }
    assert.ok(text(k).includes("運賃の金額は転載していません"), `${id}: still no amount`); assert.ok(!/[$£]\s?\d/.test(text(k)), `${id}: no amount`); }
  assert.ok(text(keyOf(page("melbourne"), "transport")).includes("路線図：確認中")); assert.ok(text(keyOf(page("toronto"), "transport")).includes("確認日: 2026-10-19")); assert.ok(text(keyOf(page("london"), "transport")).includes("読み取れなかった"));
  for (const id of ["manchester", "vancouver"]) assert.ok(!page(id).includes('data-testid="transport-guide-links"'), `${id} unchanged`);
});

t("transport comparison: the systems are shown side by side (payment, student-eligibility checkpoint, official pages) without amounts or a verdict; cities without guides are not invented (the block sits in the opened detail of the transport row)", () => {
  const nm = (ids: string[]) => Object.fromEntries(ids.map((id) => [id, city(id).name])); const render = (ids: string[]) => wrap(h(TransportGuideCompare, { ids, names: nm(ids) }));
  const html = render(["toronto", "sydney"]); const ts = text(html);
  assert.match(html, /data-testid="guide-compare"/); for (const k of ["payment", "student", "links"]) assert.match(html, new RegExp(`data-testid="guide-row-${k}"`)); assert.ok(ts.includes("PRESTO")); assert.ok(ts.includes("Opal")); assert.ok(ts.includes("トロント") && ts.includes("シドニー"));
  assert.ok(ts.includes("金額の比較や優劣の判定はしていません")); assert.ok(!/最安|cheapest|おすすめ|best/i.test(ts)); assert.ok(!/[$£]\s?\d/.test(ts));
  assert.equal(render(["manchester", "vancouver"]), "", "no guide for these pairs: nothing is rendered"); const lm = render(["london", "melbourne"]); assert.match(lm, /data-testid="guide-compare"/); assert.ok(text(lm).includes("確認中"));
  const mix = text(render(["toronto", "manchester"])); assert.ok(mix.includes("要約はまだありません"), "a city without a guide says so");
  assert.ok(/showGuide = topic === "transport"/.test(readFileSync("components/overview/QuickCompare.tsx", "utf8")), "wired into the transport detail");
});

t("protected data: the seven rent approvals, the Vancouver climate approval (48 values) and its numbers are unchanged", () => {
  assert.equal(Object.keys(RENT_APPROVALS).length, 7); assert.equal(RENT_APPROVALS["tor-cmhc-rent-1br"].digest, "abbbf002fa77176f0b4b2c9fc214de335c9faefd166c739b4fbf153f180185c1"); assert.equal(RENT_APPROVALS["syd-abs-census-median-weekly-rent"].digest, "506c97aa71ea3e2cdbea993353f47c6f3f099459bfdec41c6241aa2cac1c73f2");
  const v = CLIMATE_APPROVALS["van-climate-eccc-1991-2020"]; assert.equal(v.approval.at, "2026-10-17"); assert.deepEqual(v.meanC, [4.1, 4.7, 6.7, 9.4, 13.0, 15.8, 18.2, 18.2, 15.2, 10.3, 6.4, 3.9]); assert.equal(v.precipMm.length + v.meanC.length + v.maxC.length + v.minC.length, 48); assert.equal(v.annualPrecipMm, 1159.5);
  const vc = officialData("vancouver")!.climate!; assert.equal(vc.status, "verified"); assert.equal(vc.period, "1991–2020"); assert.equal(vc.stationInfo, undefined, "no field was added to the approved Vancouver record");
});

console.log(n, "Ver.1.6.3 climate and transport tests passed");
