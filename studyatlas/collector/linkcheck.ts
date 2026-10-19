/*
 * Link check (Ver.1.3.2): one request per source link of Manchester and Vancouver, then a plain verdict. A reviewer aid:
 *   npx tsx collector/linkcheck.ts            (run in GitHub Actions on pull requests; the build sandbox cannot open external sites)
 * - robots.txt is respected (a disallowed page is not fetched); sources whose rights record blocks automation (TransLink, UBC)
 *   are NOT requested at all.
 * - ONE attempt per link, no retries, one request at a time with a pause. Errors are classified, never retried in a loop.
 * - "access denied" (401/403/429) is NOT "broken": the page may exist but refuses automated requests, so it stays unverified.
 * - A link counts as VERIFIED only if it answers 2xx, does not just redirect to a site home page, AND the page text contains the
 *   words we expect (the school name, "Student visa", ...). Reachable-but-unchecked and everything else stay unverified.
 */
import { cities } from "../data/cities";
import { officialData } from "../data/official";
import { officialSources } from "../data/official/sources";
import { rightsOfSource } from "../data/official/rights";
import { healthLinks, visaLinks } from "../data/visa";
import { TRANSPORT_GUIDES } from "../data/official/transportGuides";
import { makeRobots } from "./robots";
import { blockedHostSet, decideAccess, guardedFetch, hostKey as guardHost } from "./guard";
import { fetchText, htmlToText, sleep, USER_AGENT } from "./util";

/** mode: how the link may be checked, decided from the rights records BEFORE any request: html (page body, words checked) · status-only (HTTP status, body not read) · skip (forbidden or unconfirmed: no request at all) */
export type LinkMode = "html" | "status-only" | "skip";
export type LinkTarget = { url: string; where: string[]; expect?: string; skip?: string; mode: LinkMode; skipVerdict?: "skipped" | "unconfirmed" };
export type Verdict = "ok" | "redirected" | "access-denied" | "broken" | "client-error" | "server-error" | "unreachable" | "robots-disallowed" | "skipped" | "unconfirmed";
export type LinkResult = { url: string; where: string[]; verdict: Verdict; status: number | null; finalUrl?: string; title?: string; contentOk: boolean | null; note?: string; mode?: LinkMode; checkedAt?: string };

