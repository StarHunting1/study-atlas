import type { Change, Snapshot, Source, SourceRun } from "./types";
// Markdown report for the GitHub Actions job summary and the change-candidate pull request. Not part of the website.
const esc = (s: string) => s.replace(/\|/g, "\\|").replace(/\n/g, " ");
const accessLabel: Record<Source["access"], string> = { implemented: "✅ implemented (open API)", "open-api-planned": "🟡 open API – planned", "needs-key": "🔑 needs key / registration", "needs-terms-review": "⚖️ terms review needed" };
export function renderReport(o: { sources: Source[]; runs: SourceRun[]; snapshot: Snapshot; changes: Change[]; mode: "live" | "fixtures"; now: string; aiErrors: string[]; newSincePending?: number }) {
  const L: string[] = [];
  L.push(`# StudyAtlas data collection report`, "");
  L.push(`- Run: ${o.now} (${o.mode === "live" ? "**live API requests**" : "**local fixtures – not real data**"})`);
  if (o.newSincePending !== undefined) L.push(`- Compared with the open candidate PR: **${o.newSincePending} new change(s)** in this run. The list below is everything the PR proposes relative to \`main\`.`);
  L.push(`- Collected records are **unverified** candidates. Nothing here changes the published city data until a person reviews and promotes it.`, "");
  L.push(`## Sources`, "", `| Source | Access | This run | Last success | Records | Domains |`, `|---|---|---|---|---|---|`);
  for (const s of o.sources) {
    const r = o.runs.find((x) => x.sourceId === s.id); const st = o.snapshot.runs[s.id];
    const now = !r ? "—" : r.skipped ? `skipped: ${esc(r.skipped)}` : r.ok ? `ok (${r.records})` : `❌ ${esc(r.error ?? "failed")}`;
    const count = Object.values(o.snapshot.records).filter((x) => x.sourceId === s.id).length;
    L.push(`| [${esc(s.name)}](${s.docs}) | ${accessLabel[s.access]} | ${now} | ${st?.lastSuccessAt ?? "—"} | ${count} | ${s.domains.map((d) => `\`${d}\``).join(" ")} |`);
  }
  L.push("", `## Changes (${o.changes.length})`, "");
  if (!o.changes.length) L.push("No changes since the last accepted snapshot.");
  for (const c of o.changes) {
    const r = c.type === "changed" ? c.after : c.record;
    L.push(`### ${c.type === "added" ? "🆕 Added" : c.type === "changed" ? "✏️ Changed" : "⚠️ No longer returned"}: ${esc(r.label.en)}`);
    L.push(`- id: \`${c.id}\` · field: \`${r.field}\`${r.cityId ? ` · city: ${r.cityId}` : ""} · review: **${r.review === "human-required" ? "human approval required" : "standard"}**`);
    L.push(`- source: ${r.sourceUrl} (API: ${r.apiUrl})`);
    L.push(`- retrieved: ${r.retrievedAt} · source updated: ${r.sourceUpdatedAt ?? "not stated"} · licence: ${r.licence ?? "not stated"}`);
    L.push(`- evidence (\`${r.evidence.path}\`): ${r.evidence.quote ? `“${esc(r.evidence.quote).slice(0, 300)}”` : "—"}`);
    if (c.type === "changed") L.push(`- changed fields: ${c.fields.join(", ")}${c.fields.includes("value") ? `\n  - before: ${esc(c.before.value.text ?? "")}\n  - after: ${esc(c.after.value.text ?? "")}` : ""}`);
    if (r.ai) {
      L.push(`- AI (${r.ai.model}, unverified): ${esc(r.ai.summary.en)}`, `  - 日本語: ${esc(r.ai.summary.ja)}`);
      r.ai.facts.forEach((f) => L.push(`  - fact: ${esc(f.name)} = ${esc(f.value)}${f.unit ? ` ${f.unit}` : ""}${f.currency ? ` ${f.currency}` : ""}${f.appliesTo ? ` (applies to: ${esc(f.appliesTo)})` : ""} — “${esc(f.quote).slice(0, 200)}”`));
      r.ai.rejected.forEach((x) => L.push(`  - rejected: ${esc(x.fact.name)} = ${esc(x.fact.value)} (${x.reason})`));
    }
    L.push("");
  }
  if (o.aiErrors.length) L.push(`## AI step errors`, "", ...o.aiErrors.map((e) => `- ${esc(e)}`), "");
  const human = Object.values(o.snapshot.records).filter((r) => r.review === "human-required");
  L.push(`## Review queue`, "", `${human.length} record(s) need human approval before any use (visa / healthcare / work).`, "");
  L.push(`## Review checklist`, "", "- [ ] Open each source link and confirm the value, the people it applies to and the period", "- [ ] Confirm the licence allows reuse with attribution", "- [ ] Visa / healthcare / work items: approved by a person (not by AI)", "- [ ] Promote confirmed values into `data/profiles/*` with `status: \"verified\"`, sources, period and checkedAt");
  return L.join("\n");
}
