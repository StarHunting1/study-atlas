/*
 * Source probe: a reviewer aid for adding or re-checking official sources.
 *   npx tsx collector/probe.ts [url ...]       (no args: every page in PROBE_PAGES + the API probes)
 * For each page: robots.txt verdict for our user agent, HTTP status, final URL, title, the lines that contain money
 * amounts (verbatim page text) and links whose text mentions fares / prices / terms. Nothing is stored or
 * committed: the output only helps a person find and quote the official figures. One request at a time.
 * Pages disallowed by robots.txt are not fetched.
 */
import { makeRobots } from "./robots";
import { MET_PROBE_PERIODS, MET_ELEMENTS, monthlyMeans, parseStationData } from "./sources/metoffice";
import { fetchText, htmlToText, postJson, sleep, USER_AGENT } from "./util";

export const PROBE_PAGES: string[] = [];

/** Pages printed as text. `from`: print from the LAST occurrence of this marker (skips long navigation menus). */
export const TEXT_PAGES: { url: string; from?: string }[] = [];
/** Pages whose raw HTML is inspected: table/iframe/script counts and the context of every price-like string. */
export const HTML_HINTS: string[] = [
  // UBC housing pages were probed here until Ver.1.2. UBC's terms of use (ubc.ca/site/legal.html) allow only short extracts for
  // personal, non-commercial use and require prior written consent for anything else, and StudyAtlas shows no UBC figures,
  // so these pages are no longer requested automatically. Re-add only with UBC's written consent.
];
/** Extra pages probed for links/money lines only. */
export const LINK_PAGES: string[] = [];
/** Raw text files: first lines printed as they are (data files). */
export const RAW_FILES: string[] = ["https://www.metoffice.gov.uk/pub/data/weather/uk/climate/stationdata/ringwaydata.txt"];

export const robotsFor = makeRobots((u) => fetchText(u, { accept: "text/plain" }), USER_AGENT);

const MONEY = /(£|\$|CAD|GBP)\s?\d|\d+(\.\d+)?\s?(p\b|pence)/i;
const LINK_WORDS = /eligib|contract|guarantee|stationdata|\.txt|csv|\.pdf|climate-averages\/|stnID|fare|price|pric|cost|rate|fee|ticket|pass|student|concession|u-pass|residence|accommodation|room|rent|average|normal|climate|station|terms|copyright|legal|disclaimer|licen|open data|developer/i;

