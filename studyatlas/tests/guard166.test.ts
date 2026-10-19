// Tests for Ver.1.6.6 (collection safety). No test touches the network: every transport is a mock that counts its calls.
import assert from "node:assert/strict";
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { AccessDenied, accessLedger, assertAccess, decideAccess, guardedFetch, requestsSent, resetGuard } from "../collector/guard";
import { checkLinks, linkTargets, modeOf } from "../collector/linkcheck";
import { fetchText } from "../collector/util";
import { RIGHTS, type Rights } from "../data/official/rights";
import { officialSources } from "../data/official/sources";
import { TRANSPORT_GUIDES, guideOf } from "../data/official/transportGuides";
import { LINK_STATUS } from "../data/linkStatus";
import { RENT_APPROVALS } from "../data/official/cityRents";
import { CLIMATE_APPROVALS } from "../data/approvals";

let n = 0; const t = async (name: string, fn: () => void | Promise<void>) => { resetGuard(); await fn(); n++; console.log("ok", name); };
const ok = (body = "") => new Response(body, { status: 200 });
const spy = (status = 200) => { const s = { calls: [] as string[], transport: async (u: string) => { s.calls.push(u); const r = new Response("x", { status }); Object.defineProperty(r, "url", { value: u }); return r; } }; return s; };
const rec = (o: Partial<Rights>): Rights => ({ sourceName: "t", sourceUrl: "https://example.org/", licenseUrl: null, reuseStatus: "permitted", accessMethod: "open-api", automation: "allowed", lastReviewedAt: "2026-10-19", reviewNotes: { en: "", ja: "" }, reviewed: [], restrictions: [], expertReview: false, ...o });
const ctxOf = (r: Record<string, Rights>, pages: Record<string, string[]> = {}) => ({ rights: r, sources: Object.entries(pages).map(([id, p]) => ({ id, pages: p }) as never) });
const TL = ["https://www.translink.ca/transit-fares/pricing-and-fare-zones", "https://www.translink.ca/transit-fares/u-pass-bc", "https://www.translink.ca/transit-fares/compass-card", "https://www.translink.ca/schedules-and-maps/transit-system-maps", "https://www.translink.ca/terms-and-conditions", "https://www.translink.ca/robots.txt"];

