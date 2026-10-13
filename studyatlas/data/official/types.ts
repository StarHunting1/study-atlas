import type { Localized } from "@/lib/i18n";
import type { Status } from "../schema";
import type { Topic } from "./sources";
/*
 * Official city data (Ver.1.5): concrete figures with their conditions, kept separate from the Ver.1.3 profile
 * summaries. Every data point says what the number is, for whom, for which period, and where exactly it was read.
 * Validation (validate.ts) runs at load time, so `next build` fails on an incomplete entry.
 */

/** Billing / reporting period of an amount. "trip" = one journey; "contract" = whole tenancy (see contractWeeks). */
export type Per = "trip" | "day" | "week" | "4weeks" | "month" | "year" | "academicYear" | "contract";

/**
 * Who a figure applies to. Figures for different audiences are never compared as the same metric.
 * adult = general adult fare/price; student = any enrolled student meeting the stated conditions; youth = age-based;
 * universityStudent = students of one named university; renter = whole rental market (all households).
 */
export type Audience = "adult" | "student" | "youth" | "universityStudent" | "undergraduate" | "postgraduate" | "renter";

export type Amount = { amount: number; currency: string; per: Per; /** upper bound when the source gives a range */ max?: number };

/** University-run housing: always tied to a school and a contract, never mixed with city rent averages. */
export type UniversityHousing = {
  schoolId: string; school: string; residence?: string; roomType: Localized;
  contractWeeks?: number; contract?: Localized;
  /** What the rent covers, as stated by the university (bills, internet, meals) */
  includes?: Localized; catered?: boolean;
};

export type Evidence = {
  url: string; publisher: string;
  /** Section / table / heading on the page where the figure is shown */
  section: Localized;
  /** Verbatim text from the page that contains the figure. The page check looks for its numbers. */
  quote: string;
  terms?: string;
};

export type DataPoint = {
  id: string; cityId: string; topic: Topic; sourceId: string;
  /** Kind of figure. Compare rows match on `metric`, never on the label. */
  metric: string;
  label: Localized;
  value?: Amount;
  /** Conditions that are not money, e.g. eligibility rules (no amount) */
  text?: Localized;
  audience: Audience;
  /** Who exactly, and under which conditions (age, enrolment, zones, peak times…) */
  conditions: Localized;
  /** What the figure is valid for: fare year, academic year, survey month */
  validFor: string;
  housing?: UniversityHousing;
  evidence: Evidence[];
  /** When the value was last read from the source (YYYY-MM-DD) */
  retrievedAt: string;
  /** When someone last compared the value with the source (YYYY-MM-DD) */
  checkedAt?: string;
  status: Status;
  note?: Localized;
  /** For api sources: id of the collector record holding the same figure (data/collected/snapshot.json). Kept in sync by review. */
  collectedId?: string;
};

export type ClimateMonth = { meanC?: number; maxC?: number; minC?: number; precipMm?: number };
export type ClimateNormals = {
  id: string; cityId: string; sourceId: string;
  station: string; stationId?: string;
  /** Averaging period, e.g. "1991–2020" */
  period: string;
  /** 12 entries, Jan..Dec. A field missing from the source stays undefined (never computed or guessed). */
  months: ClimateMonth[];
  evidence: Evidence[]; retrievedAt: string; checkedAt?: string; status: Status; note?: Localized;
  collectedIds?: string[];
};

export type OfficialCityData = { cityId: string; points: DataPoint[]; climate?: ClimateNormals };
