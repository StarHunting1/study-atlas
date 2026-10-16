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
(async () => {
  console.log("## A. ECCC bulk-download form (1991–2020) and licence attribution");
  const r = await get("https://climate.weather.gc.ca/climate_normals/index_e.html");
  const b = r.body; const i = b.search(/Bulk Data Download of the 1991/i);
  console.log(`- index ${r.status}; bulk section at ${i}`);
  const seg = i >= 0 ? b.slice(i, i + 6000) : "";
  console.log("  forms/inputs/selects:", [...seg.matchAll(/<(form|input|select|option|button|a)\b[^>]*>/gi)].map((m) => short(m[0], 220)).slice(0, 60).join("\n  "));
  console.log("  scripts near:", [...b.matchAll(/<script\b[^>]*src="([^"]*(bulk|normals|download)[^"]*)"/gi)].map((m) => m[1]).join(" ") || "none");
  console.log("  zip/csv urls anywhere:", [...new Set([...b.matchAll(/["'(]([^"'()\s]*(\.zip|bulk_data|bulk_e)[^"'()\s]*)/gi)].map((m) => m[1]))].slice(0, 20).join(" ") || "none");
  const l = await get("https://eccc-msc.github.io/open-data/licence/readme_en/"); const lt = htmlToText(l.body).replace(/\s+/g, " ");
  console.log(`- licence ${l.status}: ${ctx(lt, /Contains information/i, 40, 3).join(" | ")}`); console.log(`  exemptions: ${ctx(lt, /4\. Exemptions/i, 10, 2).join(" | ")} ${short(lt.slice(lt.lastIndexOf("4. Exemptions"), lt.lastIndexOf("4. Exemptions") + 700), 700)}`);
})();
