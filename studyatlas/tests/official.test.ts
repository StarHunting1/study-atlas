// Tests for official city data (Ver.1.5). Local fixtures only (no network): results here are NOT live API results.
// Run: npm test
import assert from "node:assert/strict";
import { automationFor, rightsOfSource } from "../data/official/rights";
import { collect, dueIn } from "../collector/run";
import { fixtureText } from "../collector/fixtures";
import { officialConsistency } from "../collector/consistency";
import { makeRobots, robotsAllows } from "../collector/robots";
import { emptySnapshot } from "../collector/store";
import { allOfficialData, officialSources, pointsOf } from "../data/official";
import { climateCompare, climateIssues, compareIssues, compareRows, pickPoint } from "../data/official/compare";
import { monthlyMeans, parseStationData } from "../collector/sources/metoffice";
import { sources } from "../collector/sources";
import { fixtureStationFile } from "../collector/fixtures";
import { checkClimate, checkPoint } from "../data/official/validate";
import { checkOnPage } from "../collector/sources/pages";
import { convert, noFx } from "../lib/fx";
import { getCity } from "../data/cities";
import { checkProfile } from "../data/validate";
import { moneyComparability } from "../data/comparability";
import type { DataPoint } from "../data/official/types";

let n = 0; const t = async (name: string, fn: () => Promise<void> | void) => { await fn(); n++; console.log("ok", name); };
const T1 = "2026-10-14T00:00:00.000Z";
const man = allOfficialData().find((c) => c.cityId === "manchester")!, van = allOfficialData().find((c) => c.cityId === "vancouver")!;
const pt = (id: string) => [...man.points, ...van.points].find((p) => p.id === id)!;

