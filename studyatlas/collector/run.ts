/*
 * Collector CLI.
 *   npx tsx collector/run.ts [--sources all|id,id] [--ai] [--fixtures] [--dry-run] [--summary <file>]
 * --fixtures  read local test files in collector/fixtures/ instead of calling APIs (results are labelled as fixtures)
 * --dry-run   do not write data/collected/* (used on pull requests)
 * --data-dir <dir>  read/write the snapshot here instead of data/collected (tests; also allows writing with --fixtures)
 * --force    fetch every source now, ignoring each source's cadence (pull-request dry runs use it)
 * --pending <file>  snapshot of an open, not yet merged candidate PR. The run is compared against it, so the same
 *                   data fetched again produces no new changes (no duplicate PR) and nothing in that PR is lost.
 * Exit code is 0 even when a source fails (failures are reported); 2 when every attempted source failed.
 */
import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { extract } from "./ai";
import { fixtureFetchAll, fixturePost, fixtureText } from "./fixtures";
import { officialConsistency } from "./consistency";
import { makeRobots } from "./robots";
import { renderReport } from "./report";
import { sources } from "./sources";
import { diffSnapshots, emptySnapshot, merge } from "./store";
import type { CollectedRecord, FetchContext, Snapshot, SourceRun } from "./types";
import { fetchJson, fetchText, postJson, sleep, USER_AGENT } from "./util";
import { RIGHTS, automationFor } from "../data/official/rights";

export const DEFAULT_DATA_DIR = path.resolve(process.cwd(), "data/collected");
const arg = (name: string) => { const i = process.argv.indexOf(`--${name}`); return i >= 0 ? process.argv[i + 1] : undefined; };
const flag = (name: string) => process.argv.includes(`--${name}`);

type Fetchers = Partial<Pick<FetchContext, "fetchJson" | "postJson" | "fetchText">>;
/** Days until a source is due again (0 = due now). Based on its last successful fetch in the comparison snapshot. */
export function dueIn(s: { cadenceDays?: number }, lastSuccessAt: string | undefined, now: string) {
  if (!s.cadenceDays || !lastSuccessAt) return 0;
  return Math.max(0, Math.ceil(s.cadenceDays - (Date.parse(now) - Date.parse(lastSuccessAt)) / 86400000));
}

export async function collect(o: { only?: string[]; ai: boolean; fixtures: boolean; now: string; prev: Snapshot; fetcher?: (url: string) => Promise<unknown>; fetchers?: Fetchers; force?: boolean; aiUnavailable?: string }) {
  const runs: SourceRun[] = []; const fetched: Record<string, CollectedRecord[]> = {}; const aiErrors: string[] = o.aiUnavailable ? [o.aiUnavailable] : []; const failedIds = new Set<string>();
  const live = { fetchJson: (u: string) => fetchJson(u), postJson, fetchText: (u: string) => fetchText(u) };
  const fix = { fetchJson: fixtureFetchAll, postJson: fixturePost, fetchText: fixtureText };
  const base = { ...(o.fixtures ? fix : live), ...(o.fetcher ? { fetchJson: o.fetcher } : {}), ...o.fetchers };
  const robots = makeRobots(base.fetchText, USER_AGENT);
  // Every request goes through one gate: robots.txt must allow the URL, and a Crawl-delay is honoured per host (Ver.1.2).
  // (The page sources check robots themselves as before; checking twice is harmless – the verdict is cached per origin.)
  const lastAt = new Map<string, number>(); const polite = async (url: string) => {
    const rb = await robots(url);
    if (!rb.allowed) {
      const ex = Object.values(RIGHTS).find((r) => r.robotsException && url.startsWith(r.robotsException.urlPrefix))?.robotsException;
      if (!ex) throw new Error(`${url}: ${rb.reason} – not requested`);
      console.warn(`[robots] ${url} is disallowed by robots.txt but allowed by the provider's usage policy (${ex.policyUrl}); continuing at the documented rate.`);
    }
    const host = new URL(url).host; const gap = (rb.crawlDelay ?? 0) * 1000; const wait = (lastAt.get(host) ?? 0) + gap - Date.now(); if (gap > 0 && wait > 0) await sleep(wait); lastAt.set(host, Date.now());
  };
  const gate = !o.fixtures && !o.fetcher; // fixtures and an injected JSON fetcher are tests: no real robots.txt requests
  const gated = !gate ? base : { ...base, fetchJson: async (u: string) => { await polite(u); return base.fetchJson(u); }, postJson: async (u: string, b: unknown) => { await polite(u); return base.postJson(u, b); } };
  const ctx: FetchContext = { ...gated, robots, now: o.now };
  for (const s of sources) {
    if (o.only && !o.only.includes(s.id)) continue;
    if (!s.fetch) { runs.push({ sourceId: s.id, ok: false, attemptedAt: o.now, records: 0, skipped: `not implemented (${s.access})` }); continue; }
    const auto = automationFor(s.id); // rights review (data/official/rights.data.ts): a blocked source is not requested at all
    if (auto.automation === "blocked") { runs.push({ sourceId: s.id, ok: true, attemptedAt: o.now, records: 0, skipped: `blocked by the rights review: ${auto.why}` }); continue; }
    const wait = o.force ? 0 : dueIn(s, o.prev.runs[s.id]?.lastSuccessAt, o.now);
    if (wait > 0) { runs.push({ sourceId: s.id, ok: true, attemptedAt: o.now, records: 0, skipped: `not due (checked every ${s.cadenceDays} days; due in ${wait} day(s))` }); continue; }
    try {
      const { records, texts, failedIds: failed = [] } = await s.fetch(ctx); failed.forEach((id) => failedIds.add(id));
      if (o.ai) for (const r of records) {
        const text = texts[r.id]; const prev = o.prev.records[r.id];
        if (!text || (prev?.ai && prev.contentHash === r.contentHash)) continue; // nothing new to read
        try { const out = await extract(r, text, o.now); if ("error" in out) aiErrors.push(`${r.id}: ${out.error}`); else r.ai = out; }
        catch (e) { aiErrors.push(`${r.id}: ${(e as Error).message}`); }
      }
      fetched[s.id] = records; runs.push({ sourceId: s.id, ok: true, attemptedAt: o.now, records: records.length });
    } catch (e) { runs.push({ sourceId: s.id, ok: false, attemptedAt: o.now, records: 0, error: (e as Error).message }); }
  }
  // A skipped (not implemented) source is not a failure and must not touch its state
  const attempted = runs.filter((r) => !r.skipped);
  const { next, changes } = merge(o.prev, attempted, fetched, o.now, failedIds);
  next.runs = { ...next.runs, ...Object.fromEntries(runs.filter((r) => r.skipped).map((r) => [r.sourceId, { ...r, lastSuccessAt: o.prev.runs[r.sourceId]?.lastSuccessAt }])) };
  const consistency = officialConsistency(next);
  const report = renderReport({ sources: sources.filter((s) => !o.only || o.only.includes(s.id)), runs, snapshot: next, changes, mode: o.fixtures ? "fixtures" : "live", now: o.now, aiErrors, consistency });
  return { runs, attempted, next, changes, report, aiErrors, consistency };
}

