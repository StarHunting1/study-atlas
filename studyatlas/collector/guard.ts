/*
 * Access guard (Ver.1.6.6). EVERY automated request of the collector, the link check and any temporary probe goes through this file, and nothing is sent
 * before `decideAccess` has said yes. Fail closed: a host with no rights record, a record never reviewed, or a way of access the record does not
 * cover is NOT requested.
 *
 *   state        meaning
 *   allowed      the rights record allows this way of access (e.g. status-only check of a host whose automation is not blocked)
 *   conditional  allowed only within the recorded scope: a documented API, a published dataset file, a listed source page
 *   forbidden    a rights record blocks automated requests to this host (automation = "blocked"), or this way of access is outside the record
 *   unconfirmed  no rights record covers the host, or its terms were never reviewed: held back, never treated as allowed
 *
 * kinds (never substituted for one another): html (page body) · api · dataset (CSV/XLSX/ZIP file) · robots (robots.txt) · status-only (HTTP status of a link, body not read)
 * robots.txt permission is a SEPARATE check made after this one (robots.ts): "robots allows it" never overrides "the rights record forbids it".
 * Permission to fetch is independent of permission to republish (`reuseStatus` / `display`): this file never grants reuse.
 */
import { RIGHTS, type Rights } from "../data/official/rights";
import { officialSources, type OfficialSource } from "../data/official/sources";

export type AccessKind = "html" | "api" | "dataset" | "robots" | "status-only";
export type AccessState = "allowed" | "conditional" | "forbidden" | "unconfirmed";
export type AccessDecision = { allow: boolean; state: AccessState; kind: AccessKind; url: string; reason: string; recordIds: string[] };

