// Link checker (Ver.1.3.2): classification and target selection. No network: the live check runs in GitHub Actions.
import assert from "node:assert/strict";
import { blockedHosts, classify, expectFor, isVerifiedLink, linkTargets, type LinkResult } from "../collector/linkcheck";
let n = 0; const t = (name: string, f: () => void) => { f(); n++; console.log("ok", name); };

t("access denied is not 'broken'; not found is; server errors and odd 4xx are told apart", () => {
  const u = "https://example.gov/a/b";
  for (const s of [401, 403, 429, 999]) assert.equal(classify(s, u, u).verdict, "access-denied", String(s));
  for (const s of [404, 410]) assert.equal(classify(s, u, u).verdict, "broken", String(s));
  assert.equal(classify(503, u, u).verdict, "server-error"); assert.equal(classify(400, u, u).verdict, "client-error");
  assert.equal(classify(200, u, u).verdict, "ok");
});
t("a redirect to the site home page is not a working link; an ordinary redirect (www, trailing slash, new path) is", () => {
  assert.equal(classify(200, "https://x.gov/deep/page", "https://x.gov/").verdict, "redirected");
  assert.equal(classify(200, "https://x.gov/deep/page/", "https://www.x.gov/deep/page").verdict, "ok");
  assert.equal(classify(200, "https://x.gov/old", "https://x.gov/new").verdict, "ok");
});
t("only a 2xx answer whose page contains the expected words counts as verified", () => {
  const base: LinkResult = { url: "u", where: [], verdict: "ok", status: 200, contentOk: true };
  assert.ok(isVerifiedLink(base)); assert.ok(!isVerifiedLink({ ...base, contentOk: false })); assert.ok(!isVerifiedLink({ ...base, contentOk: null }));
  for (const v of ["access-denied", "broken", "unreachable", "robots-disallowed", "skipped", "redirected", "server-error", "client-error"] as const) assert.ok(!isVerifiedLink({ ...base, verdict: v }), v);
});
t("targets: Manchester and Vancouver links only; sources whose rights block automation (TransLink, UBC, the Met Office site) are never requested; the data.gov.uk catalogue page is", () => {
  const ts = linkTargets(); assert.ok(ts.length >= 40 && new Set(ts.map((x) => x.url)).size === ts.length);
  assert.ok(ts.every((x) => x.url.startsWith("https://")));
  for (const x of ts) { const host = new URL(x.url).hostname; if (/translink\.ca$|ubc\.ca$|(^|\.)metoffice\.gov\.uk$/.test(host)) assert.ok(x.skip, `${x.url} must be skipped`); }
  assert.ok(ts.find((x) => x.url.includes("data.gov.uk"))?.skip === undefined, "the catalogue page is checkable");
  assert.ok(blockedHosts().has("translink.ca") && blockedHosts().has("ubc.ca") && blockedHosts().has("metoffice.gov.uk"));
  assert.ok(!ts.some((x) => /sydney|melbourne/.test(x.where.join(" "))), "Sydney and Melbourne are not checked (Toronto and London since Ver.1.5.0)");
});
t("each key visa/health/school link has words to look for, so a reachable-but-wrong page is not counted as verified", () => {
  for (const u of ["https://www.gov.uk/student-visa", "https://www.gov.uk/visa-to-study-english", "https://ircc.canada.ca/english/helpcentre/answer.asp?qnum=484&top=15", "https://www2.gov.bc.ca/gov/content/health/accessing-health-care/health-fee-international-students", "https://expressenglishcollege.co.uk", "https://themcacademy.co.uk/", "https://ihvancouver.com/"]) assert.ok(expectFor(u), u);
  const ts = linkTargets(); for (const x of ts.filter((y) => /^(visa|health|school):/.test(y.where[0]))) assert.ok(x.expect, x.url);
});
t("recorded Actions result: every link that is requested has a result, nothing recorded is stale, access denied is kept apart from broken, and no broken link remains in the data", () => {
  const { LINK_STATUS, linkStatusOf } = require("../data/linkStatus") as typeof import("../data/linkStatus");
  const ts = linkTargets(); const urls = new Set(ts.map((x) => x.url));
  for (const x of ts) assert.ok(linkStatusOf(x.url), `no recorded result for ${x.url}`);
  for (const [u] of LINK_STATUS) assert.ok(urls.has(u), `recorded result for a link that is no longer used: ${u}`);
  for (const x of ts) { const r = linkStatusOf(x.url)!; assert.equal(r[1] === "skipped", !!x.skip, x.url); assert.notEqual(r[1], "broken", `broken link in the data: ${x.url}`); }
  const verified = LINK_STATUS.filter((r) => r[1] === "ok" && r[3] === true).length; assert.ok(verified >= 20, "verified links: " + verified);
  assert.ok(LINK_STATUS.every((r) => ["ok", "access-denied", "broken", "skipped", "robots-disallowed"].includes(r[1])), "every recorded verdict is a known kind (access denied / robots are never recorded as broken)");
});
console.log(n, "link check tests passed");