export function moneyLines(text: string, max = 80) { return [...new Set(text.split("\n").map((l) => l.trim()).filter((l) => l.length < 400 && MONEY.test(l)))].slice(0, max); }
export function links(html: string, base: string, max = 60) {
  const out: string[] = []; const seen = new Set<string>();
  for (const m of html.matchAll(/<a\b[^>]*href="([^"#]+)"[^>]*>([\s\S]*?)<\/a>/gi)) {
    const text = htmlToText(m[2]).replace(/\s+/g, " ").trim(); let href: string;
    try { href = new URL(m[1].replace(/&amp;/g, "&"), base).toString(); } catch { continue; }
    if (!text || seen.has(href) || !(LINK_WORDS.test(text) || LINK_WORDS.test(href))) continue;
    seen.add(href); out.push(`${text.slice(0, 80)} → ${href}`); if (out.length >= max) break;
  }
  return out;
}

async function probePage(url: string, fullText = false, from?: string) {
  const L: string[] = [`## ${url}`];
  const rb = await robotsFor(url); L.push(`- robots.txt: ${rb.allowed ? "allowed" : "NOT allowed"} (${rb.reason})`);
  if (!rb.allowed) return L;
  try {
    const r = await fetchText(url);
    L.push(`- HTTP ${r.status} · final URL: ${r.url} · ${r.contentType}`);
    if (r.status >= 400) return L;
    const title = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(r.body)?.[1]?.replace(/\s+/g, " ").trim();
    const updated = /(last (updated|reviewed|modified)[^<]{0,60})/i.exec(htmlToText(r.body))?.[1];
    L.push(`- title: ${title ?? "—"}${updated ? ` · ${updated.trim()}` : ""}`);
    const text = htmlToText(r.body);
    if (fullText) { const k = from ? text.lastIndexOf(from) : -1; L.push(`- page text${k >= 0 ? ` (from "${from}")` : ""} (capped):`, "```", text.slice(k >= 0 ? k : 0, (k >= 0 ? k : 0) + 14000), "```", "- links:", ...links(r.body, r.url).map((l) => `  - ${l}`)); return L; }
    L.push("- money lines (verbatim page text):", ...moneyLines(text).map((l) => `  - ${l}`));
    L.push("- links:", ...links(r.body, r.url).map((l) => `  - ${l}`));
  } catch (e) { L.push(`- ❌ ${(e as Error).message}`); }
  return L;
}

async function probeHtml(url: string) {
  const L: string[] = [`## HTML hints: ${url}`]; const rb = await robotsFor(url); L.push(`- robots.txt: ${rb.allowed ? "allowed" : "NOT allowed"}`); if (!rb.allowed) return L;
  try {
    const r = await fetchText(url); const h = r.body; L.push(`- HTTP ${r.status}, ${h.length} chars`);
    const count = (re: RegExp) => (h.match(re) ?? []).length;
    L.push(`- tables: ${count(/<table/gi)} · iframes: ${count(/<iframe/gi)} · scripts: ${count(/<script/gi)} · accordions/tabs: ${count(/accordion|tab-pane|data-toggle/gi)} · pdf links: ${count(/\.pdf/gi)}`);
    L.push("- headings:", ...[...h.matchAll(/<h([1-4])[^>]*>([\s\S]*?)<\/h\1>/gi)].map((m) => `  - h${m[1]}: ${htmlToText(m[2]).replace(/\s+/g, " ").slice(0, 100)}`).slice(0, 40));
    L.push("- script srcs:", ...[...h.matchAll(/<script[^>]+src="([^"]+)"/gi)].map((m) => `  - ${m[1]}`).slice(0, 25));
    L.push("- price-like contexts:", ...[...h.matchAll(/\$\s?\d[\d,]*(\.\d+)?/g)].slice(0, 40).map((m) => `  - …${htmlToText(h.slice(Math.max(0, m.index! - 120), m.index! + 60)).replace(/\s+/g, " ")}…`));
    L.push("- json-like data hints:", ...[...h.matchAll(/(wp-json|admin-ajax|data-url|data-src|fetch\()[^"'<>]{0,120}/gi)].slice(0, 15).map((m) => `  - ${m[0]}`));
    const i1 = h.search(/<h1[\s>]/i); const i2 = h.search(/<h2[^>]*>\s*Actions\s*</i);
    const body = i1 >= 0 ? h.slice(i1, i2 > i1 ? i2 : i1 + 60000) : "";
    L.push(`- body text from <h1> to "Actions" (table cells joined by " | "):`, "```", htmlToText(body.replace(/<\/t[dh]>/gi, " | ")).replace(/[ \t]+/g, " ").slice(0, 6500), "```");
    const hrefs = [...new Set([...h.matchAll(/href="(https:\/\/vancouver\.housing\.ubc\.ca\/[^"#]+)"/g)].map((m) => m[1]))].filter((u) => /applications|getting-started|eligib|contract|guarantee|assign|dining|meal|residences\//.test(u));
    L.push("- internal links:", ...hrefs.slice(0, 60).map((u) => `  - ${u}`));
  } catch (e) { L.push(`- ❌ ${(e as Error).message}`); }
  return L;
}

async function probeApis() {
  const L: string[] = ["## API probes"];
  for (const id of ["1108395", "1108447"]) {
    const url = `https://api.weather.gc.ca/collections/climate-normals/items?f=json&CLIMATE_IDENTIFIER=${id}&limit=1000`;
    try {
      const r = await fetchText(url, { accept: "application/json" }); L.push(`### ECCC climate-normals ${id}: HTTP ${r.status}`);
      const j = JSON.parse(r.body) as { numberMatched?: number; features?: { properties: Record<string, unknown> }[] };
      const f = j.features ?? []; L.push(`- features: ${f.length} (matched ${j.numberMatched ?? "?"})`);
      if (f[0]) L.push(`- property keys: ${Object.keys(f[0].properties).join(", ")}`, `- first: ${JSON.stringify(f[0].properties).slice(0, 900)}`);
      const names = new Map<string, number>(); for (const x of f) { const p = x.properties; const k = `${p.NORMAL_ID ?? "?"} | ${p.E_NORMAL_ELEMENT_NAME ?? p.NORMAL_ELEMENT_NAME ?? "?"} | period ${p.FIRST_YEAR ?? p.PERIOD ?? "?"}-${p.LAST_YEAR ?? ""}`; names.set(k, (names.get(k) ?? 0) + 1); }
      L.push("- elements:", ...[...names].slice(0, 80).map(([k, n]) => `  - ${k} (${n})`));
    } catch (e) { L.push(`### ECCC ${id}: ❌ ${(e as Error).message}`); }
    await sleep(500);
  }
  try {
    const coll = await fetchText("https://api.weather.gc.ca/collections/climate-normals?f=json", { accept: "application/json" });
    const j = JSON.parse(coll.body) as { title?: string; description?: string; keywords?: string[]; links?: { rel?: string; href?: string; title?: string }[] };
    L.push(`### ECCC collection: ${j.title} — ${j.description}`, ...(j.links ?? []).filter((l) => /licen|terms/i.test(`${l.rel} ${l.title}`)).map((l) => `- ${l.rel}: ${l.title} ${l.href}`));
  } catch (e) { L.push(`### ECCC collection: ❌ ${(e as Error).message}`); }
  try {
    const meta = (await postJson("https://www150.statcan.gc.ca/t1/wds/rest/getCubeMetadata", [{ productId: 34100133 }])) as { status: string; object: { cubeTitleEn: string; cubeEndDate: string; releaseTime: string; dimension: { dimensionNameEn: string; member: { memberId: number; memberNameEn: string; parentMemberId?: number }[] }[] } }[];
    const o = meta[0]?.object; L.push(`### StatCan 34-10-0133-01: ${meta[0]?.status} — ${o?.cubeTitleEn} · end ${o?.cubeEndDate} · released ${o?.releaseTime}`);
    o?.dimension.forEach((d, i) => { const ms = d.member.filter((m) => i > 0 || /vancouver/i.test(m.memberNameEn)); L.push(`- dim ${i + 1} ${d.dimensionNameEn}: ${ms.slice(0, 20).map((m) => `${m.memberId}=${m.memberNameEn}`).join("; ")}`); });
  } catch (e) { L.push(`### StatCan: ❌ ${(e as Error).message}`); }
  return L;
}

/** data.gov.uk CKAN metadata for the Met Office historic station dataset: licence and downloadable resources. */
async function probeCkan() {
  const L: string[] = ["## CKAN: data.gov.uk dataset"]; const url = "https://www.data.gov.uk/api/action/package_show?id=17ba3bbe-0e98-4a8c-9937-bd1d50fdc3c5";
  const rb = await robotsFor(url); L.push(`- robots.txt: ${rb.allowed ? "allowed" : "NOT allowed"} (${rb.reason})`); if (!rb.allowed) return L;
  try {
    const r = await fetchText(url, { accept: "application/json" }); L.push(`- HTTP ${r.status}`);
    const j = JSON.parse(r.body) as { result?: { title?: string; license_title?: string; license_url?: string; organization?: { title?: string }; metadata_modified?: string; notes?: string; resources?: { name?: string; format?: string; url?: string; description?: string }[] } };
    const p = j.result; if (!p) return [...L, "- no result"];
    L.push(`- title: ${p.title} · publisher: ${p.organization?.title} · licence: ${p.license_title} ${p.license_url ?? ""} · modified: ${p.metadata_modified}`, `- notes: ${(p.notes ?? "").slice(0, 600).replace(/\s+/g, " ")}`);
    (p.resources ?? []).slice(0, 40).forEach((x) => L.push(`  - ${x.name} [${x.format}] ${x.url} ${(x.description ?? "").slice(0, 120).replace(/\s+/g, " ")}`));
  } catch (e) { L.push(`- ❌ ${(e as Error).message}`); }
  return L;
}

async function main() {
  const urls = process.argv.slice(2).filter((a) => /^https:\/\//.test(a));
  const out: string[] = ["# Source probe (live requests, reviewer aid — nothing stored)", ""];
  for (const u of urls.length ? urls : [...PROBE_PAGES, ...LINK_PAGES]) { out.push(...(await probePage(u)), ""); await sleep(1000); }
  if (!urls.length) for (const u of TEXT_PAGES) { out.push(...(await probePage(u.url, true, u.from)), ""); await sleep(1000); }
  if (!urls.length) out.push(...(await probeCkan()));
  if (!urls.length) for (const u of HTML_HINTS) { out.push(...(await probeHtml(u)), ""); await sleep(1000); }
  if (!urls.length) out.push(...(await probeApis()));
  if (!urls.length) for (const u of RAW_FILES) {
    const rb = await robotsFor(u); out.push(`## ${u}`, `- robots.txt: ${rb.allowed ? "allowed" : "NOT allowed"} (${rb.reason})`);
    if (rb.allowed) try { const r = await fetchText(u, { accept: "text/plain" }); out.push(`- HTTP ${r.status}`, "```", r.body.split("\n").slice(0, 80).join("\n"), "```");
      const f = parseStationData(r.body); out.push(`- parsed: name="${f.name}" rows=${f.rows.length} first=${JSON.stringify(f.rows[0])} last=${JSON.stringify(f.rows[f.rows.length - 1])}`, `- header: ${JSON.stringify(f.header.slice(0, 6))}`, `- tail:`, "```", r.body.trimEnd().split("\n").slice(-6).join("\n"), "```");
      for (const [a, b] of MET_PROBE_PERIODS) for (const el of MET_ELEMENTS) { const mm = monthlyMeans(f.rows, el.key, a, b); out.push(`- MEANS ${mm.period} ${el.key}: [${mm.values.join(", ")}] complete=${mm.complete} ${mm.missing.join(";")}`); } } catch (e) { out.push(`- ❌ ${(e as Error).message}`); }
    out.push(""); await sleep(1000);
  }
  console.log(out.join("\n"));
}
if (process.argv[1] && /probe\.ts$/.test(process.argv[1])) main().catch((e) => { console.error(e); process.exit(1); });