const CITY_IDS = ["manchester", "vancouver", "toronto", "london", "sydney", "melbourne"] as const;
/** Words the page must contain for the link to count as "the right page". Matched case-insensitively against the page text. */
const EXPECT: [RegExp, string][] = [
  [/gov\.uk\/student-visa/, "student visa"], [/gov\.uk\/check-uk-visa/, "visa"], [/gov\.uk\/visa-to-study-english/, "study english"],
  [/gov\.uk\/standard-visitor\/visit-to-study/, "study"], [/gov\.uk\/healthcare-immigration-application\/how-much-pay/, "£776"],
  [/gov\.uk\/healthcare-immigration-application/, "immigration health surcharge"],
  [/canada\.ca\/.*study-permit\.html/, "study permit"], [/qnum=484/, "study permit"], [/qnum=1289/, "eta"],
  [/gov\.bc\.ca\/.*health-fee-international-students/, "health fee"], [/gov\.bc\.ca\/.*\/msp/, "medical services plan"],
  [/englishuk\.com\/member-directory\?id=6665/, "express english college"], [/englishuk\.com\/member-directory\?id=878/, "international house"], [/englishuk\.com\/member-directory\?id=897/, "kaplan"],
  [/climate\.weather\.gc\.ca\/climate_normals\/index_e/, "1991-2020"], [/ihmanchester\.com\/prices/, "price"], [/kaplaninternational\.com\/faq\/prices/, "price"], [/expressenglishcollege\.co\.uk\/courses\/general-english/, "english courses"], [/ihmanchester\.com/, "ih manchester"], [/kaplaninternational\.com/, "manchester"], [/ecenglish\.com/, "manchester"], [/ihvancouver\.com\/ihv-price-list/, "price"],
  [/languagescanada\.ca\/.*ef-international/, "ef"], [/englishuk\.com\/.*id=228/, "mc academy"],
  [/expressenglishcollege\.co\.uk/, "express english"], [/themcacademy\.co\.uk/, "mc academy"],
  [/languagescanada\.ca\/.*international-house-vancouver/, "international house"], [/ihvancouver\.com/, "international house"],
  [/sprachcaffe\.com.*vancouver|sprachcaffe\.com\/english\/adults-english-courses-canada/, "vancouver"], [/ef\.com\/ca\/ilsd\/schools\/vancouver/, "price"],
  [/ef\.com\/ca\/ilsd\/schools\/toronto/, "toronto"], [/kaplaninternational\.com\/language-schools\/canada\/toronto/, "toronto"], [/kaplaninternational\.com\/language-schools\/united-kingdom\/london/, "london"],
  [/francesking\.com.*course-prices/, "price"], [/francesking\.com/, "frances king"], [/stgiles-international\.com/, "st giles"],
  [/homeaffairs\.gov\.au\/.*student-500/, "student"], [/homeaffairs\.gov\.au\/.*visitor-600/, "visitor"], [/homeaffairs\.gov\.au\/.*electronic-travel-authority-601/, "eta|electronic travel"],
  [/studyaustralia\.gov\.au\/en\/plan-your-move\/your-guide-to-visas/, "visa"], [/studyaustralia\.gov\.au\/en\/plan-your-move\/overseas-student-health-cover/, "oshc|health cover"],
  [/search\.studyaustralia\.gov\.au\/provider\/ilsc/, "ilsc"], [/search\.studyaustralia\.gov\.au\/provider\/city-language/, "city language"], [/studyaustralia\.gov\.au\/en$/, "study australia"], [/cricos\.education\.gov\.au/, "cricos"],
  [/ilsc\.com\/language-schools\/destinations\/australia\/city\/(sydney|melbourne)/, "ilsc"], [/navitasenglish\.edu\.au/, "navitas"], [/cityenglish\.edu\.au/, "city language"],
  [/abs\.gov\.au\/census\/find-census-data\/quickstats\/2021\/1GSYD/, "greater sydney"], [/abs\.gov\.au\/census\/find-census-data\/quickstats\/2021\/2GMEL/, "greater melbourne"], [/abs\.gov\.au\/website-privacy/, "creative commons"],
  [/nsw\.gov\.au\/housing-and-construction\/rental-forms-surveys-and-data\/rental-bond-data/, "rental bond"],
  [/ons\.gov\.uk/, "private rent"], [/statcan\.gc\.ca|statcan/, "rent"], [/manchester\.ac\.uk/, "manchester"], [/tfgm\.com/, "tfgm|bee|ticket"],
];
export const expectFor = (url: string): string | undefined => EXPECT.find(([re]) => re.test(url))?.[1];

/** Hosts we never request: a rights record blocks automation (see guard.ts; the publisher's own site only). */
export function blockedHosts(): Set<string> { return blockedHostSet(); }
const hostKey = guardHost;

/** Decided from the rights records, before any request. Forbidden or unconfirmed links are listed with the reason and never requested. */
export function modeOf(url: string): { mode: LinkMode; skip?: string; skipVerdict?: "skipped" | "unconfirmed" } {
  if (decideAccess(url, "html").allow) return { mode: "html" };
  const s = decideAccess(url, "status-only"); if (s.allow) return { mode: "status-only" };
  return { mode: "skip", skip: `rights: ${s.reason}`, skipVerdict: s.state === "unconfirmed" ? "unconfirmed" : "skipped" };
}

