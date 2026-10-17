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
import { APPROVALS, approve } from "@/data/approvals";
const APPROVED = ["U1", "U2", "U3", "U5b", "U6"];
import manchester from "@/data/official/manchester";
let n = 0; const t = (name: string, f: () => void) => { f(); n++; console.log("ok", name); };
const wrap = (el: unknown) => renderToStaticMarkup(h(I18nProvider, null, el as never));
const claims = allClaims();

t("every one of the ten candidates (U1–U6, C1–C4) is covered by claims, ids are unique, and each claim carries source, conditions, review and display place", () => {
  for (const c of CANDIDATES) assert.ok(claims.some((x) => x.candidate === c), `candidate ${c} has a claim`);
  assert.equal(new Set(claims.map((c) => c.id)).size, claims.length);
  for (const c of claims) { assert.ok(c.sources.length && c.sources.every((s) => s.url.startsWith("https://") && s.terms), `${c.id}: https source with a licence line`); assert.ok(c.conditions.ja && c.conditions.en && c.review.reason.ja && c.where, c.id); }
});
t("only the five approved claims are verified (U1, U2, U3, U5b, U6), each with its approval record; every other claim is unverified without one; no verified claim lacks a record (an automated check never promotes)", () => {
  assert.deepEqual(claims.filter((c) => c.status === "verified").map((c) => c.id).sort(), [...APPROVED].sort());
  for (const c of claims) { if (APPROVED.includes(c.id)) { assert.ok(c.approval && c.approval.by === "StarHunting1" && c.approval.at === "2026-10-17" && /承認指示/.test(c.approval.compared) && c.sources.every((x) => c.approval!.compared.includes(x.url)), c.id); } else assert.ok(c.status === "unverified" && !c.approval, `${c.id} stays unverified`); }
  for (const id of ["U4", "U5a", "C1", "C2", "C3", "C4a", "C4b", "C4c", "C4-ref"]) assert.equal(claims.find((c) => c.id === id)!.status, "unverified", id);
  for (const g of CLAIM_GROUPS) assert.ok(g.claims.length > 0);
  const gbr = countries.find((c) => c.code === "GBR")!.profile.visa, can = countries.find((c) => c.code === "CAN")!.profile.visa;
  const want = [[gbr.official, "unverified"], [gbr.notes, "verified"], [can.official, "unverified"], [can.notes, "unverified"], [getCity("manchester")!.profile.living.healthcare, "unverified"], [getCity("vancouver")!.profile.living.healthcare, "unverified"]] as const;
  for (const [f, st] of want) { assert.equal(f.status, st); assert.ok(f.claims?.length, "Fact is built from claims"); assert.deepEqual(checkFact("x", f), []); }
});
t("the displayed wording is the claims' text, and the licence conditions stay: Canada.ca / B.C. are paraphrase-and-link only", () => {
  const gbr = countries.find((c) => c.code === "GBR")!.profile.visa; assert.ok(gbr.notes.value!.en.includes("£228") && gbr.official.value!.ja.includes("Student visa"));
  assert.ok(getCity("manchester")!.profile.living.healthcare.value!.en.includes("£776") && getCity("vancouver")!.profile.living.healthcare.value!.en.includes("CAD 75"));
  for (const c of claims.filter((x) => x.candidate.startsWith("C"))) assert.ok(c.sources.every((s) => /not confirmed|written permission/.test(s.terms!)), `${c.id}: no commercial reuse is assumed`);
  for (const c of claims.filter((x) => x.candidate.startsWith("U"))) assert.ok(c.sources.every((s) => /Open Government Licence v3\.0/.test(s.terms!)), c.id);
  assert.ok(!claims.some((c) => /visitor stay of 6 months or less has no IHS|before you travel|degree study/.test(c.text.en)), "statements without a basis on the pages read are gone");
});
t("the validator refuses an unsafe approval: verified without a record, a held claim verified, a mixed Fact marked verified, an unverified claim with an approval", () => {
  const base = { ...claims.find((c) => c.id === "U1")!, status: "unverified" as const, approval: undefined };
  const ok = { ...base, status: "verified" as const, approval: { by: "Reviewer", at: "2026-10-20", compared: "gov.uk page text" } };
  assert.deepEqual(checkFact("f", factFromClaims([ok])), [], "a verified claim with its approval record passes");
  assert.ok(checkFact("f", factFromClaims([{ ...ok, approval: undefined }])).some((p) => /needs an approval/.test(p)));
  const held = claims.find((c) => c.review.verdict === "hold")!;
  assert.ok(checkFact("f", factFromClaims([{ ...held, status: "verified", approval: ok.approval }])).some((p) => /on hold cannot be verified/.test(p)));
  const mixed = factFromClaims([ok, claims.find((c) => c.id === "U4")!]); assert.equal(mixed.status, "unverified"); assert.ok(checkFact("f", { ...mixed, status: "verified" }).some((p) => /derived from its claims/.test(p)));
  assert.ok(checkFact("f", factFromClaims([{ ...base, approval: ok.approval }])).some((p) => /unverified claim must not carry an approval/.test(p)));
});
t("approving one claim shows that claim as verified and the others as unverified (never one badge for a mixed Fact); with none approved the page looks as before", () => {
  const u1 = claims.find((c) => c.id === "U1")!, u2 = claims.find((c) => c.id === "U2")!;
  const partly = factFromClaims([u1, { ...u2, status: "unverified" as const, approval: undefined }]);
  const html = wrap(h(FactView, { fact: partly, kind: "text" })); const items = html.match(/data-testid="claim"/g) ?? [];
  assert.equal(items.length, 2); assert.ok(/data-claim="U1"[^>]*data-status="verified"/.test(html) && /data-claim="U2"[^>]*data-status="unverified"/.test(html));
  const un = (c: typeof u1) => ({ ...c, status: "unverified" as const, approval: undefined }); const none = wrap(h(FactView, { fact: factFromClaims([un(u1), un(u2)]), kind: "text" })); assert.ok(!none.includes('data-testid="claim"'), "no per-claim list while nothing is approved"); assert.ok(none.includes("未確認"));
});
t("the approval sheet is generated from the data and is up to date; it lists the hold items, the licence conditions and the Vancouver 1981–2010 vs 1991–2020 comparison", () => {
  const sheet = approvalSheet(); assert.equal(readFileSync("data/APPROVAL_SHEET.md", "utf8"), sheet, "run `npm run approvals`");
  for (const w of ["保留すべき情報", "C4-ref", "合成観測所", "1108447", "1108395", "End-use Licence", "切り替えたときの影響", "承認の状況（Ver.1.4.0）"]) assert.ok(sheet.includes(w), w);
  for (const c of claims) assert.ok(sheet.includes(`### ${c.id}（候補 ${c.candidate}）`), c.id);
});
t("Vancouver climate (Ver.1.4.3): the approved 1991–2020 values are shown and verified with an approval record; the 1981–2010 record is history only; Manchester is unchanged", () => {
  assert.equal(official.climate!.period, "1991–2020"); assert.equal(official.climate!.status, "verified"); assert.equal(official.climate!.months[0].meanC, 4.1); assert.equal(official.climate!.approval?.by, "StarHunting1");
  assert.equal(official.climateAlt!.period, "1981–2010"); assert.equal(official.climateAlt!.months[0].meanC, 4.13);
  const monthly = getCity("vancouver")!.profile.climate.monthly; assert.equal(monthly.period, "1991–2020"); assert.equal(monthly.status, "verified");
  assert.ok(!/1991/.test(manchester.climate!.period));
});
t("Ver.1.3.9: every claim has a scope (nationality, stay, visa class), a difference note and a decision for the approver; the checklist and procedure are in the sheet", () => {
  assert.deepEqual(Object.keys(SCOPE).sort(), claims.map((c) => c.id).sort());
  for (const c of claims) { const k = SCOPE[c.id]; assert.ok(k.who && k.stay && k.visa && k.changed && k.decide, c.id); }
  const sheet = approvalSheet();
  assert.equal((sheet.match(/\*\*承認チェックリスト（/g) ?? []).length, claims.length, "one checklist per claim");
  for (const w of ["承認者名", "全部に印が付くまで", "再利用条件が未確認の出典", "一部だけ承認したとき", "気候データ承認チェックリスト"]) assert.ok(sheet.includes(w), w);
  assert.ok(TERMS_CHECK.length === 2 && TERMS_CHECK.every((x) => x.pages.every((p) => p.url.startsWith("https://"))));
  const tally = (v: string) => claims.filter((c) => c.review.verdict === v).length; assert.deepEqual([tally("recommend"), tally("conditional"), tally("hold")], [5, 8, 1], "U4 and U5a were reworded, so they need a fresh comparison (conditional)");
  for (const c of claims.filter((x) => x.candidate.startsWith("C"))) assert.ok(/言い換え|paraphrase|リンク|link/i.test(SCOPE[c.id].decide + c.sources.map((s) => s.terms).join()), `${c.id}: Canada.ca/BC reuse is not assumed`);
});
t("Vancouver 1991–2020 climate: mechanical checks pass for the approved record (12 months, min ≤ mean ≤ max, plausible, monthly precipitation adds up to the published annual value, station/period/evidence recorded); a broken record is caught; the candidate stays unverified", () => {
  const cand = official.climate!; assert.equal(cand.status, "verified");
  const r = climateChecks(cand, ECCC_ANNUAL_PRECIP_1991_2020); assert.ok(r.length >= 6 && r.every((k) => k.ok), JSON.stringify(r.filter((k) => !k.ok)));
  assert.ok(cand.stationId!.includes("1108447") && cand.stationId!.includes("1108395") && /Daily Average/.test(cand.evidence[0].quote));
  const bad = { ...cand, months: cand.months.map((m, i) => (i === 3 ? { ...m, minC: m.maxC! + 1, precipMm: m.precipMm! + 50 } : m)) };
  const rb = climateChecks(bad, ECCC_ANNUAL_PRECIP_1991_2020); assert.ok(rb.filter((k) => !k.ok).length >= 2, "an inconsistent record is flagged");
  assert.equal(official.climateAlt!.period, "1981–2010");
});
t("verified count: exactly 5 claims verified, each with an approval record; Planner does not read visa or healthcare facts", () => {
  assert.equal(claims.filter((c) => c.status === "verified").length, 5); assert.equal(claims.filter((c) => c.status === "verified" && !c.approval).length, 0);
  for (const f of ["lib/planner.ts", "lib/budget.ts", "lib/smart.ts"]) assert.ok(!/healthcare|visa\.|IHS|healthSurcharge/i.test(readFileSync(f, "utf8").replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, "")), f);
});
t("UK corrections (Ver.1.3.10): U5-visa is no longer an approval candidate; U4 does not say the course length alone decides the Student visa; U5a keeps £776/£1,035 but does not promise NHS use; U1, U2, U3, U5b, U6 are unchanged; nothing is verified", () => {
  assert.ok(!claims.some((c) => c.id === "U5-visa") && !approvalSheet().includes("### U5-visa") && claims.length === 14);
  for (const id of ["U1", "U2", "U3", "U5a", "U5b", "U6", "U4"]) assert.ok(claims.some((c) => c.id === id), id);
  const u4 = claims.find((c) => c.id === "U4")!, u5a = claims.find((c) => c.id === "U5a")!;
  for (const l of ["en", "ja"] as const) { assert.ok(u4.text[l] && u5a.text[l]); }
  assert.ok(/length of the course alone does not decide/.test(u4.text.en) && /コースの期間だけで決まるわけではありません/.test(u4.text.ja));
  for (const w of ["licensed student sponsor", "16 or over", "enough money", "English", "age, nationality"]) assert.ok(u4.text.en.includes(w), `U4 en: ${w}`);
  for (const w of ["licensed student sponsor", "16歳以上", "資金", "英語力", "年齢"]) assert.ok(u4.text.ja.includes(w), `U4 ja: ${w}`);
  assert.ok(!/^Longer courses need a Student visa/.test(u4.text.en) && !/それより長いコースは/.test(u4.text.ja), "the old wording is gone");
  assert.ok(u5a.text.en.includes("£776") && u5a.text.en.includes("£1,035") && u5a.text.ja.includes("£776") && u5a.text.ja.includes("£1,035"));
  assert.ok(!/and can then use the NHS|その後NHSを利用できます/.test(u5a.text.en + u5a.text.ja), "no unconditional NHS access");
  assert.ok(/depends on the visa you apply for/.test(u5a.text.en) && /ビザの種類・期間・申請場所・個々の事情によって異なります/.test(u5a.text.ja) && /can give you access/.test(u5a.text.en) && /利用できる場合があります/.test(u5a.text.ja));
  assert.ok(/Standard Visitor/.test(claims.find((c) => c.id === "U1")!.text.en) && /国籍によってビザ|ETA/.test(claims.find((c) => c.id === "U1")!.conditions.ja) && /nationality/.test(claims.find((c) => c.id === "U6")!.text.en));
  assert.ok(claims.filter((c) => c.candidate.startsWith("U")).every((c) => c.sources.every((s) => /Open Government Licence v3\.0/.test(s.terms!) && s.url.startsWith("https://www.gov.uk/"))), "OGL v3.0 source lines kept");
  assert.ok(claims.filter((c) => c.status === "verified").every((c) => APPROVED.includes(c.id)), "only the approved five are verified");
});
t("Ver.1.4.0 approval record: data/approvals.ts holds exactly the five approvals with the approved wording; editing an approved claim, approving a held claim, or approving by an automated check is impossible", () => {
  assert.deepEqual(Object.keys(APPROVALS).sort(), [...APPROVED].sort());
  for (const id of APPROVED) { const c = claims.find((x) => x.id === id)!, r = APPROVALS[id]; assert.deepEqual([c.text, c.conditions, c.sources.map((x) => x.url)], [r.text, r.conditions, r.sources], `${id}: approved wording = displayed wording`); assert.ok(/Open Government Licence v3\.0/.test(c.sources[0].terms!), id); assert.ok(c.checkedAt === "2026-10-15" && c.period === "2026-10"); }
  const u1 = claims.find((c) => c.id === "U1")!;
  assert.throws(() => approve({ ...u1, text: { ...u1.text, en: u1.text.en + " (edited)" } }), /changed after its approval/);
  assert.throws(() => approve({ ...u1, conditions: { ...u1.conditions, ja: "変更" } }), /changed after its approval/);
  assert.equal(approve({ ...claims.find((c) => c.id === "U4")!, status: "unverified" }).status, "unverified", "no record = stays unverified");
  assert.ok(claims.filter((c) => c.status === "verified").every((c) => c.review.verdict !== "hold"));
});
t("display: the country page lists each claim with its own status (U1/U2/U6 verified, U4 not verified), the single-claim notes Fact is verified, £228 keeps its date and the re-check advice, OGL v3.0 and the check date are shown, in ja and en", () => {
  const g = countries.find((c) => c.code === "GBR")!.profile.visa;
  const off = wrap(h(FactView, { fact: g.official, kind: "text" }));
  for (const [id, st] of [["U1", "verified"], ["U2", "verified"], ["U6", "verified"], ["U4", "unverified"]]) assert.ok(new RegExp(`data-claim="${id}"[^>]*data-status="${st}"`).test(off), `${id} ${st}`);
  assert.ok(off.includes("確認済み") && off.includes("未確認") && off.includes("Open Government Licence v3.0") && off.includes("2026-10-15"));
  const notes = wrap(h(FactView, { fact: g.notes, kind: "text" })); assert.ok(notes.includes("£228") && notes.includes("2026-10-15") && notes.includes("公式ページで最新額を確認") && /data-claim="U3"[^>]*data-status="verified"/.test(notes) && notes.includes("Open Government Licence v3.0"));
  assert.ok(g.notes.value!.en.includes("check the current amount on the official page") && g.notes.status === "verified" && g.official.status === "unverified");
  const man = wrap(h(FactView, { fact: getCity("manchester")!.profile.living.healthcare, kind: "text" })); assert.ok(/data-claim="U5b"[^>]*data-status="verified"/.test(man) && /data-claim="U5a"[^>]*data-status="unverified"/.test(man));
  for (const f of [g.official, g.notes]) { assert.ok(f.value!.ja && f.value!.en); }
});
t("Ver.1.4.2/1.4.3: the ECCC CSV check is recorded in the approval sheet (48/48 values, station IDs, annual values, licence) and the approved record is the one shown", () => {
  const sheet = approvalSheet();
  for (const w of ["ECCC の元 CSV との照合結果", "39051554489", "48個すべて", "12/12 一致", "1159.5", "1159.7", "最大 ±0.6 mm", "断定はできません", "1108447", "1108395", "Version 2.1.1", "承認済み・本番反映", "履歴"]) assert.ok(sheet.includes(w), w);
  const sum = Number(official.climate!.months.reduce((n, m) => n + m.precipMm!, 0).toFixed(1)); assert.equal(sum, 1159.7); assert.ok(Math.abs(sum - ECCC_ANNUAL_PRECIP_1991_2020) <= 0.6);
  assert.equal(official.climate!.annual?.precipMm, 1159.5, "the published annual value, not the sum of the months");
  assert.ok(!readFileSync("../.github/workflows/collect-data.yml", "utf8").includes("v142-verify"), "the temporary probe step is removed");
});
console.log(n, "approval tests passed");
