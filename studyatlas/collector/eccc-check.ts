/*
 * TEMPORARY (Ver.1.6.3 follow-up): compares the stored Toronto climate candidate with ECCC's own 1991–2020 Ontario CSV, value by value. Read-only: one request for the bulk file and one for the licence page,
 * robots.txt respected, no retries, nothing stored. Never changes any data file. Removed after the result is reported.
 */
import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { makeRobots } from "./robots";
import { fetchText, htmlToText, sleep, USER_AGENT } from "./util";
import { TORONTO_CLIMATE_CANDIDATE as C } from "../data/official/cityClimates";
const robots = makeRobots((u) => fetchText(u, { accept: "text/plain", retries: 0 }), USER_AGENT);
const unq = (s: string) => s.replace(/^"|"$/g, "");
const parse = (line: string) => (line.match(/("([^"]|"")*"|[^,]*)(,|$)/g) ?? []).map((x) => unq(x.replace(/,$/, "")));
(async () => {
  let ok = 0, bad = 0; const check = (name: string, got: unknown, want: unknown) => { const g = JSON.stringify(got), w = JSON.stringify(want); if (g === w) ok++; else { bad++; console.log(`MISMATCH ${name}: ECCC=${g} stored=${w}`); } };
  const url = "https://climate.weather.gc.ca/climate_normals/download/1991_e.html?area=province&province%5B%5D=ON&product%5B%5D=data&product%5B%5D=station_inventory";
  const rb = await robots(url); console.log("robots:", rb.allowed, rb.reason); if (!rb.allowed) return;
  await sleep(1500); const res = await fetch(url, { headers: { "user-agent": USER_AGENT } }); const buf = Buffer.from(await res.arrayBuffer());
  console.log(`bulk file: HTTP ${res.status} ${res.headers.get("content-type")} ${buf.length} bytes; disposition: ${res.headers.get("content-disposition")}`);
  const dir = mkdtempSync(join(tmpdir(), "eccc-")); const f = join(dir, "on.zip"); writeFileSync(f, buf);
  try {
    const names = execFileSync("unzip", ["-Z1", f]).toString().split("\n").filter(Boolean); console.log("files:", names.join(" | "));
    const data = names.find((n) => /Data\.csv$/.test(n))!, inv = names.find((n) => /inventory/i.test(n))!;
    const dl = execFileSync("unzip", ["-p", f, data], { maxBuffer: 400 * 1024 * 1024 }).toString("utf8").replace(/^﻿/, "").split(/\r?\n/);
    const il = execFileSync("unzip", ["-p", f, inv], { maxBuffer: 50 * 1024 * 1024 }).toString("utf8").replace(/^﻿/, "").split(/\r?\n/);
    console.log("data header:", dl[0]); console.log("inventory header:", il[0]);
    const rows = dl.filter((l) => l.startsWith('"TORONTO (CITY)"')).map(parse); console.log("TORONTO (CITY) rows:", rows.length, "; periods present:", [...new Set(rows.map((r) => r[2]))].join(","));
    const get = (el: string) => rows.find((r) => r[2] === "Normal" && r[4].replace(/Â/g, "").replace(/°/g, "°") === el);
    const want: [string, "meanC" | "maxC" | "minC" | "precipMm", "meanC" | "maxC" | "minC" | "precipMm", string][] = [["Daily Average (°C)", "meanC", "meanC", "A"], ["Daily Maximum (°C)", "maxC", "maxC", "A"], ["Daily Minimum (°C)", "minC", "minC", "A"], ["Precipitation (mm)", "precipMm", "precipMm", "C"]];
    for (const [el, k, ak, code] of want) {
      const r = get(el); if (!r) { bad++; console.log(`MISSING row ${el}`); continue; }
      const months = r.slice(5, 17).map(Number); check(`${el} months`, months, C.months.map((m) => m[k]));
      const year = Number(r[17]); const a = C.annual as Record<string, number>; check(`${el} year`, year, a[ak]); check(`${el} quality code`, r[18], code);
      console.log(`  ${el}: ${months.join(", ")} | Year ${r[17]} | Code ${r[18]}`);
    }
    const ir = il.filter((l) => l.startsWith('"TORONTO (CITY)"')).map(parse); console.log("inventory TORONTO (CITY):"); for (const r of ir) console.log("  " + r.join(" | "));
    check("composite station climate IDs", ir.map((r) => r[3]).sort().join("+"), C.stationId); check("normals code", [...new Set(ir.map((r) => r[1]))].join(","), "C");
    check("latitude / longitude", [...new Set(ir.map((r) => `${r[7]},${r[8]}`))].join(";"), `${C.stationInfo!.lat},${C.stationInfo!.lon}`); check("elevation (m)", [...new Set(ir.map((r) => r[9]))].join(";"), String(C.stationInfo!.elevationM));
    const air = il.filter((l) => /PEARSON/i.test(l)).length; console.log("airport composite (TORONTO PEARSON (AIRPORT)) is a separate station in the inventory:", air > 0);
    check("data file belongs to the 1991–2020 normals", /1991.?2020/.test(data) && /1991.?2020/.test(inv), true);
  } finally { rmSync(dir, { recursive: true, force: true }); }
  const lic = "https://eccc-msc.github.io/open-data/licence/readme_en/"; const rb2 = await robots(lic); console.log("licence robots:", rb2.allowed);
  if (rb2.allowed) { await sleep(1500); const r = await fetchText(lic, { retries: 0, accept: "text/html,*/*" }); const t = htmlToText(r.body).replace(/\s+/g, " "); console.log("licence HTTP", r.status, "·", (/Data Services End-use Licence Version [\d.]+ - \w+ \d{4}/.exec(t) ?? ["(version line not found)"])[0], "·", (/including for commercial purposes/.test(t) ? "commercial use: stated" : "commercial use: NOT FOUND"), "·", (/Acknowledge the source/.test(t) ? "attribution: required" : "attribution: NOT FOUND")); }
  console.log(`\nRESULT: ${ok} checks equal, ${bad} mismatches`);
})();
