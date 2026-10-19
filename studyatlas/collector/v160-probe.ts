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
  const CR = /CRICOS[^.]{0,70}/i, LV = /Address[^.]{0,160}/i;
  console.log("## O. government provider directories (cross-check of CRICOS code and address)");
  for (const u of ["https://search.studyaustralia.gov.au/provider/ef-international-language-schools/4e3b43856f05d59fd5cf7d7d93af14be", "https://search.studyaustralia.gov.au/provider/ilsc-greystone-college/8e18e884000b3ff1d42524a0acf3294b"]) await page(u, [CR, LV, /Type of provider[^.]{0,60}/i, /Sydney[^.]{0,100}/i, /Melbourne[^.]{0,100}/i], 100);
  await page("https://search.studyaustralia.gov.au/providers?page=185", [/Navitas English[^.]{0,160}/i], 80);
  await links("https://cityenglish.edu.au/", /campus|contact|general-english|fees|melbourne/i, 20);
  console.log("\n## P. NEAS quality centre directory (accreditation can only be stated if listed here)");
  for (let n = 1; n <= 30; n++) {
    const u = n === 1 ? "https://neas.org.au/quality-centre" : `https://neas.org.au/quality-centre/page/${n}`;
    const rb = await robots(u); if (!rb.allowed) { console.log(`- ${u} robots: ${rb.reason}`); break; }
    await sleep(1500);
    let r; try { r = await fetchText(u, { retries: 0, accept: "text/html,*/*;q=0.8" }); } catch (e) { console.log(`- ${u} ERROR ${(e as Error).message}`); break; }
    const text = htmlToText(r.body).replace(/\s+/g, " ");
    const hits = ctx(text, /(EF International|ILSC|Navitas|City Language)[^.]{0,200}/i, 20, 6);
    console.log(`- ${u} ${r.status} ${r.body.length}B hits: ${hits.length ? hits.join(" | ") : "none"}`);
    if (r.status !== 200 || /Sydney|Melbourne/.test(text) === false && n > 3 && text.length < 500) break;
  }
})();
