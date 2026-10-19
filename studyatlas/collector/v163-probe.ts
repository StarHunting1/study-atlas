/*
 * TEMPORARY (Ver.1.6.3): reads public sources for climate normals (ECCC bulk file for Ontario, BoM pages) and transport-card facts (TTC, Transport for NSW) plus their terms.
 * One request per URL, 1.5 s apart, no retries, robots.txt respected, nothing stored. Never requests metoffice.gov.uk, tfl.gov.uk or transport.vic.gov.au (rights records / bot checks).
 * Removed before the PR.
 */
import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { makeRobots } from "./robots";
import { fetchText, htmlToText, sleep, USER_AGENT } from "./util";
const robots = makeRobots((u) => fetchText(u, { accept: "text/plain", retries: 0 }), USER_AGENT);
const short = (t: string, n = 300) => t.replace(/\s+/g, " ").trim().slice(0, n);
const ctx = (text: string, re: RegExp, w = 110, max = 3) => [...text.matchAll(new RegExp(re.source, re.flags.includes("g") ? re.flags : re.flags + "g"))].slice(0, max).map((m) => short(text.slice(Math.max(0, (m.index ?? 0) - w), (m.index ?? 0) + m[0].length + w), 2 * w + m[0].length));
const links = (body: string, base: string, re: RegExp, max = 30) => [...new Set([...body.matchAll(/<a\b[^>]*href="([^"#]+)"[^>]*>([\s\S]*?)<\/a>/gi)].filter((m) => re.test(m[1] + " " + htmlToText(m[2]))).map((m) => { try { return new URL(m[1].replace(/&amp;/g, "&"), base).toString() + " [" + short(htmlToText(m[2]), 40) + "]"; } catch { return ""; } }).filter(Boolean))].slice(0, max);
async function page(url: string, res: RegExp[], linkRe?: RegExp, w = 110) {
  const rb = await robots(url); if (!rb.allowed) { console.log(`- ${url}\n  robots: ${rb.reason} (not fetched)`); return; }
  await sleep(1500); let r; try { r = await fetchText(url, { retries: 0, accept: "text/html,*/*;q=0.8" }); } catch (e) { console.log(`- ${url}\n  ERROR ${(e as Error).message}`); return; }
  const text = htmlToText(r.body).replace(/\s+/g, " ");
  console.log(`- ${url}\n  ${r.status} → ${r.url} · “${short(/<title[^>]*>([\s\S]*?)<\/title>/i.exec(r.body)?.[1] ?? "", 100)}”`);
  if (r.status !== 200) return;
  for (const re of res) { const h = ctx(text, re, w, 2); console.log(`  ${re.source.slice(0, 40)}: ${h.length ? h.map((x) => `…${x}…`).join(" | ") : "none"}`); }
  if (linkRe) console.log("  links:\n    " + (links(r.body, r.url, linkRe).join("\n    ") || "none"));
}
(async () => {
  console.log("## E. terms re-read: ECCC data licence, TTC website terms, Transport for NSW legal pages");
  await page("https://eccc-msc.github.io/open-data/licence/readme_en/", [/Licence[^.]{0,200}/i, /commercial[^.]{0,200}/i, /attribution|acknowledg[^.]{0,200}/i, /version[^.]{0,80}/i, /modif|adapt|derive[^.]{0,200}/i, /redistribut|sub-licen[^.]{0,200}/i], /licen|terms|end-use/i, 140);
  await page("https://www.ttc.ca/transparency-and-accountability/policies/web-site-terms-and-conditions-of-use", [/copyright[^.]{0,260}/i, /reproduc[^.]{0,260}/i, /commercial[^.]{0,200}/i, /licen[cs]e[^.]{0,200}/i, /without[^.]{0,160}permission[^.]{0,120}/i], /licen|open data|copyright|terms/i, 140);
  await page("https://transportnsw.info/", [/Copyright[^.]{0,120}/i, /Creative Commons[^.]{0,160}/i], /copyright|terms|disclaimer|licen|privacy|open data|developer|legal/i);
  await page("https://www.transport.nsw.gov.au/", [/Copyright[^.]{0,120}/i, /Creative Commons[^.]{0,160}/i], /copyright|terms|disclaimer|licen|privacy|open data|developer|legal/i);
  await page("https://opendata.transport.nsw.gov.au/", [/Creative Commons[^.]{0,200}/i, /licen[cs]e[^.]{0,200}/i, /commercial[^.]{0,160}/i], /licen|terms|copyright|fare|opal/i);
})();