export function linkTargets(): LinkTarget[] {
  const map = new Map<string, LinkTarget>();
  const add = (url: string | undefined, where: string) => {
    if (!url || !/^https:\/\//.test(url)) return; const key = url.replace(/#.*$/, "");
    const cur = map.get(key); if (cur) { if (!cur.where.includes(where)) cur.where.push(where); return; }
    map.set(key, { url: key, where: [where], expect: expectFor(key), ...modeOf(key) });
  };
  for (const code of ["GBR", "CAN", "AUS"]) { for (const l of visaLinks[code] ?? []) add(l.link.value, `visa:${code}`); for (const l of healthLinks[code] ?? []) add(l.link.value, `health:${code}`); }
  for (const g of TRANSPORT_GUIDES) for (const l of g.links) add(l.url, `guide:${g.cityId}`);
  for (const id of CITY_IDS) {
    const c = cities.find((x) => x.id === id)!; const edu = c.profile.education;
    for (const i of edu.languageSchools.value ?? []) { add(i.url, `school:${id}:${i.name}`); add(i.source?.url, `school-source:${id}:${i.name}`); add(i.feesUrl, `school-fees:${id}:${i.name}`); }
    for (const i of edu.universities.value ?? []) add(i.url, `university:${id}:${i.name}`);
    const walk = (o: unknown, path: string) => { if (!o || typeof o !== "object") return; const f = o as { status?: string; sources?: { url: string }[] };
      if ("status" in f) f.sources?.forEach((s) => add(s.url, `fact:${id}:${path}`)); else for (const [k, v] of Object.entries(o)) walk(v, `${path}.${k}`); };
    walk(c.profile, "profile");
    const od = officialData(id);
    for (const p of od?.points ?? []) p.evidence.forEach((e) => add(e.url, `official:${id}:${p.id}`));
    od?.climate?.evidence.forEach((e) => add(e.url, `climate:${id}`)); od?.climateAlt?.evidence.forEach((e) => add(e.url, `climate-alt:${id}`));
    od?.notices?.forEach((n) => n.links.forEach((l) => add(l.url, `notice:${id}`)));
    for (const s of officialSources.filter((x) => x.cityIds.includes(id))) { s.pages.forEach((p) => add(p, `source-page:${s.id}`)); const r = rightsOfSource(s.id); add(r.sourceUrl, `rights:${s.id}`); add(r.licenseUrl ?? undefined, `licence:${s.id}`); }
  }
  return [...map.values()].sort((a, b) => a.url.localeCompare(b.url));
}

const norm = (u: string) => { try { const x = new URL(u); return `${x.hostname.replace(/^www\./, "")}${x.pathname.replace(/\/$/, "")}`; } catch { return u; } };
/** Verdict from an HTTP answer. Pure, so it is unit-tested without a network. */
export function classify(status: number, requestedUrl: string, finalUrl: string): { verdict: Verdict; note?: string } {
  if (status >= 200 && status < 300) {
    const fp = new URL(finalUrl).pathname, rp = new URL(requestedUrl).pathname;
    if (norm(finalUrl) !== norm(requestedUrl)) return fp === "/" && rp !== "/" ? { verdict: "redirected", note: "redirected to the site home page" } : { verdict: "ok", note: `redirected to ${finalUrl}` };
    return { verdict: "ok" };
  }
  if (status === 401 || status === 403 || status === 429 || status === 999) return { verdict: "access-denied", note: "refuses automated requests; the page may exist" };
  if (status === 404 || status === 410) return { verdict: "broken", note: "not found" };
  if (status >= 500) return { verdict: "server-error" };
  return { verdict: "client-error" };
}
export const isVerifiedLink = (r: LinkResult) => r.verdict === "ok" && r.contentOk === true;
const titleOf = (html: string) => htmlToText(/<title[^>]*>([\s\S]*?)<\/title>/i.exec(html)?.[1] ?? "").slice(0, 120);

export async function checkLinks(targets = linkTargets(), pauseMs = 1500, io: { transport?: (u: string, init?: RequestInit) => Promise<Response>; robotsFetch?: (u: string) => Promise<{ status: number; body: string }> } = {}): Promise<LinkResult[]> {
  const robots = makeRobots(io.robotsFetch ?? ((u) => fetchText(u, { accept: "text/plain", retries: 0 })), USER_AGENT); const out: LinkResult[] = []; const checkedAt = new Date().toISOString().slice(0, 10);
  for (const t of targets) {
    // re-decided here as well: a stale or hand-built target can never reach the network if the rights records say no
    const m = t.mode === "skip" ? t : { ...t, ...modeOf(t.url) };
    if (m.mode === "skip") { out.push({ url: t.url, where: t.where, verdict: m.skipVerdict ?? "skipped", status: null, contentOk: null, note: m.skip ?? "rights: not requested", mode: "skip", checkedAt }); continue; }
    try {
      const rb = await robots(t.url); if (!rb.allowed) { out.push({ url: t.url, where: t.where, verdict: "robots-disallowed", status: null, contentOk: null, note: rb.reason, mode: m.mode, checkedAt }); continue; }
      await sleep(Math.max(pauseMs, (rb.crawlDelay ?? 0) * 1000));
      const ctrl = new AbortController(); const timer = setTimeout(() => ctrl.abort(), 20000);
      try {
        const res = await guardedFetch(t.url, m.mode === "html" ? "html" : "status-only", { headers: { "User-Agent": USER_AGENT, Accept: "text/html,*/*;q=0.8", "Accept-Language": "en" }, signal: ctrl.signal, redirect: "follow" }, { transport: io.transport, paceMs: pauseMs ? undefined : 0 });
        const readBody = m.mode === "html" && res.status >= 200 && res.status < 300; const body = readBody ? (await res.text()).slice(0, 600_000) : ""; if (!readBody) await res.body?.cancel().catch(() => undefined);
        const { verdict, note } = classify(res.status, t.url, res.url);
        const text = htmlToText(body).toLowerCase(); const want = t.expect?.split("|"); const contentOk = verdict === "ok" && readBody ? (want ? want.some((w) => text.includes(w)) : null) : null;
        out.push({ url: t.url, where: t.where, verdict, status: res.status, finalUrl: res.url !== t.url ? res.url : undefined, title: titleOf(body) || undefined, contentOk, note: contentOk === false ? `expected words not found: ${t.expect}` : m.mode === "status-only" && verdict === "ok" ? "status only: page body not read (rights)" : note, mode: m.mode, checkedAt });
      } finally { clearTimeout(timer); }
    } catch (e) { const err = e as Error & { cause?: Error }; out.push({ url: t.url, where: t.where, verdict: "unreachable", status: null, contentOk: null, note: `${err.name}: ${err.cause?.message ?? err.message}`.slice(0, 160), mode: m.mode, checkedAt }); }
  }
  return out;
}

export function linkReport(rs: LinkResult[]): string {
  const n = (v: Verdict) => rs.filter((r) => r.verdict === v).length;
  const L = [`## Link check (${new Date().toISOString().slice(0, 10)})`, "",
    `links ${rs.length} · verified (2xx + expected words found) ${rs.filter(isVerifiedLink).length} · reachable, content not matched/unchecked ${rs.filter((r) => r.verdict === "ok" && r.contentOk !== true).length} · access denied ${n("access-denied")} · broken ${n("broken")} · other client error ${n("client-error")} · server error ${n("server-error")} · unreachable ${n("unreachable")} · redirected to home ${n("redirected")} · robots ${n("robots-disallowed")} · rights unconfirmed ${n("unconfirmed")} · skipped (rights forbid) ${n("skipped")} · rights unconfirmed ${n("unconfirmed")}`, "",
    "| verdict | status | content | url | note |", "|---|---|---|---|---|"];
  for (const r of rs) L.push(`| ${r.verdict} | ${r.status ?? "–"} | ${r.contentOk === null ? "n/a" : r.contentOk ? "match" : "NO MATCH"} | ${r.url} | ${(r.note ?? "").replace(/\|/g, "/")}${r.title ? ` · “${r.title.replace(/\|/g, "/")}”` : ""} |`);
  return L.join("\n");
}

if (require.main === module) {
  checkLinks().then((rs) => {
    console.log(linkReport(rs));
    console.log("LINKCHECK_JSON_BEGIN"); console.log(JSON.stringify(rs.map((r) => ({ u: r.url, v: r.verdict, s: r.status, c: r.contentOk, f: r.finalUrl, w: r.where.length, m: r.mode, d: r.checkedAt })))); console.log("LINKCHECK_JSON_END");
  });
}
