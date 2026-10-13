// Tests for the data collector, using local fixtures and fake fetchers only (no network).
// Run: npm test
import assert from "node:assert/strict";
import { collect } from "../collector/run";
import { fixtureFetch } from "../collector/fixtures";
import { checkFacts, extract } from "../collector/ai";
import { emptySnapshot } from "../collector/store";
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
    assert.deepEqual(r.next.records["canada-open-gov:fixture-rental-dataset"], first.next.records["canada-open-gov:fixture-rental-dataset"]);
    assert.equal(r.next.runs["canada-open-gov"].lastSuccessAt, T1);
    assert.equal(r.changes.filter((c) => c.id.startsWith("canada")).length, 0);
  });
  await t("one GOV.UK page failing does not fail the source", async () => {
    const r = await collect({ only: ["govuk-content"], ai: false, fixtures: false, now: T2, prev: first.next, fetcher: fail(/healthcare/) });
    assert.equal(r.runs[0].ok, true); assert.deepEqual(r.next.records["govuk-content:/healthcare-immigration-application"], first.next.records["govuk-content:/healthcare-immigration-application"]); assert.equal(r.changes.length, 0);
  });
  await t("record no longer returned is kept and flagged, not deleted", async () => {
    const r = await collect({ only, ai: false, fixtures: false, now: T2, prev: first.next, fetcher: edit(/q=Canadian/, (j) => { j.result.results = []; }) });
    const rec = r.next.records["canada-open-gov:fixture-climate-normals"]; assert.ok(rec); assert.equal(rec.missingSince, T2);
    assert.ok(r.changes.some((c) => c.type === "missing" && c.id === "canada-open-gov:fixture-climate-normals"));
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
  console.log(`${n} collector tests passed`);
})().catch((e) => { console.error(e); process.exit(1); });
