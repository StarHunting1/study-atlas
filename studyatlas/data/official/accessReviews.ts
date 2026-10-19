/*
 * Human source-access reviews (Ver.1.6.8). A new source can be requested by the collector only after a PERSON has read its terms and recorded, here, what they allow.
 * Nothing in this file is generated: reviewer, date, clauses and scope are written by the person who read the terms. The guard (collector/guard.ts) reads these records;
 * a record that fails `validateReview`, is suspended or has passed its `nextReviewDue` date grants nothing (fail closed).
 *
 * Two permissions are recorded SEPARATELY and never imply each other:
 *   1. automated ACCESS  – may a program request these URLs, and in which ways (html page body / api / dataset file / status-only / robots)?   → `automation`, `methods`, `urlPrefixes`, `clauses`
 *   2. REDISTRIBUTION    – may what was fetched be shown or republished on StudyAtlas, and under what attribution?                              → `redistribution`
 * Getting a page is not permission to publish it, and a school or register record that was fetched does not make a school "verified" (that stays a human approval).
 *
 * A review can only open a host that no rights record covers. It never lifts a block in rights.data.ts (automation = "blocked"): that record itself must be edited by a person.
 * Procedure, examples and the CLI: collector/README.md ("Source access review"). `npm run review -- list | validate | template <host> | show <id>`.
 */
import { RIGHTS, type Rights } from "./rights";

export type ReviewKind = "html" | "api" | "dataset" | "robots" | "status-only";
export type Clause = { /** where in the terms, e.g. "§4.2 Automated access" */ ref: string; /** what it says, in the reviewer's words */ summary: string; /** optional verbatim words */ quote?: string; /** the ways of access this clause permits */ allows: ReviewKind[] };
export type ReviewHistory = { at: string; by: string; change: string; /** what was in force before this change, so an earlier condition can still be read */ previous?: { automation: string; methods: ReviewKind[]; urlPrefixes: string[]; nextReviewDue: string } };
export type AccessReview = {
  id: string; service: string; hosts: string[];
  termsUrl: string; termsName: string; termsVersion: string;
  reviewedAt: string; reviewedBy: string; nextReviewDue: string; status: "active" | "suspended";
  /** may a program request the URLs below? "forbidden" is recorded too, so that a refusal is a decision and not a gap */
  automation: "allowed" | "forbidden";
  methods: ReviewKind[]; urlPrefixes: string[]; clauses: Clause[];
  rateLimit: { minIntervalMs: number; maxRequestsPerRun: number };
  /** reuse of what is fetched: separate from `automation`, with its own basis */
  redistribution: { status: "permitted" | "restricted" | "unknown"; conditions: string; attribution?: string; basis?: { ref: string; summary: string }[] };
  /** what could not be settled; the reviewer lists it instead of guessing */
  unconfirmed: string[];
  history: ReviewHistory[];
};
/** The human's decisions. Empty until a person adds a record (see collector/README.md). */
export const ACCESS_REVIEWS: AccessReview[] = [];

/** Sources whose review is wanted next. They are NOT reviewed and grant nothing: the guard still holds every host below as unconfirmed. */
export const PENDING_SOURCES: { id: string; service: string; hosts: string[]; purpose: string }[] = [
  { id: "study-australia", service: "Study Australia (Australian Government)", hosts: ["studyaustralia.gov.au", "search.studyaustralia.gov.au"], purpose: "provider directory: institution name, CRICOS provider code, campus address" },
  { id: "cricos", service: "CRICOS (Commonwealth Register of Institutions and Courses for Overseas Students)", hosts: ["cricos.education.gov.au"], purpose: "institution, campus and course registration (its robots.txt disallows automated access; robots.txt is not the terms)" },
  { id: "languages-canada", service: "Languages Canada", hosts: ["languagescanada.ca"], purpose: "accredited programs directory" },
  { id: "english-uk", service: "English UK", hosts: ["englishuk.com"], purpose: "member directory" },
  { id: "british-council", service: "British Council", hosts: ["britishcouncil.org"], purpose: "accreditation UK (English language centres)" },
];

