/*
 * ONS API probe (Ver.1.2.2): a temporary reviewer aid. Asks the ONS official API (api.beta.ons.gov.uk) whether the Price Index of
 * Private Rents (PIPR) is published there and whether the Manchester (E08000003) monthly rent can be read as JSON, and prints the
 * response headers (rate limits, cache rules) and the developer documentation's terms. Read-only GET requests, one at a time,
 * 1 s apart; nothing is stored or committed. Anything that cannot be read is reported as such.
 *   npx tsx collector/ons-probe.ts
 */
import { USER_AGENT, sleep } from "./util";

const API = "https://api.beta.ons.gov.uk/v1";
const out: string[] = ["# ONS API probe - Ver.1.2.2 (nothing stored)", ""];
const log = (...l: string[]) => out.push(...l);

type Res = { status: number; url: string; headers: Record<string, string>; body: string };
async function get(url: string, accept = "application/json"): Promise<Res | undefined> {
  try {
    const r = await fetch(url, { headers: { "User-Agent": USER_AGENT, Accept: accept }, redirect: "follow", signal: AbortSignal.timeout(30000) });
    const headers: Record<string, string> = {}; r.headers.forEach((v, k) => { if (/rate|limit|retry|cache|age|server|content-type|link|x-|via|license|licence|terms/i.test(k)) headers[k] = v; });
    const res = { status: r.status, url: r.url, headers, body: await r.text() };
    log(`### GET ${url} -> HTTP ${res.status}`, `- headers: ${JSON.stringify(headers)}`); return res;
  } catch (e) { log(`### GET ${url} -> ERROR ${(e as Error).message}`); return undefined; } finally { await sleep(1000); }
}
const json = (r?: Res): any => { try { return r && r.status < 400 ? JSON.parse(r.body) : undefined; } catch { return undefined; } };
const clip = (s: string, n = 2500) => (s.length > n ? s.slice(0, n) + " ...[cut]" : s);

async function pages() {
  const m = await get("https://www.ons.gov.uk/visualisations/housingpriceslocal/data/json/E08000003.json"); const j = json(m);
  if (j) {
    const place = j.place ?? {}; const rk = Object.keys(place).filter((k) => /rent/i.test(k)).sort();
    log(`- place: areacd=${place.areacd} areanm=${place.areanm} geography=${place.geography} parentcd=${place.parentcd} parentnm=${place.parentnm} brma=${place.brma_name}/${place.brmacd}`);
    log(`- place keys mentioning rent: ${rk.length}; first/last: ${rk.slice(0, 3).join(", ")} ... ${rk.slice(-3).join(", ")}`, `- latest values: ${rk.slice(-4).map((k) => `${k}=${place[k]}`).join(", ")}`, `- other key families: ${[...new Set(Object.keys(place).map((k) => k.replace(/[0-9]{4}-[0-9]{2}$/, "YYYY-MM")))].join(", ")}`);
    const secs: any[] = j.sections ?? []; log(`- sections: ${secs.length}`, ...secs.map((x, n) => `  ${n}. id=${x.id ?? ""} type=${x.type ?? ""} chartType=${x.chartType ?? ""} title=${x.title ?? ""} | subtitle=${x.subtitle ?? ""} | footer=${String(x.footer ?? "").replace(/<[^>]+>/g, "")}`));
    for (const x of secs.filter((y) => /rent/i.test(`${y.id} ${y.title} ${y.subtitle}`))) log(`- section ${x.id ?? x.title} (JSON, cut):`, "```", clip(JSON.stringify(x), 2200), "```");
  }
  const ret = await get("https://developer.ons.gov.uk/retirement/", "text/html,application/json");
  if (ret && ret.status < 400) log("```", clip(ret.body.replace(/<(script|style)[\s\S]*?<\/\1>/gi, " ").replace(/<[^>]+>/g, " ").replace(/\s+/g, " "), 3500), "```");
  console.log(out.join("\n"));
}

