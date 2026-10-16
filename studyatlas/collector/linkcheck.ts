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
import { makeRobots } from "./robots";
import { fetchText, htmlToText, sleep, USER_AGENT } from "./util";

export type LinkTarget = { url: string; where: string[]; expect?: string; skip?: string };
export type Verdict = "ok" | "redirected" | "access-denied" | "broken" | "client-error" | "server-error" | "unreachable" | "robots-disallowed" | "skipped";
export type LinkResult = { url: string; where: string[]; verdict: Verdict; status: number | null; finalUrl?: string; title?: string; contentOk: boolean | null; note?: string };

const CITY_IDS = ["manchester", "vancouver"] as const;
/** Words the page must contain for the link to count as "the right page". Matched case-insensitively against the page text. */
const EXPECT: [RegExp, string][] = [
  [/gov\.uk\/student-visa/, "student visa"], [/gov\.uk\/check-uk-visa/, "visa"], [/gov\.uk\/visa-to-study-english/, "study english"],
  [/gov\.uk\/standard-visitor\/visit-to-study/, "study"], [/gov\.uk\/healthcare-immigration-application\/how-much-pay/, "£776"],
  [/gov\.uk\/healthcare-immigration-application/, "immigration health surcharge"],
  [/canada\.ca\/.*study-permit\.html/, "study permit"], [/qnum=484/, "study permit"], [/qnum=1289/, "eta"],
  [/gov\.bc\.ca\/.*health-fee-international-students/, "health fee"], [/gov\.bc\.ca\/.*\/msp/, "medical services plan"],
  [/englishuk\.com\/member-directory\?id=6665/, "express english college"], [/englishuk\.com\/member-directory\?id=878/, "international house"], [/englishuk\.com\/member-directory\?id=897/, "kaplan"],
  [/ihmanchester\.com\/prices/, "price"], [/kaplaninternational\.com\/faq\/prices/, "price"], [/expressenglishcollege\.co\.uk\/courses\/general-english/, "english courses"], [/ihmanchester\.com/, "ih manchester"], [/kaplaninternational\.com/, "manchester"], [/ecenglish\.com/, "manchester"], [/ihvancouver\.com\/ihv-price-list/, "price"],
  [/languagescanada\.ca\/.*ef-international/, "ef"], [/englishuk\.com\/.*id=228/, "mc academy"],
  [/expressenglishcollege\.co\.uk/, "express english"], [/themcacademy\.co\.uk/, "mc academy"],
  [/languagescanada\.ca\/.*international-house-vancouver/, "international house"], [/ihvancouver\.com/, "international house"],
  [/sprachcaffe\.com.*vancouver|sprachcaffe\.com\/english\/adults-english-courses-canada/, "vancouver"], [/ef\.com\/ca\/ilsd\/schools\/vancouver/, "price"],
  [/ons\.gov\.uk/, "private rent"], [/statcan\.gc\.ca|statcan/, "rent"], [/manchester\.ac\.uk/, "manchester"], [/tfgm\.com/, "tfgm|bee|ticket"],
];
export const expectFor = (url: string): string | undefined => EXPECT.find(([re]) => re.test(url))?.[1];

/** Hosts we never request automatically: the rights record blocks automation, or the publisher's terms restrict it. */
export function blockedHosts(): Set<string> {
  const h = new Set<string>(["ubc.ca", "translink.ca"]);
  // the publisher's own site (rights.sourceUrl) is off limits; a third-party catalogue that merely lists the dataset (data.gov.uk) is not
  for (const s of officialSources) { const r = rightsOfSource(s.id); if (r.automation === "blocked") h.add(new URL(r.sourceUrl).hostname.replace(/^www\d?\./, "")); }
  return h;
}
const hostKey = (u: string) => new URL(u).hostname.replace(/^www\d?\./, "");

