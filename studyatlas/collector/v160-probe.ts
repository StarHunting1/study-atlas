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
const ADDR = /\b(NSW|VIC)\s?\d{4}\b/, CRICOS = /CRICOS[^.]{0,40}/i, NEAS = /NEAS|English Australia/i, FEE = /fee|price|tuition/i;
(async () => {
  console.log("## A. Sydney schools");
  for (const u of ["https://www.kaplaninternational.com/language-schools/australia/sydney", "https://www.ef.com/wwen/language-courses/english/sydney/", "https://www.ilsc.com/english-language-schools/sydney", "https://www.navitasenglish.edu.au/", "https://www.sydneyenglishacademy.com/"]) await page(u, [ADDR, CRICOS, NEAS, FEE, /closed|closure|no longer/i]);
  console.log("\n## B. Melbourne schools");
  for (const u of ["https://www.kaplaninternational.com/language-schools/australia/melbourne", "https://www.ef.com/wwen/language-courses/english/melbourne/", "https://www.ilsc.com/english-language-schools/melbourne", "https://www.langports.edu.au/", "https://www.impactenglish.com.au/"]) await page(u, [ADDR, CRICOS, NEAS, FEE, /closed|closure|no longer/i]);
  console.log("\n## C. Registers");
  for (const u of ["https://cricos.education.gov.au/", "https://cricos.education.gov.au/Course/CourseSearch.aspx", "https://www.englishaustralia.com.au/", "https://www.neas.org.au/", "https://www.studyaustralia.gov.au/en"]) await page(u, [/CRICOS/i, /terms|copyright|creative commons/i]);
  console.log("\n## D. Transport");
  for (const u of ["https://transportnsw.info/tickets-opal/opal/fares-payments", "https://transportnsw.info/tickets-opal/opal/fares-payments/fares/opal-fares", "https://transportnsw.info/tickets-opal/concessions", "https://www.ptv.vic.gov.au/tickets/myki/", "https://www.ptv.vic.gov.au/tickets/fares/", "https://www.ptv.vic.gov.au/tickets/concessions/"]) await page(u, [/international student/i, /concession/i, /\$\d+\.\d\d/, /copyright|reproduc/i]);
  console.log("\n## E. Visa / OSHC");
  for (const u of ["https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/student-500", "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/visitor-600", "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/electronic-travel-authority-601", "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/eta-601", "https://www.privatehealth.gov.au/healthinsurance/overseasstudents/", "https://www.studyaustralia.gov.au/en/plan-your-move/health-insurance", "https://www.servicesaustralia.gov.au/medicare-for-visitors-to-australia"]) await page(u, [/OSHC|Overseas Student Health Cover/i, /English language/i, /ELICOS/i]);
  console.log("\n## F. Rent statistics");
  for (const u of ["https://www.abs.gov.au/statistics/people/housing/census-population-and-housing-data-summary", "https://www.abs.gov.au/website-privacy-copyright-and-disclaimer", "https://www.nsw.gov.au/housing-and-construction/rental-forms-surveys-and-data/rent-and-sales-report", "https://www.nsw.gov.au/housing-and-construction/rental-forms-surveys-and-data", "https://www.dffh.vic.gov.au/moving-annual-rents-suburb", "https://www.dffh.vic.gov.au/publications/rental-report", "https://www.vic.gov.au/copyright", "https://data.nsw.gov.au/", "https://discover.data.vic.gov.au/"]) await page(u, [/median/i, /weekly/i, /Creative Commons|CC BY|licen[cs]e|copyright/i, /bond/i]);
  console.log("\nABS Data API:");
  for (const u of ["https://data.api.abs.gov.au/rest/dataflow/ABS?detail=allcompletestubs", "https://data.api.abs.gov.au/rest/data/ABS,C21_G02_GCCSA,1.0.0/all?startPeriod=2021&detail=dataonly&dimensionAtObservation=AllDimensions"]) await page(u, [/Rent/i, /Median/i, /Sydney|Melbourne/i]);
})();
