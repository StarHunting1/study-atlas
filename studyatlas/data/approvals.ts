import type { Claim } from "./schema";
import type { Localized } from "@/lib/i18n";
import type { ClimateNormals } from "./official/types";
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

/*
 * Approval of a climate record (Ver.1.4.3). Same rule as for claims: the record is verified only with an entry here, and the approved numbers,
 * station, period, annual value and sources must still be what was approved (otherwise the build fails until a person approves the new values).
 */
export type ClimateApproval = { approval: NonNullable<ClimateNormals["approval"]>; station: string; stationId: string; period: string; meanC: number[]; maxC: number[]; minC: number[]; precipMm: number[]; annualPrecipMm: number; sources: string[];
  /** optional extra bound values (Ver.1.6.4): annual mean / max / min temperature and the ECCC quality codes; when present they must still match the record */
  annualMeanC?: number; annualMaxC?: number; annualMinC?: number; quality?: string };
export const CLIMATE_APPROVALS: Record<string, ClimateApproval> = {
  "van-climate-eccc-1991-2020": {
    approval: { by: "StarHunting1", at: "2026-10-17", compared: "2026-10-17 StarHunting1 による Vancouver 1991–2020 気候平年値（日平均・日最高・日最低・降水量の月別48値）の明示的な公開承認。照合：PR #46（GitHub Actions run 39051554489）で ECCC の一括CSV（Canadian Climate Normals 1991–2020、BC州）の合成観測所 VANCOUVER INTERNATIONAL (AIRPORT)（Normal）の48値と全件一致を確認。ライセンス：ECCC Data Services End-use Licence v2.1.1（2026年8月）" },
    station: "VANCOUVER INTERNATIONAL (AIRPORT) – composite of 1108447 and 1108395", stationId: "1108447+1108395", period: "1991–2020",
    meanC: [4.1, 4.7, 6.7, 9.4, 13.0, 15.8, 18.2, 18.2, 15.2, 10.3, 6.4, 3.9],
    maxC: [6.8, 7.9, 10.1, 13.1, 16.9, 19.6, 22.4, 22.4, 19.1, 13.5, 9.3, 6.6],
    minC: [1.4, 1.5, 3.3, 5.7, 9.0, 11.9, 13.9, 14.0, 11.2, 7.0, 3.6, 1.2],
    precipMm: [174.0, 90.8, 106.4, 85.5, 59.1, 51.1, 34.1, 36.1, 51.9, 123.9, 174.6, 172.2],
    annualPrecipMm: 1159.5,
    sources: ["https://climate.weather.gc.ca/climate_normals/index_e.html"],
  },
  "tor-climate-eccc-1991-2020": {
    approval: { by: "StarHunting1", at: "2026-10-19", compared: "2026-10-19 StarHunting1 による Toronto 1991–2020 気候平年値の明示的な公開承認（Ver.1.6.4）。対象：複合観測地点 TORONTO (CITY)（気候ID 6158350・6158355、北緯43.67度・西経79.40度、標高112.5 m）の月別48値（日平均・日最高・日最低気温、降水量）、年値4件（平均気温9.7 °C・平均最高13.4 °C・平均最低6.0 °C・降水量822.7 mm）、観測地点、統計期間、品質コード（気温A・降水量C）、公式出典、ライセンス。照合：GitHub Actions run 39308503517（読み取り専用）で ECCC の公式CSV（Canadian Climate Normals 1991–2020、オンタリオ州）と、48値と年値の全件一致を確認。ライセンス：ECCC Data Services End-use Licence v2.1.1（2026年8月）" },
    station: "TORONTO (CITY) – composite of 6158350 and 6158355", stationId: "6158350+6158355", period: "1991–2020",
    meanC: [-3.5, -2.7, 1.7, 7.8, 14.5, 19.8, 22.5, 21.9, 17.9, 11.2, 5.2, -0.1],
    maxC: [-0.3, 0.6, 5.1, 11.7, 18.8, 24.2, 27.0, 26.1, 22.0, 14.6, 8.1, 2.6],
    minC: [-6.7, -6.0, -1.8, 3.9, 10.0, 15.3, 18.1, 17.7, 13.8, 7.7, 2.3, -2.7],
    precipMm: [64.6, 53.9, 52.8, 78.0, 76.4, 81.6, 76.5, 71.9, 69.4, 69.1, 70.8, 57.8],
    annualPrecipMm: 822.7, annualMeanC: 9.7, annualMaxC: 13.4, annualMinC: 6.0, quality: "A (temperature) · C (precipitation)",
    sources: ["https://climate.weather.gc.ca/climate_normals/index_e.html"],
  },
};
export function approveClimate(c: ClimateNormals): ClimateNormals {
  const r = CLIMATE_APPROVALS[c.id]; if (!r) return c;
  const col = (k: "meanC" | "maxC" | "minC" | "precipMm") => JSON.stringify(c.months.map((m) => m[k]));
  const same = c.station === r.station && c.stationId === r.stationId && c.period === r.period && col("meanC") === JSON.stringify(r.meanC) && col("maxC") === JSON.stringify(r.maxC) && col("minC") === JSON.stringify(r.minC) && col("precipMm") === JSON.stringify(r.precipMm)
    && c.annual?.precipMm === r.annualPrecipMm && (r.annualMeanC === undefined || c.annual?.meanC === r.annualMeanC) && (r.annualMaxC === undefined || c.annual?.maxC === r.annualMaxC) && (r.annualMinC === undefined || c.annual?.minC === r.annualMinC) && (r.quality === undefined || c.stationInfo?.quality === r.quality) && JSON.stringify(c.evidence.map((e) => e.url)) === JSON.stringify(r.sources);
  if (!same) throw new Error(`Climate record ${c.id} was changed after its approval (${r.approval.at}): approve the new values again or restore the approved ones`);
  return { ...c, status: "verified", approval: r.approval };
}