export function linkTargets(): LinkTarget[] {
  const map = new Map<string, LinkTarget>(); const blocked = blockedHosts();
  const add = (url: string | undefined, where: string) => {
    if (!url || !/^https:\/\//.test(url)) return; const key = url.replace(/#.*$/, "");
    const cur = map.get(key); if (cur) { if (!cur.where.includes(where)) cur.where.push(where); return; }
    const skip = [...blocked].some((b) => hostKey(key) === b || hostKey(key).endsWith("." + b)) ? "rights/terms: automated requests not allowed" : undefined;
    map.set(key, { url: key, where: [where], expect: expectFor(key), skip });
  };
  for (const code of ["GBR", "CAN"]) { for (const l of visaLinks[code] ?? []) add(l.link.value, `visa:${code}`); for (const l of healthLinks[code] ?? []) add(l.link.value, `health:${code}`); }
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

export async function checkLinks(targets = linkTargets(), pauseMs = 1500): Promise<LinkResult[]> {
  const robots = makeRobots((u) => fetchText(u, { accept: "text/plain", retries: 0 }), USER_AGENT); const out: LinkResult[] = [];
  for (const t of targets) {
    if (t.skip) { out.push({ url: t.url, where: t.where, verdict: "skipped", status: null, contentOk: null, note: t.skip }); continue; }
    try {
      const rb = await robots(t.url); if (!rb.allowed) { out.push({ url: t.url, where: t.where, verdict: "robots-disallowed", status: null, contentOk: null, note: rb.reason }); continue; }
      await sleep(Math.max(pauseMs, (rb.crawlDelay ?? 0) * 1000));
      const ctrl = new AbortController(); const timer = setTimeout(() => ctrl.abort(), 20000);
      try {
        const res = await fetch(t.url, { headers: { "User-Agent": USER_AGENT, Accept: "text/html,*/*;q=0.8", "Accept-Language": "en" }, signal: ctrl.signal, redirect: "follow" });
        const body = res.status >= 200 && res.status < 300 ? (await res.text()).slice(0, 600_000) : ""; const { verdict, note } = classify(res.status, t.url, res.url);
        const text = htmlToText(body).toLowerCase(); const want = t.expect?.split("|"); const contentOk = verdict === "ok" ? (want ? want.some((w) => text.includes(w)) : null) : null;
        out.push({ url: t.url, where: t.where, verdict, status: res.status, finalUrl: res.url !== t.url ? res.url : undefined, title: titleOf(body) || undefined, contentOk, note: contentOk === false ? `expected words not found: ${t.expect}` : note });
      } finally { clearTimeout(timer); }
    } catch (e) { const err = e as Error & { cause?: Error }; out.push({ url: t.url, where: t.where, verdict: "unreachable", status: null, contentOk: null, note: `${err.name}: ${err.cause?.message ?? err.message}`.slice(0, 160) }); }
  }
  return out;
}

export function linkReport(rs: LinkResult[]): string {
  const n = (v: Verdict) => rs.filter((r) => r.verdict === v).length;
  const L = [`## Link check (${new Date().toISOString().slice(0, 10)})`, "",
    `links ${rs.length} · verified (2xx + expected words found) ${rs.filter(isVerifiedLink).length} · reachable, content not matched/unchecked ${rs.filter((r) => r.verdict === "ok" && r.contentOk !== true).length} · access denied ${n("access-denied")} · broken ${n("broken")} · other client error ${n("client-error")} · server error ${n("server-error")} · unreachable ${n("unreachable")} · redirected to home ${n("redirected")} · robots ${n("robots-disallowed")} · skipped ${n("skipped")}`, "",
    "| verdict | status | content | url | note |", "|---|---|---|---|---|"];
  for (const r of rs) L.push(`| ${r.verdict} | ${r.status ?? "–"} | ${r.contentOk === null ? "n/a" : r.contentOk ? "match" : "NO MATCH"} | ${r.url} | ${(r.note ?? "").replace(/\|/g, "/")}${r.title ? ` · “${r.title.replace(/\|/g, "/")}”` : ""} |`);
  return L.join("\n");
}

if (require.main === module) {
  checkLinks().then((rs) => {
    console.log(linkReport(rs));
    console.log("LINKCHECK_JSON_BEGIN"); console.log(JSON.stringify(rs.map((r) => ({ u: r.url, v: r.verdict, s: r.status, c: r.contentOk, f: r.finalUrl, w: r.where.length })))); console.log("LINKCHECK_JSON_END");
  });
}
