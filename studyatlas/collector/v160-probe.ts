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
  const CR = /CRICOS[^.]{0,70}/i, ST = /\d+[A-Za-z]?\s[A-Z][a-z]+ (Street|St|Road|Rd|Lane|Avenue)[^.]{0,60}/, LV = /(Level|Suite)\s?\d+[^.]{0,70}(VIC|Victoria)[, ]+\d{4}/i;
  console.log("## M. Melbourne candidates, official sites and government course directories");
  for (const u of ["https://discoverenglish.com.au/", "https://www.discoverenglish.com.au/contact/", "https://cityenglish.edu.au/", "https://cityenglish.edu.au/contact/", "https://impactenglish.edu.au/", "https://langports.edu.au/", "https://search.studyaustralia.gov.au/provider/discover-english/6023706c67eb0679bbb72cc5e3987757", "https://search.studyaustralia.gov.au/provider/city-language-institute/6445438342133f69f3f08e2ca705a750", "https://search.studyaustralia.gov.au/provider/ilsc-melbourne/", "https://coursesearch.studymelbourne.vic.gov.au/provider/city-language-institute/6445438342133f69f3f08e2ca705a750"]) await page(u, [CR, LV, ST, /NEAS|English Australia|accredit[^.]{0,80}/i, /closed|closure|no longer|ceased/i, /General English[^.]{0,80}/i], 100);
  console.log("\n## N. Sydney: ILSC page age, Navitas Sydney age, Study Australia provider directory for the three Sydney schools");
  await page("https://www.ilsc.com/language-schools/destinations/australia/city/sydney", [/Minimum age[^.]{0,60}/i, /Launched[^.]{0,40}/i], 80);
  await page("https://www.navitasenglish.edu.au/school/tour-2/", [/campus[^.]{0,120}/i], 80);
})();
