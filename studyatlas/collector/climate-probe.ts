/*
 * TEMPORARY (Ver.1.3.2): finds out whether 1991–2020 climate normals are available from the official sources and under which licence.
 * Reads only: ECCC GeoMet (open OGC API) and the data.gov.uk CKAN search (open API). Nothing on metoffice.gov.uk is requested (its terms restrict automated access). One request per URL,
 * no retries. Nothing is stored. Removed once the answer is recorded in RELEASE_DATA_AUDIT.md.
 */
import { fetchText, sleep } from "./util";
const get = async (url: string, accept = "application/json") => { await sleep(1200); try { const r = await fetchText(url, { retries: 0, accept }); return r; } catch (e) { return { status: 0, url, contentType: "", body: `ERROR ${(e as Error).message} ${((e as { cause?: Error }).cause?.message) ?? ""}` }; } };
const show = (t: string, n = 1500) => t.replace(/\s+/g, " ").slice(0, n);
(async () => {
  console.log("## ECCC climate normals");
  const meta = await get("https://api.weather.gc.ca/collections/climate-normals?f=json"); console.log("collection", meta.status, show(meta.body, 1200));
  const all = await get("https://api.weather.gc.ca/collections?f=json&limit=400"); try { const ids = (JSON.parse(all.body).collections as { id: string; title?: string }[]).map((c) => c.id).filter((i) => /normal/i.test(i)); console.log("normals collections:", ids.join(", ")); } catch { console.log("collections list", all.status, show(all.body, 200)); }
  for (const nid of [1, 56]) { const j = await get(`https://api.weather.gc.ca/collections/climate-normals/items?f=json&CLIMATE_IDENTIFIER=1108447&NORMAL_ID=${nid}&limit=50`);
    try { const fs = JSON.parse(j.body).features as { properties: Record<string, unknown> }[]; const per = [...new Set(fs.map((f) => `${f.properties.PERIOD_BEGIN}-${f.properties.PERIOD_END}|${f.properties.DATE_CALCULATED}|${f.properties.STATION_NAME}`))]; console.log(`NORMAL_ID ${nid}: ${fs.length} features; periods/stations:`, per.join("; ")); console.log("keys:", Object.keys(fs[0]?.properties ?? {}).join(",")); } catch { console.log("items", j.status, show(j.body, 300)); } }
  const st = await get("https://api.weather.gc.ca/collections/climate-normals/items?f=json&STATION_NAME=VANCOUVER%20INTL%20A&limit=5"); console.log("by name", st.status, show(st.body, 400));
  console.log("\n## data.gov.uk – Met Office 1991–2020 averages");
  for (const q of ["met office climate averages 1991-2020", "UK climate averages station 1991-2020"]) { const r = await get(`https://data.gov.uk/api/action/package_search?q=${encodeURIComponent(q)}&rows=8`);
    try { const res = JSON.parse(r.body).result.results as { title: string; name: string; license_title?: string; organization?: { title: string }; resources: { url: string; format: string }[] }[]; for (const p of res) console.log(`- ${p.title} | ${p.organization?.title} | ${p.license_title} | ${p.name} | ${p.resources.slice(0, 3).map((x) => x.format + ":" + x.url).join(" ; ")}`); } catch { console.log(q, r.status, show(r.body, 300)); } }
  // The Met Office website terms forbid robots / scraping of its site except for APIs it provides (rights record "metoffice-station-data"),
  // so NO metoffice.gov.uk page or file is requested here: only the catalogue metadata above (data.gov.uk API) is read.
})();
