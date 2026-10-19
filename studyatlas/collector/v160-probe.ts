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
  const CR = /CRICOS[^.]{0,70}/i, WH = /Where to Find Us[^+]{0,120}/i, AD = /\b(Level|Suite|Floor)\s?\d+[^.]{0,80}(NSW|VIC|Victoria)[, ]+\d{4}/i, ST = /\d+[A-Za-z]?\s[A-Z][a-z]+ (Street|St|Road|Rd|Lane|Avenue)[^.]{0,60}/;
  console.log("## K. schools round 4");
  await links("https://www.kaplaninternational.com/language-schools/australia", /sydney|melbourne|australia\//i);
  for (const u of ["https://www.kaplaninternational.com/learn-english-australia/melbourne", "https://www.kaplaninternational.com/learn-english-australia/sydney", "https://www.ilsc.com/language-schools/destinations/australia/city/melbourne", "https://www.ef-australia.com.au/campaign/ilsd/australia/sydney/"]) await page(u, [WH, AD, ST, CR, /NEAS|English Australia|accredit[^.]{0,80}/i, /minimum age|16 years|aged 1\d/i, /closed|closure|no longer/i], 110);
  await links("https://www.ilsc.com/language-schools/destinations/australia/city/melbourne", /fee|price|visa|insurance|admission|australia\/city|campus/i, 20);
  await links("https://www.kaplaninternational.com/learn-english-australia/melbourne", /fee|price|faq|course|visa|accommodation|cricos/i, 20);
  console.log("\n## L. ILSC / Kaplan terms for CRICOS provider");
  await page("https://www.ilsc.com/greystone-college/australia/policies", [CR], 120);
  await page("https://www.kaplaninternational.com/faq/prices-and-payment", [/AUD|A\$|\$\d+[^.]{0,60}/i], 80);
})();
