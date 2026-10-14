// Tests for the data collector, using local fixtures and fake fetchers only (no network).
// Run: npm test
import assert from "node:assert/strict";
import { collect } from "../collector/run";
import { fixtureFetch } from "../collector/fixtures";
import { checkFacts, extract } from "../collector/ai";
import { diffSnapshots, emptySnapshot } from "../collector/store";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { merge } from "../collector/store";
import { renderReport } from "../collector/report";
import type { Snapshot } from "../collector/types";
import { toFact } from "../collector/toFact";
import type Anthropic from "@anthropic-ai/sdk";

let n = 0; const t = async (name: string, fn: () => Promise<void> | void) => { await fn(); n++; console.log("ok", name); };
const T1 = "2026-10-13T00:00:00.000Z", T2 = "2026-10-20T00:00:00.000Z";
const only = ["govuk-content", "canada-open-gov"];
const edit = (match: RegExp, change: (j: any) => void) => async (url: string) => { const j = structuredClone(await fixtureFetch(url)) as any; if (match.test(url)) change(j); return j; };
const fail = (match: RegExp) => async (url: string) => { if (match.test(url)) throw new Error("HTTP 503 for " + url); return fixtureFetch(url); };

(async () => {
  const first = await collect({ only, ai: false, fixtures: true, now: T1, prev: emptySnapshot() });
  await t("fixture run stores records with source, retrieval time and evidence", () => {
    const recs = Object.values(first.next.records); assert.equal(recs.length, 4);
    for (const r of recs) { assert.equal(r.status, "unverified"); assert.match(r.sourceUrl, /^https:\/\//); assert.match(r.apiUrl, /^https:\/\//); assert.equal(r.retrievedAt, T1); assert.ok(r.evidence.path && r.contentHash); }
    assert.equal(first.changes.filter((c) => c.type === "added").length, 4);
    assert.equal(first.next.records["govuk-content:/student-visa"].review, "human-required");
    assert.equal(first.next.records["govuk-content:/student-visa"].sourceUpdatedAt, "2026-01-01T00:00:00.000+00:00");
  });
  await t("report says fixtures are not real data", () => assert.match(first.report, /local fixtures – not real data/));
  await t("unchanged second run: no changes, retrievedAt kept", async () => {
    const r = await collect({ only, ai: false, fixtures: true, now: T2, prev: first.next });
    assert.equal(r.changes.length, 0); assert.equal(r.next.records["govuk-content:/student-visa"].retrievedAt, T1);
    assert.equal(r.next.runs["govuk-content"].lastSuccessAt, T2);
  });
  await t("changed page body is detected", async () => {
    const r = await collect({ only, ai: false, fixtures: false, now: T2, prev: first.next, fetcher: edit(/student-visa/, (j) => { j.details.parts[1].body = "<p>[FIXTURE] Fee is now &pound;150.</p>"; j.public_updated_at = "2026-10-15T00:00:00.000+00:00"; }) });
    const c = r.changes.find((x) => x.id === "govuk-content:/student-visa");
    assert.ok(c && c.type === "changed" && c.fields.includes("contentHash") && c.fields.includes("sourceUpdatedAt"));
    assert.equal(r.next.records["govuk-content:/student-visa"].retrievedAt, T2);
  });
  await t("failed source keeps previous data untouched", async () => {
    const r = await collect({ only, ai: false, fixtures: false, now: T2, prev: first.next, fetcher: fail(/open\.canada\.ca/) });
    assert.equal(r.runs.find((x) => x.sourceId === "canada-open-gov")!.ok, false);
    assert.deepEqual(r.next.records["canada-open-gov:c2a1fdbf-d9b7-4c84-b7eb-c845b6ffd5e6"], first.next.records["canada-open-gov:c2a1fdbf-d9b7-4c84-b7eb-c845b6ffd5e6"]);
    assert.equal(r.next.runs["canada-open-gov"].lastSuccessAt, T1);
    assert.equal(r.changes.filter((c) => c.id.startsWith("canada")).length, 0);
  });
  await t("one GOV.UK page failing does not fail the source", async () => {
    const r = await collect({ only: ["govuk-content"], ai: false, fixtures: false, now: T2, prev: first.next, fetcher: fail(/healthcare/) });
    assert.equal(r.runs[0].ok, true); assert.deepEqual(r.next.records["govuk-content:/healthcare-immigration-application"], first.next.records["govuk-content:/healthcare-immigration-application"]); assert.equal(r.changes.length, 0);
  });
  await t("a dataset whose CKAN licence is not OGL-Canada is not collected (that dataset only); the other one still is", async () => {
    const r = await collect({ only: ["canada-open-gov"], ai: false, fixtures: false, now: T2, prev: emptySnapshot(), fetcher: edit(/51dbf91e/, (j) => { j.result.license_id = "ca-odla-aldg"; j.result.license_title = "Some other licence"; }) });
    const ids = Object.keys(r.next.records).filter((i) => i.startsWith("canada-open-gov:"));
    assert.deepEqual(ids, ["canada-open-gov:c2a1fdbf-d9b7-4c84-b7eb-c845b6ffd5e6"]);
  });
  await t("a pinned dataset failing is kept as is (not flagged missing)", async () => {
    const r = await collect({ only, ai: false, fixtures: false, now: T2, prev: first.next, fetcher: fail(/51dbf91e/) });
    assert.deepEqual(r.next.records["canada-open-gov:51dbf91e-509c-437b-ab9e-eca6d0bf6fa8"], first.next.records["canada-open-gov:51dbf91e-509c-437b-ab9e-eca6d0bf6fa8"]); assert.equal(r.changes.length, 0);
  });
  await t("record no longer returned by a successful source is kept and flagged, not deleted", async () => {
    const old = { ...first.next.records["canada-open-gov:51dbf91e-509c-437b-ab9e-eca6d0bf6fa8"], id: "canada-open-gov:retired-dataset" };
    const prev = { ...first.next, records: { ...first.next.records, [old.id]: old } };
    const r = await collect({ only, ai: false, fixtures: true, now: T2, prev });
    assert.equal(r.next.records[old.id].missingSince, T2);
    assert.ok(r.changes.some((c) => c.type === "missing" && c.id === old.id));
  });
  await t("all sources failing is reported", async () => {
    const r = await collect({ only, ai: false, fixtures: false, now: T2, prev: first.next, fetcher: async () => { throw new Error("offline"); } });
    assert.ok(r.attempted.every((x) => !x.ok)); assert.equal(Object.keys(r.next.records).length, 4);
  });
  await t("AI facts: quote and numbers must be in the source", () => {
    const text = "Fees\nThe synthetic test fee is £123 for each applicant.";
    const out = checkFacts([
      { name: "fee", value: "£123", quote: "The synthetic test fee is £123 for each applicant." },
      { name: "invented", value: "£999", quote: "The synthetic test fee is £123 for each applicant." },
      { name: "paraphrase", value: "£123", quote: "Each applicant pays 123 pounds" },
    ], text);
    assert.deepEqual(out.facts.map((f) => f.name), ["fee"]); assert.equal(out.rejected.length, 2);
  });
  await t("AI step with a mocked client keeps only grounded facts and stays unverified", async () => {
    const rec = first.next.records["govuk-content:/student-visa"];
    const fake = { beta: { messages: { create: async (req: any) => {
      assert.equal(req.model, "claude-opus-5-5"); assert.equal(req.fallbacks, "default"); assert.equal(req.output_config.format.type, "json_schema");
      return { model: "claude-opus-5-5", stop_reason: "end_turn", content: [{ type: "text", text: JSON.stringify({ summary_en: "Synthetic.", summary_ja: "テスト用。", facts: [
        { name: "fee", value: "£123", unit: "", currency: "GBP", applies_to: "each applicant", quote: "The synthetic test fee is £123 for each applicant." },
        { name: "made up", value: "£500", unit: "", currency: "GBP", applies_to: "", quote: "£500 per month" }] }) }] };
    } } } } as unknown as Anthropic;
    const out = await extract(rec, "[FIXTURE] The synthetic test fee is £123 for each applicant.", T1, fake);
    assert.ok(!("error" in out)); if ("error" in out) return;
    assert.equal(out.facts.length, 1); assert.equal(out.rejected.length, 1); assert.equal(out.summary.ja, "テスト用。");
    assert.equal(rec.status, "unverified");
  });
  await t("refusal is reported, not stored", async () => {
    const fake = { beta: { messages: { create: async () => ({ model: "x", stop_reason: "refusal", content: [] }) } } } as unknown as Anthropic;
    assert.deepEqual(await extract(first.next.records["govuk-content:/student-visa"], "text", T1, fake), { error: "model declined (refusal)" });
  });
  await t("toFact maps to the Ver.1.3 Fact shape as unverified", () => {
    const f = toFact(first.next.records["govuk-content:/student-visa"]);
    assert.equal(f.status, "unverified"); assert.equal(f.sources![0].url, "https://www.gov.uk/student-visa"); assert.match(f.note!.ja, /自動取得/);
  });
  // --- Open candidate PR (pending snapshot): duplicates and data retention ---
  await t("same data fetched again while a candidate PR is open: no new changes (no duplicate PR), PR still proposes all 4", async () => {
    const r = await collect({ only, ai: false, fixtures: true, now: T2, prev: first.next });
    assert.equal(r.changes.length, 0);
    assert.equal(diffSnapshots(emptySnapshot(), r.next).filter((c) => c.type === "added").length, 4);
  });
  await t("source failing while a candidate PR is open keeps the PR's records (nothing lost)", async () => {
    const r = await collect({ only, ai: false, fixtures: false, now: T2, prev: first.next, fetcher: fail(/open\.canada\.ca/) });
    assert.equal(r.changes.length, 0);
    assert.deepEqual(Object.keys(r.next.records).sort(), Object.keys(first.next.records).sort());
    assert.equal(diffSnapshots(emptySnapshot(), r.next).length, 4);
  });
  await t("a real change on top of an open candidate PR is detected once and added to the same proposal", async () => {
    const changed = edit(/student-visa/, (j) => { j.description = "[FIXTURE] Updated description."; });
    const r = await collect({ only, ai: false, fixtures: false, now: T2, prev: first.next, fetcher: changed });
    assert.equal(r.changes.length, 1);
    const again = await collect({ only, ai: false, fixtures: false, now: T2, prev: r.next, fetcher: changed });
    assert.equal(again.changes.length, 0);
    const proposed = diffSnapshots(emptySnapshot(), again.next);
    assert.equal(proposed.length, 4); assert.equal((proposed.find((c) => c.id === "govuk-content:/student-visa") as any).record.value.text, "[FIXTURE] Updated description.");
  });
  await t("diffSnapshots against an accepted snapshot lists only real differences", async () => {
    assert.equal(diffSnapshots(first.next, first.next).length, 0);
    const r = await collect({ only, ai: false, fixtures: false, now: T2, prev: first.next, fetcher: edit(/student-visa/, (j) => { j.description = "x"; }) });
    assert.deepEqual(diffSnapshots(first.next, r.next).map((c) => [c.type, c.id]), [["changed", "govuk-content:/student-visa"]]);
  });
  await t("--ai without ANTHROPIC_API_KEY collects anyway and reports that AI was skipped", () => {
    const env = { ...process.env }; delete env.ANTHROPIC_API_KEY;
    const out = execFileSync(process.execPath, ["--import", "tsx", "collector/run.ts", "--fixtures", "--ai"], { env, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
    assert.match(out, /AI step skipped: ANTHROPIC_API_KEY is not set/); assert.match(out, /ok \(2\)/);
  });
  // --- Same data collected twice in a row (end to end through the CLI, local fixtures) ---
  await t("CLI: second consecutive collection of the same responses finds 0 changes and rewrites nothing", () => {
    const dir = mkdtempSync(path.join(tmpdir(), "collect-")); const out = path.join(dir, "gh-output");
    const run = () => { writeFileSync(out, ""); execFileSync(process.execPath, ["--import", "tsx", "collector/run.ts", "--fixtures", "--data-dir", dir, "--sources", "govuk-content,canada-open-gov"], { env: { ...process.env, GITHUB_OUTPUT: out }, stdio: "ignore" }); return Object.fromEntries(readFileSync(out, "utf8").trim().split("\n").map((l) => l.split("="))); };
    const first = run(); const snap1 = readFileSync(path.join(dir, "snapshot.json"), "utf8"); const rep1 = readFileSync(path.join(dir, "REPORT.md"), "utf8");
    assert.equal(first.changes, "4");
    const second = run();
    assert.equal(second.changes, "0");
    assert.equal(readFileSync(path.join(dir, "snapshot.json"), "utf8"), snap1, "snapshot must be byte-identical (no timestamp churn)");
    assert.equal(readFileSync(path.join(dir, "REPORT.md"), "utf8"), rep1, "report of the first run is kept");
  });
  await t("real data on main: a re-fetch that differs only in retrieval time is not a change", () => {
    const real = JSON.parse(readFileSync("data/collected/snapshot.json", "utf8")) as Snapshot;
    const recs = Object.values(real.records); if (!recs.length) { console.log("   (skipped: main has no collected records)"); return; }
    const refetched = recs.map((r) => ({ ...r, retrievedAt: "2030-01-01T00:00:00.000Z" }));
    const bySource: Record<string, typeof refetched> = {}; refetched.forEach((r) => (bySource[r.sourceId] ??= []).push(r));
    const runs = Object.keys(bySource).map((id) => ({ sourceId: id, ok: true, attemptedAt: "2030-01-01T00:00:00.000Z", records: bySource[id].length }));
    const { next, changes } = merge(real, runs, bySource, "2030-01-01T00:00:00.000Z");
    assert.equal(changes.length, 0);
    for (const r of recs) assert.equal(next.records[r.id].retrievedAt, r.retrievedAt);
    assert.equal(diffSnapshots(real, next).length, 0);
  });
  await t("report separates new changes from what an open candidate PR already proposes", () => {
    const rep = renderReport({ sources: [], runs: [], snapshot: first.next, changes: [], proposed: first.changes, mode: "live", now: T2, aiErrors: [] });
    assert.match(rep, /## New changes in this run \(0\)/); assert.match(rep, /## Already proposed in the open candidate PR \(4\) — not new in this run/);
    assert.doesNotMatch(rep, /## Changes \(/);
    const plain = renderReport({ sources: [], runs: [], snapshot: first.next, changes: first.changes, mode: "live", now: T1, aiErrors: [] });
    assert.match(plain, /## New changes in this run \(4\)/); assert.doesNotMatch(plain, /Already proposed/);
  });
  console.log(`${n} collector tests passed`);
})().catch((e) => { console.error(e); process.exit(1); });
