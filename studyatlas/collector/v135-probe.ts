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
  console.log("## A. ECCC climate normals 1991–2020: where is the data?");
  const idx = await html("https://climate.weather.gc.ca/climate_normals/index_e.html", [/1991/i, /bulk|download/i, /composite/i], /bulk|csv|zip|download|normals|inventory/i);
  const bulk = idx ? links(idx.body, idx.url, /bulk|download/i)[0] : undefined;
  if (bulk) await html(bulk, [/1991/i, /csv|zip/i, /Vancouver|British Columbia/i, /station.*inventory|composite/i], /csv|zip|bulk|inventory|BC|british/i);
  console.log("\n## B. GeoMet API: collections about normals, and what a Vancouver record carries");
  const c = await get("https://api.weather.gc.ca/collections?f=json&lang=en", "application/json");
  console.log(`- collections ${c.status}`); try { const j = JSON.parse(c.body); console.log("  " + (j.collections ?? []).filter((x: { id: string; title: string }) => /normal/i.test(x.id + x.title)).map((x: { id: string; title: string }) => `${x.id}: ${x.title}`).join(" | ")); } catch { console.log("  " + short(c.body, 200)); }
  const q = await get("https://api.weather.gc.ca/collections/climate-normals/items?f=json&CLIMATE_IDENTIFIER=1108447&limit=2", "application/json");
  console.log(`- items(1108447) ${q.status}: ${short(q.body, 900)}`);
  const q2 = await get("https://api.weather.gc.ca/collections/climate-normals/items?f=json&CLIMATE_IDENTIFIER=1108395&limit=2", "application/json");
  console.log(`- items(1108395) ${q2.status}: ${short(q2.body, 900)}`);
  console.log("\n## C. ECCC terms for the data");
  await html("https://eccc-msc.github.io/open-data/licence/readme_en/", [/licen[cs]e/i, /commercial/i, /attribution|acknowledg/i], /licen/i);
})();
