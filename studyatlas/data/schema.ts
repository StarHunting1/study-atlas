import type { Localized } from "@/lib/i18n";
/*
 * City information schema (Ver.1.3).
 * Every piece of information is a Fact: a value plus where it came from and how far it can be trusted.
 * Shapes are plain JSON-compatible objects so they can later live in a database (e.g. Supabase:
 * one row per fact keyed by city_id + field path, sources in a separate table) without changing the UI.
 */

/**
 * verified   – checked against the cited source(s); requires sources, period and checkedAt (enforced in validate.ts)
 * unverified – carried over or written without a checked source; shown with an "unverified" label
 * sample     – placeholder demo number; shown with a "demo sample" label, never as a real figure
 * pending    – not researched yet; no value, shown as "data coming soon"
 */
export type Status = "verified" | "unverified" | "sample" | "pending";

export type SourceRef = {
  url: string;
  /** Publisher / page name as shown on the source, e.g. "Met Office" */
  publisher: string;
  /** License or terms note when relevant (e.g. "Open Government Licence v3.0") */
  terms?: string;
};

export type Fact<T> = {
  status: Status;
  value?: T;
  sources?: SourceRef[];
  /** What the value describes in time: "2025", "2025-09", "1991-2020", "2025/26 academic year" */
  period?: string;
  /** Date someone last checked the value against the source (YYYY-MM-DD) */
  checkedAt?: string;
  /** Japanese/English explanation, caveats, what is included */
  note?: Localized;
};

/** Money in its original currency. Never converted: different currencies are shown side by side, not compared. */
export type Money = {
  amount: number; currency: string; per: "month" | "week" | "year" | "once";
  /** Upper bound when the source gives a range */
  max?: number;
  /** What the amount covers, e.g. "1-bed flat, city centre, excl. bills" */
  includes?: Localized;
};

export type MonthlyClimate = {
  /** Weather station or area the averages are for */
  station: string;
  /** 12 values, Jan..Dec */
  meanTempC: number[];
  precipMm: number[];
};

/** `where`, `courses` and `stay` (accommodation arranged by the school) are short paraphrases, written only when a listing states them; `source` is the page the entry was read from. */
export type Institution = { name: string; url?: string; note?: Localized; where?: Localized; courses?: Localized; stay?: Localized; source?: SourceRef };

export type CityProfile = {
  cost: { rent: Fact<Money>; food: Fact<Money>; transport: Fact<Money>; phone: Fact<Money>; totalMonthly: Fact<Money> };
  housing: { overview: Fact<Localized>; dorm: Fact<Localized>; homestay: Fact<Localized>; shareHouse: Fact<Localized> };
  climate: { overview: Fact<Localized>; monthly: Fact<MonthlyClimate> };
  safety: { crimeStats: Fact<Localized>; advice: Fact<Localized> };
  education: { universities: Fact<Institution[]>; languageSchools: Fact<Institution[]>; tuition: Fact<Localized> };
  transport: { modes: Fact<Localized>; studentDiscount: Fact<Localized> };
  living: { studentLife: Fact<Localized>; healthcare: Fact<Localized>; sim: Fact<Localized>; banking: Fact<Localized>; studentFacilities: Fact<Localized> };
};

/** Visa rules are national, so they live on the country, not the city. */
export type CountryProfile = { visa: { official: Fact<Localized>; notes: Fact<Localized> } };

/** Shorthand for "not researched yet". */
export const pending = <T,>(note?: Localized): Fact<T> => ({ status: "pending", ...(note ? { note } : {}) });
