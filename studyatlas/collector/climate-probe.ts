/*
 * TEMPORARY (Ver.1.3.2, second round): re-checks only what the first Actions round could not settle. One request per URL, no retries,
 * robots.txt respected, nothing stored. Never requests metoffice.gov.uk (its terms restrict automated access).
 *  A. fact check: do the pages we paraphrased really state the numbers / periods we wrote? (prints short context around each hit)
 *  B. ECCC: is there a 1991–2020 bulk file or API, and what licence?
 *  C. replacements for the links that failed (English UK directory entry of MC Academy, IRCC eTA page) and the Met Office catalogue entry.
 */
import { makeRobots } from "./robots";
import { fetchText, htmlToText, sleep, USER_AGENT } from "./util";
const robots = makeRobots((u) => fetchText(u, { accept: "text/plain", retries: 0 }), USER_AGENT);
const get = async (url: string, accept = "text/html,*/*;q=0.8") => { await sleep(1500); try { return await fetchText(url, { retries: 0, accept }); } catch (e) { return { status: 0, url, contentType: "", body: `ERROR ${(e as Error).message} ${((e as { cause?: Error }).cause?.message) ?? ""}` }; } };
const short = (t: string, n = 200) => t.replace(/\s+/g, " ").trim().slice(0, n);
const title = (h: string) => short(htmlToText(/<title[^>]*>([\s\S]*?)<\/title>/i.exec(h)?.[1] ?? ""), 100);
async function page(url: string, needles: (string | RegExp)[], ctx = 90) {
  const rb = await robots(url); if (!rb.allowed) { console.log(`- ${url}\n  robots: ${rb.reason} (not fetched)`); return; }
  const r = await get(url); const text = htmlToText(r.body).replace(/\s+/g, " "); console.log(`- ${url}\n  ${r.status} → ${r.url} · “${title(r.body)}”`);
  for (const n of needles) { const re = typeof n === "string" ? new RegExp(n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi") : n; const hits = [...text.matchAll(re)].slice(0, 3).map((m) => text.slice(Math.max(0, (m.index ?? 0) - ctx), (m.index ?? 0) + m[0].length + ctx)); console.log(`  [${String(n)}] ${hits.length ? hits.map((h) => `…${h}…`).join(" | ") : "NOT FOUND"}`); }
  return r;
}
(async () => {
  console.log("## A. fact check (words / numbers on the official pages)");
  await page("https://www.gov.uk/healthcare-immigration-application/how-much-pay", ["£776", "£1,035", /student/i, "6 months"]);
  await page("https://www2.gov.bc.ca/gov/content/health/accessing-health-care/health-fee-international-students", ["$75", "six months", "6 months", /wait/i]);
  await page("https://www.gov.uk/visa-to-study-english", ["11 months", "6 months"]);
  await page("https://www.gov.uk/standard-visitor/visit-to-study", ["6 months"]);
  await page("https://ircc.canada.ca/english/helpcentre/answer.asp?qnum=484&top=15", ["6 months", "six months", "travel document"]);
  await page("https://www.gov.uk/student-visa", ["6 months", "sponsor"]);
  await page("https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada/study-permit.html", ["6 months", "study permit"]);
  console.log("\n## B. ECCC 1991–2020 normals");
  const eccc = await page("https://climate.weather.gc.ca/climate_normals/", ["1991", "bulk", /licen[cs]e/i], 120);
  if (eccc) console.log("  links:", [...eccc.body.matchAll(/href="([^"]+)"/gi)].map((m) => m[1]).filter((h) => /1991|bulk|csv|zip|download|licen|terms/i.test(h)).slice(0, 25).join(" "));
  const bulk = await page("https://climate.weather.gc.ca/climate_normals/bulk_data_e.html", ["1991", "csv", /licen[cs]e/i], 140);
  if (bulk) console.log("  links:", [...bulk.body.matchAll(/(?:href|action)="([^"]+)"/gi)].map((m) => m[1]).slice(0, 40).join(" "));
  for (const q of ["canadian climate normals 1991-2020", "climate normals 1991 2020 station"]) { const r = await get(`https://open.canada.ca/data/api/action/package_search?q=${encodeURIComponent(q)}&rows=6`, "application/json");
    try { for (const p of JSON.parse(r.body).result.results as { title: string; license_title?: string; name: string; resources: { url: string; format: string }[] }[]) console.log(`  CKAN: ${p.title} | ${p.license_title} | ${p.name} | ${p.resources.slice(0, 3).map((x) => x.format + ":" + x.url).join(" ; ")}`); } catch { console.log("  CKAN", q, r.status, short(r.body, 160)); } }
  console.log("\n## C. replacement links and the Met Office catalogue entry");
  await page("https://englishuk.com/member-directory?id=228", ["MC Academy", "Mosley", "Oldham", "website", /homestay/i], 100);
  await page("https://ircc.canada.ca/english/helpcentre/answer.asp?qnum=1289&top=23", ["eTA", "air"], 100);
  const pk = await get("https://data.gov.uk/api/action/package_show?id=uk-climate-averages", "application/json");
  try { const p = JSON.parse(pk.body).result; console.log(`- uk-climate-averages | ${p.title} | licence: ${p.license_title ?? p.license_id} | ${short(p.notes ?? "", 400)} | resources: ${(p.resources ?? []).map((x: { url: string; format: string }) => x.format + ":" + x.url).join(" ; ")}`); } catch { console.log("- package_show", pk.status, short(pk.body, 300)); }
  const pk2 = await get("https://data.gov.uk/api/action/package_show?id=17ba3bbe-0e98-4a8c-9937-bd1d50fdc3c5", "application/json");
  try { const p = JSON.parse(pk2.body).result; console.log(`- historic station data | ${p.name} | licence: ${p.license_title ?? p.license_id}`); } catch { console.log("- package_show 17ba", pk2.status); }
})();
