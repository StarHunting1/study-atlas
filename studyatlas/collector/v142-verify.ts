/*
 * TEMPORARY (Ver.1.4.2): checks the stored Vancouver 1991–2020 normals against ECCC's own bulk CSV (British Columbia, one request, robots.txt respected,
 * no retries, nothing stored). Prints a match / mismatch table for the 48 monthly values, the annual values, the station rows (climate IDs 1108447 / 1108395)
 * and the licence lines. Removed after the results are recorded.
 */
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { makeRobots } from "./robots";
import { fetchText, sleep, USER_AGENT } from "./util";
import official from "../data/official/vancouver";
const robots = makeRobots((u) => fetchText(u, { accept: "text/plain", retries: 0 }), USER_AGENT);
const short = (t: string, n = 300) => t.replace(/\s+/g, " ").trim().slice(0, n);
const csv = (line: string) => { const out: string[] = []; let cur = "", q = false; for (const ch of line) { if (ch === '"') q = !q; else if (ch === "," && !q) { out.push(cur); cur = ""; } else cur += ch; } out.push(cur); return out.map((x) => x.trim()); };
const num = (s: string) => (s !== "" && /^-?\d+(\.\d+)?$/.test(s) ? Number(s) : NaN);
const alt = official.climateAlt!;
const MO = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const ours: Record<string, number[]> = { "Daily Average": alt.months.map((m) => m.meanC!), "Daily Maximum": alt.months.map((m) => m.maxC!), "Daily Minimum": alt.months.map((m) => m.minC!), "Precipitation": alt.months.map((m) => m.precipMm!) };
(async () => {
  console.log("## 1. ECCC bulk CSV (British Columbia, 1991–2020) vs stored values");
  const url = "https://climate.weather.gc.ca/climate_normals/download/1991_e.html?area=province&province%5B%5D=BC&product%5B%5D=data&product%5B%5D=station_inventory";
  const rb = await robots(url); if (!rb.allowed) { console.log(`robots: ${rb.reason} (not fetched)`); return; }
  await sleep(1500); const res = await fetch(url, { headers: { "user-agent": USER_AGENT } }); const buf = Buffer.from(await res.arrayBuffer());
  console.log(`- HTTP ${res.status} ${res.headers.get("content-type")} ${buf.length} bytes`);
  if (res.status !== 200 || buf.subarray(0, 2).toString() !== "PK") { console.log(short(buf.toString("utf8"), 400)); return; }
  const dir = mkdtempSync(join(tmpdir(), "eccc-")); const f = join(dir, "bc.zip"); writeFileSync(f, buf);
  try {
    const names = execFileSync("unzip", ["-Z1", f]).toString().split("\n").filter(Boolean); console.log("- files:", names.join(", "));
    let ok = 0, bad = 0, found = 0;
    for (const n of names) {
      const lines = execFileSync("unzip", ["-p", f, n], { maxBuffer: 300 * 1024 * 1024 }).toString("latin1").split(/\r?\n/);
      const head = csv(lines[0]); console.log(`### ${n}: ${lines.length} lines; header: ${short(lines[0], 700)}`);
      if (/inventory/i.test(n)) { for (const l of lines.filter((x) => /VANCOUVER INT|1108447|1108395/i.test(x)).slice(0, 12)) console.log("  INV " + short(l, 500)); continue; }
      const rows = lines.filter((l) => /VANCOUVER INTERNATIONAL \(AIRPORT\)|1108447|1108395/i.test(l)); console.log(`  Vancouver rows: ${rows.length}`);
      const col = (name: string) => head.findIndex((h) => h.replace(/^\uFEFF|^ï»¿/, "").replace(/"/g, "").toUpperCase() === name);
      const iEl = col("NORMALS_ELEMENT"), iGrp = col("ELEMENT_GROUP"), iPer = col("PERIOD_OF_RECORD"), iJan = col("JAN"), iYear = col("YEAR"), iCode = col("CODE");
      console.log(`  columns: element=${iEl} group=${iGrp} period=${iPer} jan=${iJan} year=${iYear} code=${iCode}`);
      const wanted: Record<string, string> = { "Daily Average": "Daily Average", "Daily Maximum": "Daily Maximum", "Daily Minimum": "Daily Minimum", "Precipitation": "Precipitation" };
      for (const l of rows) {
        const c = csv(l); const el = c[iEl] ?? ""; const grp = c[iGrp] ?? ""; const per = c[iPer] ?? "";
        if (/Normal/i.test(per) === false && !/^Normal$/i.test(per)) { /* period-of-record column differs per file; keep going */ }
        const key = Object.keys(wanted).find((k) => el.toLowerCase().startsWith(k.toLowerCase()) && !/days|extreme|rainfall|snow|date/i.test(el));
        if (!key || !/Temperature|Precipitation/i.test(grp)) { if (/Temperature|Precipitation/i.test(grp)) console.log(`  (not compared) ${grp} / ${el} [${per}]`); continue; }
        const vals = c.slice(iJan, iJan + 12).map(num); const year = num(c[iYear]); const code = c[iCode];
        found++; const diffs = vals.map((v, i) => (Math.abs(v - ours[key][i]) < 0.005 ? "" : `${MO[i]}: ECCC ${v} vs ours ${ours[key][i]}`)).filter(Boolean);
        const sum = Number(vals.reduce((a, b) => a + b, 0).toFixed(1)); const mean = Number((vals.reduce((a, b) => a + b, 0) / 12).toFixed(2));
        if (diffs.length) bad++; else ok++;
        console.log(`  ELEMENT "${el}" [${grp} / ${c[iPer]}]: ${diffs.length ? "MISMATCH " + diffs.join("; ") : "all 12 monthly values match"}; ECCC annual=${year}; sum of months=${sum}; mean of months=${mean}; code=${code}`);
        console.log(`    ECCC monthly: ${vals.join(", ")}`);
      }
    }
    console.log(`\nSUMMARY: rows compared ${found}; all-match ${ok}; with differences ${bad}`);
  } finally { rmSync(dir, { recursive: true, force: true }); }
  console.log("\n## 2. ECCC licence page (attribution and commercial use)");
  const lic = "https://eccc-msc.github.io/open-data/licence/readme_en/"; const lr = await robots(lic);
  if (!lr.allowed) console.log(`robots: ${lr.reason}`); else { await sleep(1500); const r = await fetchText(lic, { retries: 0 }); const t = r.body.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
    console.log(`- ${r.status}`); for (const re of [/Version [\d.]+/i, /commercial/i, /Contains information licen[cs]ed/i, /attribution|acknowledg/i]) { const m = re.exec(t); console.log(`  ${re.source}: ${m ? "…" + short(t.slice(Math.max(0, m.index - 150), m.index + 300), 450) + "…" : "none"}`); } }
})();
