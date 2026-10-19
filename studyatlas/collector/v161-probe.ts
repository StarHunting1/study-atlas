/* TEMPORARY (Ver.1.6.1): re-reads the two ABS QuickStats pages (geography type, rent line, footnote) before the approval is registered. Two requests, robots.txt respected, nothing stored. Removed before the PR. */
import { makeRobots } from "./robots";
import { fetchText, htmlToText, sleep, USER_AGENT } from "./util";
const robots = makeRobots((u) => fetchText(u, { accept: "text/plain", retries: 0 }), USER_AGENT);
const short = (t: string, n: number) => t.replace(/\s+/g, " ").trim().slice(0, n);
(async () => {
  for (const u of ["https://www.abs.gov.au/census/find-census-data/quickstats/2021/1GSYD", "https://www.abs.gov.au/census/find-census-data/quickstats/2021/2GMEL"]) {
    const rb = await robots(u); if (!rb.allowed) { console.log(u, "robots", rb.reason); continue; }
    await sleep(1500); const r = await fetchText(u, { retries: 0, accept: "text/html,*/*;q=0.8" }); const t = htmlToText(r.body).replace(/\s+/g, " ");
    console.log(`- ${u} ${r.status}`);
    for (const re of [/Geography type[^]{0,160}/i, /Latest release[^]{0,120}/i, /Median weekly rent[^]{0,200}/i, /Greater Capital City[^]{0,160}/i, /rent-free[^]{0,80}/i]) { const m = re.exec(t); console.log(`  ${re.source.slice(0, 22)}: ${m ? short(m[0], 260) : "none"}`); }
  }
})();
