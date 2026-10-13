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

export type UniversityProgram = {
  id: string; degree: Localized; major: Localized;
  years: Fact<number>;
  tuitionInternational: Fact<Price>;
  entryRequirements: Fact<Localized>;
  applicationPeriod: Fact<Localized>;
};

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
export type University = SchoolBase & { kind: "university"; programs: UniversityProgram[] };
export type School = LanguageSchool | University;
export type SchoolKind = School["kind"];
