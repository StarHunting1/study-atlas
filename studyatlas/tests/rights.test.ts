// Tests for Ver.1.2 (data rights): every source has a rights record, display gating, collector gate, generated report. Local tests only.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { officialSources } from "../data/official/sources";
import { RIGHTS, REUSE_STATUSES, automationFor, displayModeOf, impliedDisplay } from "../data/official/rights";
import { rightsMarkdown } from "../data/official/rightsReport";

const V = { amount: 1, currency: "GBP" } as never;
let n = 0; const t = (name: string, fn: () => void) => { fn(); n++; console.log("ok", name); };

t("every official source has a rights record with a valid status and bilingual notes", () => {
  for (const s of officialSources) assert.ok(RIGHTS[s.id], `missing rights for ${s.id}`);
  for (const [id, r] of Object.entries(RIGHTS)) {
    assert.ok((REUSE_STATUSES as readonly string[]).includes(r.reuseStatus), id);
    assert.ok(r.reviewNotes.en && r.reviewNotes.ja, id);
    if (r.lastReviewedAt) assert.match(r.lastReviewedAt, /^\d{4}-\d{2}-\d{2}$/, id);
    for (const p of r.reviewed) { assert.match(p.url, /^https:\/\//); assert.match(p.reviewedAt, /^\d{4}-\d{2}-\d{2}$/); }
  }
});

t("display gating: permitted shows in full, restricted is link-only, unverified shows a figure with its link", () => {
  assert.equal(impliedDisplay("permitted", true), "full");
  assert.equal(impliedDisplay("restricted", true), "link-only");
  assert.equal(impliedDisplay("needs-review", true), "figure-with-link");
  assert.equal(impliedDisplay("unknown", false), "link-only");
});

t("a per-figure override can only be stricter, never looser", () => {
  const permitted = Object.keys(RIGHTS).find((k) => RIGHTS[k].reuseStatus === "permitted")!;
  const restricted = Object.keys(RIGHTS).find((k) => RIGHTS[k].reuseStatus === "restricted")!;
  assert.equal(displayModeOf({ sourceId: permitted, value: V, rights: { display: "link-only" } }), "link-only");
  assert.equal(displayModeOf({ sourceId: restricted, value: V, rights: { display: "full" } }), "link-only");
});

t("collector gate: restricted and unregistered sources are blocked", () => {
  assert.equal(automationFor("no-such-source").automation, "blocked");
  for (const [id, r] of Object.entries(RIGHTS)) if (r.reuseStatus === "restricted") assert.equal(automationFor(`page:${id}`).automation, "blocked", id);
});

t("RIGHTS.md is current (run `npm run rights` after changing a record)", () => {
  assert.equal(readFileSync(path.resolve(__dirname, "../data/official/RIGHTS.md"), "utf8"), rightsMarkdown());
});

console.log(`${n} tests passed`);
