/* Ver.1.5.1 temporary read-only verification (removed before the PR is final): re-reads the official Toronto and London rent figures and the licence wording. Respects robots.txt, one request at a time, no retries. */
import { makeRobots } from "./robots";
import { fetchBinary, fetchText, htmlToText, postJson, sleep, USER_AGENT } from "./util";
import { extractArea, latestEdition, LONDON, PIPR_PAGE } from "./sources/onsrent";
import { LONDON_RENT_CANDIDATE, TORONTO_RENTS } from "../data/official/cityRents";

const robots = makeRobots((u) => fetchText(u, { accept: "text/plain" }), USER_AGENT);
const log = (...a: unknown[]) => console.log(...a);
async function text(url: string) { const rb = await robots(url); if (!rb.allowed) { log("ROBOTS-DISALLOW", url, rb.reason); return ""; } const r = await fetchText(url); log("PAGE", url, r.status); await sleep(1200); return r.status === 200 ? htmlToText(r.body) : ""; }
const lines = (t: string, re: RegExp, max = 12) => [...new Set(t.split("\n").map((l) => l.trim()).filter((l) => l && l.length < 500 && re.test(l)))].slice(0, max);

async function statcan() {
  const base = "https://www150.statcan.gc.ca/t1/wds/rest"; const PID = 34100133;
  const meta = (await postJson(`${base}/getCubeMetadata`, [{ productId: PID }])) as any; const o = meta[0].object;
  log("CUBE", o.cubeTitleEn, "| frequency", o.frequencyCode, "| releaseTime", o.releaseTime, "| end", o.cubeEndDate);
  const dims = o.dimension; const geo = (id: number) => dims[0].member.find((m: any) => m.memberId === id);
  for (const id of [125, 184]) { const g = geo(id); log("GEO", id, g.memberNameEn, "geoLevel", g.geoLevel, "classificationCode", g.classificationCode); }
  log("STRUCT 3 =", dims[1].member.find((m: any) => m.memberId === 3).memberNameEn);
  log("UNITS", dims[2].member.map((m: any) => `${m.memberId}=${m.memberNameEn}`).join("; "));
  log("FOOTNOTES", JSON.stringify((o.footnote ?? []).slice(0, 12).map((f: any) => f.footnotesEn ?? f)).slice(0, 1500));
  const coords = TORONTO_RENTS.map((r, i) => ({ productId: PID, coordinate: [125, 3, i + 1, 0, 0, 0, 0, 0, 0, 0].join("."), latestN: 2 }));
  const data = (await postJson(`${base}/getDataFromCubePidCoordAndLatestNPeriods`, coords)) as any;
  TORONTO_RENTS.forEach((r, i) => { const d = data[i].object; const pts = d.vectorDataPoint; const latest = pts[pts.length - 1];
    log(`TORONTO ${r.unit}: official ${latest.value} (refPer ${latest.refPer}, released ${latest.releaseTime}, vector v${d.vectorId}, scalarFactor ${latest.scalarFactorCode}, status ${latest.statusCode}) vs site ${r.amount} => ${latest.value === r.amount && String(latest.refPer).startsWith("2025") ? "MATCH" : "MISMATCH"}`); });
}
async function ons() {
  const page = await fetchText(PIPR_PAGE); log("PAGE", PIPR_PAGE, page.status); const ed = latestEdition(page.body); log("EDITION", JSON.stringify(ed)); if (!ed) return;
  const t = htmlToText(page.body); log("OGL-LINES", JSON.stringify(lines(t, /Open Government Licence|Crown copyright|official statistics in development|Contact|Next release/i, 8)));
  await sleep(1500); const file = await fetchBinary(ed.url); log("XLSX", file.status, file.body.length);
  const x = await extractArea(file.body, LONDON);
  log(`LONDON: official ${x.price} (${x.month}, row ${x.row}, area ${x.areaName}, published ${x.published}, definition(new+existing) ${x.definition}, unit(£1) ${x.unit}, status ${x.statisticalStatus}) vs site ${LONDON_RENT_CANDIDATE.value!.amount} => ${x.price === LONDON_RENT_CANDIDATE.value!.amount && x.month.startsWith("2026-08") ? "MATCH" : "MISMATCH (a newer month may have been published)"}`);
}
async function licences() {
  for (const [name, url, re] of [
    ["CMHC licence", "https://www.cmhc-schl.gc.ca/about-us/terms-conditions/hmip-terms-conditions", /licen[cs]e|reproduce|publish|distribute|sell|commercial|attribution|notice|modif|derivative|as is/i],
    ["StatCan open licence", "https://www.statcan.gc.ca/en/terms-conditions/open-licence", /commercial|non-commercial|adapt|modify|attribution|Contains information|exploit|sublicen/i],
    ["StatCan table page", "https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=3410013301", /average rent|Canada Mortgage|survey|October|Reference period|definition|licen/i],
    ["OGL v3.0", "https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/", /copy|publish|distribute|transmit|adapt|exploit|commercially|attribution|acknowledge|Contains public sector information/i],
    ["ONS terms", "https://www.ons.gov.uk/help/termsandconditions", /Open Government Licence|Crown copyright|OGL|commercial|reproduc/i],
  ] as [string, string, RegExp][]) { const t = await text(url); log(`== ${name}\n   ` + lines(t, re).join("\n   ")); }
}
(async () => { for (const f of [statcan, ons, licences]) try { await f(); } catch (e) { log("FAIL", f.name, String(e)); } })();
