import type { Change, CollectedRecord, Snapshot, SourceRun } from "./types";
/*
 * Snapshot = last accepted state of collected records (data/collected/snapshot.json, reviewed via PR).
 * Merging a run never deletes anything: a failed source keeps all its old records untouched; a record a
 * successful source no longer returns is kept and marked `missingSince`.
 * `retrievedAt` is when the current content was first retrieved; the time of every attempt is in `runs`.
 */
export const emptySnapshot = (): Snapshot => ({ updatedAt: null, records: {}, runs: {} });

const COMPARED: (keyof CollectedRecord)[] = ["contentHash", "value", "sourceUpdatedAt", "licence", "sourceUrl", "field"];
export function diffRecord(a: CollectedRecord, b: CollectedRecord): string[] {
  return COMPARED.filter((k) => JSON.stringify(a[k] ?? null) !== JSON.stringify(b[k] ?? null)) as string[];
}

export function merge(prev: Snapshot, runs: SourceRun[], fetched: Record<string, CollectedRecord[]>, now: string, failedIds: Set<string> = new Set()): { next: Snapshot; changes: Change[] } {
  const records = { ...prev.records }; const changes: Change[] = [];
  const runState = { ...prev.runs };
  for (const run of runs) {
    runState[run.sourceId] = { ...run, lastSuccessAt: run.ok ? run.attemptedAt : prev.runs[run.sourceId]?.lastSuccessAt };
    if (!run.ok) continue; // failure: keep previous records exactly as they were
    const got = fetched[run.sourceId] ?? []; const seen = new Set(got.map((r) => r.id));
    for (const r of got) {
      const old = records[r.id];
      // AI output belongs to the content it was made from; keep it only while the content is unchanged
      const carriedAi = old?.ai && old.contentHash === r.contentHash && !r.ai ? { ai: old.ai } : {};
      if (!old) { changes.push({ type: "added", id: r.id, record: r }); records[r.id] = r; continue; }
      const fields = diffRecord(old, r);
      if (fields.length) changes.push({ type: "changed", id: r.id, before: old, after: r, fields });
      records[r.id] = fields.length || old.missingSince || r.ai ? { ...r, ...carriedAi } : old; // unchanged: keep as is (retrievedAt = when this content was first seen)
    }
    for (const [id, old] of Object.entries(records)) {
      if (old.sourceId === run.sourceId && !seen.has(id) && !failedIds.has(id) && !old.missingSince) { records[id] = { ...old, missingSince: now }; changes.push({ type: "missing", id, record: old }); }
    }
  }
  const sorted = Object.fromEntries(Object.entries(records).sort(([a], [b]) => a.localeCompare(b)));
  return { next: { updatedAt: changes.length ? now : prev.updatedAt, records: sorted, runs: runState }, changes };
}

/** Every difference between an accepted snapshot (main) and a newer one: what a candidate PR proposes in total. */
export function diffSnapshots(base: Snapshot, next: Snapshot): Change[] {
  const out: Change[] = [];
  for (const [id, r] of Object.entries(next.records)) {
    const old = base.records[id];
    if (!old) out.push({ type: "added", id, record: r });
    else if (r.missingSince && !old.missingSince) out.push({ type: "missing", id, record: old });
    else { const fields = diffRecord(old, r); if (fields.length) out.push({ type: "changed", id, before: old, after: r, fields }); }
  }
  return out;
}
