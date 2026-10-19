/*
 * TEMPORARY (Ver.1.6.0): reads public pages needed to list Sydney/Melbourne language schools, transport links, visa/OSHC links and public rent statistics.
 * One request at a time, 1.5 s apart, no retries, robots.txt respected, nothing stored. Removed after the results are recorded.
 */
import { makeRobots } from "./robots";
import { fetchText, htmlToText, sleep, USER_AGENT } from "./util";
const robots = makeRobots((u) => fetchText(u, { accept: "text/plain", retries: 0 }), USER_AGENT);
const short = (t: string, n = 220) => t.replace(/\s+/g, " ").trim().slice(0, n);
const ctx = (text: string, re: RegExp, w = 90, max = 3) => [...text.matchAll(new RegExp(re.source, re.flags.includes("g") ? re.flags : re.flags + "g"))].slice(0, max).map((m) => short(text.slice(Math.max(0, (m.index ?? 0) - w), (m.index ?? 0) + m[0].length + w), 2 * w + m[0].length));
async function page(url: string, res: RegExp[], w = 100) {
  const rb = await robots(url); if (!rb.allowed) { console.log(`- ${url}\n  robots: ${rb.reason} (not fetched)`); return; }
  await sleep(1500);
  let r; try { r = await fetchText(url, { retries: 0, accept: "text/html,application/json,*/*;q=0.8" }); } catch (e) { console.log(`- ${url}\n  ERROR ${(e as Error).message}`); return; }
  const text = htmlToText(r.body).replace(/\s+/g, " ");
  console.log(`- ${url}\n  ${r.status} → ${r.url} · ${r.contentType} · “${short(/<title[^>]*>([\s\S]*?)<\/title>/i.exec(r.body)?.[1] ?? "", 110)}”`);
  if (r.status !== 200) return;
  for (const re of res) { const h = ctx(text, re, w, 2); console.log(`  ${re.source}: ${h.length ? h.map((x) => `…${x}…`).join(" | ") : "none"}`); }
}
const links = async (url: string, re: RegExp, max = 25) => {
  const rb = await robots(url); if (!rb.allowed) { console.log(`- ${url}\n  robots: ${rb.reason}`); return; }
  await sleep(1500);
  let r; try { r = await fetchText(url, { retries: 0, accept: "text/html,*/*;q=0.8" }); } catch (e) { console.log(`- ${url}\n  ERROR ${(e as Error).message}`); return; }
  console.log(`- ${url}\n  ${r.status} → ${r.url} · “${short(/<title[^>]*>([\s\S]*?)<\/title>/i.exec(r.body)?.[1] ?? "", 100)}”`);
  const hs = [...new Set([...r.body.matchAll(/<a\b[^>]*href="([^"#]+)"[^>]*>([\s\S]*?)<\/a>/gi)].filter((m) => re.test(m[1] + " " + htmlToText(m[2]))).map((m) => { try { return new URL(m[1].replace(/&amp;/g, "&"), r.url).toString() + " [" + short(htmlToText(m[2]), 40) + "]"; } catch { return ""; } }).filter(Boolean))];
  console.log("  links:", hs.slice(0, max).join("\n         ") || "none");
};
(async () => {
  console.log("## G. link discovery");
  await links("https://www.kaplaninternational.com/language-schools", /australia|sydney|melbourne/i);
  await links("https://www.kaplaninternational.com/", /australia|sydney|melbourne/i);
  await links("https://www.ef.com/wwen/", /australia|sydney|melbourne/i);
  await links("https://www.ilsc.com/", /australia|sydney|melbourne/i);
  await links("https://www.navitasenglish.edu.au/", /sydney|melbourne|campus|fees|location|courses|general/i, 40);
  await links("https://www.studyaustralia.gov.au/en", /health|insur|oshc|visa|cost|live/i, 40);
  await links("https://transportnsw.info/tickets-fares", /opal|fare|concession|student|international/i, 40);
  await links("https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/student-500", /oshc|health|english|visitor|elicos/i, 30);
  await links("https://www.abs.gov.au/website-privacy-copyright-and-disclaimer", /creative|licen|attribution|cc/i);
  await links("https://www.nsw.gov.au/housing-and-construction/rental-forms-surveys-and-data", /rent|bond|data|report|check/i, 40);
  console.log("\n## H. text checks");
  await page("https://www.abs.gov.au/website-privacy-copyright-and-disclaimer", [/Creative Commons Attribution[^.]{0,200}/i, /commercial[^.]{0,150}/i, /Attribution 4\.0[^.]{0,100}/i], 150);
  await page("https://www.abs.gov.au/census/find-census-data/quickstats/2021/1GSYD", [/Median weekly rent[^A-Za-z]{0,40}/i, /Greater Sydney/i], 120);
  await page("https://www.abs.gov.au/census/find-census-data/quickstats/2021/2GMEL", [/Median weekly rent[^A-Za-z]{0,40}/i, /Greater Melbourne/i], 120);
  await page("https://www.vic.gov.au/copyright", [/Creative Commons[^.]{0,200}/i, /Attribution[^.]{0,150}/i], 150);
  await page("https://data.gov.au/data/api/3/action/package_search?q=cricos&rows=5", [/"title":"[^"]{0,100}"/i, /"license_title":"[^"]{0,60}"/i], 60);
})();
