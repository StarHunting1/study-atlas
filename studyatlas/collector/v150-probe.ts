/* Ver.1.5.0 temporary read-only probe (removed before the PR is finished). Respects robots.txt, one request at a time, no retries beyond util defaults. */
import { makeRobots } from "./robots";
import { fetchBinary, fetchText, postJson, sleep, USER_AGENT } from "./util";
const robotsFor = makeRobots((u) => fetchText(u, { accept: "text/plain" }), USER_AGENT);
import { latestEdition, PIPR_PAGE } from "./sources/onsrent";
import { openWorkbook, sheetRows } from "./sources/xlsx";

const log = (...a: unknown[]) => console.log(...a);
async function statcan() {
  const base = "https://www150.statcan.gc.ca/t1/wds/rest";
  const meta = (await postJson(`${base}/getCubeMetadata`, [{ productId: 34100133 }])) as any;
  const dims = meta[0].object.dimension;
  log("DIMS", dims.map((d: any) => `${d.dimensionNameEn}:${d.member.length}`).join(" | "));
  const geo = dims[0].member.filter((m: any) => /toronto|london|ontario/i.test(m.memberNameEn));
  log("GEO", JSON.stringify(geo.map((m: any) => [m.memberId, m.memberNameEn, m.geoLevel, m.classificationCode])));
  log("STRUCT", JSON.stringify(dims[1].member.map((m: any) => [m.memberId, m.memberNameEn])));
  log("UNITS", JSON.stringify(dims[2].member.map((m: any) => [m.memberId, m.memberNameEn])));
  const toronto = geo.find((m: any) => /^Toronto, Ontario/.test(m.memberNameEn));
  if (!toronto) return;
  const coords = [1, 2, 3, 4].map((u) => ({ productId: 34100133, coordinate: [toronto.memberId, 3, u, 0, 0, 0, 0, 0, 0, 0].join("."), latestN: 3 }));
  const data = (await postJson(`${base}/getDataFromCubePidCoordAndLatestNPeriods`, coords)) as any;
  log("TORONTO", JSON.stringify(data.map((d: any) => d.object?.vectorDataPoint?.map((p: any) => [p.refPer, p.value, p.scalarFactorCode, p.statusCode, p.releaseTime, d.object.vectorId, d.object.coordinate]))));
}
async function ons() {
  const rb = await robotsFor(PIPR_PAGE); log("ONS robots", rb.allowed);
  const page = await fetchText(PIPR_PAGE); const ed = latestEdition(page.body); log("EDITION", JSON.stringify(ed)); if (!ed) return;
  await sleep(1500);
  const file = await fetchBinary(ed.url); log("XLSX", file.status, file.body.length);
  const wb = openWorkbook(file.body); log("SHEETS", Object.keys(wb.sheets).join(","));
  let head: Record<string, string> | undefined; const want = /^(London|Greater London|E12000007|E13000001|E13000002|E09000007|E09000033|E08000003|Camden|Westminster|Inner London|Outer London)$/;
  const out: string[] = []; let latest = "";
  for await (const r of sheetRows(wb, "Table 1")) {
    if (!head && r.r <= 12) { const l = Object.fromEntries(Object.entries(r.cells).filter(([, v]) => typeof v === "string").map(([c, v]) => [String(v).trim(), c])); if (l["Time period"] && l["Area code"]) { head = l; log("HEAD", JSON.stringify(l)); } continue; }
    if (!head) continue;
    const code = String(r.cells[head["Area code"]] ?? ""), name = String(r.cells[head["Area name"]] ?? "");
    const tp = r.cells[head["Time period"]]; if (typeof tp === "number" && String(tp) > latest) latest = String(tp);
    if (want.test(code) || want.test(name)) out.push(JSON.stringify([r.r, tp, code, name, r.cells[head["Region or country name"] ?? ""], r.cells[head["Rental price"]]]));
  }
  log("LATEST_TP", latest); const byKey = new Map<string, string>(); for (const o of out) byKey.set(JSON.parse(o).slice(2, 4).join("|"), o);
  log("ONS_ROWS(last per area)", [...byKey.values()].join("\n"));
  for (const s of ["Cover sheet", "Notes"]) if (wb.sheets[s]) { const t: string[] = []; for await (const r of sheetRows(wb, s)) for (const v of Object.values(r.cells)) if (typeof v === "string") t.push(v); log(`SHEET ${s}:`, t.join(" ¦ ").slice(0, 3500)); }
}
const PAGES = ["https://www.languagescanada.ca/sitemaps/page.xml"];
const TEXT = ["https://www.kaplaninternational.com/language-schools/canada/toronto"];
async function pages() {
  for (const u of PAGES) {
    const rb = await robotsFor(u); if (!rb.allowed) { log("PAGE", u, "robots disallow"); continue; }
    const r = await fetchText(u); const locs = [...r.body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    log("SITEMAP", u, r.status, "locs", locs.length, "\n   " + locs.filter((x) => /listing-directory\/students\/.*(toronto|kaplan|ilac|ef-|english-in-canada|oxford|cic|ils|sprach)/i.test(x)).join("\n   "));
    await sleep(1500);
  }
  for (const u of TEXT) {
    const rb = await robotsFor(u); if (!rb.allowed) continue;
    const r = await fetchText(u);
    const text = r.body.replace(/<(script|style)[\s\S]*?<\/\1>/gi, " ").replace(/<[^>]+>/g, "\n").replace(/&amp;/g, "&").replace(/&nbsp;/g, " ").split("\n").map((l) => l.replace(/\s+/g, " ").trim()).filter(Boolean);
    const k = text.findIndex((l) => /M5E ?1Z4/.test(l)); log("KAPLAN-TORONTO context:", JSON.stringify(text.slice(Math.max(0, k - 8), k + 3)));
    const raw = r.body; const m = /"streetAddress"\s*:\s*"([^"]+)"|addressLocality[^}]{0,200}/i.exec(raw); log("JSONLD", m ? m[0].slice(0, 300) : "none");
    const m2 = /M5E ?1Z4/.exec(raw); log("RAW", m2 ? raw.slice(Math.max(0, m2.index - 300), m2.index + 60).replace(/\s+/g, " ") : "none");
  }
}
(async () => { await pages().catch((e) => log("FAIL", String(e))); })();
