/*
 * TEMPORARY (Ver.1.6.3): reads public sources for climate normals (ECCC bulk file for Ontario, BoM pages) and transport-card facts (TTC, Transport for NSW) plus their terms.
 * One request per URL, 1.5 s apart, no retries, robots.txt respected, nothing stored. Never requests metoffice.gov.uk, tfl.gov.uk or transport.vic.gov.au (rights records / bot checks).
 * Removed before the PR.
 */
import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { makeRobots } from "./robots";
import { fetchText, htmlToText, sleep, USER_AGENT } from "./util";
const robots = makeRobots((u) => fetchText(u, { accept: "text/plain", retries: 0 }), USER_AGENT);
const short = (t: string, n = 300) => t.replace(/\s+/g, " ").trim().slice(0, n);
const ctx = (text: string, re: RegExp, w = 110, max = 3) => [...text.matchAll(new RegExp(re.source, re.flags.includes("g") ? re.flags : re.flags + "g"))].slice(0, max).map((m) => short(text.slice(Math.max(0, (m.index ?? 0) - w), (m.index ?? 0) + m[0].length + w), 2 * w + m[0].length));
const links = (body: string, base: string, re: RegExp, max = 30) => [...new Set([...body.matchAll(/<a\b[^>]*href="([^"#]+)"[^>]*>([\s\S]*?)<\/a>/gi)].filter((m) => re.test(m[1] + " " + htmlToText(m[2]))).map((m) => { try { return new URL(m[1].replace(/&amp;/g, "&"), base).toString() + " [" + short(htmlToText(m[2]), 40) + "]"; } catch { return ""; } }).filter(Boolean))].slice(0, max);
async function page(url: string, res: RegExp[], linkRe?: RegExp, w = 110) {
  const rb = await robots(url); if (!rb.allowed) { console.log(`- ${url}\n  robots: ${rb.reason} (not fetched)`); return; }
  await sleep(1500); let r; try { r = await fetchText(url, { retries: 0, accept: "text/html,*/*;q=0.8" }); } catch (e) { console.log(`- ${url}\n  ERROR ${(e as Error).message}`); return; }
  const text = htmlToText(r.body).replace(/\s+/g, " ");
  console.log(`- ${url}\n  ${r.status} → ${r.url} · “${short(/<title[^>]*>([\s\S]*?)<\/title>/i.exec(r.body)?.[1] ?? "", 100)}”`);
  if (r.status !== 200) return;
  for (const re of res) { const h = ctx(text, re, w, 2); console.log(`  ${re.source.slice(0, 40)}: ${h.length ? h.map((x) => `…${x}…`).join(" | ") : "none"}`); }
  if (linkRe) console.log("  links:\n    " + (links(r.body, r.url, linkRe).join("\n    ") || "none"));
}
(async () => {
  console.log("## A. ECCC 1991–2020 normals, bulk file for Ontario (one request)");
  const url = "https://climate.weather.gc.ca/climate_normals/download/1991_e.html?area=province&province%5B%5D=ON&product%5B%5D=data&product%5B%5D=station_inventory";
  const rb = await robots(url);
  if (!rb.allowed) console.log(`robots: ${rb.reason} (not fetched)`); else {
    await sleep(1500); const res = await fetch(url, { headers: { "user-agent": USER_AGENT } }); const buf = Buffer.from(await res.arrayBuffer());
    console.log(`- ${res.status} ${res.headers.get("content-type")} ${buf.length} bytes`);
    if (res.status === 200 && buf.subarray(0, 2).toString() === "PK") {
      const dir = mkdtempSync(join(tmpdir(), "eccc-")); const f = join(dir, "on.zip"); writeFileSync(f, buf);
      try {
        for (const n of execFileSync("unzip", ["-Z1", f]).toString().split("\n").filter(Boolean)) {
          const lines = execFileSync("unzip", ["-p", f, n], { maxBuffer: 400 * 1024 * 1024 }).toString("latin1").split(/\r?\n/);
          console.log(`### ${n}: ${lines.length} lines; header: ${short(lines[0], 700)}`);
          const hits = lines.filter((l) => /TORONTO/i.test(l)); const inv = /inventory/i.test(n);
          console.log(`  TORONTO rows: ${hits.length}`);
          if (inv) for (const l of hits.slice(0, 20)) console.log("  " + short(l, 400));
          else { const names = [...new Set(hits.map((l) => l.split(",").slice(0, 4).join("|")))]; console.log("  stations in data file: " + names.slice(0, 12).join(" ;; ")); for (const l of hits.filter((x) => /TORONTO (CITY|INTL|PEARSON|CITY CENTRE)/i.test(x)).slice(0, 150)) console.log("  " + short(l, 330)); }
        }
      } finally { rmSync(dir, { recursive: true, force: true }); }
    } else console.log(short(buf.toString("utf8"), 300));
  }
  console.log("\n## B. Bureau of Meteorology: terms and climate-statistics pages");
  await page("https://www.bom.gov.au/other/copyright.shtml", [/Creative Commons[^.]{0,200}/i, /commercial[^.]{0,150}/i, /automated|scrap|robot/i], /licen|creative|copyright|terms|data/i);
  for (const u of ["https://www.bom.gov.au/climate/averages/tables/cw_066062.shtml", "https://www.bom.gov.au/climate/averages/tables/cw_086071.shtml", "https://www.bom.gov.au/climate/averages/tables/cw_066037.shtml", "https://www.bom.gov.au/climate/averages/tables/cw_086282.shtml"]) await page(u, [/Statistics[^.]{0,120}/i, /1991[^.]{0,80}/i, /Mean maximum temperature[^A-Za-z]{0,120}/i, /Mean rainfall[^A-Za-z]{0,120}/i], undefined, 90);
  console.log("\n## C. TTC");
  await page("https://www.ttc.ca/fares-and-passes", [/PRESTO[^.]{0,160}/i, /contactless[^.]{0,140}/i, /student[^.]{0,160}/i, /zone|flat fare/i, /\$\d+\.\d\d/], /map|fare|presto|concession|student|payment/i);
  await page("https://www.ttc.ca/terms-of-use", [/copyright[^.]{0,200}/i, /reproduc[^.]{0,160}/i, /licen[cs]e[^.]{0,160}/i], /licen|terms|open data|copyright/i);
  console.log("\n## D. Transport for NSW");
  await page("https://transportnsw.info/tickets-fares/fares", [/Opal card[^.]{0,160}/i, /zone|distance|band/i, /Opal network map|map/i], /map|opal|concession|fare|student|payment/i);
  await page("https://transportnsw.info/tickets-fares/eligibility-concessions", [/Tertiary[^.]{0,200}/i, /international[^.]{0,200}/i, /apply[^.]{0,160}/i], /student|tertiary|international|concession/i);
  await page("https://transportnsw.info/copyright", [/Creative Commons[^.]{0,200}/i, /copyright[^.]{0,200}/i, /reproduc[^.]{0,160}/i], /licen|creative|copyright|terms|data/i);
  await page("https://transportnsw.info/about-us/terms-of-use", [/Creative Commons[^.]{0,200}/i, /copyright[^.]{0,200}/i], /licen|creative|copyright|terms|data/i);
})();
