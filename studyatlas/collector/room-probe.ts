/*
 * Temporary probe (Ver.1.2.5): is the ONS "Private rental market summary statistics in England" (VOA data, final edition Oct 2022 – Sep 2023)
 * downloadable, what licence does its page state, and what does it say for Manchester's single-room (shared house) monthly rent? Read-only, nothing stored.
 */
import { USER_AGENT, fetchText, htmlToText, sleep } from "./util";
const out: string[] = ["# Room-rent probe (Ver.1.2.5)", ""]; const log = (...l: string[]) => out.push(...l);
async function get(u: string) { try { const r = await fetchText(u); log(`### GET ${u} -> HTTP ${r.status}`); await sleep(1000); return r; } catch (e) { log(`### GET ${u} -> ERROR ${(e as Error).message}`); return undefined; } }
async function main() {
  const base = "https://www.ons.gov.uk/peoplepopulationandcommunity/housing/bulletins/privaterentalmarketsummarystatisticsinengland";
  for (const ed of ["latest", "october2022toseptember2023"]) {
    const r = await get(`${base}/${ed}`); if (!r || r.status >= 400) continue;
    const text = htmlToText(r.body).replace(/[ \t]+/g, " "); const seen = new Set<string>();
    for (const l of text.split("\n").map((x) => x.trim())) if (l.length > 25 && /room|service charge|Open Government|licen|National Statistic|published|final|replace|PIPR|discontinu|Manchester|sample|bedsit|shared/i.test(l) && !seen.has(l) && seen.size < 40) { seen.add(l); log(`  > ${l.slice(0, 400)}`); }
    const links = [...r.body.matchAll(/href="([^"]+\.(?:xlsx|xls|csv|zip))"/gi)].map((m) => m[1]).slice(0, 12); log("- downloadable files on the bulletin page:", ...links.map((l) => `  - ${l}`));
    const rel = [...r.body.matchAll(/href="([^"]*(?:datasets|related)[^"]*)"/gi)].map((m) => m[1]).slice(0, 10); log("- dataset links:", ...rel.map((l) => `  - ${l}`));
  }
  for (const d of ["privaterentalmarketsummarystatisticsinengland", "privaterentalmarketstatistics"]) {
    const u = `https://www.ons.gov.uk/peoplepopulationandcommunity/housing/datasets/${d}`; const r = await get(u); if (!r || r.status >= 400) continue;
    const text = htmlToText(r.body).replace(/[ \t]+/g, " "); log(...text.split("\n").map((x) => x.trim()).filter((l) => /Release date|Next release|Contact|edition|Dataset|Office for National/i.test(l)).slice(0, 12).map((l) => `  > ${l.slice(0, 200)}`));
    const files = [...r.body.matchAll(/href="([^"]*\/file\?uri=[^"]+)"/gi)].map((m) => m[1]).slice(0, 12); log("- files:", ...files.map((f) => `  - ${f}`));
  }
  console.log(out.join("\n"));
}
main();
