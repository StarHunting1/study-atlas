import type { Localized } from "@/lib/i18n";
import type { Price } from "./types";
import { RESEARCH_DATE, RESEARCHED_BY } from "./universityLinks";
/*
 * Ver.1.7.2 research import: INTERNAL CANDIDATE DATA for the four front-runner programmes, from the 2026-10-20 research dossier. Not imported by any screen.
 * A candidate is NOT published. A field reaches a user only through `buildPrograms` (universityPrograms.ts) when ALL hold:
 *   1. no open `issues` and not `neverPublish`;
 *   2. a human accuracy approval in PROGRAM_APPROVALS (who, when, what was compared); the research dossier is not one;
 *   3. a rights clearance in PROGRAM_RIGHTS for that field (who, when, basis, scope); public viewability is not a commercial reuse right.
 * Accuracy and rights are separate: (2) says the value is right, (3) says StarHunting may republish it. Both lists are empty, so nothing here is shown.
 * Values are structured / paraphrased by the importer, not copied sentences or tables. Where the dossier leaves a point open the field carries an issue instead of a guess.
 */
export type CandidateFieldName = "years" | "tuitionInternational" | "entryRequirements" | "applicationPeriod" | "campus" | "intake" | "englishRequirement" | "prerequisites";
export type CandidateField = {
  /** what the value is: a short number / date / score (`fact`) or sentences / a table (`text`); `text` needs a rights scope of "text" */
  kind: "fact" | "text";
  value: number | Price | Localized;
  source: { url: string; publisher: string };
  /** cohort / year the value applies to */
  period: string;
  /** who or what it applies to (entry qualification, route, fee category) */
  applicability: Localized;
  /** unresolved points; any entry keeps the field unpublished */
  issues: string[];
};
export type Candidate = {
  uniId: string; programId: string; officialName: Localized; level: "bachelor"; major: Localized;
  /** programme codes, the intake year and the page the programme was read from */
  codes: Record<string, string>; targetYear: string; officialUrl: string;
  researchedAt: string; researchedBy: string; confirmation: "candidate-only";
  fields: Partial<Record<CandidateFieldName, CandidateField>>;
  /** points the dossier could not settle; they are research tasks, not data */
  open: string[];
  /** figures that exist but must never be published as current (wrong year, wrong cohort) */
  neverPublish: { what: string; why: string; value: string }[];
};
const l = (en: string, ja: string): Localized => ({ en, ja });
const L0 = { researchedAt: RESEARCH_DATE, researchedBy: RESEARCHED_BY, confirmation: "candidate-only" as const, level: "bachelor" as const };
export const CANDIDATES: Candidate[] = [
  { ...L0, uniId: "uom", programId: "bsc-management", officialName: l("BSc Management", "BSc Management"), major: l("Management", "マネジメント"), codes: { ucas: "N201", institution: "M20" }, targetYear: "2027 entry", officialUrl: "https://www.manchester.ac.uk/study/undergraduate/courses/2027/03519/bsc-management/all-content/",
    fields: {
      years: { kind: "fact", value: 3, source: { url: "https://www.manchester.ac.uk/study/undergraduate/courses/2027/03519/bsc-management/all-content/", publisher: "The University of Manchester" }, period: "2027 entry", applicability: l("BSc Management, UCAS N201", "BSc Management（UCAS N201）"), issues: [] },
      tuitionInternational: { kind: "fact", value: { amount: 35300, currency: "GBP", unit: "year", feeYear: "2027 entry", applicability: l("International students entering in 2027", "2027年入学の留学生"), tax: "notApplicable" }, source: { url: "https://www.manchester.ac.uk/study/undergraduate/courses/2027/03519/bsc-management/course-details/", publisher: "The University of Manchester" }, period: "2027 entry", applicability: l("International fee status, 2027 entrants", "留学生料金区分・2027年入学者"), issues: ["The course-details page is the intended authority, but the programme overview page carries an outdated / unset fee statement; a person must confirm which page governs before this figure is approved."] },
      englishRequirement: { kind: "fact", value: l("IELTS 6.5 overall, at least 6.0 in each component, or an approved alternative", "IELTS総合6.5、各4技能6.0以上（または認められた代替試験）"), source: { url: "https://www.manchester.ac.uk/study/undergraduate/courses/2027/03519/bsc-management/all-content/", publisher: "The University of Manchester" }, period: "2027 entry", applicability: l("This programme", "このプログラム"), issues: [] },
      entryRequirements: { kind: "fact", value: l("Typical offer: A-level AAA; IB 36 points with 6/6/6 at Higher Level", "標準的な条件：A-level AAA／IB 36点（HL 6/6/6）"), source: { url: "https://www.manchester.ac.uk/study/undergraduate/courses/2027/03519/bsc-management/all-content/", publisher: "The University of Manchester" }, period: "2027 entry", applicability: l("Applicants holding A-levels or the IB only; other qualifications are not covered", "A-levelまたはIB保有者のみ。他の資格は対象外"), issues: [] },
    },
    open: ["Which Manchester page governs the 2027 international fee (course-details vs overview)?", "Campus, intake month and the application deadline are not in the dossier."], neverPublish: [] },
  { ...L0, uniId: "ucl", programId: "management-science-bsc", officialName: l("Management Science BSc", "Management Science BSc"), major: l("Management Science", "マネジメント・サイエンス"), codes: { ucas: "N991", option: "UBSENG00071A" }, targetYear: "2027 entry", officialUrl: "https://www.ucl.ac.uk/study/prospective-students/undergraduate/courses/management-science-bsc?option=UBSENG00071A",
    fields: {
      years: { kind: "fact", value: 3, source: { url: "https://www.ucl.ac.uk/study/prospective-students/undergraduate/courses/management-science-bsc?option=UBSENG00071A", publisher: "UCL" }, period: "2027 entry", applicability: l("3 academic years, full time", "3学年・フルタイム"), issues: ["The 4-year Year in Industry variant also exists; a person must confirm that this page and option code are the 3-year programme."] },
      tuitionInternational: { kind: "fact", value: { amount: 44400, currency: "GBP", unit: "year", feeYear: "2027/28", applicability: l("Overseas students entering in 2027/28", "2027/28年入学の海外（留学生）料金区分"), tax: "notApplicable" }, source: { url: "https://www.ucl.ac.uk/study/prospective-students/undergraduate/courses/management-science-bsc?option=UBSENG00071A", publisher: "UCL" }, period: "2027/28", applicability: l("Overseas fee status", "海外（留学生）料金区分"), issues: [] },
      intake: { kind: "fact", value: l("September 2027, full time", "2027年9月開始・フルタイム"), source: { url: "https://www.ucl.ac.uk/study/prospective-students/undergraduate/courses/management-science-bsc?option=UBSENG00071A", publisher: "UCL" }, period: "2027 entry", applicability: l("This programme", "このプログラム"), issues: [] },
      applicationPeriod: { kind: "fact", value: l("Equal-consideration deadline: 13 January 2027, 18:00 UK time (late applications may be considered separately)", "平等審査の締切：2027年1月13日 18:00（英国時間）。遅れた出願は別途検討される場合あり"), source: { url: "https://www.ucl.ac.uk/study/prospective-students/undergraduate/courses/management-science-bsc?option=UBSENG00071A", publisher: "UCL" }, period: "2027 entry", applicability: l("Equal-consideration round only", "平等審査の対象期限のみ"), issues: [] },
      englishRequirement: { kind: "fact", value: l("UCL Level 4: IELTS 7.5 overall, at least 7.0 in each component", "UCLレベル4：IELTS総合7.5、各4技能7.0以上"), source: { url: "https://www.ucl.ac.uk/study/prospective-students/undergraduate/how-apply/english-language-requirements", publisher: "UCL" }, period: "2027 entry", applicability: l("UCL English level 4 (general table)", "UCL英語レベル4（一般表）"), issues: ["Which English level this programme requires is NOT confirmed; the table value must not be attached to the programme until a person confirms it."] },
    },
    open: ["Which UCL English level applies to Management Science BSc?", "Is the page the 3-year programme or the Year in Industry variant?", "Campus (Canary Wharf or Bloomsbury) is unclear."], neverPublish: [] },
  { ...L0, uniId: "uoft", programId: "rotman-commerce", officialName: l("Rotman Commerce", "Rotman Commerce"), major: l("Commerce", "コマース"), codes: {}, targetYear: "Fall 2027", officialUrl: "https://rotmancommerce.utoronto.ca/future-students/important-dates/",
    fields: {
      intake: { kind: "fact", value: l("Fall 2027", "2027年秋入学"), source: { url: "https://rotmancommerce.utoronto.ca/future-students/important-dates/", publisher: "Rotman Commerce, University of Toronto" }, period: "Fall 2027", applicability: l("This programme", "このプログラム"), issues: [] },
      applicationPeriod: { kind: "fact", value: l("Early main 7 Nov 2026 · early supplementary 1 Dec 2026 · final main 15 Jan 2027 · final supplemental/documents 1 Feb 2027 (all 23:59 EST)", "早期メイン 2026/11/7・早期補足 2026/12/1・最終メイン 2027/1/15・最終補足/書類 2027/2/1（いずれも23:59 EST）"), source: { url: "https://rotmancommerce.utoronto.ca/future-students/important-dates/", publisher: "Rotman Commerce, University of Toronto" }, period: "Fall 2027", applicability: l("Four different application stages", "性質の異なる4つの出願段階"), issues: ["Four deadlines of different application categories; a person must choose which are shown and how they are labelled. They are never merged into one date."] },
      englishRequirement: { kind: "fact", value: l("IELTS Academic 6.5 overall, at least 6.0 in each band (exceptions apply)", "IELTS Academic 総合6.5、各バンド6.0以上（例外あり）"), source: { url: "https://future.utoronto.ca/english-language-requirements", publisher: "University of Toronto" }, period: "Fall 2027", applicability: l("General undergraduate requirement of the university", "大学全体の学部共通要件"), issues: ["Rotman Commerce's own English requirement is not confirmed; the university-wide value must not be shown as the programme's requirement."] },
    },
    open: ["Fall 2027 international tuition amount (only the structure is known: first year = Arts & Science fee, later years = Rotman Commerce fee).", "Rotman Commerce-specific English requirement.", "Duration, campus and entry requirements are not in the dossier."],
    neverPublish: [{ what: "tuition, first year", why: "2025/26 indicative brochure figure; not a 2027 fee; includes an insurance item and excludes ancillary fees", value: "CAD 63,570 (2025/26)" }, { what: "tuition, years 2–4", why: "2025/26 indicative brochure figure; not a 2027 fee; includes an insurance item and excludes ancillary fees", value: "CAD 72,260 (2025/26)" }] },
  { ...L0, uniId: "unimelb", programId: "bachelor-of-commerce", officialName: l("Bachelor of Commerce", "Bachelor of Commerce"), major: l("Commerce", "コマース"), codes: {}, targetYear: "2027", officialUrl: "https://study.unimelb.edu.au/find/courses/undergraduate/bachelor-of-commerce/",
    fields: {
      years: { kind: "fact", value: 3, source: { url: "https://study.unimelb.edu.au/find/courses/undergraduate/bachelor-of-commerce/", publisher: "The University of Melbourne" }, period: "2027", applicability: l("Full time", "フルタイム"), issues: [] },
      campus: { kind: "fact", value: l("Parkville", "パークビル"), source: { url: "https://study.unimelb.edu.au/find/courses/undergraduate/bachelor-of-commerce/", publisher: "The University of Melbourne" }, period: "2027", applicability: l("This programme", "このプログラム"), issues: [] },
      intake: { kind: "fact", value: l("February and July", "2月・7月"), source: { url: "https://study.unimelb.edu.au/find/courses/undergraduate/bachelor-of-commerce/", publisher: "The University of Melbourne" }, period: "2027", applicability: l("This programme", "このプログラム"), issues: [] },
      englishRequirement: { kind: "fact", value: l("IELTS Academic 6.5 overall, at least 6.0 in each band", "IELTS Academic 総合6.5、各バンド6.0以上"), source: { url: "https://study.unimelb.edu.au/how-to-apply/english-language-requirements/undergraduate-english-language-requirements", publisher: "The University of Melbourne" }, period: "2027", applicability: l("Bachelor of Commerce (course-specific)", "Bachelor of Commerce（コース別）"), issues: [] },
      applicationPeriod: { kind: "fact", value: l("Semester 1 2027: 30 Nov 2026 · Semester 2 2027: 31 May 2027", "2027年第1学期：2026/11/30・第2学期：2027/5/31"), source: { url: "https://study.unimelb.edu.au/how-to-apply/undergraduate-study/international-applications/applications", publisher: "The University of Melbourne" }, period: "2027", applicability: l("Direct international applications only; the VTAC route has different dates", "海外からの直接出願のみ（VTAC経由は日程が異なる）"), issues: [] },
    },
    open: ["2027 international tuition for the Bachelor of Commerce: the fee depends on discipline band, subjects and load, so there is no flat figure; the amount is unconfirmed (the domestic CSP is not an international fee).", "Seven majors (Accounting, Actuarial Studies, Business Analytics, Economics, Finance, Management, Marketing): a major-level record is not made yet."], neverPublish: [] },
];
