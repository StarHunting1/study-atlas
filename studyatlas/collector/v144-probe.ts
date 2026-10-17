/*
 * TEMPORARY (Ver.1.4.4): looks, through data.gov.uk's own catalogue API (CKAN), for an official 1991–2020 climate-averages dataset that covers
 * Manchester (Met Office or another UK public body) and prints its licence and downloadable resources. Metadata only: no data file and no
 * metoffice.gov.uk page is requested (its terms forbid scraping). One request per query, no retries. Removed after the result is recorded.
 */
import { sleep, USER_AGENT } from "./util";
const base = "https://ckan.publishing.service.gov.uk/api/action/package_search";
const queries = ["climate averages 1991-2020", "Met Office station climate averages", "Manchester Airport climate"];
type Res = { name?: string; format?: string; url?: string };
type Pkg = { name: string; title: string; license_id?: string; license_title?: string; organization?: { title?: string }; metadata_modified?: string; resources?: Res[] };
(async () => {
  for (const q of queries) {
    await sleep(1500); const url = `${base}?q=${encodeURIComponent(q)}&rows=8&fl=name,title,license_id,license_title,organization,metadata_modified,resources`;
    try {
      const r = await fetch(url, { headers: { "user-agent": USER_AGENT, accept: "application/json" } }); console.log(`## query “${q}” → HTTP ${r.status}`);
      if (!r.ok) { console.log((await r.text()).slice(0, 200)); continue; }
      const j = (await r.json()) as { result?: { count?: number; results?: Pkg[] } }; console.log(`  hits: ${j.result?.count}`);
      for (const p of j.result?.results ?? []) {
        console.log(`- ${p.title} [${p.name}] · ${p.organization?.title ?? "?"} · licence: ${p.license_id ?? "?"} (${p.license_title ?? ""}) · modified ${p.metadata_modified?.slice(0, 10)}`);
        for (const x of (p.resources ?? []).slice(0, 6)) console.log(`    · ${x.format ?? "?"} ${x.name ?? ""} ${x.url ?? ""}`);
      }
    } catch (e) { console.log(`## query “${q}” → ERROR ${(e as Error).message}`); }
  }
})();