(async () => {
  await t("1. a forbidden URL is refused BEFORE any request, in every way of access", async () => {
    const s = spy(); for (const u of ["https://www.translink.ca/transit-fares/u-pass-bc", "https://vancouver.housing.ubc.ca/applications/fees-payments/", "https://tfl.gov.uk/fares", "https://www.ttc.ca/fares-and-passes", "https://transportnsw.info/tickets-fares/fares", "https://www.metoffice.gov.uk/pub/data/weather/uk/climate/stationdata/ringwaydata.txt"])
      for (const k of ["html", "api", "dataset", "robots", "status-only"] as const) await assert.rejects(guardedFetch(u, k, undefined, { transport: s.transport, paceMs: 0 }), (e: Error) => e instanceof AccessDenied && e.decision.state === "forbidden");
    assert.equal(s.calls.length, 0); assert.equal(requestsSent(), 0);
  });

  await t("2. an unconfirmed URL (no rights record / never reviewed) is also refused before any request – fail closed", async () => {
    const s = spy(); await assert.rejects(guardedFetch("https://unknown-school.example/fees", "html", undefined, { transport: s.transport, paceMs: 0 }), (e: Error) => e instanceof AccessDenied && e.decision.state === "unconfirmed");
    const c = ctxOf({ x: rec({ sourceUrl: "https://newsite.example/", lastReviewedAt: null }) }); const d = decideAccess("https://newsite.example/a", "status-only", c); assert.equal(d.state, "unconfirmed"); assert.equal(d.allow, false);
    assert.equal(decideAccess("https://data.gov.uk/x", "status-only").state, "unconfirmed", "gov.uk does not cover data.gov.uk"); assert.equal(decideAccess("http://www.gov.uk/", "status-only").allow, false, "https only"); assert.equal(s.calls.length, 0);
  });

  await t("3. a conditional record allows only its documented API / dataset, nothing else", async () => {
    const c = ctxOf({ api: rec({ sourceUrl: "https://api.example/", accessMethod: "open-api" }) });
    const a = decideAccess("https://api.example/v1/items", "api", c); assert.equal(a.allow, true); assert.equal(a.state, "conditional");
    assert.equal(decideAccess("https://api.example/page", "html", c).allow, false, "a page body is not an API"); assert.equal(decideAccess("https://api.example/robots.txt", "robots", c).allow, true);
    const s = spy(); await guardedFetch("https://api.example/v1/items", "api", undefined, { transport: s.transport, ctx: c, paceMs: 0 }); assert.equal(s.calls.length, 1);
  });

  await t("4. HTML forbidden / CSV allowed are told apart; a page body is read only for pages listed in the record", async () => {
    const c = ctxOf({ ds: rec({ sourceUrl: "https://data.example/", accessMethod: "open-data-file" }) }, { ds: ["https://data.example/catalogue"] });
    assert.equal(decideAccess("https://data.example/files/rent.csv", "dataset", c).allow, true); assert.equal(decideAccess("https://data.example/other-page", "html", c).allow, false);
    assert.equal(decideAccess("https://data.example/catalogue", "html", c).allow, true, "the listed catalogue page"); assert.equal(decideAccess("https://data.example/other-page", "status-only", c).allow, true, "status only is a separate, weaker way of access");
    const manual = ctxOf({ m: rec({ sourceUrl: "https://m.example/", accessMethod: "manual-link", automation: "page-check-only" }) }, { m: ["https://m.example/fees"] }); assert.equal(decideAccess("https://m.example/fees", "html", manual).allow, false, "manual-link: no page body");
    assert.equal(decideAccess("https://m.example/fees", "api", manual).allow, false);
  });

  await t("5. robots.txt allowing a path does not help when the rights record forbids it (and robots.txt of a forbidden host is not requested)", async () => {
    const s = spy(); let robotsCalls = 0; const targets = TL.slice(0, 4).map((u) => ({ url: u, where: ["test"], ...modeOf(u) }));
    const res = await checkLinks(targets as never, 0, { transport: s.transport, robotsFetch: async () => { robotsCalls++; return { status: 200, body: "User-agent: *\nAllow: /\n" }; } });
    assert.ok(res.every((r) => r.verdict === "skipped" && r.status === null && r.mode === "skip")); assert.equal(s.calls.length, 0); assert.equal(robotsCalls, 0);
    for (const u of TL) assert.equal(decideAccess(u, u.endsWith("robots.txt") ? "robots" : "status-only").state, "forbidden", u);
  });

  await t("6+7. link check: forbidden / unconfirmed links are not requested and are recorded as a rights skip; an HTTP 403 stays access-denied (not broken, not skipped)", async () => {
    const s = spy(403); const allowedUrl = "https://tfgm.com/maps"; const unconfirmed = "https://www.ef.com/ca/ilsd/schools/toronto/"; const forbidden = TL[0];
    const ts = [allowedUrl, unconfirmed, forbidden].map((u) => ({ url: u, where: ["test"], ...modeOf(u) }));
    const res = await checkLinks(ts as never, 0, { transport: s.transport, robotsFetch: async () => ({ status: 200, body: "" }) });
    const by = Object.fromEntries(res.map((r) => [r.url, r])); assert.equal(by[allowedUrl].verdict, "access-denied"); assert.equal(by[allowedUrl].status, 403); assert.equal(by[unconfirmed].verdict, "unconfirmed"); assert.equal(by[forbidden].verdict, "skipped");
    assert.deepEqual(s.calls, [allowedUrl], "only the allowed link was requested"); assert.ok(res.every((r) => /^\d{4}-\d{2}-\d{2}$/.test(r.checkedAt ?? "")), "every result carries its check date");
    const ok200 = spy(200); const r2 = await checkLinks([{ url: allowedUrl, where: ["t"], ...modeOf(allowedUrl) }] as never, 0, { transport: ok200.transport, robotsFetch: async () => ({ status: 200, body: "" }) }); assert.equal(r2[0].verdict, "ok"); assert.equal(r2[0].mode, "status-only"); assert.equal(r2[0].contentOk, null, "status-only: the body is not read, so no content verdict");
  });

  await t("a hand-built target cannot bypass the rights decision inside checkLinks", async () => {
    const s = spy(); const res = await checkLinks([{ url: TL[0], where: ["t"], mode: "html" }] as never, 0, { transport: s.transport, robotsFetch: async () => ({ status: 200, body: "" }) }); assert.equal(res[0].verdict, "skipped"); assert.equal(s.calls.length, 0);
  });

  await t("8. allowed sources keep working: the URLs the collector uses are allowed in the way it uses them", async () => {
    const A = (u: string, k: Parameters<typeof decideAccess>[1]) => assert.equal(decideAccess(u, k).allow, true, `${k} ${u}`);
    A("https://content-api.publishing.service.gov.uk/content/student-visa", "api"); A("https://open.canada.ca/data/api/action/package_show?id=x", "api"); A("https://api.weather.gc.ca/collections/climate-normals/items?f=json", "api");
    A("https://www150.statcan.gc.ca/t1/wds/rest/getCubeMetadata", "api"); A("https://www.ons.gov.uk/economy/inflationandpriceindices/datasets/priceindexofprivaterentsukmonthlypricestatistics", "html"); A("https://www.ons.gov.uk/file?uri=/x/y.xlsx", "dataset");
    A("https://tfgm.com/tickets-and-passes/bus-tickets", "html"); A("https://www.manchester.ac.uk/study/undergraduate/fees-and-funding/cost-of-living/", "html"); A("https://www.abs.gov.au/census/find-census-data/quickstats/2021/1GSYD", "html"); A("https://tfgm.com/robots.txt", "robots");
    for (const u of ["https://tfgm.com/maps"]) assert.equal(decideAccess(u, "html").allow, false, "an unlisted page of an allowed host: status only"), A(u, "status-only");
  });

  await t("9. approved data and their sources are unchanged", async () => {
    assert.equal(Object.keys(RENT_APPROVALS).length, 7); assert.equal(RENT_APPROVALS["tor-cmhc-rent-bachelor"].digest, "4a79633baf6e7b89bdd7e14393229e1674567a418856ca355e824e5739eab8cf"); assert.equal(RENT_APPROVALS["tor-cmhc-rent-1br"].digest, "abbbf002fa77176f0b4b2c9fc214de335c9faefd166c739b4fbf153f180185c1");
    assert.equal(RENT_APPROVALS["syd-abs-census-median-weekly-rent"].digest, "506c97aa71ea3e2cdbea993353f47c6f3f099459bfdec41c6241aa2cac1c73f2"); assert.equal(RENT_APPROVALS["mel-abs-census-median-weekly-rent"].digest, "ed4c547df54b47f95701207d8f22bd2a1c01b3e89f96d022713ef353b87a7a91");
    assert.deepEqual(Object.keys(CLIMATE_APPROVALS), ["van-climate-eccc-1991-2020", "tor-climate-eccc-1991-2020"]); assert.equal(CLIMATE_APPROVALS["van-climate-eccc-1991-2020"].approval.at, "2026-10-17");
    for (const id of ["tfgm-fares", "translink-fares", "ttc-fares", "eccc-climate-normals", "govuk-content", "ons-private-rents", "statcan-cmhc-rents", "abs-census-rent"]) assert.ok(RIGHTS[id], id);
    assert.equal(RIGHTS["translink-fares"].automation, "blocked"); assert.equal(RIGHTS["translink-fares"].reuseStatus, "restricted"); assert.equal(RIGHTS["tfgm-fares"].reuseStatus, "needs-review"); assert.equal(RIGHTS["govuk-content"].automation, "allowed");
    assert.ok(officialSources.find((s) => s.id === "translink-fares"));
  });

  await t("10. the stored link-check result agrees with what the rights records allow today: no recorded request for a denied link, a recorded skip for every denied link, mode and date on every entry", async () => {
    const ts = linkTargets(); const byUrl = new Map(LINK_STATUS.map((r) => [r[0], r]));
    for (const x of ts) { const r = byUrl.get(x.url)!; assert.ok(r, `no recorded result for ${x.url}`); assert.equal(r[4], x.mode, `${x.url}: recorded mode`); assert.match(r[5], /^\d{4}-\d{2}-\d{2}$/);
      if (x.mode === "skip") { assert.ok(r[1] === "skipped" || r[1] === "unconfirmed", x.url); assert.equal(r[2], null); assert.equal(r[1], x.skipVerdict); } else { assert.ok(r[1] !== "skipped" && r[1] !== "unconfirmed", `${x.url}: an allowed link must have been checked`); if (x.mode === "status-only") assert.equal(r[3], null, `${x.url}: no content verdict without reading the body`); } }
    assert.equal(LINK_STATUS.length, ts.length);
  });

  await t("TransLink: every TransLink URL is forbidden, the Vancouver card keeps its official links, and nothing from the pages fetched by mistake in Ver.1.6.5 is published", async () => {
    const s = spy(); for (const u of TL) await assert.rejects(fetchText(u, { retries: 0 }), AccessDenied);
    assert.equal(RIGHTS["translink-fares"].automation, "blocked"); assert.match(RIGHTS["translink-fares"].reviewNotes.en, /mistake/);
    const g = guideOf("vancouver")!; assert.deepEqual(g.links.map((l) => l.kind).sort(), ["fares", "map", "payment", "student"]); assert.ok(g.links.every((l) => l.url.startsWith("https://www.translink.ca/") && !l.opened && !l.read));
    assert.ok(!g.read && g.checkedAt === null && !g.modes && !g.payment && !g.paymentShort && !g.zones && !g.passes, "no summary of the pages read by mistake");
    const text = JSON.stringify(g); for (const w of ["stored value", "SkyTrain gate", "three fare zones", "Interac", "HandyCard", "referendum", "Apple Pay"]) assert.ok(!text.includes(w), `not reused: ${w}`);
    for (const x of linkTargets().filter((x) => /translink\.ca/.test(x.url))) { assert.equal(x.mode, "skip", x.url); assert.equal(x.skipVerdict, "skipped"); }
    assert.equal(s.calls.length, 0);
  });

  await t("every request is recorded with its way of access, and the request budget stops runaway loops", async () => {
    resetGuard({ maxRequests: 2 }); const s = spy(); const c = ctxOf({ r: rec({ sourceUrl: "https://api.example/" }) });
    await guardedFetch("https://api.example/a", "api", undefined, { transport: s.transport, ctx: c, paceMs: 0 }); await guardedFetch("https://api.example/b", "status-only", undefined, { transport: s.transport, ctx: c, paceMs: 0 });
    await assert.rejects(guardedFetch("https://api.example/c", "api", undefined, { transport: s.transport, ctx: c, paceMs: 0 }), /budget/); assert.equal(s.calls.length, 2);
    assert.deepEqual(accessLedger().map((e) => [e.kind, e.allowed]), [["api", true], ["status-only", true], ["api", true]]); assert.throws(() => assertAccess("https://nowhere.example/", "html"), AccessDenied);
  });

  await t("no direct network call outside collector/guard.ts, and no temporary probe script or workflow is left behind", async () => {
    const files: string[] = []; const walk = (d: string) => { for (const e of readdirSync(d, { withFileTypes: true })) { const p = join(d, e.name); if (e.isDirectory()) { if (e.name !== "node_modules" && e.name !== "fixtures") walk(p); } else files.push(p); } };
    walk("collector"); const wf = "../.github/workflows"; const flows = existsSync(wf) ? readdirSync(wf).map((f) => join(wf, f)) : [];
    const RAW = /(await|return|=|\(|,)\s*fetch\(|https?\.(get|request)\(|node:https?"|\bcurl\b|\bwget\b|XMLHttpRequest|undici|node-fetch|axios/;
    for (const f of [...files.filter((x) => /\.(ts|sh)$/.test(x)), ...flows]) { if (f.endsWith("collector/guard.ts")) continue; const src = readFileSync(f, "utf8").split("\n").filter((l) => !/^\s*(\/\/|\*|\/\*)/.test(l)).join("\n"); assert.ok(!RAW.test(src), `direct network access outside the guard: ${f}`); }
    assert.equal(files.filter((f) => /(^|\/)v\d[\w.-]*-probe\.ts$/.test(f) || /tmp|scratch/i.test(f)).length, 0, "temporary probe script left behind");
    assert.equal(flows.filter((f) => /probe|tmp|temp|scratch/i.test(f)).length, 0, "temporary workflow left behind");
    const wfText = flows.map((f) => readFileSync(f, "utf8")).join("\n"); assert.ok(!/npx tsx collector\/v\d/.test(wfText));
    assert.ok(readFileSync("collector/util.ts", "utf8").includes("guardedFetch"), "util routes through the guard");
  });

  console.log(n, "Ver.1.6.6 collection safety tests passed");
})().catch((e) => { console.error(e); process.exit(1); });