/** Hosts that were blocked before the rights records could express it; kept so that removing a record can never re-open them. */
const LEGACY_BLOCKED = ["ubc.ca", "translink.ca"];
export const hostKey = (u: string) => new URL(u).hostname.toLowerCase().replace(/^www\d?\./, "");
const sameOrSub = (h: string, base: string) => h === base || h.endsWith("." + base);
const noHash = (u: string) => u.replace(/#.*$/, "");

type Ctx = { rights: Record<string, Rights>; sources: OfficialSource[] };
const DEFAULT: Ctx = { rights: RIGHTS, sources: officialSources };

/** Hosts of publishers whose rights record blocks automation. Only the publisher's own site (`sourceUrl`) counts: a third-party catalogue that merely lists a dataset is judged on its own. */
export function blockedHostSet(ctx: Ctx = DEFAULT): Set<string> {
  const h = new Set<string>(LEGACY_BLOCKED);
  for (const r of Object.values(ctx.rights)) if (r.automation === "blocked" && r.sourceUrl) { try { h.add(hostKey(r.sourceUrl)); } catch { /* no url */ } }
  return h;
}

function evidence(url: string, ctx: Ctx) {
  const host = hostKey(url), u = noHash(url); const out: { id: string; r: Rights; listed: boolean; licence: boolean; licenceHost: boolean; apiHost: boolean; hostMatch: boolean }[] = [];
  for (const [id, r] of Object.entries(ctx.rights)) {
    if (r.automation === "blocked") continue;
    const src = ctx.sources.find((s) => s.id === id); const pages = [r.sourceUrl, ...(src?.pages ?? [])].filter(Boolean).map(noHash);
    const hosts = new Set(pages.map((p) => { try { return hostKey(p); } catch { return ""; } }));
    const apiHost = (r.apiHosts ?? []).some((a) => host === a.replace(/^www\d?\./, "")); const listed = pages.includes(u);
    const licence = !!r.licenseUrl && noHash(r.licenseUrl) === u; const licenceHost = !!r.licenseUrl && host === hostKey(r.licenseUrl); const hostMatch = hosts.has(host); // exact host only: gov.uk does not cover data.gov.uk (no public-suffix guessing)
    if (hostMatch || apiHost || licence || licenceHost) out.push({ id, r, listed, licence, licenceHost, apiHost, hostMatch });
  }
  return out;
}

export function decideAccess(url: string, kind: AccessKind, ctx: Ctx = DEFAULT): AccessDecision {
  const d = (allow: boolean, state: AccessState, reason: string, recordIds: string[] = []): AccessDecision => ({ allow, state, kind, url, reason, recordIds });
  let host: string; try { const p = new URL(url); if (p.protocol !== "https:") return d(false, "forbidden", "only https URLs are requested"); host = hostKey(url); } catch { return d(false, "forbidden", "not a valid URL"); }
  if ([...blockedHostSet(ctx)].some((b) => sameOrSub(host, b))) {
    const ids = Object.entries(ctx.rights).filter(([, r]) => r.automation === "blocked" && r.sourceUrl && sameOrSub(host, hostKey(r.sourceUrl))).map(([id]) => id);
    return d(false, "forbidden", `the rights record${ids.length ? ` (${ids.join(", ")})` : ""} blocks automated requests to ${host}; robots.txt permission does not change that`, ids);
  }
  const ev = evidence(url, ctx); const ids = ev.map((e) => e.id);
  if (!ev.length) return d(false, "unconfirmed", `no rights record covers ${host}: automated access is held back until its terms are reviewed`);
  const reviewed = ev.filter((e) => e.r.lastReviewedAt);
  if (!reviewed.length) return d(false, "unconfirmed", `the terms of ${host} were never reviewed (lastReviewedAt = null)`, ids);
  const ok = (state: AccessState, why: string) => d(true, state, why, reviewed.map((e) => e.id));
  const no = (why: string) => d(false, "forbidden", why, ids);
  const byKind = (k: AccessKind): AccessDecision => {
    if (k === "status-only" && !reviewed.some((e) => e.hostMatch || e.apiHost)) return no("only the record's own licence page is covered on this host");
    if (k === "status-only") return ok("allowed", "status-only check: the record does not block automation");
    if (k === "api") return reviewed.some((e) => e.r.accessMethod === "open-api") ? ok("conditional", "documented API of an open-api record") : no("the record allows no API access");
    if (k === "dataset") return reviewed.some((e) => e.r.accessMethod === "open-api" || e.r.accessMethod === "open-data-file") ? ok("conditional", "published dataset file of an open record") : no("the record allows no dataset download");
    if (k === "html") {
      if (reviewed.some((e) => e.licence)) return ok("conditional", "the record's own licence page");
      if (reviewed.some((e) => e.listed && e.r.accessMethod !== "manual-link")) return ok("conditional", "a source page listed in the record (page body)");
      return no("page bodies are read only for the source pages listed in the record; use a status-only check for other links");
    }
    return no("unknown way of access");
  };
  if (kind === "robots") { if (reviewed.some((e) => e.licenceHost)) return ok("allowed", "robots.txt of the host that serves the record's licence page"); const any = (["status-only", "api", "dataset", "html"] as AccessKind[]).some((k) => byKind(k).allow); return any ? ok("allowed", "robots.txt of a host that may be requested") : no("no way of access to this host is allowed, so its robots.txt is not requested either"); }
  return byKind(kind);
}

export class AccessDenied extends Error {
  constructor(public decision: AccessDecision) { super(`access refused before any request (${decision.state}, ${decision.kind}): ${decision.url} — ${decision.reason}`); this.name = "AccessDenied"; }
}

/* ---------- ledger, budget, pacing ---------- */
export type LedgerEntry = { at: string; kind: AccessKind; url: string; state: AccessState; allowed: boolean };
const ledger: LedgerEntry[] = []; const lastByHost = new Map<string, number>();
let budget = Number(process.env.STUDYATLAS_MAX_REQUESTS) || 400; let sent = 0;
export const accessLedger = () => ledger.slice();
export function resetGuard(opts: { maxRequests?: number } = {}) { ledger.length = 0; lastByHost.clear(); sent = 0; budget = opts.maxRequests ?? (Number(process.env.STUDYATLAS_MAX_REQUESTS) || 400); }
export const requestsSent = () => sent;
/** Throws AccessDenied before anything is sent. Every attempt (also a retry) counts against the budget. */
export function assertAccess(url: string, kind: AccessKind, ctx: Ctx = DEFAULT): AccessDecision {
  const dec = decideAccess(url, kind, ctx); ledger.push({ at: new Date().toISOString(), kind, url, state: dec.state, allowed: dec.allow });
  if (!dec.allow) throw new AccessDenied(dec);
  if (sent >= budget) throw new Error(`request budget of ${budget} reached: ${url} not requested`);
  sent++; return dec;
}
export type Transport = (url: string, init?: RequestInit) => Promise<Response>;
const PACE_MS = 1000; const pause = (ms: number) => new Promise((r) => setTimeout(r, ms));
/** The ONLY place that touches the network. `transport` and `ctx` can be replaced in tests; the rights check always runs first. */
export async function guardedFetch(url: string, kind: AccessKind, init?: RequestInit, opts: { transport?: Transport; ctx?: Ctx; paceMs?: number } = {}): Promise<Response> {
  assertAccess(url, kind, opts.ctx);
  const host = hostKey(url), gap = opts.paceMs ?? PACE_MS, wait = (lastByHost.get(host) ?? 0) + gap - Date.now(); if (wait > 0 && gap > 0) await pause(wait);
  lastByHost.set(host, Date.now());
  return (opts.transport ?? fetch)(url, init);
}
