// Tests for official city data (Ver.1.5). Local fixtures only (no network): results here are NOT live API results.
// Run: npm test
import assert from "node:assert/strict";
import { collect, dueIn } from "../collector/run";
import { fixtureText } from "../collector/fixtures";
import { officialConsistency } from "../collector/consistency";
import { makeRobots, robotsAllows } from "../collector/robots";
import { emptySnapshot } from "../collector/store";
import { allOfficialData, officialSources, pointsOf } from "../data/official";
import { climateSummary, compareIssues, compareRows, pickPoint } from "../data/official/compare";
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
    assert.equal(man.points.length, 24); assert.equal(van.points.length, 16); assert.ok(van.climate);
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
    assert.equal(man.points.filter((p) => p.audience === "renter").length, 0); // no city-wide Manchester statistic is invented
  });

  await t("evidence quotes carry the published amounts (spot checks against the 2026-10-13 live page text)", () => {
    assert.equal(pt("man-bus-28day-adult").value!.amount, 80); assert.equal(pt("man-anybus-28day-student").value!.amount, 63.3);
    assert.equal(pt("man-uom-ug-total").value!.amount, 1484); assert.equal(pt("van-monthly-adult-z1").value!.amount, 117.2);
    assert.equal(pt("van-upass").value!.amount, 47.85); assert.equal(pt("van-cmhc-rent-1br").value!.amount, 1807);
    assert.deepEqual(van.climate!.months.map((m) => m.meanC).slice(0, 3), [4.13, 4.9, 6.88]); assert.equal(van.climate!.period, "1981–2010");
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
    assert.deepEqual(compareIssues([m("single", "manchester"), m("single", "vancouver")]), []); // trip vs trip, both adults
    assert.deepEqual(compareIssues([m("monthlyAdult", "manchester"), m("monthlyAdult", "vancouver")]), ["period"]); // 28 days vs calendar month
    assert.deepEqual(compareIssues([m("studentTransit", "manchester"), m("studentTransit", "vancouver")]), ["period"]);
    assert.deepEqual(compareIssues([m("marketRent", "manchester"), m("marketRent", "vancouver")]), ["missing"]);
    assert.deepEqual(compareIssues([pt("man-bus-single-adult"), pt("man-anybus-28day-student")]).sort(), ["audience", "period"]);
    assert.ok(compareIssues([pt("man-bus-single-adult"), { ...pt("van-fare-stored-adult-z1"), status: "unverified" }]).includes("notVerified"));
    const s = climateSummary("vancouver")!; assert.equal(s.period, "1981–2010"); assert.equal(climateSummary("manchester"), undefined);
  });

  await t("no currency conversion without an exchange-rate provider; same currency passes through", () => {
    assert.equal(convert(10, "GBP", "CAD", noFx), undefined); assert.deepEqual(convert(10, "GBP", "GBP"), { amount: 10 });
    const fx = { rate: (f: string, to: string) => (f === "GBP" && to === "JPY" ? { from: f, to, rate: 200, date: "2026-10-14", publisher: "test", url: "https://example.com" } : undefined) };
    assert.equal(convert(2, "GBP", "JPY", fx)!.amount, 400);
    assert.equal(moneyComparability([getCity("manchester")!.profile.cost.transport, getCity("vancouver")!.profile.cost.transport]), "currency");
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
    assert.ok(second.runs.filter((r) => /^(page:|statcan|eccc)/.test(r.sourceId)).every((r) => /not due/.test(r.skipped ?? "")));
    assert.equal(second.changes.length, 0);
    const forced = await collect({ ai: false, fixtures: true, now: later, prev: first.next, force: true });
    assert.ok(forced.runs.filter((r) => /^(page:|statcan|eccc)/.test(r.sourceId)).every((r) => r.ok && !r.skipped)); assert.equal(forced.changes.length, 0);
  });

  await t("collecting the same (fixture) responses twice: first run adds records, second run finds 0 changes", async () => {
    const first = await collect({ ai: false, fixtures: true, now: T1, prev: emptySnapshot(), force: true });
    const ids = Object.keys(first.next.records);
    assert.equal(ids.filter((i) => i.startsWith("page:")).length, 36); assert.equal(ids.filter((i) => i.startsWith("statcan-cmhc-rents:")).length, 4); assert.equal(ids.filter((i) => i.startsWith("eccc-climate-normals:")).length, 4);
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
    assert.equal(run.changes.length, 0); assert.equal(Object.keys(run.next.records).filter((i) => i.startsWith("page:")).length, 36);
    assert.ok(run.runs.filter((r) => r.sourceId.startsWith("page:")).every((r) => !r.ok));
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

  console.log(`${n} official-data tests passed`);
})().catch((e) => { console.error(e); process.exit(1); });
