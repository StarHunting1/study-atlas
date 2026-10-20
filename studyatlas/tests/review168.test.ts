// Tests for Ver.1.6.8 (human source review -> guard). No test touches the network: every transport is a mock.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { AccessDenied, accessLedger, assertAccess, decideAccess, guardedFetch, resetGuard } from "../collector/guard";
import { hostRows, template, undatedRights, validateAll } from "../collector/review";
import { ACCESS_REVIEWS, PENDING_SOURCES, canRepublish, inScope, reviewInForce, validateReview, type AccessReview } from "../data/official/accessReviews";
import { RIGHTS } from "../data/official/rights";
import { officialSources } from "../data/official/sources";
import { RENT_APPROVALS } from "../data/official/cityRents";
import { CLIMATE_APPROVALS } from "../data/approvals";
import { listCompareSchools } from "../data/languageSchools";

let n = 0; const t = async (name: string, fn: () => void | Promise<void>) => { resetGuard(); await fn(); n++; console.log("ok", name); };
const TODAY = "2026-11-01";
const review = (o: Partial<AccessReview> = {}): AccessReview => ({
  id: "register-example", service: "Example Register", hosts: ["register.example.org"], termsUrl: "https://register.example.org/terms", termsName: "Example Register Terms of Use", termsVersion: "v2, 2026-01",
  reviewedAt: "2026-10-30", reviewedBy: "A. Reviewer", nextReviewDue: "2027-04-30", status: "active", automation: "allowed", methods: ["html"], urlPrefixes: ["https://register.example.org/directory/"],
  clauses: [{ ref: "§4.2 Automated access", summary: "Automated retrieval of directory pages is allowed at a reasonable rate.", allows: ["html"] }], rateLimit: { minIntervalMs: 2000, maxRequestsPerRun: 3 },
  redistribution: { status: "unknown", conditions: "Reuse terms not yet read." }, unconfirmed: ["whether the directory may be republished"], history: [{ at: "2026-10-30", by: "A. Reviewer", change: "first review" }], ...o });
const ctx = (reviews: AccessReview[], today = TODAY) => ({ rights: RIGHTS, sources: officialSources, reviews, today });
const res = (status = 200, headers: Record<string, string> = {}, url?: string) => { const r = new Response(status === 200 ? "ok" : null, { status, headers }); if (url) Object.defineProperty(r, "url", { value: url }); return r; };

