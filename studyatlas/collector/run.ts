/*
 * Collector CLI.
 *   npx tsx collector/run.ts [--sources all|id,id] [--ai] [--fixtures] [--dry-run] [--summary <file>]
 * --fixtures  read local test files in collector/fixtures/ instead of calling APIs (results are labelled as fixtures)
 * --dry-run   do not write data/collected/* (used on pull requests)
 * --data-dir <dir>  read/write the snapshot here instead of data/collected (tests; also allows writing with --fixtures)
 * --pending <file>  snapshot of an open, not yet merged candidate PR. The run is compared against it, so the same
 *                   data fetched again produces no new changes (no duplicate PR) and nothing in that PR is lost.
 * Exit code is 0 even when a source fails (failures are reported); 2 when every attempted source failed.
 */
import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { extract } from "./ai";
import { fixtureFetch } from "./fixtures";
import { renderReport } from "./report";
import { sources } from "./sources";
import { diffSnapshots, emptySnapshot, merge } from "./store";
import type { CollectedRecord, Snapshot, SourceRun } from "./types";
import { fetchJson } from "./util";

export const DEFAULT_DATA_DIR = path.resolve(process.cwd(), "data/collected");
const arg = (name: string) => { const i = process.argv.indexOf(`--${name}`); return i >= 0 ? process.argv[i + 1] : undefined; };
const flag = (name: string) => process.argv.includes(`--${name}`);

export async function collect(o: { only?: string[]; ai: boolean; fixtures: boolean; now: string; prev: Snapshot; fetcher?: (url: string) => Promise<unknown>; aiUnavailable?: string }) {
  const runs: SourceRun[] = []; const fetched: Record<string, CollectedRecord[]> = {}; const aiErrors: string[] = o.aiUnavailable ? [o.aiUnavailable] : []; const failedIds = new Set<string>();
  const ctx = { fetchJson: o.fetcher ?? (o.fixtures ? fixtureFetch : (u: string) => fetchJson(u)), now: o.now };
  for (const s of sources) {
    if (o.only && !o.only.includes(s.id)) continue;
    if (!s.fetch) { runs.push({ sourceId: s.id, ok: false, attemptedAt: o.now, records: 0, skipped: `not implemented (${s.access})` }); continue; }
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
  const report = renderReport({ sources: sources.filter((s) => !o.only || o.only.includes(s.id)), runs, snapshot: next, changes, mode: o.fixtures ? "fixtures" : "live", now: o.now, aiErrors });
  return { runs, attempted, next, changes, report, aiErrors };
}

async function main() {
  const onlyArg = arg("sources"); const only = onlyArg && onlyArg !== "all" ? onlyArg.split(",").map((s) => s.trim()) : undefined;
  const fixtures = flag("fixtures"); const dry = flag("dry-run");
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
  const { runs, attempted, next, changes, aiErrors } = await collect({ only, ai, fixtures, now, prev: pending ?? accepted, aiUnavailable });
  // candidates.json always holds everything the (new or updated) PR proposes relative to main
  const proposed = diffSnapshots(accepted, next);
  const report = renderReport({ sources: sources.filter((s) => !only || only.includes(s.id)), runs, snapshot: next, changes, proposed: pending ? proposed : undefined, mode: fixtures ? "fixtures" : "live", now, aiErrors });
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
