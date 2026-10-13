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
export const visaLinks: Record<string, { label: Localized; link: Fact<string> }[]> = {
  GBR: [
    { label: { en: "GOV.UK – Student visa", ja: "GOV.UK – Student visa（学生ビザ）" }, link: { status: "unverified", value: "https://www.gov.uk/student-visa", note: unchecked } },
    { label: { en: "GOV.UK – Check if you need a UK visa", ja: "GOV.UK – ビザが必要かの確認" }, link: { status: "unverified", value: "https://www.gov.uk/check-uk-visa", note: unchecked } },
  ],
  CAN: [
    { label: { en: "IRCC – Study permit", ja: "IRCC – Study permit（就学許可）" }, link: { status: "unverified", value: "https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada/study-permit.html", note: unchecked } },
  ],
  AUS: [
    { label: { en: "Department of Home Affairs – Student visa (subclass 500)", ja: "内務省 – Student visa（subclass 500）" }, link: { status: "unverified", value: "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/student-500", note: unchecked } },
  ],
};