async function main() {
  const onlyArg = arg("sources"); const only = onlyArg && onlyArg !== "all" ? onlyArg.split(",").map((s) => s.trim()) : undefined;
  const fixtures = flag("fixtures"); const dry = flag("dry-run"); const force = flag("force");
  // Missing key: collect anyway without AI (reported), instead of failing the whole run
  let ai = flag("ai"); let aiUnavailable: string | undefined;
  if (ai && !process.env.ANTHROPIC_API_KEY) { aiUnavailable = "AI step skipped: ANTHROPIC_API_KEY is not set (add it as a GitHub Secret)."; console.warn(`::warning::${aiUnavailable}`); ai = false; }
  const dataDirArg = arg("data-dir"); const DATA_DIR = dataDirArg ? path.resolve(dataDirArg) : DEFAULT_DATA_DIR;
  const snapPath = path.join(DATA_DIR, "snapshot.json");
  const accepted: Snapshot = existsSync(snapPath) ? JSON.parse(readFileSync(snapPath, "utf8")) : emptySnapshot();
  const pendingPath = arg("pending");
  const pending: Snapshot | undefined = pendingPath && existsSync(pendingPath) ? JSON.parse(readFileSync(pendingPath, "utf8")) : undefined;
  const now = new Date().toISOString();
  // Compare with the open candidate PR when there is one, otherwise with the accepted snapshot on main
  const { runs, attempted, next, changes, aiErrors, consistency } = await collect({ only, ai, fixtures, now, prev: pending ?? accepted, aiUnavailable, force });
  // candidates.json always holds everything the (new or updated) PR proposes relative to main
  const proposed = diffSnapshots(accepted, next);
  const report = renderReport({ sources: sources.filter((s) => !only || only.includes(s.id)), runs, snapshot: next, changes, proposed: pending ? proposed : undefined, mode: fixtures ? "fixtures" : "live", now, aiErrors, consistency });
  console.log(report);
  const summary = arg("summary"); if (summary) appendFileSync(summary, report + "\n");
  // Fixture runs never touch the real data directory; they may write only to an explicit --data-dir (tests)
  if (!dry && (!fixtures || dataDirArg)) {
    mkdirSync(DATA_DIR, { recursive: true });
    // Only write when something changed, so unchanged runs do not open pull requests
    if (changes.length) {
      writeFileSync(snapPath, JSON.stringify(next, null, 2) + "\n");
      writeFileSync(path.join(DATA_DIR, "candidates.json"), JSON.stringify({ generatedAt: now, changes: proposed }, null, 2) + "\n");
      writeFileSync(path.join(DATA_DIR, "REPORT.md"), report + "\n");
    }
  }
  const out = process.env.GITHUB_OUTPUT; if (out) appendFileSync(out, `changes=${changes.length}\nproposed=${proposed.length}\nfailed=${attempted.filter((r) => !r.ok).length}\n`);
  if (attempted.length && attempted.every((r) => !r.ok)) process.exit(2);
}
if (process.argv[1] && /run\.ts$/.test(process.argv[1])) main().catch((e) => { console.error(e); process.exit(1); });
