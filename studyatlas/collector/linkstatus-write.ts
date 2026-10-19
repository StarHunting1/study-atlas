/*
 * Writes data/linkStatus.ts from the JSON that `collector/linkcheck.ts` prints between LINKCHECK_JSON_BEGIN / LINKCHECK_JSON_END (Ver.1.6.6).
 *   npx tsx collector/linkstatus-write.ts <json file> <actions run URL> <YYYY-MM-DD>
 * Nothing is requested here. Each entry keeps how it was checked (mode) and when, so an old result is never read as the latest one.
 */
import { readFileSync, writeFileSync } from "node:fs";
type Row = { u: string; v: string; s: number | null; c: boolean | null; m?: string; d?: string };
export function renderLinkStatus(rows: Row[], run: string, date: string): string {
  const lines = [...rows].sort((a, b) => a.u.localeCompare(b.u)).map((r) => `  [${JSON.stringify(r.u)}, ${JSON.stringify(r.v)}, ${r.s}, ${r.c}, ${JSON.stringify(r.m ?? "html")}, ${JSON.stringify(r.d ?? date)}],`);
  return `/*
 * Result of the link check of the Manchester / Vancouver / Toronto / London / Sydney / Melbourne source links (collector/linkcheck.ts), run by GitHub Actions on ${date}
 * (${run}: the PR job "Collect official data" ran \`npx tsx collector/linkcheck.ts\`). Written by collector/linkstatus-write.ts from the job log; one request per link, no retries.
 * Which links may be requested, and how, is decided from the rights records BEFORE any request (collector/guard.ts); the recorded result must agree with that decision (tests/guard166.test.ts).
 *   verdict: ok | access-denied (HTTP 401/403/429: the page may exist) | broken | skipped (a rights record forbids automated requests: not requested) | unconfirmed (no rights record covers the host, or its terms were never reviewed: not requested)
 *            | robots-disallowed (robots.txt disallows the path, or could not be fetched: then no request is made)
 *   content: true = the page answered 2xx AND contains the words we expect; false = answered but the words were not found; null = not checked for words (status-only check, licence pages, catalogues) or not requested.
 *   mode:    html (page body read) | status-only (HTTP status only, body not read) | skip (no request at all)
 *   checkedAt: the day this entry was produced. "Verified link" in the audit = ok + content true. A rights skip is NOT a broken link and NOT a verified one: the link is simply not confirmed.
 */
export type LinkVerdict = "ok" | "access-denied" | "broken" | "skipped" | "unconfirmed" | "robots-disallowed";
export type LinkMode = "html" | "status-only" | "skip";
export const LINK_CHECKED_AT = ${JSON.stringify(date)};
export const LINK_CHECK_RUN = ${JSON.stringify(run)};
export const LINK_STATUS: [url: string, verdict: LinkVerdict, status: number | null, content: boolean | null, mode: LinkMode, checkedAt: string][] = [
${lines.join("\n")}
];
export const linkStatusOf = (url: string) => LINK_STATUS.find((r) => r[0] === url.replace(/#.*$/, ""));
`;
}
if (process.argv[1] && /linkstatus-write\.ts$/.test(process.argv[1])) {
  const [, , file, run, date] = process.argv; const raw = readFileSync(file, "utf8"); const m = /LINKCHECK_JSON_BEGIN\s*([\s\S]*?)\s*LINKCHECK_JSON_END/.exec(raw);
  const rows = JSON.parse(m ? m[1] : raw) as Row[]; writeFileSync("data/linkStatus.ts", renderLinkStatus(rows, run, date)); console.log(`wrote data/linkStatus.ts (${rows.length} links)`);
}
