/*
 * Collector CLI.
 *   npx tsx collector/run.ts [--sources all|id,id] [--ai] [--fixtures] [--dry-run] [--summary <file>]
 * --fixtures  read local test files in collector/fixtures/ instead of calling APIs (results are labelled as fixtures)
 * --dry-run   do not write data/collected/* (used on pull requests)
 * Exit code is 0 even when a source fails (failures are reported); 2 when every attempted source failed.
 */
import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { extract } from "./ai";
import { fixtureFetch } from "./fixtures";
import { renderReport } from "./report";
import { sources } from "./sources";
import { emptySnapshot, merge } from "./store";
import type { CollectedRecord, Snapshot, SourceRun } from "./types";
import { fetchJson } from "./util";

export const DATA_DIR = path.resolve(process.cwd(), "data/collected");
const arg = (name: string) => { const i = process.argv.indexOf(`--${name}`); return i >= 0 ? process.argv[i + 1] : undefined; };
const flag = (name: string) => process.argv.includes(`--${name}`);

export async function collect(o: { only?: string[]; ai: boolean; fixtures: boolean; now: string; prev: Snapshot; fetcher?: (url: string) => Promise<unknown> }) {
  const runs: SourceRun[] = []; const fetched: Record<string, CollectedRecord[]> = {}; const aiErrors: string[] = []; const failedIds = new Set<string>();
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
  return { runs, attempted, next, changes, report };
}

async function main() {
  const onlyArg = arg("sources"); const only = onlyArg && onlyArg !== "all" ? onlyArg.split(",").map((s) => s.trim()) : undefined;
  const fixtures = flag("fixtures"); const dry = flag("dry-run"); const ai = flag("ai");
  if (ai && !process.env.ANTHROPIC_API_KEY) { console.error("--ai needs ANTHROPIC_API_KEY (set it as a GitHub Secret)"); process.exit(1); }
  const snapPath = path.join(DATA_DIR, "snapshot.json");
  const prev: Snapshot = existsSync(snapPath) ? JSON.parse(readFileSync(snapPath, "utf8")) : emptySnapshot();
  const now = new Date().toISOString();
  const { attempted, next, changes, report } = await collect({ only, ai, fixtures, now, prev });
  console.log(report);
  const summary = arg("summary"); if (summary) appendFileSync(summary, report + "\n");
  if (!dry && !fixtures) {
    mkdirSync(DATA_DIR, { recursive: true });
    // Only write when something changed, so unchanged runs do not open pull requests
    if (changes.length) {
      writeFileSync(snapPath, JSON.stringify(next, null, 2) + "\n");
      writeFileSync(path.join(DATA_DIR, "candidates.json"), JSON.stringify({ generatedAt: now, changes }, null, 2) + "\n");
      writeFileSync(path.join(DATA_DIR, "REPORT.md"), report + "\n");
    }
  }
  const out = process.env.GITHUB_OUTPUT; if (out) appendFileSync(out, `changes=${changes.length}\nfailed=${attempted.filter((r) => !r.ok).length}\n`);
  if (attempted.length && attempted.every((r) => !r.ok)) process.exit(2);
}
if (process.argv[1] && /run\.ts$/.test(process.argv[1])) main().catch((e) => { console.error(e); process.exit(1); });
