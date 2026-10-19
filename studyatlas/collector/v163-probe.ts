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
  console.log("## A2. ECCC 1991–2020, Ontario bulk file: composite station TORONTO (CITY), the four elements (one request)");
  const url = "https://climate.weather.gc.ca/climate_normals/download/1991_e.html?area=province&province%5B%5D=ON&product%5B%5D=data&product%5B%5D=station_inventory";
  const rb = await robots(url);
  if (!rb.allowed) console.log(`robots: ${rb.reason} (not fetched)`); else {
    await sleep(1500); const res = await fetch(url, { headers: { "user-agent": USER_AGENT } }); const buf = Buffer.from(await res.arrayBuffer());
    console.log(`- ${res.status} ${res.headers.get("content-type")} ${buf.length} bytes`);
    if (res.status === 200 && buf.subarray(0, 2).toString() === "PK") {
      const dir = mkdtempSync(join(tmpdir(), "eccc-")); const f = join(dir, "on.zip"); writeFileSync(f, buf);
      try {
        const n = execFileSync("unzip", ["-Z1", f]).toString().split("\n").filter((x) => /Data\.csv$/.test(x))[0];
        const lines = execFileSync("unzip", ["-p", f, n], { maxBuffer: 400 * 1024 * 1024 }).toString("latin1").split(/\r?\n/);
        const city = lines.filter((l) => l.startsWith('"TORONTO (CITY)"'));
        console.log(`TORONTO (CITY) rows: ${city.length}`);
        for (const l of city) if (/"(Daily Average|Daily Maximum|Daily Minimum|Precipitation|Rainfall|Snowfall) \((.C|mm|cm)\)"/.test(l.replace("Â", ""))) console.log("  " + l);
        console.log("elements present for the normal period: " + [...new Set(city.filter((l) => l.includes('"Normal"')).map((l) => l.split('","')[4]))].join(" ; ").slice(0, 900));
        const pr = lines.filter((l) => l.startsWith('"TORONTO (CITY)"') && /Period|Year|Number of years/i.test(l)); console.log("period/records lines: " + pr.length);
      } finally { rmSync(dir, { recursive: true, force: true }); }
    } else console.log(short(buf.toString("utf8"), 300));
  }
  console.log("\n## B2. Transport for NSW: footer/legal links, tertiary students, concession eligibility wording");
  await page("https://transportnsw.info/tickets-fares", [/Copyright[^.]{0,120}/i, /Creative Commons[^.]{0,160}/i], /copyright|terms|disclaimer|licen|privacy|open data|developer/i);
  await page("https://transportnsw.info/tickets-fares/eligibility-concessions/tertiary-tafe-students", [/international[^.]{0,200}/i, /overseas[^.]{0,200}/i, /CRICOS[^.]{0,200}/i, /full.time[^.]{0,200}/i, /eligible[^.]{0,220}/i, /Student Concession[^.]{0,160}/i]);
  console.log("\n## C2. TTC: legal/footer links, post-secondary student wording, maps");
  await page("https://www.ttc.ca/Fares-and-passes/Fares-types-and-discounts", [/Post-secondary[^.]{0,260}/i, /international[^.]{0,200}/i, /full.time[^.]{0,200}/i, /Youth[^.]{0,100}/i], /map|student|post-secondary|presto|discount/i);
  await page("https://www.ttc.ca/", [/Copyright[^.]{0,120}/i, /Terms[^.]{0,120}/i], /terms|legal|copyright|privacy|open data|map|subway|route/i);
})();
