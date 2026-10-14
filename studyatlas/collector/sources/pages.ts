import { allOfficialData, officialSources } from "../../data/official";
import type { DataPoint } from "../../data/official/types";
import { numbersIn } from "../../data/official/validate";
import { rightsOfSource } from "../../data/official/rights";
import type { CollectedRecord, Fetched, Source } from "../types";
import { htmlToText, normalize, sha256, sleep } from "../util";
/*
 * Official page check (no API available). For every data point whose source is a public web page, fetch that page
 * (once per cadence, only where robots.txt allows) and check that the recorded figure is still shown:
 *   quote-found  – the verbatim quote is on the page
 *   value-found  – the quote changed but every recorded amount still appears on the page
 *   not-found    – a recorded amount is no longer on the page → becomes a change candidate for a person to review
 * Nothing new is extracted from pages; values only enter StudyAtlas through a reviewed edit of data/official/*.
 */
export type PageCheck = "quote-found" | "value-found" | "not-found";

export function checkOnPage(p: DataPoint, pageText: string): PageCheck {
  const page = normalize(pageText); const quote = p.evidence.map((e) => e.quote);
  if (quote.some((q) => page.includes(normalize(q)))) return "quote-found";
  const want = [p.value?.amount, p.value?.max].filter((x): x is number => x !== undefined);
  const onPage = new Set(numbersIn(pageText).map(Number));
  return want.length && want.every((n) => onPage.has(n)) ? "value-found" : "not-found";
}

const pageSourceIds = () => new Set(officialSources.filter((s) => s.method === "page" && allOfficialData().some((c) => c.points.some((p) => p.sourceId === s.id))).map((s) => s.id));

export function makePageSource(id: string): Source {
  const os = officialSources.find((s) => s.id === id)!;
  return {
    id: `page:${id}`, name: `${os.publisher} – ${os.name.en} (page check)`, country: os.country, access: "page-check", cadenceDays: os.cadenceDays,
    docs: os.pages[0], licence: rightsOfSource(id).licence, domains: [...new Set(os.pages.map((u) => new URL(u).hostname))], topics: [os.topic],
    note: "Public web page without an API: checks that recorded figures are still shown (robots.txt respected).",
    async fetch(ctx): Promise<Fetched> {
      const points = allOfficialData().flatMap((c) => c.points).filter((p) => p.sourceId === id && p.status !== "pending");
      const urls = [...new Set(points.flatMap((p) => p.evidence.map((e) => e.url)))];
      const texts: Record<string, string> = {}; const errors: string[] = [];
      for (const [i, url] of urls.entries()) {
        if (i > 0) await sleep(1000); // one request at a time, a second apart
        const rb = await ctx.robots(url);
        if (!rb.allowed) { errors.push(`${url}: ${rb.reason}`); continue; }
        try { const r = await ctx.fetchText(url); if (r.status >= 400) throw new Error(`HTTP ${r.status}`); texts[url] = htmlToText(r.body); }
        catch (e) { errors.push(`${url}: ${(e as Error).message}`); }
      }
      const records: CollectedRecord[] = []; const failedIds: string[] = [];
      for (const p of points) {
        const rid = `page:${p.id}`; const page = p.evidence.map((e) => texts[e.url]).filter(Boolean).join("\n");
        if (!page) { failedIds.push(rid); continue; }
        const check = checkOnPage(p, page);
        const ev = p.evidence[0];
        records.push({
          id: rid, sourceId: `page:${id}`, country: os.country, cityId: p.cityId, field: `official.${p.id}`,
          label: { en: `${p.label.en} — ${check === "not-found" ? "NOT FOUND on the official page" : "still on the official page"}`, ja: `${p.label.ja} — ${check === "not-found" ? "公式ページで見つかりません" : "公式ページに掲載あり"}` },
          // value-found and quote-found both mean the recorded amount is still published: same content, no change candidate
          value: { text: check === "not-found" ? "not-found" : "found", ...(p.value ? { number: p.value.amount, currency: p.value.currency, unit: p.value.per } : {}) },
          period: p.validFor, sourceUrl: ev.url, apiUrl: ev.url, retrievedAt: ctx.now,
          evidence: { path: `page text (${check})`, quote: ev.quote },
          contentHash: sha256(JSON.stringify([check === "not-found", p.value ?? p.text?.en ?? "", p.evidence.map((e) => e.url)])),
          licence: rightsOfSource(id).licence, status: "unverified", review: check === "not-found" ? "human-required" : "standard",
        });
      }
      if (!records.length) throw new Error(errors.join("; ") || "no pages fetched");
      if (errors.length) console.warn(`[page:${id}] partial: ${errors.join("; ")}`);
      return { records, texts: {}, failedIds };
    },
  };
}
export const pageSources = (): Source[] => [...pageSourceIds()].map(makePageSource);
