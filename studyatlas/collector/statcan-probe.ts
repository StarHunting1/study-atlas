/*
 * Statistics Canada probe (Ver.1.2.4, temporary reviewer aid): prints the table 34-10-0133-01 metadata the Vancouver rent cards rely on –
 * title, reference dates, frequency, the geography member (and its level), the structure and unit members, the footnotes – and the lines of the
 * public table page that define the survey, the reference month and the geography. Read-only, nothing stored.
 */
import { USER_AGENT, fetchText, htmlToText } from "./util";
const out: string[] = ["# Statistics Canada probe - table 34-10-0133-01 (Ver.1.2.4)", ""];
const log = (...l: string[]) => out.push(...l);
async function main() {
  try {
    const r = await fetch("https://www150.statcan.gc.ca/t1/wds/rest/getCubeMetadata", { method: "POST", headers: { "User-Agent": USER_AGENT, "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify([{ productId: 34100133 }]) });
    const j = (await r.json()) as any[]; const o = j[0]?.object ?? {};
    log(`- HTTP ${r.status}; status ${j[0]?.status}`, `- title: ${o.cubeTitleEn}`, `- start ${o.cubeStartDate} · end ${o.cubeEndDate} · release ${o.releaseTime} · frequency ${o.frequencyCode} · archived ${o.archiveStatusCode} · survey ${JSON.stringify(o.surveyEn)} · subject ${JSON.stringify(o.subjectEn)}`);
    for (const d of o.dimension ?? []) {
      const ms = d.member ?? []; log(`- dimension ${d.dimensionPositionId} "${d.dimensionNameEn}" (${ms.length} members, hasUOM ${d.hasUom})`);
      const keep = ms.filter((m: any) => /Vancouver/.test(m.memberNameEn) || ["Row and apartment structures of three units and over"].includes(m.memberNameEn) || /Bachelor|One bedroom|Two bedroom|Three bedroom/.test(m.memberNameEn));
      for (const m of keep.slice(0, 12)) log(`  - member ${JSON.stringify(m)}`);
      if (d.dimensionPositionId === 1) log(`  - geo levels in the table: ${[...new Set(ms.map((m: any) => `${m.geoLevel}`))].join(", ")}`);
    }
    for (const f of (o.footnote ?? []).slice(0, 12)) log(`- footnote ${JSON.stringify(f).slice(0, 700)}`);
    log(`- other keys: ${Object.keys(o).join(", ")}`);
  } catch (e) { log(`- metadata ERROR ${(e as Error).message}`); }
  try {
    const p = await fetchText("https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=3410013301"); log("", `## table page -> HTTP ${p.status}`);
    const text = htmlToText(p.body).replace(/[ \t]+/g, " "); const seen = new Set<string>();
    for (const line of text.split("\n")) { const l = line.trim(); if (l.length > 20 && /Rental Market Survey|October|average rent|private|structure|metropolitan|census|CMA|reference|survey|apartment|units|released|Frequency|Footnote|Note/i.test(l) && !seen.has(l)) { seen.add(l); log(`  > ${l.slice(0, 420)}`); if (seen.size > 45) break; } }
  } catch (e) { log(`- page ERROR ${(e as Error).message}`); }
  console.log(out.join("\n"));
}
main();
