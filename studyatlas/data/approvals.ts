import type { Claim } from "./schema";
import type { Localized } from "@/lib/i18n";
/*
 * Human approvals of single claims (Ver.1.4.0). This file is the record: who approved which claim, when, on what basis, and the exact wording,
 * conditions and sources that were approved. A claim is verified only if it has an entry here AND its text, conditions and sources still equal
 * what was approved: `approve()` throws otherwise, so editing an approved claim fails the build until a person approves the new wording.
 * Nothing is ever approved by an automated check. Held / unapproved claims (U4, U5a, C1–C4c, C4-ref) have no entry.
 */
export type ApprovalRecord = { approval: NonNullable<Claim["approval"]>; text: Localized; conditions: Localized; sources: string[] };
export const APPROVALS: Record<string, ApprovalRecord> = {
  "U1": {
    approval: { by: "StarHunting1", at: "2026-10-17", compared: "2026-10-17 StarHunting1 によるこの5件（U1・U2・U3・U5b・U6）の明示的な承認指示。照合：GOV.UK の公式情報との照合結果（2026-10-15 の GitHub Actions ページ確認で記載との一致を確認済み、およびユーザーによる GOV.UK 公式情報の確認）。出典: https://www.gov.uk/standard-visitor/visit-to-study" },
    text: {
      "en": "Entry routes for study in the UK depend mainly on the length and type of course. A course of up to 6 months can be studied as a Standard Visitor, with a place at an accredited institution.",
      "ja": "英国での学習の入国区分は、主にコースの期間と種類で決まります。6か月以内のコースは、認定機関に受講先があれば訪問者（Standard Visitor）として学習できます。"
    },
    conditions: {
      "en": "Accredited UK institution (English language courses included); the course is no more than 6 months (distance learning excepted); not an academy or state-funded school. A visa or ETA may still be needed by nationality.",
      "ja": "認定を受けた英国の教育機関（英語コース含む）。コースが6か月以内（遠隔学習を除く）。アカデミー・公立校は対象外。国籍によりビザ/ETAが別途必要な場合あり。"
    },
    sources: ["https://www.gov.uk/standard-visitor/visit-to-study"],
  },
  "U2": {
    approval: { by: "StarHunting1", at: "2026-10-17", compared: "2026-10-17 StarHunting1 によるこの5件（U1・U2・U3・U5b・U6）の明示的な承認指示。照合：GOV.UK の公式情報との照合結果（2026-10-15 の GitHub Actions ページ確認で記載との一致を確認済み、およびユーザーによる GOV.UK 公式情報の確認）。出典: https://www.gov.uk/visa-to-study-english" },
    text: {
      "en": "An English-language course of more than 6 and up to 11 months falls under the Short-term study visa.",
      "ja": "英語コースが6か月超〜11か月なら短期学習ビザ（Short-term study visa）になります。"
    },
    conditions: {
      "en": "English-language course at an accredited institution, longer than 6 and no more than 11 months (6 months or shorter: Visitor visa; longer than 11 months: Student visa). Under-18 rules differ. Nationality-based travel authorisation is separate.",
      "ja": "認定機関の英語コースで、6か月超11か月以内（6か月以内=訪問者、11か月超=Student visa）。18歳未満は別の扱い。国籍別の渡航認証は別。"
    },
    sources: ["https://www.gov.uk/visa-to-study-english"],
  },
  "U6": {
    approval: { by: "StarHunting1", at: "2026-10-17", compared: "2026-10-17 StarHunting1 によるこの5件（U1・U2・U3・U5b・U6）の明示的な承認指示。照合：GOV.UK の公式情報との照合結果（2026-10-15 の GitHub Actions ページ確認で記載との一致を確認済み、およびユーザーによる GOV.UK 公式情報の確認）。出典: https://www.gov.uk/check-uk-visa" },
    text: {
      "en": "Whether you need a visa or an electronic travel authorisation before travelling depends on your nationality.",
      "ja": "渡航前にビザや電子渡航認証が必要かどうかは国籍によって異なります。"
    },
    conditions: {
      "en": "Applies to every applicant: GOV.UK “Check if you need a UK visa” is the entry point.",
      "ja": "すべての申請者が対象。入口は GOV.UK の「Check if you need a UK visa」。"
    },
    sources: ["https://www.gov.uk/check-uk-visa"],
  },
  "U3": {
    approval: { by: "StarHunting1", at: "2026-10-17", compared: "2026-10-17 StarHunting1 によるこの5件（U1・U2・U3・U5b・U6）の明示的な承認指示。照合：GOV.UK の公式情報との照合結果（2026-10-15 の GitHub Actions ページ確認で記載との一致を確認済み、およびユーザーによる GOV.UK 公式情報の確認）。出典: https://www.gov.uk/visa-to-study-english" },
    text: {
      "en": "GOV.UK lists the Short-term study visa fee as £228 (page read on 2026-10-15). Fees change – check the current amount on the official page.",
      "ja": "GOV.UKでは短期学習ビザの申請料を£228と記載しています（2026-10-15に確認したページの記載）。金額は変更されるため、公式ページで最新額を確認してください。"
    },
    conditions: {
      "en": "Only if you apply for the Short-term study visa; the healthcare surcharge and other costs are separate.",
      "ja": "短期学習ビザを申請する場合のみ。医療付加金などは別。"
    },
    sources: ["https://www.gov.uk/visa-to-study-english"],
  },
  "U5b": {
    approval: { by: "StarHunting1", at: "2026-10-17", compared: "2026-10-17 StarHunting1 によるこの5件（U1・U2・U3・U5b・U6）の明示的な承認指示。照合：GOV.UK の公式情報との照合結果（2026-10-15 の GitHub Actions ページ確認で記載との一致を確認済み、およびユーザーによる GOV.UK 公式情報の確認）。出典: https://www.gov.uk/healthcare-immigration-application/how-much-pay" },
    text: {
      "en": "It depends on the length of the visa and where you apply from: for 6 months or less you do not pay when applying from outside the UK (half the yearly cost when applying from inside the UK); for more than 6 months but less than a year you pay a full year.",
      "ja": "金額はビザの期間と申請場所で変わります：6か月以内は英国外から申請する場合は不要（英国内から申請する場合は年額の半額）、6か月超〜1年未満は1年分です。"
    },
    conditions: {
      "en": "Applies to the visa length actually granted; inside-UK applications at half rate (e.g. £388 for students); dependants and exemptions follow separate rules.",
      "ja": "実際に付与されるビザの期間に対して適用。英国内からの申請は半額（学生は£388など）。同伴者・免除は別規定。"
    },
    sources: ["https://www.gov.uk/healthcare-immigration-application/how-much-pay"],
  },
};

/** Returns the claim as verified with its approval record, or unchanged if it has no record. Throws if the approved wording, conditions or sources were changed afterwards. */
export function approve(c: Claim): Claim {
  const r = APPROVALS[c.id]; if (!r) return c;
  const same = c.text.en === r.text.en && c.text.ja === r.text.ja && c.conditions.en === r.conditions.en && c.conditions.ja === r.conditions.ja && JSON.stringify(c.sources.map((s) => s.url)) === JSON.stringify(r.sources);
  if (!same) throw new Error(`Claim ${c.id} was changed after its approval (${r.approval.at}): approve the new wording again or restore the approved text`);
  if (c.review.verdict === "hold") throw new Error(`Claim ${c.id} is on hold and cannot be approved`);
  return { ...c, status: "verified", approval: r.approval };
}
