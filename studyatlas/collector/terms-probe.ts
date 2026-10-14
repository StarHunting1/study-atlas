/*
 * Terms probe (Ver.1.2): a reviewer aid for the data-rights review. For each publisher it reads the official terms /
 * copyright / licence pages and the site's robots.txt and prints (a) the robots.txt verdict for our user agent, (b) the
 * verbatim lines that mention copyright, reproduction, licences, automated access, commercial use or APIs, and
 * (c) the terms-like links found on the page. Nothing is stored or committed; the output goes to the job summary so
 * a person can read the wording. It only requests the listed pages (one at a time, 1 s apart), only where robots.txt
 * allows. A page that cannot be read is reported as such – the review then records "unknown", never a guess.
 *   npx tsx collector/terms-probe.ts [--full]
 */
import { robotsFor, links } from "./probe";
import { fetchText, htmlToText, sleep } from "./util";

export const TERMS_PAGES: { who: string; url: string }[] = [
  { who: "TfGM / Bee Network", url: "https://tfgm.com/disclaimer" },
  { who: "TfGM / Bee Network", url: "https://tfgm.com/" },
  { who: "TfGM / Bee Network", url: "https://developer.tfgm.com/" },
  { who: "TransLink", url: "https://www.translink.ca/terms-and-conditions" },
  { who: "TransLink (open API / GTFS)", url: "https://www.translink.ca/about-us/doing-business-with-translink/app-developer-resources/terms-of-use" },
  { who: "TransLink (open API / GTFS)", url: "https://www.translink.ca/about-us/doing-business-with-translink/app-developer-resources/gtfs/gtfs-data" },
  { who: "University of Manchester", url: "https://www.manchester.ac.uk/copyright/" },
  { who: "University of Manchester", url: "https://www.manchester.ac.uk/" },
  { who: "UBC", url: "https://www.ubc.ca/site/legal.html" },
  { who: "UBC Housing", url: "https://vancouver.housing.ubc.ca/" },
  { who: "CMHC", url: "https://www.cmhc-schl.gc.ca/en/professionals/housing-markets-data-and-research/housing-data/cmhc-licence-agreement-use-of-data" },
  { who: "CMHC", url: "https://www.cmhc-schl.gc.ca/about-us/terms-conditions/hmip-terms-conditions" },
  { who: "CMHC / Statistics Canada", url: "https://www.statcan.gc.ca/en/reference/agreement_CMHC" },
  { who: "Statistics Canada", url: "https://www.statcan.gc.ca/en/terms-conditions/open-licence" },
  { who: "Statistics Canada (table 34-10-0133-01)", url: "https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=3410013301" },
  { who: "ECCC", url: "https://www.canada.ca/en/transparency/terms.html" },
  { who: "ECCC (MSC open data)", url: "https://eccc-msc.github.io/open-data/licence/readme_en/" },
  { who: "ECCC (MSC open data)", url: "https://eccc-msc.github.io/open-data/usage/readme_en/" },
  { who: "ECCC (GeoMet API)", url: "https://api.weather.gc.ca/" },
  { who: "Met Office", url: "https://www.metoffice.gov.uk/policies/legal" },
  { who: "Met Office (station data on data.gov.uk)", url: "https://www.data.gov.uk/dataset/17ba3bbe-0e98-4a8c-9937-bd1d50fdc3c5" },
  { who: "UK Open Government Licence v3.0", url: "https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/" },
];
/** Origins whose robots.txt is printed verbatim (public crawl policy). */
export const ROBOTS_ORIGINS = ["https://tfgm.com", "https://www.translink.ca", "https://www.manchester.ac.uk", "https://www.ubc.ca", "https://vancouver.housing.ubc.ca", "https://www.cmhc-schl.gc.ca", "https://www150.statcan.gc.ca", "https://api.weather.gc.ca", "https://climate.weather.gc.ca", "https://www.metoffice.gov.uk", "https://www.data.gov.uk"];

const KEY = /copyright|reproduc|republish|redistribut|licen[cs]e|permission|written consent|personal use|non-commercial|commercial|robot|spider|crawl|scrap|automat|data mining|text and data|extract|database right|open government|attribution|\bapi\b|rate limit|requests per|trade ?mark|exclusive property|may not|must not|prohibit/i;
const TERMS_LINK = /terms|copyright|legal|licen|disclaimer|conditions|open data|developer|privacy/i;

export function keyLines(text: string, max = 45): string[] {
  const seen = new Set<string>(); const out: string[] = [];
  for (const raw of text.split("\n")) { const l = raw.replace(/\s+/g, " ").trim(); if (l.length < 25 || !KEY.test(l) || seen.has(l)) continue; seen.add(l); out.push(l.length > 420 ? l.slice(0, 420) + "…" : l); if (out.length >= max) break; }
  return out;
}

async function main() {
  const full = process.argv.includes("--full"); const out: string[] = ["# Terms probe (live requests, reviewer aid — nothing stored)", "", `Run at ${new Date().toISOString()}. User agent as in collector/util.ts.`, ""];
  out.push("## robots.txt (verbatim, first 40 lines of each origin)");
  for (const o of ROBOTS_ORIGINS) {
    try { const r = await fetchText(`${o}/robots.txt`, { accept: "text/plain" }); out.push(`### ${o}/robots.txt → HTTP ${r.status}`, "```", r.status < 400 ? r.body.split("\n").slice(0, 40).join("\n") : "(none)", "```"); }
    catch (e) { out.push(`### ${o}/robots.txt → ❌ ${(e as Error).message}`); }
    await sleep(500);
  }
  out.push("", "## Terms pages");
  for (const { who, url } of TERMS_PAGES) {
    out.push(`### ${who} — ${url}`);
    const rb = await robotsFor(url); out.push(`- robots.txt verdict for our agent: ${rb.allowed ? "allowed" : "NOT allowed"} (${rb.reason})`);
    if (!rb.allowed) { out.push("- not fetched", ""); continue; }
    try {
      const r = await fetchText(url); out.push(`- HTTP ${r.status} · final URL: ${r.url} · ${r.contentType}`);
      if (r.status >= 400) { out.push(""); continue; }
      const title = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(r.body)?.[1]?.replace(/\s+/g, " ").trim(); out.push(`- title: ${title ?? "—"}`);
      const text = htmlToText(r.body); const kl = keyLines(text, full ? 80 : 45);
      out.push(`- ${text.length} chars of text; lines about copyright / reuse / automated access (verbatim):`, ...kl.map((l) => `  > ${l}`));
      out.push("- terms-like links:", ...links(r.body, r.url, 80).filter((l) => TERMS_LINK.test(l)).slice(0, 25).map((l) => `  - ${l}`));
      if (full) out.push("- text (capped):", "```", text.slice(0, 9000), "```");
    } catch (e) { out.push(`- ❌ ${(e as Error).message}`); }
    out.push(""); await sleep(1000);
  }
  console.log(out.join("\n"));
}
if (process.argv[1] && /terms-probe\.ts$/.test(process.argv[1])) main().catch((e) => { console.error(e); process.exit(1); });
