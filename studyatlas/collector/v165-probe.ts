/*
 * TEMPORARY (Ver.1.6.5): reads public sources for climate normals (ECCC bulk file for Ontario, BoM pages) and transport-card facts (TTC, Transport for NSW) plus their terms.
 * One request per URL, 1.5 s apart, no retries, robots.txt respected, nothing stored. Never requests tfl.gov.uk, transport.vic.gov.au, metoffice.gov.uk (HTTP 403 / bot check / terms: not retried).
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
  console.log("## A. TfGM / Bee Network (fare facts, payment, student tickets, maps)");
  await page("https://tfgm.com/tickets-and-passes/bus-tickets", [/contactless[^.]{0,200}/i, /Bee Network app[^.]{0,200}/i, /capped?[^.]{0,200}/i, /single[^.]{0,160}/i, /day ticket[^.]{0,160}/i, /zone[^.]{0,160}/i, /student[^.]{0,200}/i], /student|map|zone|contactless|ticket|pass|fare/i, 140);
  await page("https://tfgm.com/tickets-and-passes/all-terms-bee-bus-student", [/eligib[^.]{0,260}/i, /full.time[^.]{0,200}/i, /international[^.]{0,200}/i, /language[^.]{0,200}/i, /age[ds]? [^.]{0,120}/i], /student|map|terms/i, 140);
  await page("https://tfgm.com/maps", [/map[^.]{0,160}/i], /map/i);
  console.log("\n## B. TransLink (Compass, fare zones, concessions, U-Pass BC, maps)");
  await page("https://www.translink.ca/transit-fares/pricing-and-fare-zones", [/Compass[^.]{0,200}/i, /contactless[^.]{0,200}/i, /zone[^.]{0,200}/i, /concession[^.]{0,200}/i, /student[^.]{0,200}/i, /day pass[^.]{0,160}/i], /compass|concession|student|u-pass|map|zone|fare/i, 140);
  await page("https://www.translink.ca/transit-fares/u-pass-bc", [/eligib[^.]{0,260}/i, /international[^.]{0,200}/i, /institution[^.]{0,200}/i, /language[^.]{0,200}/i, /participating[^.]{0,200}/i], /u-pass|institution|eligib/i, 140);
  await page("https://www.translink.ca/schedules-and-maps", [/map[^.]{0,160}/i], /map|system/i);
  console.log("\n## C. Link liveness only (status, final URL; content not read): TTC routes, Transport for NSW contactless and map");
  await page("https://www.ttc.ca/routes-and-schedules", [/map[^.]{0,160}/i], /map/i);
  await page("https://transportnsw.info/tickets-fares/contactless-payments", [/contactless[^.]{0,200}/i, /tap[^.]{0,160}/i, /international[^.]{0,200}/i], /contactless|card|visa|mastercard/i, 140);
  await page("https://transportnsw.info/maps", [/map[^.]{0,160}/i], /map/i);
  console.log("\n## D. Official statistics pages (licence and what they cover; no figures read): ONS, Statistics Canada, ABS");
  await page("https://www.ons.gov.uk/peoplepopulationandcommunity/personalandhouseholdfinances/expenditure/bulletins/familyspendingintheuk/financialyearending2024", [/Open Government Licence[^.]{0,160}/i, /households?[^.]{0,200}/i], /licen|terms|open government/i, 120);
  await page("https://www.statcan.gc.ca/en/survey/household/5115", [/households?[^.]{0,200}/i, /licen[^.]{0,160}/i], /licen|terms|table|data/i, 120);
  await page("https://www.abs.gov.au/statistics/economy/finance/household-expenditure-survey-australia-summary-results/latest-release", [/Creative Commons[^.]{0,160}/i, /households?[^.]{0,200}/i, /licen[^.]{0,160}/i], /licen|copyright|creative/i, 120);
})();
