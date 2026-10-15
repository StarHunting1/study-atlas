import type { DataPoint } from "./types";
/*
 * Ver.1.2.6 – which study type a published figure applies to. Derived only from what a data point already says (its audience and
 * the institution named in its conditions); nothing is added to the data. A figure is never shown as "applicable" to a study type
 * unless its audience allows it:
 *   applies     – the audience covers this study type (adult fares, whole-market rents, university-only figures for university study…)
 *   unconfirmed – the audience is "any student" and the data does not say whether language-school students qualify
 *   not         – the figure is for university / college students only and is not available to this study type
 */
export type StudyMode = "language" | "university";
export const STUDY_MODES = ["language", "university"] as const;
export type Fit = "applies" | "unconfirmed" | "not";

/** "student" figures whose conditions name degree-level institutions (so language-school students do not qualify) */
const INSTITUTION_ONLY = new Set(["man-bus-allterms-student", "van-upass"]);

export function fitOf(p: Pick<DataPoint, "id" | "audience">, mode: StudyMode): Fit {
  if (mode === "university") return "applies";    // university students qualify for every audience on record (university-only, "student", adult, youth by age, renter)
  switch (p.audience) {
    case "universityStudent": case "undergraduate": case "postgraduate": return "not";
    case "student": return INSTITUTION_ONLY.has(p.id) ? "not" : "unconfirmed";
    default: return "applies";                     // adult, youth (age-based), renter
  }
}