(async () => {
  await t("every published point passes validation; counts and statuses", () => {
    for (const c of allOfficialData()) { for (const p of c.points) assert.deepEqual(checkPoint(p, officialSources), [], p.id); if (c.climate) assert.deepEqual(checkClimate(c.climate, officialSources), []); }
    assert.equal(man.points.length, 25); assert.equal(van.points.length, 16); assert.ok(van.climate); assert.ok(man.climate);
    assert.ok([...man.points, ...van.points].every((p) => p.status === "verified" && p.evidence.length && p.checkedAt));
  });

  await t("validation rejects incomplete or inconsistent data", () => {
    const base = pt("man-bus-single-adult");
    const bad = (patch: Partial<DataPoint>) => checkPoint({ ...base, ...patch }, officialSources);
    assert.ok(bad({ value: { amount: 3, currency: "GBP", per: "trip" } }).some((e) => /does not appear in any evidence quote/.test(e))); // typo in the amount
    assert.ok(bad({ evidence: [] }).some((e) => /evidence/.test(e)));
    assert.ok(bad({ validFor: "" }).some((e) => /validFor/.test(e)));
    assert.ok(bad({ value: { amount: 2, currency: "gbp", per: "trip" } }).some((e) => /currency/.test(e)));
    assert.ok(bad({ value: { amount: 2, currency: "GBP", per: "contract" } }).some((e) => /contractWeeks/.test(e)));
    assert.ok(bad({ checkedAt: undefined }).some((e) => /checkedAt/.test(e)));
    assert.ok(bad({ evidence: [{ ...base.evidence[0], url: "https://example.com/x" }] }).some((e) => /not one of source/.test(e)));
    assert.ok(bad({ sourceId: "nope" }).some((e) => /unknown sourceId/.test(e)));
  });

  await t("university hall prices are tied to a school and kept apart from city rent", () => {
    const halls = [...man.points, ...van.points].filter((p) => p.metric.startsWith("housing.universityHalls"));
    assert.ok(halls.length >= 4 && halls.every((p) => p.housing?.schoolId && p.housing.school && p.audience === "universityStudent"));
    const rent = van.points.filter((p) => p.metric.startsWith("housing.marketRent"));
    assert.equal(rent.length, 4); assert.ok(rent.every((p) => p.audience === "renter" && !p.housing && /not student housing/.test(p.conditions.en)));
    // the only city-wide Manchester statistic is the approved ONS private rent (Ver.1.2.3): whole market, not student housing, nothing else is invented
    const mr = man.points.filter((p) => p.audience === "renter"); assert.equal(mr.length, 1); assert.equal(mr[0].id, "man-ons-pipr-private-rent-month"); assert.equal(mr[0].status, "verified"); assert.equal(mr[0].value?.amount, 1373); assert.ok(!mr[0].housing && /Not student housing/.test(mr[0].conditions.en));
  });

  await t("evidence quotes carry the published amounts (spot checks against the 2026-10-13 live page text)", () => {
    assert.equal(pt("man-bus-28day-adult").value!.amount, 80); assert.equal(pt("man-anybus-28day-student").value!.amount, 63.3);
    assert.equal(pt("man-uom-ug-total").value!.amount, 1484); assert.equal(pt("van-monthly-adult-z1").value!.amount, 117.2);
    assert.equal(pt("van-upass").value!.amount, 47.85); assert.equal(pt("van-cmhc-rent-1br").value!.amount, 1807);
    assert.deepEqual(van.climate!.months.map((m) => m.meanC).slice(0, 3), [4.1, 4.7, 6.7]); assert.equal(van.climate!.period, "1991–2020"); assert.deepEqual(van.climateAlt!.months.map((m) => m.meanC).slice(0, 3), [4.13, 4.9, 6.88]); assert.equal(van.climateAlt!.period, "1981–2010");
  });

  await t("profile facts bridged from official data validate and replace the demo numbers", () => {
    for (const id of ["manchester", "vancouver"]) {
      const c = getCity(id)!; assert.deepEqual(checkProfile(id, c.profile), []);
      assert.ok(Object.values(c.profile.cost).every((f) => f.status !== "sample"), `${id}: no demo cost numbers left`);
    }
    assert.equal(getCity("vancouver")!.profile.climate.monthly.status, "verified");
    assert.equal(getCity("london")!.profile.cost.rent.status, "sample"); // other cities keep their existing display
  });

  await t("comparison: different period or group of people is not comparable; unverified is not comparable", () => {
    const row = (id: string) => compareRows.find((r) => r.id === id)!;
    const m = (id: string, city: string) => pickPoint(city, row(id));
    // TransLink fares are held back (rights.ts: restricted), so a Vancouver fare is "no figure" and nothing is compared with it
    for (const id of ["single", "monthlyAdult", "studentTransit"]) { assert.equal(m(id, "vancouver"), undefined); assert.deepEqual(compareIssues([m(id, "manchester"), m(id, "vancouver")]), ["missing"]); }
    // the same comparison logic on the held-back figures themselves (all points are still in the data)
    assert.deepEqual(compareIssues([pt("man-bus-single-adult"), pt("van-fare-stored-adult-z1")]), []); // trip vs trip, both adults
    assert.deepEqual(compareIssues([pt("man-bus-28day-adult"), pt("van-monthly-adult-z1")]), ["period"]); // 28 days vs calendar month
    // Ver.1.2.4: the whole-market rent row puts the ONS Manchester figure beside the CMHC Vancouver figure; they share no basis, which the row says (see tests/housingcompare.test.ts)
    assert.deepEqual(compareIssues([m("marketRent", "manchester"), m("marketRent", "vancouver")]), []);
    assert.deepEqual(compareIssues([pt("man-bus-single-adult"), pt("man-anybus-28day-student")]).sort(), ["audience", "period"]);
    assert.ok(compareIssues([pt("man-bus-single-adult"), { ...pt("van-fare-stored-adult-z1"), status: "unverified" }]).includes("notVerified"));
    const v = climateCompare("vancouver")!, mc = climateCompare("manchester")!;
    assert.equal(v.period, "1991–2020"); assert.equal(mc.period, "1971–2000"); assert.equal(v.precipTotal, 1159.5, "the published annual value, not the 1159.7 sum"); assert.equal(v.status, "verified"); assert.ok(mc.derived && !v.derived);
    assert.deepEqual(climateIssues([mc, v]), ["period"]); // different averaging periods are not compared as the same metric
    assert.deepEqual(climateIssues([mc, { ...mc }]), []); assert.deepEqual(climateIssues([mc, undefined]), ["missing"]);
    assert.equal(mc.mean, undefined); assert.ok(mc.tmax && mc.tmin && mc.precipTotal === 806); // no mean temperature is invented for Manchester
  });

  await t("no currency conversion without an exchange-rate provider; same currency passes through", () => {
    assert.equal(convert(10, "GBP", "CAD", noFx), undefined); assert.deepEqual(convert(10, "GBP", "GBP"), { amount: 10 });
    const fx = { rate: (f: string, to: string) => (f === "GBP" && to === "JPY" ? { from: f, to, rate: 200, date: "2026-10-14", publisher: "test", url: "https://example.com" } : undefined) };
    assert.equal(convert(2, "GBP", "JPY", fx)!.amount, 400);
    // Vancouver's transport fare is held back (TransLink: restricted), so it is "pending" in the profile and nothing is compared; the rent (CMHC: permitted) shows the currency rule
    assert.equal(getCity("vancouver")!.profile.cost.transport.status, "pending");
    assert.equal(moneyComparability([getCity("manchester")!.profile.cost.transport, getCity("vancouver")!.profile.cost.transport]), "ok");
    assert.equal(moneyComparability([{ ...getCity("manchester")!.profile.cost.transport, status: "verified" }, getCity("vancouver")!.profile.cost.rent]), "currency");
  });

  await t("robots.txt: Disallow honoured, unreachable treated as disallow, 404 allows", async () => {
    assert.equal(robotsAllows("User-agent: *\nDisallow: /private\n", "StudyAtlasCollector/1.0", "/private/x").allowed, false);
    assert.equal(robotsAllows("User-agent: StudyAtlasCollector\nDisallow: /\n\nUser-agent: *\nAllow: /\n", "StudyAtlasCollector/1.0", "/a").allowed, false);
    const mk = (status: number, body = "") => makeRobots(async () => { if (status === 0) throw new Error("fetch failed"); return { status, body }; }, "StudyAtlasCollector/1.0");
    assert.equal((await mk(0)("https://a.example/x")).allowed, false); assert.equal((await mk(503)("https://a.example/x")).allowed, false);
    assert.equal((await mk(404)("https://a.example/x")).allowed, true); assert.equal((await mk(200, "User-agent: *\nDisallow: /x")("https://a.example/x")).allowed, false);
  });

  await t("page check: quote found / amount still on page / amount gone", () => {
    const p = pt("man-bus-28day-adult"); const quote = p.evidence[0].quote;
    assert.equal(checkOnPage(p, `<x> ${quote} </x>`), "quote-found");
    assert.equal(checkOnPage(p, "A 28-day Bee Bus ticket now costs £40 for children and £80 for adults."), "value-found");
    assert.equal(checkOnPage(p, "A 28-day Bee Bus ticket costs £45 for children and £90 for adults."), "not-found");
  });

  await t("cadence: a source that is not due is skipped; --force ignores it", async () => {
    assert.equal(dueIn({ cadenceDays: 30 }, "2026-10-01T00:00:00.000Z", T1), 17); assert.equal(dueIn({ cadenceDays: 30 }, undefined, T1), 0); assert.equal(dueIn({}, "2026-10-13T00:00:00.000Z", T1), 0);
    const first = await collect({ ai: false, fixtures: true, now: T1, prev: emptySnapshot() });
    const later = "2026-10-20T00:00:00.000Z"; // 6 days later: page checks (30/60 days) and climate (180 days) are not due; others have no cadence
    const second = await collect({ ai: false, fixtures: true, now: later, prev: first.next });
    // (a source blocked by the rights review is skipped for that reason, with or without --force)
    assert.ok(second.runs.filter((r) => /^(page:|statcan|eccc)/.test(r.sourceId)).every((r) => /not due|blocked by the rights review/.test(r.skipped ?? "")));
    assert.equal(second.changes.length, 0);
    const forced = await collect({ ai: false, fixtures: true, now: later, prev: first.next, force: true });
    const live = forced.runs.filter((r) => /^(page:|statcan|eccc)/.test(r.sourceId) && automationFor(r.sourceId).automation !== "blocked"); assert.ok(live.length >= 4);
    assert.ok(live.every((r) => r.ok && !r.skipped)); assert.equal(forced.changes.length, 0);
    assert.ok(forced.runs.filter((r) => automationFor(r.sourceId).automation === "blocked" && r.skipped && !/not implemented/.test(r.skipped)).every((r) => /blocked by the rights review/.test(r.skipped!)));
  });

  await t("collecting the same (fixture) responses twice: first run adds records, second run finds 0 changes", async () => {
    const first = await collect({ ai: false, fixtures: true, now: T1, prev: emptySnapshot(), force: true });
    const ids = Object.keys(first.next.records);
    assert.equal(ids.filter((i) => i.startsWith("page:")).length, 24); assert.ok(!ids.some((i) => i.startsWith("page:translink")), "no TransLink page is checked: the rights review blocks it"); assert.equal(ids.filter((i) => i.startsWith("statcan-cmhc-rents:")).length, 4); assert.equal(ids.filter((i) => i.startsWith("eccc-climate-normals:")).length, 4);
    const second = await collect({ ai: false, fixtures: true, now: "2026-10-14T06:00:00.000Z", prev: first.next, force: true });
    assert.equal(second.changes.length, 0); assert.equal(JSON.stringify(second.next.records), JSON.stringify(first.next.records)); // retrieval times untouched
    assert.ok(Object.values(first.next.records).filter((r) => r.sourceId.startsWith("page:")).every((r) => r.value.text === "found"));
  });

  await t("a changed official page is reported once as a change candidate and needs human review", async () => {
    const first = await collect({ ai: false, fixtures: true, now: T1, prev: emptySnapshot(), force: true });
    const changedText = async (url: string) => { const r = await fixtureText(url); return url.endsWith("/bus-tickets") ? { ...r, body: r.body.replace("£80", "£95") } : r; };
    const run = await collect({ ai: false, fixtures: true, now: "2026-11-01T00:00:00.000Z", prev: first.next, force: true, fetchers: { fetchText: changedText } });
    const ch = run.changes.filter((c) => c.type === "changed"); assert.equal(ch.length, 1);
    const rec = (ch[0] as { after: { id: string; review: string; value: { text: string } } }).after;
    assert.equal(rec.id, "page:man-bus-28day-adult"); assert.equal(rec.value.text, "not-found"); assert.equal(rec.review, "human-required");
    const again = await collect({ ai: false, fixtures: true, now: "2026-11-02T00:00:00.000Z", prev: run.next, force: true, fetchers: { fetchText: changedText } });
    assert.equal(again.changes.length, 0); // same change is not proposed twice
  });

  await t("page source failing keeps earlier records (nothing invented, nothing lost)", async () => {
    const first = await collect({ ai: false, fixtures: true, now: T1, prev: emptySnapshot(), force: true });
    const down = async (url: string) => { if (/robots\.txt$/.test(url)) return { status: 200, url, body: "User-agent: *\nAllow: /\n" }; throw new Error("fetch failed"); };
    const run = await collect({ ai: false, fixtures: true, now: "2026-11-01T00:00:00.000Z", prev: first.next, force: true, fetchers: { fetchText: down } });
    assert.equal(run.changes.length, 0); assert.equal(Object.keys(run.next.records).filter((i) => i.startsWith("page:")).length, 24);
    const pageRuns = run.runs.filter((r) => r.sourceId.startsWith("page:"));
    // sources blocked by the rights review are skipped (never requested); the others were requested and failed
    assert.ok(pageRuns.filter((r) => automationFor(r.sourceId).automation !== "blocked").every((r) => !r.ok));
    assert.ok(pageRuns.filter((r) => automationFor(r.sourceId).automation === "blocked").every((r) => /blocked by the rights review/.test(JSON.stringify(r))));
  });

  await t("a page disallowed by robots.txt is not fetched", async () => {
    let fetched = 0;
    const blocked = async (url: string) => { if (/robots\.txt$/.test(url)) return { status: 200, url, body: "User-agent: *\nDisallow: /\n" }; fetched++; return fixtureText(url); };
    const run = await collect({ ai: false, fixtures: true, now: T1, prev: emptySnapshot(), force: true, only: ["page:tfgm-fares"], fetchers: { fetchText: blocked } });
    assert.equal(fetched, 0); assert.ok(run.runs.every((r) => !r.ok));
  });

  await t("consistency report: published figures vs API values", async () => {
    const real = { ...emptySnapshot(), records: Object.fromEntries(["bachelor", "1br", "2br", "3br"].map((k, i) => [`statcan-cmhc-rents:vancouver:${k}`, { value: { number: [1667, 1807, 2364, 2820][i] }, period: "2025" }])) } as never;
    const rows = officialConsistency(real).filter((c) => c.collectedId.startsWith("statcan"));
    assert.equal(rows.length, 4); assert.ok(rows.every((r) => r.result === "match"));
    const moved = JSON.parse(JSON.stringify(real)); moved.records["statcan-cmhc-rents:vancouver:1br"].value.number = 1900;
    assert.equal(officialConsistency(moved).filter((c) => c.result === "differs").length, 1);
    assert.ok(officialConsistency(emptySnapshot()).every((c) => c.result === "not-collected"));
    assert.equal(pointsOf("vancouver", "housing").length, 4);
  });

  await t("Met Office station file: parsing, missing values and 30-year coverage", () => {
    const f = parseStationData(fixtureStationFile());
    assert.equal(f.name, "Ringway [FIXTURE]"); assert.equal(f.rows.length, 75 * 12);
    assert.equal(f.rows.find((r) => r.year === 1950 && r.month === 1)!.tmax, 9); // "*" (estimated) kept as published
    const mm = monthlyMeans(f.rows, "tmax", 1971, 2000); assert.ok(mm.complete); assert.deepEqual(mm.values.slice(0, 3), [9, 10, 11]);
    // a "---" month inside the period makes that calendar month null; nothing is filled in
    const gap = f.rows.map((r) => (r.year === 1990 && r.month === 2 ? { ...r, rain: undefined } : r));
    const g = monthlyMeans(gap, "rain", 1971, 2000); assert.equal(g.complete, false); assert.equal(g.values[1], null); assert.equal(g.values[0], 51);
    // the real file ends in 2004: later periods are incomplete, never derived
    const short = f.rows.filter((r) => r.year <= 2004); assert.equal(monthlyMeans(short, "tmax", 1981, 2010).complete, false); assert.equal(monthlyMeans(short, "tmax", 1971, 2000).complete, true);
    const real = parseStationData("Ringway\nLocation: 381400E 384400N, Lat 53.356 Lon -2.279, 69 metres amsl\n   yyyy  mm   tmax    tmin      af    rain     sun\n              degC    degC    days      mm   hours\n   1949   1    7.9     2.0       6     ---    41.5\n   1950   3   11.2*    ---      ---   30.1#   ---\n");
    assert.deepEqual(real.rows[0], { year: 1949, month: 1, tmax: 7.9, tmin: 2, af: 6, rain: undefined, sun: 41.5 }); assert.deepEqual([real.rows[1].tmax, real.rows[1].tmin, real.rows[1].rain], [11.2, undefined, 30.1]);
  });

  await t("Met Office source: blocked by the rights review (automated access restricted) - skipped, nothing requested or recorded", async () => {
    assert.equal(automationFor("metoffice-station-data").automation, "blocked");
    const run1 = await collect({ ai: false, fixtures: true, now: T1, prev: emptySnapshot(), force: true, only: ["metoffice-station-data"] });
    assert.equal(Object.keys(run1.next.records).length, 0); assert.equal(run1.changes.length, 0);
    assert.ok(run1.runs.length > 0 && run1.runs.every((r) => /blocked by the rights review/.test(JSON.stringify(r))));
  });

  await t("consistency: published Ringway climate matches the collected values; a differing value is reported", () => {
    const rec = (k: string, series: number[]) => [`metoffice-station-data:ringway:1971-2000:${k}`, { value: { series }, period: "1971–2000" }] as const;
    const m = man.climate!; const snap = { ...emptySnapshot(), records: Object.fromEntries([rec("tmax", m.months.map((x) => x.maxC!)), rec("tmin", m.months.map((x) => x.minC!)), rec("rain", m.months.map((x) => x.precipMm!))]) } as never;
    const rows = officialConsistency(snap).filter((c) => c.id === m.id); assert.equal(rows.length, 3); assert.ok(rows.every((r) => r.result === "match"));
    const bad = JSON.parse(JSON.stringify(snap)); bad.records["metoffice-station-data:ringway:1971-2000:rain"].value.series[0] = 99;
    assert.deepEqual(officialConsistency(bad).filter((c) => c.id === m.id && c.result === "differs").map((c) => c.collectedId), ["metoffice-station-data:ringway:1971-2000:rain"]);
  });

  await t("UBC residence fees are reviewed but NOT published (terms of use); the page shows a notice with official links", () => {
    assert.ok([...man.points, ...van.points].every((p) => p.evidence.every((e) => !/ubc\.ca/.test(e.url)))); // no UBC figure anywhere
    const n = van.notices!.find((x) => x.sourceId === "ubc-housing-fees")!; assert.equal(n.topic, "housing"); assert.ok(n.text.en && n.text.ja && n.links.length >= 4 && n.links.every((l) => /^https:\/\//.test(l.url)));
    assert.equal(rightsOfSource("ubc-housing-fees").reuseStatus, "restricted");
    assert.ok(!sources.some((x) => x.id === "page:ubc-housing-fees")); // never fetched or checked without data points
    assert.ok(officialSources.filter((x) => rightsOfSource(x.id).automation === "blocked" && rightsOfSource(x.id).reuseStatus === "restricted" && x.id.startsWith("ubc")).every((x) => ![...man.points, ...van.points].some((p) => p.sourceId === x.id)));
  });

  console.log(`${n} official-data tests passed`);
})().catch((e) => { console.error(e); process.exit(1); });
