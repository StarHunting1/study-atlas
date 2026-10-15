/*
 * TEMPORARY (Ver.1.3.4): re-reads the government pages behind the approval record for conditions/exceptions, and looks for the
 * reuse terms of the five displayed language schools' websites. One request per URL, no retries, robots.txt respected, nothing stored.
 * Fee pages are NOT read (no figure is collected); only their terms. Removed after the results are recorded.
 */
import { makeRobots } from "./robots";
import { fetchText, htmlToText, sleep, USER_AGENT } from "./util";
const robots = makeRobots((u) => fetchText(u, { accept: "text/plain", retries: 0 }), USER_AGENT);
const short = (t: string, n = 260) => t.replace(/\s+/g, " ").trim().slice(0, n);
const get = async (url: string) => { await sleep(1500); try { return await fetchText(url, { retries: 0, accept: "text/html,*/*;q=0.8" }); } catch (e) { return { status: 0, url, contentType: "", body: `ERROR ${(e as Error).message}` }; } };
const ctx = (text: string, re: RegExp, w = 110, max = 3) => [...text.matchAll(new RegExp(re.source, re.flags.includes("g") ? re.flags : re.flags + "g"))].slice(0, max).map((m) => short(text.slice(Math.max(0, (m.index ?? 0) - w), (m.index ?? 0) + m[0].length + w), 2 * w + m[0].length));
async function page(url: string, res: RegExp[], w = 110, max = 3) {
  const rb = await robots(url); if (!rb.allowed) { console.log(`- ${url}\n  robots: ${rb.reason} (not fetched)`); return null; }
  const r = await get(url); const text = htmlToText(r.body).replace(/\s+/g, " ");
  console.log(`- ${url}\n  ${r.status} → ${r.url} · “${short(/<title[^>]*>([\s\S]*?)<\/title>/i.exec(r.body)?.[1] ?? "", 100)}”`);
  if (r.status !== 200) return null;
  for (const re of res) { const h = ctx(text, re, w, max); console.log(`  ${re.source}: ${h.length ? h.map((x) => `…${x}…`).join(" | ") : "none"}`); }
  return r;
}
const TERMS = [/copyright/i, /reproduc|republish|redistribut/i, /all rights reserved/i, /permission/i];
(async () => {
  console.log("## A. Government pages: conditions and exceptions");
  await page("https://www.gov.uk/standard-visitor/visit-to-study", [/6 months/i, /accredited/i, /electronic travel|ETA/i, /work/i], 120, 2);
  await page("https://www.gov.uk/visa-to-study-english", [/£\d+/, /6 months/i, /11 months/i, /16|18/, /Check if you need/i], 120, 3);
  await page("https://www.gov.uk/student-visa", [/licensed student sponsor/i, /£\d+/, /16/, /outside the UK|inside the UK/i], 120, 2);
  await page("https://www.gov.uk/healthcare-immigration-application/how-much-pay", [/£776/, /£1,035/, /£388|half/i, /6 months/i, /under 18|18/i, /exempt|do not need to pay/i], 140, 3);
  await page("https://www.gov.uk/check-uk-visa", [/nationality/i, /Check if you need/i], 100, 2);
  await page("https://ircc.canada.ca/english/helpcentre/answer.asp?qnum=484&top=15", [/study permit/i, /6 months/i, /exempt|exception/i, /travel document|eTA/i], 140, 3);
  await page("https://ircc.canada.ca/english/helpcentre/answer.asp?qnum=1289&top=23", [/eTA/i, /visa-exempt/i, /by air|car, bus/i, /study permit/i], 140, 3);
  await page("https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada/study-permit.html", [/\$ ?CAN ?\d+|\$\d+/, /6 months/i, /do(n't| not) need/i], 140, 3);
  await page("https://www2.gov.bc.ca/gov/content/health/accessing-health-care/health-fee-international-students", [/\$75/, /6 months|six months/i, /valid study permit/i, /wait/i, /exempt|not required|do not/i, /private insurance/i], 150, 3);
  console.log("\n## B. Language school websites: reuse terms (homepage footer → terms/legal pages; fee pages are not read)");
  for (const home of ["https://ihmanchester.com/", "https://www.kaplaninternational.com/language-schools/united-kingdom/manchester", "https://expressenglishcollege.co.uk/", "https://ihvancouver.com/", "https://www.ef.com/ca/ilsd/schools/vancouver/"]) {
    const r = await page(home, [/©[^.]{0,80}|copyright[^.]{0,80}/i, /all rights reserved/i], 60, 2);
    if (!r) continue;
    const links = [...new Set([...r.body.matchAll(/<a\b[^>]*href="([^"#]+)"[^>]*>([\s\S]*?)<\/a>/gi)].filter((m) => /terms|conditions|legal|copyright|website-use|disclaimer|privacy|imprint/i.test(m[1] + " " + htmlToText(m[2]))).map((m) => { try { return new URL(m[1].replace(/&amp;/g, "&"), r.url).toString(); } catch { return ""; } }).filter((u) => u && new URL(u).host.replace(/^www\./, "") === new URL(r.url).host.replace(/^www\./, "")))].slice(0, 4);
    console.log(`  terms-like links: ${links.join(" ") || "none"}`);
    for (const u of links.filter((x) => !/privacy|cookie/i.test(x)).slice(0, 2)) await page(u, TERMS, 110, 2);
  }
})();