/* ---------- validation ---------- */
const KINDS: ReviewKind[] = ["html", "api", "dataset", "robots", "status-only"];
const PLACEHOLDER = /^\s*$|^\s*(todo|tbd|xxx)\b|^\s*(n\/a|none|unknown|-)\s*$/i;
const NOT_A_PERSON = /claude|anthropic|\bai\b|\bbot\b|\bauto|generated|assistant|gpt|llm/i;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const day = (s: string) => Date.parse(s + "T00:00:00Z");
export const hostOnly = (h: string) => h.toLowerCase().replace(/^www\./, "");
type VCtx = { rights?: Record<string, Rights>; today?: string };
const todayStr = (c?: VCtx) => c?.today ?? new Date().toISOString().slice(0, 10);

/** Everything a person must have filled in. Returns the list of problems; an empty list means the record is complete (not that its content is right: a person still reads it). */
export function validateReview(r: AccessReview, ctx: VCtx = {}): string[] {
  const e: string[] = []; const need = (v: unknown, name: string) => { if (typeof v !== "string" || PLACEHOLDER.test(v)) e.push(`${name} is empty or a placeholder`); };
  need(r.id, "id"); need(r.service, "service"); need(r.termsName, "termsName"); need(r.termsVersion, "termsVersion"); need(r.reviewedBy, "reviewedBy");
  if (typeof r.reviewedBy === "string" && NOT_A_PERSON.test(r.reviewedBy)) e.push("reviewedBy must be the person who read the terms, not a tool or assistant");
  if (!/^https:\/\/[^/\s]+\//.test(r.termsUrl ?? "")) e.push("termsUrl must be an https URL of the terms document");
  if (!DATE.test(r.reviewedAt ?? "") || Number.isNaN(day(r.reviewedAt))) e.push("reviewedAt must be YYYY-MM-DD"); else if (day(r.reviewedAt) > day(todayStr(ctx))) e.push("reviewedAt is in the future");
  if (!DATE.test(r.nextReviewDue ?? "") || Number.isNaN(day(r.nextReviewDue))) e.push("nextReviewDue is required (YYYY-MM-DD)");
  else if (DATE.test(r.reviewedAt ?? "")) { if (day(r.nextReviewDue) <= day(r.reviewedAt)) e.push("nextReviewDue must be after reviewedAt"); else if (day(r.nextReviewDue) - day(r.reviewedAt) > 400 * 86400000) e.push("nextReviewDue is more than 400 days after reviewedAt"); }
  if (r.status !== "active" && r.status !== "suspended") e.push("status must be active or suspended");
  if (r.automation !== "allowed" && r.automation !== "forbidden") e.push("automation must be allowed or forbidden (a refusal is recorded too)");
  if (!Array.isArray(r.hosts) || !r.hosts.length) e.push("hosts is empty"); else for (const h of r.hosts) if (!/^[a-z0-9]([a-z0-9.-]*[a-z0-9])?$/.test(h) || !h.includes(".") || /^www\./.test(h)) e.push(`host "${h}" must be a bare host name (no scheme, path, wildcard or www.)`);
  if (!Array.isArray(r.methods) || !r.methods.length) e.push("methods is empty: say whether html, api, dataset, status-only or robots access is allowed"); else for (const m of r.methods) if (!KINDS.includes(m)) e.push(`unknown method "${m}"`);
  if (!Array.isArray(r.urlPrefixes) || !r.urlPrefixes.length) e.push("urlPrefixes is empty: the allowed URL range must be stated");
  else for (const p of r.urlPrefixes) {
    let u: URL | undefined; try { u = new URL(p); } catch { /* reported below */ }
    if (!u || u.protocol !== "https:") { e.push(`urlPrefix "${p}" must be an https URL`); continue; }
    if (!r.hosts?.includes(hostOnly(u.hostname))) e.push(`urlPrefix "${p}" is on a host that is not listed in hosts (no subdomain is allowed unless listed)`);
    if (u.pathname === "/" && !u.search && (r.methods ?? []).some((m) => m === "html" || m === "api" || m === "dataset")) e.push(`urlPrefix "${p}" is the whole site: state the path that the terms allow`);
  }
  if (Array.isArray(r.hosts) && Array.isArray(r.urlPrefixes)) for (const h of r.hosts) if (!r.urlPrefixes.some((p) => { try { return hostOnly(new URL(p).hostname) === h; } catch { return false; } })) e.push(`host "${h}" has no urlPrefix`);
  if (!Array.isArray(r.clauses)) e.push("clauses is missing");
  else {
    if (r.automation === "allowed" && !r.clauses.length) e.push("automation is allowed but no clause of the terms is cited");
    r.clauses.forEach((c, i) => { need(c.ref, `clauses[${i}].ref`); need(c.summary, `clauses[${i}].summary`); if (!Array.isArray(c.allows) || !c.allows.length || c.allows.some((k) => !KINDS.includes(k))) e.push(`clauses[${i}].allows must list the ways of access that clause permits`); });
    if (r.automation === "allowed") for (const m of r.methods ?? []) if (m !== "robots" && !r.clauses.some((c) => c.allows?.includes(m))) e.push(`method "${m}" is not backed by any clause`);
    if (r.automation === "forbidden" && !r.clauses.length) e.push("a refusal also cites the clause that forbids or does not grant automated access");
  }
  if (!r.rateLimit || !(r.rateLimit.minIntervalMs >= 1000) || !(r.rateLimit.maxRequestsPerRun >= 1 && r.rateLimit.maxRequestsPerRun <= 500)) e.push("rateLimit needs minIntervalMs >= 1000 and maxRequestsPerRun between 1 and 500");
  if (!r.redistribution || !["permitted", "restricted", "unknown"].includes(r.redistribution.status)) e.push("redistribution.status must be permitted, restricted or unknown: reuse is decided separately from access");
  else {
    need(r.redistribution.conditions, "redistribution.conditions");
    if (r.redistribution.status === "permitted" && !(r.redistribution.basis?.length && r.redistribution.basis.every((b) => !PLACEHOLDER.test(b.ref ?? "") && !PLACEHOLDER.test(b.summary ?? "")))) e.push("redistribution is permitted but has no basis of its own (a clause that allows access does not allow republishing)");
  }
  if (!Array.isArray(r.unconfirmed)) e.push("unconfirmed must be a list (it may be empty)");
  if (!Array.isArray(r.history) || !r.history.length) e.push("history is empty: record at least the first review"); else {
    r.history.forEach((h, i) => { if (!DATE.test(h.at ?? "") || PLACEHOLDER.test(h.by ?? "") || NOT_A_PERSON.test(h.by ?? "") || PLACEHOLDER.test(h.change ?? "")) e.push(`history[${i}] needs a date, a person and a description`); if (i > 0 && !h.previous) e.push(`history[${i}] must keep the previous conditions (previous)`); });
  }
  const rights = ctx.rights ?? RIGHTS;
  for (const h of r.hosts ?? []) for (const [id, rr] of Object.entries(rights)) { try { if (rr.automation === "blocked" && rr.sourceUrl && hostOnly(new URL(rr.sourceUrl).hostname) === h) e.push(`host "${h}" is blocked by the rights record "${id}": a review cannot lift a block, edit that record instead`); } catch { /* no url */ } }
  return e;
}
export const isExpired = (r: Pick<AccessReview, "nextReviewDue">, today = new Date().toISOString().slice(0, 10)) => day(r.nextReviewDue) < day(today);
/** Active, complete and not expired: the only state in which a review grants anything. */
export const reviewInForce = (r: AccessReview, ctx: VCtx = {}) => r.status === "active" && validateReview(r, ctx).length === 0 && !isExpired(r, todayStr(ctx));

/** Does `url` lie inside the reviewed URL range? The host must be listed exactly (no subdomain guessing) and the path must start at a prefix on a path-segment boundary. */
export function inScope(r: AccessReview, url: string): boolean {
  let u: URL; try { u = new URL(url); } catch { return false; } if (u.protocol !== "https:" || !r.hosts.includes(hostOnly(u.hostname))) return false;
  return r.urlPrefixes.some((p) => { try { const q = new URL(p); if (hostOnly(q.hostname) !== hostOnly(u.hostname)) return false; if (q.pathname === "/") return true; const base = q.pathname.replace(/\/$/, ""); return u.pathname === base || u.pathname.startsWith(base + "/") || (q.pathname.endsWith("/") && u.pathname.startsWith(q.pathname)); } catch { return false; } });
}
/** May what was fetched from `url` be republished? Only a review in force that records redistribution as permitted for that URL says yes; access permission alone never does. */
export function canRepublish(url: string, reviews: AccessReview[] = ACCESS_REVIEWS, ctx: VCtx = {}): boolean {
  return reviews.some((r) => reviewInForce(r, ctx) && r.automation === "allowed" && r.redistribution.status === "permitted" && inScope(r, url));
}
