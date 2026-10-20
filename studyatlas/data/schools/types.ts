import type { Localized } from "@/lib/i18n";
import type { Fact } from "../schema";
/*
 * School data (Ver.1.4). Language schools and universities are separate shapes.
 * Every changeable detail is a Fact, so it carries status, sources, period and last-checked date,
 * and the same validation as city data applies (data/validate.ts).
 */

/** Billing unit as published by the school. "course" = whole course, "term" = per term. */
export type PriceUnit = "week" | "month" | "term" | "year" | "course" | "once";

export type Price = {
  amount: number; currency: string; unit: PriceUnit;
  /** Upper bound when the school publishes a range (e.g. depends on programme) */
  max?: number;
  /** Fee year the price applies to, e.g. "2026" or "2026/27" */
  feeYear?: string;
  /** Who the price applies to (nationality / residence status / fee category), e.g. "International students" */
  applicability?: Localized;
  tax: "included" | "excluded" | "notApplicable" | "unknown";
  /** What is covered, e.g. "tuition only; materials extra" */
  includes?: Localized;
};

export type WeeksRange = { minWeeks: number; maxWeeks?: number };

export type LanguageCourse = {
  id: string; name: Localized;
  hoursPerWeek: Fact<number>;
  duration: Fact<WeeksRange>;
  tuition: Fact<Price>;
  registrationFee: Fact<Price>;
  materialsFee: Fact<Price>;
};

/** Degree level, kept as a code so that programmes of different levels are never compared at face value ("bachelor" and "master" tuition are different things). */
export type DegreeLevel = "bachelor" | "master" | "doctorate" | "diploma" | "other";
export type UniversityProgram = {
  id: string; degree: Localized; major: Localized;
  /** Ver.1.7.2: the level behind `degree`, set by the person who records the programme */
  level?: DegreeLevel;
  years: Fact<number>;
  tuitionInternational: Fact<Price>;
  /** Applies to THIS programme only: never read as a requirement of the whole university */
  entryRequirements: Fact<Localized>;
  applicationPeriod: Fact<Localized>;
  /** Ver.1.7.2 (all optional; an absent field is simply not recorded): campus, intake month(s), English-language requirement (e.g. IELTS / TOEFL score), required prior study */
  campus?: Fact<Localized>; intake?: Fact<Localized>; englishRequirement?: Fact<Localized>; prerequisites?: Fact<Localized>;
};

/** The official pages a student needs, per university. A page is recorded only with its URL as a Fact: "pending" until a person has supplied it; a link that exists is not a page whose content was checked. */
export const UNI_PAGE_KINDS = ["programSearch", "internationalAdmissions", "tuition", "deadlines", "english", "scholarships"] as const;
export type UniPageKind = (typeof UNI_PAGE_KINDS)[number];

type SchoolBase = {
  id: string; name: string; cityId: string;
  address: Fact<Localized>;
  website: Fact<string>;
  /** true = fictional school used only to demonstrate and test the screens */
  demo?: boolean;
  /** Is this school record itself confirmed to exist / current? */
  record: Fact<Localized>;
};
export type LanguageSchool = SchoolBase & { kind: "language"; accommodation: Fact<Localized>; courses: LanguageCourse[] };
export type University = SchoolBase & { kind: "university"; programs: UniversityProgram[]; /** formal name and main campuses (institution-level facts) */ officialName?: Fact<Localized>; campuses?: Fact<Localized>; officialPages?: Record<UniPageKind, Fact<string>> };
export type School = LanguageSchool | University;
export type SchoolKind = School["kind"];