async function main() {
  if (process.argv.includes("--pages")) return pages();
  // 1. is PIPR in the dataset list?
  const found: { id: string; title: string }[] = []; let offset = 0, total = Infinity;
  while (offset < total && offset < 1000) {
    const r = await get(`${API}/datasets?limit=100&offset=${offset}`); const j = json(r); if (!j) break;
    total = j.total_count ?? j.count ?? 0; const items = j.items ?? [];
    for (const d of items) { const t = `${d.title ?? ""} ${d.id ?? ""}`; if (/rent|pipr|housing|price/i.test(t)) found.push({ id: d.id, title: d.title }); }
    log(`- page offset ${offset}: ${items.length} items (total ${total})`); if (!items.length) break; offset += 100;
  }
  log("", "## Datasets whose id/title mentions rent / pipr / housing / price", ...found.map((f) => `- ${f.id}: ${f.title}`));
  const pipr = found.filter((f) => /rent/i.test(`${f.id} ${f.title}`));
  // 2. metadata, versions, dimensions, Manchester options, observations
  for (const d of pipr.slice(0, 4)) {
    log("", `## Dataset ${d.id}`); const meta = json(await get(`${API}/datasets/${d.id}`)); if (!meta) continue;
    log("```", clip(JSON.stringify({ title: meta.title, description: meta.description, license: meta.license, licence: meta.licence, unit_of_measure: meta.unit_of_measure, release_frequency: meta.release_frequency, next_release: meta.next_release, national_statistic: meta.national_statistic, links: Object.keys(meta.links ?? {}) }, null, 1)), "```");
    const latest = meta.links?.latest_version?.href as string | undefined; if (!latest) { log("- no latest_version link"); continue; }
    const ver = json(await get(latest)); if (!ver) continue;
    log("```", clip(JSON.stringify({ version: ver.version, release_date: ver.release_date, edition: ver.edition, state: ver.state, license: ver.license, usage_notes: ver.usage_notes, dimensions: (ver.dimensions ?? []).map((x: any) => ({ id: x.id, name: x.name, label: x.label, href: x.href })), links: Object.keys(ver.links ?? {}) }, null, 1), 4000), "```");
    const sel: Record<string, string> = {};
    for (const dim of ver.dimensions ?? []) {
      const base = `${latest}/dimensions/${dim.id ?? dim.name}/options`; const op = json(await get(`${base}?limit=1000`)); const items: any[] = op?.items ?? [];
      const labels = items.slice(0, 25).map((o) => `${o.option ?? o.code}${o.label ? "=" + o.label : ""}`);
      log(`- dimension ${dim.id ?? dim.name} (${dim.label ?? ""}): ${items.length} options; first: ${labels.join(" | ")}`);
      const man = items.find((o) => /E08000003/.test(`${o.option ?? ""}${o.code ?? ""}`) || /^manchester$/i.test(o.label ?? "")); if (man) log(`  - Manchester option: ${JSON.stringify(man)}`);
      const id = String(dim.id ?? dim.name);
      sel[id] = /geo|area|admin/i.test(id) ? (man ? String(man.option ?? man.code) : "E08000003") : /time|month/i.test(id) ? "*" : String(items[0]?.option ?? items[0]?.code ?? "");
    }
    const q = Object.entries(sel).map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join("&");
    const ob = await get(`${latest}/observations?${q}`); log("```", clip(ob?.body ?? "(no response)", 3500), "```");
  }
  // 3. the older/alternative official JSON: ONS website data endpoints
  for (const u of [
    "https://www.ons.gov.uk/economy/inflationandpriceindices/datasets/priceindexofprivaterentsukmonthlypricestatistics/data",
    "https://www.ons.gov.uk/visualisations/housingpriceslocal/E08000003/data",
  ]) { const r = await get(u); if (r) log("```", clip(r.body, 1500), "```"); }
  // 4. the page behind the Manchester chart: which URLs does its own HTML reference?
  const page = await get("https://www.ons.gov.uk/visualisations/housingpriceslocal/E08000003", "text/html");
  if (page) { const urls = [...new Set([...page.body.matchAll(/(?:src|href|data-[a-z-]+)=["']([^"']*(?:api|json|csv|data|download)[^"']*)["']/gi)].map((m) => m[1]))].slice(0, 40); log("- URLs in the page mentioning api/json/csv/data/download:", ...urls.map((u) => `  - ${u}`)); }
  // 5. API documentation: terms, rate limits
  for (const u of [`${API}`, "https://developer.ons.gov.uk/", "https://developer.ons.gov.uk/office-for-national-statistics-api/", "https://developer.ons.gov.uk/terms-of-use/", "https://developer.ons.gov.uk/faq/", "https://developer.ons.gov.uk/rate-limiting/", "https://developer.ons.gov.uk/dataset/"]) {
    const r = await get(u, "text/html,application/json"); if (!r || r.status >= 400) continue;
    const text = r.body.replace(/<(script|style)[\s\S]*?<\/\1>/gi, " ").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
    const hits = [...text.matchAll(/[^.]{0,200}(rate|limit|throttl|request|licen[cs]e|terms|fair use|commercial|attribution|API key|register)[^.]{0,200}\./gi)].map((m) => m[0].trim()); const seen = new Set<string>();
    log(...hits.filter((h) => !seen.has(h) && seen.add(h)).slice(0, 14).map((h) => `  > ${h}`));
  }
  console.log(out.join("\n"));
}
main().catch((e) => { console.log(out.join("\n")); console.error(e); process.exit(0); });