(async () => {
  await t("1. an unreviewed host is refused before any request", async () => {
    let calls = 0; await assert.rejects(guardedFetch("https://register.example.org/directory/a", "html", undefined, { transport: async () => { calls++; return res(); }, ctx: ctx([]), paceMs: 0 }), (e: Error) => e instanceof AccessDenied && e.decision.state === "unconfirmed"); assert.equal(calls, 0);
  });

  await t("2. a reviewed host still refuses URLs outside the reviewed range, other paths on the same host, and unlisted subdomains", () => {
    const c = ctx([review()]); const D = (u: string, k: "html" | "api" | "status-only" | "dataset" | "robots" = "html") => decideAccess(u, k, c);
    assert.equal(D("https://register.example.org/directory/schools/1").allow, true); assert.equal(D("https://register.example.org/directory/schools/1").state, "conditional"); assert.equal(D("https://www.register.example.org/directory/x").allow, true, "www is the same host");
    for (const u of ["https://register.example.org/other/x", "https://register.example.org/directoryx/y", "https://register.example.org/", "https://api.register.example.org/directory/x", "https://evil.register.example.org/directory/x", "http://register.example.org/directory/x"]) assert.equal(D(u).allow, false, u);
    assert.equal(D("https://register.example.org/directory/x", "status-only").allow, false, "status-only was not listed in methods");
    assert.equal(inScope(review(), "https://register.example.org/directory"), true); assert.equal(D("https://register.example.org/robots.txt", "robots").allow, true, "robots.txt only because html is allowed");
  });

  await t("3+4. HTML-only refuses API; API-only refuses HTML", () => {
    const htmlOnly = ctx([review()]); assert.equal(decideAccess("https://register.example.org/directory/x", "api", htmlOnly).allow, false);
    const apiOnly = ctx([review({ methods: ["api"], clauses: [{ ref: "§5 API", summary: "The public API may be used by programs.", allows: ["api"] }], urlPrefixes: ["https://register.example.org/api/v1/"] })]);
    assert.equal(decideAccess("https://register.example.org/api/v1/items", "api", apiOnly).allow, true); assert.equal(decideAccess("https://register.example.org/api/v1/items", "html", apiOnly).allow, false); assert.equal(decideAccess("https://register.example.org/api/v1/items", "dataset", apiOnly).allow, false);
  });

  await t("5. every redirect target is judged again: out of range, another host, and an unreviewed host are refused before they are requested; an in-range redirect is followed", async () => {
    const c = ctx([review({ rateLimit: { minIntervalMs: 1000, maxRequestsPerRun: 10 } })]); const mk = (map: Record<string, Response>) => { const calls: string[] = []; return { calls, transport: async (u: string) => { calls.push(u); return map[u] ?? res(404); } }; };
    const a = mk({ "https://register.example.org/directory/a": res(302, { location: "https://elsewhere.example.net/page" }) });
    await assert.rejects(guardedFetch("https://register.example.org/directory/a", "html", undefined, { transport: a.transport, ctx: c, paceMs: 0 }), (e: Error) => e instanceof AccessDenied && e.decision.url === "https://elsewhere.example.net/page"); assert.deepEqual(a.calls, ["https://register.example.org/directory/a"]);
    const b = mk({ "https://register.example.org/directory/a": res(301, { location: "/private/x" }) }); await assert.rejects(guardedFetch("https://register.example.org/directory/a", "html", undefined, { transport: b.transport, ctx: c, paceMs: 0 }), AccessDenied); assert.equal(b.calls.length, 1);
    const ok = mk({ "https://register.example.org/directory/a": res(301, { location: "/directory/b" }), "https://register.example.org/directory/b": res(200, {}, "https://register.example.org/directory/b") });
    const r = await guardedFetch("https://register.example.org/directory/a", "html", undefined, { transport: ok.transport, ctx: c, paceMs: 0 }); assert.equal(r.status, 200); assert.deepEqual(ok.calls, ["https://register.example.org/directory/a", "https://register.example.org/directory/b"]);
    assert.deepEqual(accessLedger().filter((e) => e.reviewId).map((e) => e.hop ?? 0), [0, 0, 0, 1], "hops are recorded, with the review that allowed them");
    const loop = mk({ "https://register.example.org/directory/a": res(302, { location: "/directory/a" }) }); await assert.rejects(guardedFetch("https://register.example.org/directory/a", "html", undefined, { transport: loop.transport, ctx: c, paceMs: 0 }), /redirects|budget|cap/);
    resetGuard(); const blocked = mk({ "https://register.example.org/directory/a": res(302, { location: "https://www.translink.ca/transit-fares/u-pass-bc" }) }); await assert.rejects(guardedFetch("https://register.example.org/directory/a", "html", undefined, { transport: blocked.transport, ctx: c, paceMs: 0 }), (e: Error) => e instanceof AccessDenied && e.decision.state === "forbidden"); assert.equal(blocked.calls.length, 1);
  });

  await t("6. an expired review grants nothing and stops the source; the list shows it as overdue; a suspended one and a 'forbidden' review refuse too", () => {
    const r = review(); const late = ctx([r], "2027-05-01"); const d = decideAccess("https://register.example.org/directory/x", "html", late); assert.equal(d.allow, false); assert.equal(d.state, "unconfirmed"); assert.match(d.reason, /expired on 2027-04-30/);
    assert.equal(reviewInForce(r, { today: TODAY }), true); assert.equal(reviewInForce(r, { today: "2027-05-01" }), false);
    assert.equal(hostRows({ reviews: [r], today: "2027-05-01", urls: [] }).find((x) => x.host === "register.example.org")!.group, "overdue"); assert.equal(hostRows({ reviews: [r], today: TODAY, urls: [] }).find((x) => x.host === "register.example.org")!.group, "reviewed");
    assert.equal(decideAccess("https://register.example.org/directory/x", "html", ctx([review({ status: "suspended" })])).allow, false); assert.equal(decideAccess("https://register.example.org/directory/x", "status-only", ctx([review({ automation: "forbidden", methods: ["status-only"] })])).state, "forbidden");
    assert.equal(validateAll([r], "2027-05-01")[0].expired, true);
    let calls = 0; return assert.rejects(guardedFetch("https://register.example.org/directory/x", "html", undefined, { transport: async () => { calls++; return res(); }, ctx: late, paceMs: 0 })).then(() => assert.equal(calls, 0));
  });

  await t("7. access permission is not republishing permission: data from a reviewed source cannot be published unless redistribution is permitted with its own basis", () => {
    const access = review(); assert.equal(decideAccess("https://register.example.org/directory/x", "html", ctx([access])).allow, true); assert.equal(canRepublish("https://register.example.org/directory/x", [access], { today: TODAY }), false);
    for (const status of ["restricted", "unknown"] as const) assert.equal(canRepublish("https://register.example.org/directory/x", [review({ redistribution: { status, conditions: "no republishing" } })], { today: TODAY }), false);
    const noBasis = review({ redistribution: { status: "permitted", conditions: "with attribution" } }); assert.ok(validateReview(noBasis, { today: TODAY }).some((p) => /no basis of its own/.test(p))); assert.equal(canRepublish("https://register.example.org/directory/x", [noBasis], { today: TODAY }), false);
    const ok = review({ redistribution: { status: "permitted", conditions: "attribution required", attribution: "Source: Example Register", basis: [{ ref: "§7 Reuse", summary: "Content may be reused with attribution." }] } });
    assert.deepEqual(validateReview(ok, { today: TODAY }), []); assert.equal(canRepublish("https://register.example.org/directory/x", [ok], { today: TODAY }), true); assert.equal(canRepublish("https://register.example.org/other/x", [ok], { today: TODAY }), false, "only inside the reviewed range"); assert.equal(canRepublish("https://register.example.org/directory/x", [ok], { today: "2027-06-01" }), false, "not after expiry");
    assert.equal(canRepublish("https://www.gov.uk/student-visa"), false, "no review, no republishing right from this module");
  });

  await t("8. a record without a reviewer, a basis, a scope, a rate limit or a next review date fails validation, grants nothing, and is never completed automatically", () => {
    const bad: [string, Partial<AccessReview>, RegExp][] = [
      ["no reviewer", { reviewedBy: "" }, /reviewedBy/], ["a tool as reviewer", { reviewedBy: "Claude" }, /not a tool/], ["placeholder reviewer", { reviewedBy: "TODO your name" }, /placeholder|empty/ ],
      ["no clause", { clauses: [] }, /no clause/], ["method without a clause", { methods: ["html", "api"] }, /method "api" is not backed/], ["no scope", { urlPrefixes: [] }, /urlPrefixes is empty/], ["whole site", { urlPrefixes: ["https://register.example.org/"] }, /whole site/],
      ["prefix on another host", { urlPrefixes: ["https://other.example.com/directory/"] }, /not listed in hosts/], ["wildcard host", { hosts: ["*.example.org"] }, /bare host/], ["www host", { hosts: ["www.register.example.org"] }, /bare host/], ["no methods", { methods: [] }, /methods is empty/],
      ["no next review date", { nextReviewDue: "" }, /nextReviewDue is required/], ["next review before review", { nextReviewDue: "2026-10-01" }, /after reviewedAt/], ["too far", { nextReviewDue: "2029-01-01" }, /400 days/], ["no rate limit", { rateLimit: { minIntervalMs: 0, maxRequestsPerRun: 0 } }, /rateLimit/],
      ["no redistribution decision", { redistribution: undefined as never }, /redistribution\.status/], ["no history", { history: [] }, /history is empty/], ["terms not https", { termsUrl: "http://x/terms" }, /termsUrl/], ["future review", { reviewedAt: "2027-12-01" }, /future/],
    ];
    for (const [name, o, re] of bad) { const r = review(o); const errs = validateReview(r, { today: TODAY }); assert.ok(errs.some((x) => re.test(x)), `${name}: ${errs.join(" | ")}`); assert.equal(decideAccess("https://register.example.org/directory/x", "html", ctx([r])).allow, false, `${name}: an incomplete record grants nothing`); }
    assert.deepEqual(validateReview(review(), { today: TODAY }), []);
    const tpl = template("register.example.org"); assert.ok(tpl.includes("TODO") && !/reviewedBy: "[A-Z][a-z]+ [A-Z]/.test(tpl) && !tpl.includes("automation: \"allowed\"")); assert.ok(!/reviewedAt: "\d{4}/.test(tpl), "the template invents no date or name");
    const second = review({ history: [{ at: "2026-10-30", by: "A. Reviewer", change: "first review" }, { at: "2026-12-01", by: "B. Reviewer", change: "narrowed scope" }] }); assert.ok(validateReview(second, { today: "2026-12-02" }).some((x) => /previous conditions/.test(x)), "a change must keep the earlier conditions");
  });

  await t("9. blocks are kept: TransLink, UBC, Met Office, TTC, TfL, Transport for NSW stay forbidden, and a review cannot lift them (validation rejects it and the guard ignores it)", () => {
    for (const u of ["https://www.translink.ca/transit-fares/u-pass-bc", "https://vancouver.housing.ubc.ca/applications/fees-payments/", "https://www.metoffice.gov.uk/pub/data/weather/uk/climate/stationdata/ringwaydata.txt", "https://www.ttc.ca/fares-and-passes", "https://tfl.gov.uk/fares", "https://transportnsw.info/tickets-fares/fares"]) for (const k of ["html", "api", "status-only", "dataset", "robots"] as const) assert.equal(decideAccess(u, k).state, "forbidden", `${k} ${u}`);
    const lift = review({ id: "lift-translink", hosts: ["translink.ca"], urlPrefixes: ["https://translink.ca/transit-fares/"], termsUrl: "https://translink.ca/terms" });
    assert.ok(validateReview(lift, { today: TODAY }).some((x) => /blocked by the rights record/.test(x))); for (const u of ["https://translink.ca/transit-fares/x", "https://www.translink.ca/transit-fares/x"]) assert.equal(decideAccess(u, "html", ctx([lift])).allow, false, u);
    assert.equal(RIGHTS["translink-fares"].automation, "blocked"); assert.equal(RIGHTS["ubc-housing-fees"].automation, "blocked"); assert.equal(RIGHTS["metoffice-station-data"].automation, "blocked");
  });

  await t("10+11. approved data are unchanged, and no review or fetch can make a school verified", () => {
    assert.equal(Object.keys(RENT_APPROVALS).length, 7); assert.equal(RENT_APPROVALS["tor-cmhc-rent-1br"].digest, "abbbf002fa77176f0b4b2c9fc214de335c9faefd166c739b4fbf153f180185c1"); assert.equal(RENT_APPROVALS["mel-abs-census-median-weekly-rent"].digest, "ed4c547df54b47f95701207d8f22bd2a1c01b3e89f96d022713ef353b87a7a91");
    assert.deepEqual(Object.keys(CLIMATE_APPROVALS), ["van-climate-eccc-1991-2020", "tor-climate-eccc-1991-2020"]);
    const schools = listCompareSchools(); assert.equal(schools.length, 13); for (const s of schools) { assert.notEqual(s.status, "verified", s.id); assert.ok(!JSON.stringify(s.inst).includes('"verified"')); }
    const src = readFileSync("data/official/accessReviews.ts", "utf8") + readFileSync("collector/review.ts", "utf8"); assert.ok(!/status:\s*"verified"|\.status\s*=\s*"verified"/.test(src), "nothing here can set verified");
    assert.equal(ACCESS_REVIEWS.length, 0, "no review record was written: the five priority sources wait for a person");
  });

  await t("12. safe existing collection still works: the sources that rights records allow are allowed exactly as before", () => {
    const A = (u: string, k: "html" | "api" | "dataset" | "robots" | "status-only") => assert.equal(decideAccess(u, k).allow, true, `${k} ${u}`);
    A("https://content-api.publishing.service.gov.uk/content/student-visa", "api"); A("https://open.canada.ca/data/api/action/package_show?id=x", "api"); A("https://api.weather.gc.ca/collections/climate-normals/items?f=json", "api"); A("https://www150.statcan.gc.ca/t1/wds/rest/getCubeMetadata", "api");
    A("https://www.ons.gov.uk/file?uri=/x/y.xlsx", "dataset"); A("https://tfgm.com/tickets-and-passes/bus-tickets", "html"); A("https://www.manchester.ac.uk/study/undergraduate/fees-and-funding/cost-of-living/", "html"); A("https://tfgm.com/robots.txt", "robots");
    assert.equal(decideAccess("https://www.englishuk.com/member-directory?id=878", "html").state, "unconfirmed");
  });

  await t("the review list: the five priority sources are unconfirmed and untouched; existing rights records are reported (not changed) as having no re-review date; the CLI sends nothing", () => {
    const before = JSON.stringify(RIGHTS); const rows = hostRows(); const pri = rows.filter((r) => r.priority); assert.deepEqual([...new Set(pri.map((r) => r.priority!.replace("priority: ", "")))].length, 5);
    assert.ok(pri.every((r) => r.group === "unconfirmed"), "no priority source is allowed"); assert.ok(rows.some((r) => r.group === "forbidden" && r.host === "translink.ca")); assert.ok(rows.some((r) => r.group === "conditional"));
    assert.equal(PENDING_SOURCES.length, 5); assert.ok(undatedRights().length > 0); assert.equal(JSON.stringify(RIGHTS), before, "no rights record was changed or given an invented date");
    assert.equal(validateAll().length, 0);
    const cli = readFileSync("collector/review.ts", "utf8"); assert.ok(!/guardedFetch|fetchText|fetchJson|from "\.\/util"|node:https?/.test(cli), "the review CLI makes no request");
  });

  await t("a reviewed source keeps its own pace and per-run cap, and every allowed request is recorded with the review that allowed it", async () => {
    const c = ctx([review({ rateLimit: { minIntervalMs: 2000, maxRequestsPerRun: 2 } })]); assert.equal(decideAccess("https://register.example.org/directory/a", "html", c).rate?.minIntervalMs, 2000);
    assertAccess("https://register.example.org/directory/a", "html", c); assertAccess("https://register.example.org/directory/b", "html", c); assert.throws(() => assertAccess("https://register.example.org/directory/c", "html", c), /cap of 2 requests/);
    assert.deepEqual(accessLedger().filter((e) => e.allowed).map((e) => e.reviewId), ["register-example", "register-example", "register-example"]);
  });

  console.log(n, "Ver.1.6.8 source review tests passed");
})().catch((e) => { console.error(e); process.exit(1); });
