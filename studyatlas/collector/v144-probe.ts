/*
 * TEMPORARY (Ver.1.4.4): reads the catalogue entries (metadata only, via data.gov.uk's CKAN API) of the two candidate datasets found in the first round:
 * "uk-climate-averages" and "average-rainfall-temperature". No data file and no metoffice.gov.uk page is requested. One request each, no retries.
 */
import { sleep, USER_AGENT } from "./util";
const base = "https://ckan.publishing.service.gov.uk/api/action/package_show?id=";
type Res = { name?: string; format?: string; url?: string; description?: string };
(async () => {
  for (const id of ["uk-climate-averages", "average-rainfall-temperature"]) {
    await sleep(1500);
    try {
      const r = await fetch(base + id, { headers: { "user-agent": USER_AGENT, accept: "application/json" } }); console.log(`## ${id} → HTTP ${r.status}`);
      if (!r.ok) { console.log((await r.text()).slice(0, 200)); continue; }
      const p = ((await r.json()) as { result: Record<string, unknown> & { resources?: Res[]; extras?: { key: string; value: string }[]; organization?: { title?: string } } }).result;
      console.log(`  title: ${p.title} · org: ${p.organization?.title} · licence: ${p.license_id} / ${p.license_title} · modified ${String(p.metadata_modified).slice(0, 10)} · state ${p.state}`);
      console.log(`  notes: ${String(p.notes ?? "").replace(/\s+/g, " ").slice(0, 900)}`);
      console.log(`  extras: ${(p.extras ?? []).map((x) => `${x.key}=${String(x.value).slice(0, 160)}`).join(" | ")}`);
      for (const x of p.resources ?? []) console.log(`  resource: ${x.format ?? "?"} · ${x.name ?? ""} · ${x.url ?? ""} · ${String(x.description ?? "").replace(/\s+/g, " ").slice(0, 200)}`);
    } catch (e) { console.log(`## ${id} → ERROR ${(e as Error).message}`); }
  }
})();
