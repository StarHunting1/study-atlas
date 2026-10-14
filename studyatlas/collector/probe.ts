/*
 * Source probe: a reviewer aid for adding or re-checking official sources.
 *   npx tsx collector/probe.ts [url ...]       (no args: every page in PROBE_PAGES + the API probes)
 * For each page: robots.txt verdict for our user agent, HTTP status, final URL, title, the lines that contain money
 * amounts (verbatim page text) and links whose text mentions fares / prices / terms. Nothing is stored or
 * committed: the output only helps a person find and quote the official figures. One request at a time.
 * Pages disallowed by robots.txt are not fetched.
 */
import { makeRobots } from "./robots";
import { fetchText, htmlToText, postJson, sleep, USER_AGENT } from "./util";

export const PROBE_PAGES: string[] = [
  "https://vancouver.housing.ubc.ca/applications/fees-payments/",
  "https://vancouver.housing.ubc.ca/applications/fees-payments/eligibility/",
  "https://vancouver.housing.ubc.ca/applications/essential-application-facts/",
];

/** Pages printed as text. `from`: print from the LAST occurrence of this marker (skips long navigation menus). */
export const TEXT_PAGES: { url: string; from?: string }[] = [
  { url: "https://vancouver.housing.ubc.ca/applications/fees-payments/marine-drive/", from: "Marine Drive Fees" },
  { url: "https://vancouver.housing.ubc.ca/applications/fees-payments/place-vanier/", from: "Place Vanier Fees" },
  { url: "https://vancouver.housing.ubc.ca/applications/fees-payments/ponderosa-commons/", from: "Ponderosa Commons Fees" },
  { url: "https://www.data.gov.uk/dataset/17ba3bbe-0e98-4a8c-9937-bd1d50fdc3c5/historic-monthly-meteorological-station-data", from: "Historic monthly" },
  { url: "https://www.metoffice.gov.uk/research/climate/maps-and-data/historic-station-data", from: "Sample of monthly station data" },
  { url: "https://www.metoffice.gov.uk/research/climate/maps-and-data/uk-synoptic-and-climate-stations", from: "stations" },
];
/** Extra pages probed for links/money lines only. */
export const LINK_PAGES: string[] = [];
/** Raw text files: first lines printed as they are (data files). */
export const RAW_FILES: string[] = [];

export const robotsFor = makeRobots((u) => fetchText(u, { accept: "text/plain" }), USER_AGENT);

const MONEY = /(£|\$|CAD|GBP)\s?\d|\d+(\.\d+)?\s?(p\b|pence)/i;
const LINK_WORDS = /eligib|contract|guarantee|stationdata|\\.txt|csv|\.pdf|climate-averages\/|stnID|fare|price|pric|cost|rate|fee|ticket|pass|student|concession|u-pass|residence|accommodation|room|rent|average|normal|climate|station|terms|copyright|legal|disclaimer|licen|open data|developer/i;

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
  if (!urls.length) out.push(...(await probeApis()));
  if (!urls.length) for (const u of RAW_FILES) {
    const rb = await robotsFor(u); out.push(`## ${u}`, `- robots.txt: ${rb.allowed ? "allowed" : "NOT allowed"} (${rb.reason})`);
    if (rb.allowed) try { const r = await fetchText(u, { accept: "text/plain" }); out.push(`- HTTP ${r.status}`, "```", r.body.split("\n").slice(0, 80).join("\n"), "```"); } catch (e) { out.push(`- ❌ ${(e as Error).message}`); }
    out.push(""); await sleep(1000);
  }
  console.log(out.join("\n"));
}
if (process.argv[1] && /probe\.ts$/.test(process.argv[1])) main().catch((e) => { console.error(e); process.exit(1); });
