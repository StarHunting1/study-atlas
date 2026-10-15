import type { Localized } from "@/lib/i18n";
import type { Fact } from "./schema";
/*
 * Visa: structure only. StudyAtlas does NOT decide which visa applies (no automatic eligibility check).
 * Requirements depend on many factors, so future rules are keyed on all of them, not just nationality.
 */
export type VisaPurpose = "language" | "degree" | "exchange" | "shortCourse";
export type VisaFactors = {
  destination: string;        // StudyAtlas country code (CAN / GBR / AUS)
  nationality: string;        // ISO alpha-2
  residence: string;          // ISO alpha-2 (applying from a third country can change the process)
  purpose: VisaPurpose | "";
  durationWeeks: number | null;
  ageGroup: string;
  entryDate: string;          // YYYY-MM-DD planned entry (rules change over time)
};
/** Future rule shape: every condition optional; a rule applies only when all given conditions match. Not used for decisions yet. */
export type VisaRule = {
  id: string; destination: string; name: Localized;
  conditions: { nationalities?: string[]; residences?: string[]; purposes?: VisaPurpose[]; minWeeks?: number; maxWeeks?: number; minAge?: number; maxAge?: number; validFrom?: string; validTo?: string };
  official: Fact<string>;
};
export const visaRules: VisaRule[] = []; // intentionally empty until rules are researched and verified

/** Official government pages to check. URLs not yet opened from the development environment, so they are "unverified". */
const unchecked = { en: "Official government page; link not yet checked by StudyAtlas.", ja: "政府の公式ページです（StudyAtlasでのリンク確認は未了）。" };
const found = { en: "Official government page found through public search on 2026-10-15; StudyAtlas has not opened it yet.", ja: "政府の公式ページ（2026-10-15に公開検索で存在を確認。StudyAtlasでの内容・リンク確認は未了）。" };
export const visaLinks: Record<string, { label: Localized; link: Fact<string> }[]> = {
  GBR: [
    { label: { en: "GOV.UK – Student visa", ja: "GOV.UK – Student visa（学生ビザ）" }, link: { status: "unverified", value: "https://www.gov.uk/student-visa", note: unchecked } },
    { label: { en: "GOV.UK – Check if you need a UK visa", ja: "GOV.UK – ビザが必要かの確認" }, link: { status: "unverified", value: "https://www.gov.uk/check-uk-visa", note: unchecked } },
    { label: { en: "GOV.UK – Study English in the UK (Short-term study visa)", ja: "GOV.UK – 英語コース（6か月超〜11か月）の短期学習ビザ" }, link: { status: "unverified", value: "https://www.gov.uk/visa-to-study-english", note: found } },
    { label: { en: "GOV.UK – Visit the UK as a Standard Visitor: visit to study (up to 6 months)", ja: "GOV.UK – 訪問者としての学習（6か月以内）" }, link: { status: "unverified", value: "https://www.gov.uk/standard-visitor/visit-to-study", note: found } },
  ],
  CAN: [
    { label: { en: "IRCC – Study permit", ja: "IRCC – Study permit（就学許可）" }, link: { status: "unverified", value: "https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada/study-permit.html", note: unchecked } },
    { label: { en: "IRCC – Do I need a study permit for a course of 6 months or less?", ja: "IRCC – 6か月以内のコースでも就学許可は必要か" }, link: { status: "unverified", value: "https://ircc.canada.ca/english/helpcentre/answer.asp?qnum=484&top=15", note: found } },
    { label: { en: "IRCC – Do I need an eTA to study for less than six months?", ja: "IRCC – 6か月未満の学習にeTAは必要か" }, link: { status: "unverified", value: "https://ircc.canada.ca/english/helpcentre/answer.asp?qnum=1289&top=23", note: found } },
  ],
  AUS: [
    { label: { en: "Department of Home Affairs – Student visa (subclass 500)", ja: "内務省 – Student visa（subclass 500）" }, link: { status: "unverified", value: "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/student-500", note: unchecked } },
  ],
};

/** Official healthcare pages for international students, per country (national or provincial). Same "unverified until checked" rule. */
export const healthLinks: Record<string, { label: Localized; link: Fact<string> }[]> = {
  GBR: [
    { label: { en: "GOV.UK – Pay for UK healthcare as part of your immigration application (Immigration Health Surcharge)", ja: "GOV.UK – 移民医療付加金（IHS）の支払い" }, link: { status: "unverified", value: "https://www.gov.uk/healthcare-immigration-application", note: unchecked } },
    { label: { en: "GOV.UK – How much you have to pay (Immigration Health Surcharge)", ja: "GOV.UK – IHSの金額と免除" }, link: { status: "unverified", value: "https://www.gov.uk/healthcare-immigration-application/how-much-pay", note: found } },
  ],
  CAN: [
    { label: { en: "Government of British Columbia – Medical Services Plan (MSP)", ja: "ブリティッシュコロンビア州政府 – 医療保険（MSP）" }, link: { status: "unverified", value: "https://www2.gov.bc.ca/gov/content/health/health-drug-coverage/msp", note: unchecked } },
    { label: { en: "Government of British Columbia – Health fee for international students", ja: "ブリティッシュコロンビア州政府 – 国際学生ヘルスフィー" }, link: { status: "unverified", value: "https://www2.gov.bc.ca/gov/content/health/accessing-health-care/health-fee-international-students", note: found } },
  ],
  AUS: [],
};
