/*
 * Source-access review helper (Ver.1.6.8). It lists, checks and prints templates; it NEVER sends a request, approves anything, or fills in a reviewer, date or clause.
 *   npm run review -- list        hosts by state: unconfirmed · forbidden · conditional · reviewed · overdue, and the records that need a person's decision
 *   npm run review -- validate    checks every human review record (exit code 1 if one is incomplete or has expired)
 *   npm run review -- show <id>   one review record, with its history
 *   npm run review -- template <host>   an empty record to be filled in BY A PERSON after reading the terms (it fails `validate` until completed)
 * Procedure, examples and what to do when the terms are unclear: collector/README.md ("Source access review").
 */
import { ACCESS_REVIEWS, PENDING_SOURCES, isExpired, reviewInForce, validateReview, type AccessReview } from "../data/official/accessReviews";
import { RIGHTS, type Rights } from "../data/official/rights";
import { officialSources } from "../data/official/sources";
import { decideAccess, hostKey } from "./guard";
import { linkTargets } from "./linkcheck";

export type HostRow = { host: string; group: "unconfirmed" | "forbidden" | "conditional" | "reviewed" | "overdue"; why: string; priority?: string };
type RCtx = { reviews?: AccessReview[]; rights?: Record<string, Rights>; today?: string; urls?: string[] };

/** One row per host the project links to or knows. Pure: reads the records and the guard's decision, requests nothing. */
export function hostRows(c: RCtx = {}): HostRow[] {
  const reviews = c.reviews ?? ACCESS_REVIEWS, rights = c.rights ?? RIGHTS, today = c.today ?? new Date().toISOString().slice(0, 10);
  const urls = new Map<string, string>(); const add = (u?: string | null) => { if (!u) return; try { const h = hostKey(u); if (!urls.has(h)) urls.set(h, u); } catch { /* not a url */ } };
  (c.urls ?? linkTargets().map((t) => t.url)).forEach(add); Object.values(rights).forEach((r) => { add(r.sourceUrl); add(r.licenseUrl); }); officialSources.forEach((s) => s.pages.forEach(add));
  reviews.forEach((r) => r.hosts.forEach((h) => add(`https://${h}/`))); PENDING_SOURCES.forEach((p) => p.hosts.forEach((h) => add(`https://${h}/`)));
  const ctx = { rights, sources: officialSources, reviews, today }; const rows: HostRow[] = [];
  for (const [host, u] of [...urls].sort((a, b) => a[0].localeCompare(b[0]))) {
    const pending = PENDING_SOURCES.find((p) => p.hosts.includes(host)); const rev = reviews.filter((r) => r.hosts.includes(host)); const dec = decideAccess(u, "status-only", ctx);
    const base = { host, priority: pending ? `priority: ${pending.service}` : undefined };
    if (rev.some((r) => r.status === "active" && validateReview(r, { rights, today }).length === 0 && isExpired(r, today))) rows.push({ ...base, group: "overdue", why: `review expired (${rev[0].nextReviewDue}); automated access is stopped until a person re-reviews` });
    else if (rev.some((r) => reviewInForce(r, { rights, today }))) rows.push({ ...base, group: "reviewed", why: `human review in force until ${rev.find((r) => reviewInForce(r, { rights, today }))!.nextReviewDue}` });
    else if (dec.state === "forbidden") rows.push({ ...base, group: "forbidden", why: dec.reason });
    else if (dec.state === "unconfirmed") rows.push({ ...base, group: "unconfirmed", why: dec.reason });
    else rows.push({ ...base, group: "conditional", why: dec.reason });
  }
  return rows;
}
/** Rights records that allow some automated access but carry no re-review date: left as they are, reported for a person to decide (a date is never invented here). */
export function undatedRights(rights: Record<string, Rights> = RIGHTS) { return Object.entries(rights).filter(([, r]) => r.automation !== "blocked").map(([id, r]) => ({ id, automation: r.automation, lastReviewedAt: r.lastReviewedAt })); }
export function validateAll(reviews: AccessReview[] = ACCESS_REVIEWS, today = new Date().toISOString().slice(0, 10)) {
  return reviews.map((r) => ({ id: r.id, problems: validateReview(r, { today }), expired: isExpired(r, today) }));
}
export function template(host: string): string {
  const h = host.toLowerCase().replace(/^www\./, "");
  return `// Fill in EVERY field yourself after reading the terms. Leave "TODO" where you have not read or decided: the record then grants nothing.
{ id: "TODO-short-id", service: "TODO", hosts: ["${h}"],
  termsUrl: "TODO https://…", termsName: "TODO", termsVersion: "TODO", reviewedAt: "TODO YYYY-MM-DD", reviewedBy: "TODO your name", nextReviewDue: "TODO YYYY-MM-DD", status: "active",
  automation: "TODO allowed | forbidden", methods: [/* "html" | "api" | "dataset" | "status-only" | "robots" */], urlPrefixes: ["TODO https://${h}/path-the-terms-allow/"],
  clauses: [{ ref: "TODO §…", summary: "TODO what the clause says", quote: "optional verbatim words", allows: [/* ways of access this clause permits */] }],
  rateLimit: { minIntervalMs: 1000, maxRequestsPerRun: 20 },
  redistribution: { status: "unknown", conditions: "TODO (decided separately from access; leave unknown until you have read the reuse terms)" },
  unconfirmed: [/* what you could not settle */],
  history: [{ at: "TODO YYYY-MM-DD", by: "TODO your name", change: "first review" }] },`;
}
function main() {
  const [cmd, arg] = process.argv.slice(2); const out = (s = "") => console.log(s);
  if (cmd === "list") {
    const rows = hostRows(); const G: [HostRow["group"], string][] = [["unconfirmed", "未確認（権利レコードも審査もない。自動取得しない）"], ["forbidden", "禁止（権利レコードが自動取得をブロック）"], ["conditional", "条件付き（権利レコードの範囲内でのみ）"], ["reviewed", "審査済み（人の審査が有効）"], ["overdue", "再確認期限切れ（自動取得停止）"]];
    for (const [g, label] of G) { const rs = rows.filter((r) => r.group === g); out(`\n## ${label}: ${rs.length}`); rs.forEach((r) => out(`- ${r.host}${r.priority ? `  [${r.priority}]` : ""}\n    ${r.why}`)); }
    const u = undatedRights(); out(`\n## 再確認日が記録されていない既存の権利レコード（${u.length}件。変更していません。人の判断が必要）`); u.forEach((r) => out(`- ${r.id}  automation=${r.automation}  lastReviewedAt=${r.lastReviewedAt ?? "never"}`));
  } else if (cmd === "validate") {
    const rs = validateAll(); let bad = 0; if (!rs.length) out("no human review records yet (nothing is allowed through a review)");
    for (const r of rs) { const ok = !r.problems.length && !r.expired; if (!ok) bad++; out(`${ok ? "OK  " : "FAIL"} ${r.id}${r.expired ? "  (EXPIRED: re-review needed)" : ""}`); r.problems.forEach((p) => out(`     - ${p}`)); }
    process.exit(bad ? 1 : 0);
  } else if (cmd === "show") {
    const r = ACCESS_REVIEWS.find((x) => x.id === arg); if (!r) { out(`no review record "${arg}"`); process.exit(1); } out(JSON.stringify(r, null, 2));
  } else if (cmd === "template" && arg) out(template(arg));
  else out("usage: npm run review -- list | validate | show <id> | template <host>");
}
if (process.argv[1] && /review\.ts$/.test(process.argv[1])) main();
