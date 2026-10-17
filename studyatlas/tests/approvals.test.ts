import "./_react";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement as h } from "react";
import { I18nProvider } from "@/lib/i18n";
import FactView from "@/components/FactView";
import { checkFact } from "@/data/validate";
import { factFromClaims } from "@/data/claims";
import { allClaims, approvalSheet, CANDIDATES, CLAIM_GROUPS } from "@/data/approvalSheet";
import { countries } from "@/data/cities";
import { getCity } from "@/data/cities";
import official from "@/data/official/vancouver";
import { climateChecks, ECCC_ANNUAL_PRECIP_1991_2020 } from "@/data/approvalSheet";
import { SCOPE, TERMS_CHECK } from "@/data/approvalScope";
import manchester from "@/data/official/manchester";
let n = 0; const t = (name: string, f: () => void) => { f(); n++; console.log("ok", name); };
const wrap = (el: unknown) => renderToStaticMarkup(h(I18nProvider, null, el as never));
const claims = allClaims();

t("every one of the ten candidates (U1–U6, C1–C4) is covered by claims, ids are unique, and each claim carries source, conditions, review and display place", () => {
  for (const c of CANDIDATES) assert.ok(claims.some((x) => x.candidate === c), `candidate ${c} has a claim`);
  assert.equal(new Set(claims.map((c) => c.id)).size, claims.length);
  for (const c of claims) { assert.ok(c.sources.length && c.sources.every((s) => s.url.startsWith("https://") && s.terms), `${c.id}: https source with a licence line`); assert.ok(c.conditions.ja && c.conditions.en && c.review.reason.ja && c.where, c.id); }
});
t("nothing is verified: all claims and all their Facts are unverified, and nothing carries an approval (an automated check never promotes)", () => {
  assert.ok(claims.every((c) => c.status === "unverified" && !c.approval));
  for (const g of CLAIM_GROUPS) assert.ok(g.claims.length > 0);
  const gbr = countries.find((c) => c.code === "GBR")!.profile.visa, can = countries.find((c) => c.code === "CAN")!.profile.visa;
  for (const f of [gbr.official, gbr.notes, can.official, can.notes, getCity("manchester")!.profile.living.healthcare, getCity("vancouver")!.profile.living.healthcare]) { assert.equal(f.status, "unverified"); assert.ok(f.claims?.length, "Fact is built from claims"); assert.deepEqual(checkFact("x", f), []); }
});
t("the displayed wording is the claims' text, and the licence conditions stay: Canada.ca / B.C. are paraphrase-and-link only", () => {
  const gbr = countries.find((c) => c.code === "GBR")!.profile.visa; assert.ok(gbr.notes.value!.en.includes("£228") && gbr.official.value!.ja.includes("Student visa"));
  assert.ok(getCity("manchester")!.profile.living.healthcare.value!.en.includes("£776") && getCity("vancouver")!.profile.living.healthcare.value!.en.includes("CAD 75"));
  for (const c of claims.filter((x) => x.candidate.startsWith("C"))) assert.ok(c.sources.every((s) => /not confirmed|written permission/.test(s.terms!)), `${c.id}: no commercial reuse is assumed`);
  for (const c of claims.filter((x) => x.candidate.startsWith("U"))) assert.ok(c.sources.every((s) => /Open Government Licence v3\.0/.test(s.terms!)), c.id);
  assert.ok(!claims.some((c) => /visitor stay of 6 months or less has no IHS|before you travel|degree study/.test(c.text.en)), "statements without a basis on the pages read are gone");
});
t("the validator refuses an unsafe approval: verified without a record, a held claim verified, a mixed Fact marked verified, an unverified claim with an approval", () => {
  const base = claims.find((c) => c.id === "U1")!;
  const ok = { ...base, status: "verified" as const, approval: { by: "Reviewer", at: "2026-10-20", compared: "gov.uk page text" } };
  assert.deepEqual(checkFact("f", factFromClaims([ok])), [], "a verified claim with its approval record passes");
  assert.ok(checkFact("f", factFromClaims([{ ...ok, approval: undefined }])).some((p) => /needs an approval/.test(p)));
  const held = claims.find((c) => c.review.verdict === "hold")!;
  assert.ok(checkFact("f", factFromClaims([{ ...held, status: "verified", approval: ok.approval }])).some((p) => /on hold cannot be verified/.test(p)));
  const mixed = factFromClaims([ok, claims.find((c) => c.id === "U2")!]); assert.equal(mixed.status, "unverified"); assert.ok(checkFact("f", { ...mixed, status: "verified" }).some((p) => /derived from its claims/.test(p)));
  assert.ok(checkFact("f", factFromClaims([{ ...base, approval: ok.approval }])).some((p) => /unverified claim must not carry an approval/.test(p)));
});
t("approving one claim shows that claim as verified and the others as unverified (never one badge for a mixed Fact); with none approved the page looks as before", () => {
  const u1 = claims.find((c) => c.id === "U1")!, u2 = claims.find((c) => c.id === "U2")!;
  const partly = factFromClaims([{ ...u1, status: "verified", approval: { by: "R", at: "2026-10-20", compared: "x" } }, u2]);
  const html = wrap(h(FactView, { fact: partly, kind: "text" })); const items = html.match(/data-testid="claim"/g) ?? [];
  assert.equal(items.length, 2); assert.ok(/data-claim="U1"[^>]*data-status="verified"/.test(html) && /data-claim="U2"[^>]*data-status="unverified"/.test(html));
  const none = wrap(h(FactView, { fact: factFromClaims([u1, u2]), kind: "text" })); assert.ok(!none.includes('data-testid="claim"'), "no per-claim list while nothing is approved"); assert.ok(none.includes("未確認"));
});
t("the approval sheet is generated from the data and is up to date; it lists the hold items, the licence conditions and the Vancouver 1981–2010 vs 1991–2020 comparison", () => {
  const sheet = approvalSheet(); assert.equal(readFileSync("data/APPROVAL_SHEET.md", "utf8"), sheet, "run `npm run approvals`");
  for (const w of ["保留すべき情報", "C4-ref", "合成観測所", "1108447", "1108395", "End-use Licence", "切り替えたときの影響", "承認ではありません"]) assert.ok(sheet.includes(w), w);
  for (const c of claims) assert.ok(sheet.includes(`### ${c.id}（候補 ${c.candidate}）`), c.id);
});
t("Vancouver climate: the verified 1981–2010 values are untouched and the 1991–2020 candidate is unverified and not displayed; Manchester is unchanged", () => {
  assert.equal(official.climate!.period, "1981–2010"); assert.equal(official.climate!.status, "verified"); assert.equal(official.climate!.months[0].meanC, 4.13);
  assert.equal(official.climateAlt!.status, "unverified"); assert.equal(official.climateAlt!.period, "1991–2020");
  const monthly = getCity("vancouver")!.profile.climate.monthly; assert.equal(monthly.period, "1981–2010"); assert.equal(monthly.status, "verified");
  assert.ok(!/1991/.test(manchester.climate!.period));
});
t("Ver.1.3.9: every claim has a scope (nationality, stay, visa class), a difference note and a decision for the approver; the checklist and procedure are in the sheet", () => {
  assert.deepEqual(Object.keys(SCOPE).sort(), claims.map((c) => c.id).sort());
  for (const c of claims) { const k = SCOPE[c.id]; assert.ok(k.who && k.stay && k.visa && k.changed && k.decide, c.id); }
  const sheet = approvalSheet();
  assert.equal((sheet.match(/\*\*承認チェックリスト（/g) ?? []).length, claims.length, "one checklist per claim");
  for (const w of ["承認者名", "全部に印が付くまで", "再利用条件が未確認の出典", "一部だけ承認したとき", "気候データ承認チェックリスト"]) assert.ok(sheet.includes(w), w);
  assert.ok(TERMS_CHECK.length === 2 && TERMS_CHECK.every((x) => x.pages.every((p) => p.url.startsWith("https://"))));
  const tally = (v: string) => claims.filter((c) => c.review.verdict === v).length; assert.deepEqual([tally("recommend"), tally("conditional"), tally("hold")], [8, 6, 1]);
  for (const c of claims.filter((x) => x.candidate.startsWith("C"))) assert.ok(/言い換え|paraphrase|リンク|link/i.test(SCOPE[c.id].decide + c.sources.map((s) => s.terms).join()), `${c.id}: Canada.ca/BC reuse is not assumed`);
});
t("Vancouver 1991–2020 climate: mechanical checks pass for the candidate (12 months, min ≤ mean ≤ max, plausible, monthly precipitation adds up to the published annual value, station/period/evidence recorded); a broken record is caught; the candidate stays unverified", () => {
  const cand = official.climateAlt!; assert.equal(cand.status, "unverified");
  const r = climateChecks(cand, ECCC_ANNUAL_PRECIP_1991_2020); assert.ok(r.length >= 6 && r.every((k) => k.ok), JSON.stringify(r.filter((k) => !k.ok)));
  assert.ok(cand.stationId!.includes("1108447") && cand.stationId!.includes("1108395") && /Daily Average/.test(cand.evidence[0].quote));
  const bad = { ...cand, months: cand.months.map((m, i) => (i === 3 ? { ...m, minC: m.maxC! + 1, precipMm: m.precipMm! + 50 } : m)) };
  const rb = climateChecks(bad, ECCC_ANNUAL_PRECIP_1991_2020); assert.ok(rb.filter((k) => !k.ok).length >= 2, "an inconsistent record is flagged");
  assert.equal(official.climate!.period, "1981–2010"); assert.equal(official.climate!.status, "verified");
});
t("verified count: still 0 claims verified and no approval records anywhere; Planner does not read visa or healthcare facts", () => {
  assert.equal(claims.filter((c) => c.status === "verified" || c.approval).length, 0);
  for (const f of ["lib/planner.ts", "lib/budget.ts", "lib/smart.ts"]) assert.ok(!/healthcare|visa\.|IHS|healthSurcharge/i.test(readFileSync(f, "utf8").replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, "")), f);
});
console.log(n, "approval tests passed");
