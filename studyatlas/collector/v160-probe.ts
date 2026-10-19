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
  const ADDR = /\b(NSW|VIC)\s?\d{4}\b/, CR = /CRICOS[^.]{0,60}/i, NE = /NEAS|English Australia/i;
  console.log("## I. schools");
  await links("https://www.kaplaninternational.com/language-schools/australia", /sydney|melbourne|australia\//i);
  for (const u of ["https://www.ilsc.com/language-schools/destinations/australia/city/sydney", "https://www.ilsc.com/language-schools/destinations/australia/city/melbourne"]) await page(u, [ADDR, CR, NE, /fee|price|tuition/i, /age|years old|16\+|17\+/i, /Level \d|Street|Rd\b|Road/i], 90);
  for (const u of ["https://www.navitasenglish.edu.au/school/tour-2/", "https://www.navitasenglish.edu.au/courses/accreditation/", "https://www.navitasenglish.edu.au/apply/fees/", "https://www.navitasenglish.edu.au/courses/general-english/"]) await page(u, [ADDR, CR, NE, /Level \d[^.]{0,60}|Street[^.]{0,40}/i, /\$\d/], 90);
  await links("https://www.ef-australia.com.au/", /sydney|melbourne|english|school|campus/i, 20);
  console.log("\n## J. transport, visa, OSHC");
  await page("https://transportnsw.info/tickets-fares/eligibility-concessions", [/international student/i, /concession[^.]{0,120}/i, /Student/i], 120);
  await page("https://transportnsw.info/tickets-fares/fares", [/Opal[^.]{0,100}/i, /contactless/i, /\$\d/], 100);
  await page("https://transport.vic.gov.au/tickets-and-myki/myki", [/myki[^.]{0,100}/i], 100);
  await page("https://transport.vic.gov.au/tickets-and-myki/fares", [/fare[^.]{0,100}/i, /\$\d/], 100);
  await page("https://www.studyaustralia.gov.au/en/plan-your-move/overseas-student-health-cover-oshc", [/OSHC[^.]{0,200}/i, /compulsory|required|mandatory/i], 120);
  await page("https://www.studyaustralia.gov.au/en/plan-your-move/your-guide-to-visas", [/subclass 500[^.]{0,120}/i, /visitor[^.]{0,150}/i, /ELICOS|English/i], 120);
  await page("https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/visitor-600", [/study[^.]{0,150}/i, /three months|3 months/i], 120);
  await page("https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/electronic-travel-authority-601", [/study[^.]{0,150}/i, /three months|3 months/i], 120);
  await page("https://www.servicesaustralia.gov.au/", [/Medicare/i], 60);
  await page("https://www.nsw.gov.au/housing-and-construction/rental-forms-surveys-and-data/rental-bond-data", [/median[^.]{0,150}/i, /Creative Commons[^.]{0,150}/i, /quarter/i], 120);
})();
