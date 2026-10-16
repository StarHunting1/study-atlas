/*
 * TEMPORARY (Ver.1.3.5): finds where ECCC publishes the 1991–2020 Canadian Climate Normals (bulk CSV / API) and the station conditions
 * for Vancouver. One request per URL, no retries, robots.txt respected, nothing stored. Never requests metoffice.gov.uk.
 * Removed after the results are recorded.
 */
import { makeRobots } from "./robots";
import { fetchText, htmlToText, sleep, USER_AGENT } from "./util";
const robots = makeRobots((u) => fetchText(u, { accept: "text/plain", retries: 0 }), USER_AGENT);
const short = (t: string, n = 300) => t.replace(/\s+/g, " ").trim().slice(0, n);
const get = async (url: string, accept = "text/html,*/*;q=0.8") => { await sleep(1500); try { return await fetchText(url, { retries: 0, accept }); } catch (e) { return { status: 0, url, contentType: "", body: `ERROR ${(e as Error).message}` }; } };
const ctx = (text: string, re: RegExp, w = 120, max = 4) => [...text.matchAll(new RegExp(re.source, re.flags.includes("g") ? re.flags : re.flags + "g"))].slice(0, max).map((m) => short(text.slice(Math.max(0, (m.index ?? 0) - w), (m.index ?? 0) + m[0].length + w), 2 * w + m[0].length));
const links = (body: string, base: string, re: RegExp) => [...new Set([...body.matchAll(/<(?:a|link)\b[^>]*href="([^"#]+)"[^>]*>/gi)].map((m) => { try { return new URL(m[1].replace(/&amp;/g, "&"), base).toString(); } catch { return ""; } }).filter((u) => u && re.test(u)))].slice(0, 25);
async function html(url: string, res: RegExp[], linkRe: RegExp) {
  const rb = await robots(url); if (!rb.allowed) { console.log(`- ${url}\n  robots: ${rb.reason}`); return null; }
  const r = await get(url); const text = htmlToText(r.body).replace(/\s+/g, " ");
  console.log(`- ${url}\n  ${r.status} → ${r.url} · “${short(/<title[^>]*>([\s\S]*?)<\/title>/i.exec(r.body)?.[1] ?? "", 100)}”`);
  if (r.status !== 200) return null;
  for (const re of res) console.log(`  ${re.source}: ${ctx(text, re).map((x) => `…${x}…`).join(" | ") || "none"}`);
  console.log(`  links: ${links(r.body, r.url, linkRe).join(" ") || "none"}`);
  return r;
}
import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
(async () => {
  console.log("## A3. ECCC 1991–2020 bulk file for British Columbia (one request, robots.txt respected, nothing stored)");
  const url = "https://climate.weather.gc.ca/climate_normals/download/1991_e.html?area=province&province%5B%5D=BC&product%5B%5D=data&product%5B%5D=station_inventory";
  const rb = await robots(url); if (!rb.allowed) { console.log(`robots: ${rb.reason} (not fetched)`); return; }
  await sleep(1500); const res = await fetch(url, { headers: { "user-agent": USER_AGENT } });
  const buf = Buffer.from(await res.arrayBuffer()); console.log(`- ${res.status} ${res.headers.get("content-type")} ${buf.length} bytes; disposition: ${res.headers.get("content-disposition")}`);
  if (res.status !== 200 || buf.subarray(0, 2).toString() !== "PK") { console.log(short(buf.toString("utf8"), 400)); return; }
  const dir = mkdtempSync(join(tmpdir(), "eccc-")); const f = join(dir, "bc.zip"); writeFileSync(f, buf);
  try {
    console.log(execFileSync("unzip", ["-l", f]).toString());
    const names = execFileSync("unzip", ["-Z1", f]).toString().split("\n").filter(Boolean);
    for (const n of names) {
      const txt = execFileSync("unzip", ["-p", f, n], { maxBuffer: 200 * 1024 * 1024 }).toString("latin1"); const lines = txt.split(/\r?\n/);
      console.log(`### ${n}: ${lines.length} lines; header: ${short(lines[0], 600)}`);
      const hits = lines.filter((l) => /VANCOUVER INT|1108447|1108395/i.test(l));
      console.log(`  Vancouver Int'l rows: ${hits.length}`); for (const l of hits.slice(0, /inventory/i.test(n) ? 6 : 140)) console.log("  " + short(l, 420));
    }
  } finally { rmSync(dir, { recursive: true, force: true }); }
})();
