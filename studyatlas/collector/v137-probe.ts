/*
 * TEMPORARY (Ver.1.3.7): reads the official terms/docs of the candidate map-tile providers (OpenFreeMap, VersaTiles) and checks that their style, TileJSON and one
 * world tile answer (with the CORS header a browser needs). One request per URL, no retries, robots.txt respected for HTML pages, nothing stored. Removed after the results are recorded.
 */
import { makeRobots } from "./robots";
import { fetchText, htmlToText, sleep, USER_AGENT } from "./util";
const robots = makeRobots((u) => fetchText(u, { accept: "text/plain", retries: 0 }), USER_AGENT);
const short = (t: string, n = 300) => t.replace(/\s+/g, " ").trim().slice(0, n);
const ctx = (text: string, re: RegExp, w = 130, max = 3) => [...text.matchAll(new RegExp(re.source, re.flags.includes("g") ? re.flags : re.flags + "g"))].slice(0, max).map((m) => short(text.slice(Math.max(0, (m.index ?? 0) - w), (m.index ?? 0) + m[0].length + w), 2 * w + m[0].length));
async function page(url: string, res: RegExp[]) {
  const rb = await robots(url); if (!rb.allowed) { console.log(`- ${url}\n  robots: ${rb.reason} (not fetched)`); return; }
  await sleep(1500); let r; try { r = await fetchText(url, { retries: 0, accept: "text/html,*/*;q=0.8" }); } catch (e) { console.log(`- ${url}\n  ERROR ${(e as Error).message}`); return; }
  const text = htmlToText(r.body).replace(/\s+/g, " "); console.log(`- ${url}\n  ${r.status} · “${short(/<title[^>]*>([\s\S]*?)<\/title>/i.exec(r.body)?.[1] ?? "", 90)}” (${text.length} chars)`);
  for (const re of res) console.log(`  ${re.source}: ${ctx(text, re).map((x) => `…${x}…`).join(" | ") || "none"}`);
}
async function raw(url: string, show = 400) {
  await sleep(1500); try {
    const r = await fetch(url, { headers: { "user-agent": USER_AGENT, origin: "https://studyatlas.example" } }); const b = Buffer.from(await r.arrayBuffer());
    console.log(`- ${url}\n  ${r.status} ${r.headers.get("content-type")} ${b.length}B · ACAO=${r.headers.get("access-control-allow-origin")} · cache=${r.headers.get("cache-control")} · enc=${r.headers.get("content-encoding")}`);
    if (show && /json|text/.test(r.headers.get("content-type") ?? "")) console.log("  " + short(b.toString("utf8"), show)); return r.status === 200 ? b : null;
  } catch (e) { console.log(`- ${url}\n  ERROR ${(e as Error).message}`); return null; }
}
const TERMS = [/commercial/i, /free/i, /attribution|credit/i, /limit|rate|fair use|abuse|ban|block/i, /api key|account|regist/i, /donat|sponsor|SLA|guarantee/i];
(async () => {
  console.log("## A. OpenFreeMap: official pages");
  await page("https://openfreemap.org/", TERMS); await page("https://openfreemap.org/tos/", [/commercial/i, /attribution/i, /limit|abuse|ban|block|fair/i, /liab|warrant|as is/i, /free/i]); await page("https://openfreemap.org/quick_start/", [/attribution/i, /style/i, /liberty|positron|bright/i]);
  console.log("\n## B. OpenFreeMap: does it answer (style, TileJSON, one tile)?");
  const st = await raw("https://tiles.openfreemap.org/styles/positron", 0);
  if (st) { const j = JSON.parse(st.toString("utf8")); console.log(`  style: sources=${JSON.stringify(Object.fromEntries(Object.entries(j.sources ?? {}).map(([k, v]) => [k, (v as { url?: string }).url ?? "inline"])))} glyphs=${j.glyphs} sprite=${j.sprite} layers=${j.layers?.length}`); }
  const tj = await raw("https://tiles.openfreemap.org/planet", 700);
  try { const j = JSON.parse((tj ?? Buffer.from("{}")).toString("utf8")); const tpl: string | undefined = j.tiles?.[0]; console.log(`  tilejson: attribution=${j.attribution} minzoom=${j.minzoom} maxzoom=${j.maxzoom} tiles=${tpl}`); if (tpl) await raw(tpl.replace("{z}", "2").replace("{x}", "1").replace("{y}", "1"), 0); } catch { console.log("  (no TileJSON)"); }
  console.log("\n## C. VersaTiles: official docs and endpoint");
  await page("https://docs.versatiles.org/guides/use_tiles.versatiles.org.html", [/free/i, /attribution|credit/i, /commercial/i, /limit|fair|guarantee|24/i, /cdn|cache/i]); await page("https://versatiles.org/", [/free/i, /commercial/i, /attribution/i]);
  await raw("https://tiles.versatiles.org/assets/styles/colorful/style.json", 0); await raw("https://tiles.versatiles.org/tiles/osm/2/1/1", 0);
})();
