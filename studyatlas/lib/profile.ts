// "My Study Profile": stored only in this browser (localStorage key below). No field is sent anywhere.
export const PROFILE_KEY = "studyatlas.profile";
export const AGE_GROUPS = ["under18", "18-24", "25-30", "31-40", "41plus"] as const;
export const STUDY_TYPES = ["language", "university"] as const;
export type Profile = {
  nationality: string;      // ISO 3166-1 alpha-2 of the passport-issuing country
  residence: string;        // ISO alpha-2 of the current country of residence
  ageGroup: (typeof AGE_GROUPS)[number] | "";
  destCountry: string;      // StudyAtlas country code (CAN/GBR/AUS) or ""
  destCity: string;         // city id or ""
  studyType: (typeof STUDY_TYPES)[number] | "";
  duration: { value: number | null; unit: "weeks" | "months" | "years" };
  departure: string;        // YYYY-MM
  budget: { amount: number | null; currency: string };
  currency: string;         // display currency
};
export const emptyProfile = (): Profile => ({ nationality: "", residence: "", ageGroup: "", destCountry: "", destCity: "", studyType: "", duration: { value: null, unit: "weeks" }, departure: "", budget: { amount: null, currency: "JPY" }, currency: "JPY" });
export function cleanProfile(v: unknown): Profile | undefined {
  if (!v || typeof v !== "object") return undefined;
  const e = emptyProfile(), p = v as Partial<Profile>, str = (x: unknown) => (typeof x === "string" ? x : "");
  return {
    nationality: str(p.nationality), residence: str(p.residence),
    ageGroup: (AGE_GROUPS as readonly string[]).includes(str(p.ageGroup)) ? (p.ageGroup as Profile["ageGroup"]) : "",
    destCountry: str(p.destCountry), destCity: str(p.destCity),
    studyType: (STUDY_TYPES as readonly string[]).includes(str(p.studyType)) ? (p.studyType as Profile["studyType"]) : "",
    duration: { value: typeof p.duration?.value === "number" ? p.duration.value : null, unit: ["weeks", "months", "years"].includes(str(p.duration?.unit)) ? p.duration!.unit : "weeks" },
    departure: /^\d{4}-\d{2}$/.test(str(p.departure)) ? str(p.departure) : "",
    budget: { amount: typeof p.budget?.amount === "number" ? p.budget.amount : null, currency: str(p.budget?.currency) || e.budget.currency },
    currency: str(p.currency) || e.currency,
  };
}
export const isEmptyProfile = (p: Profile) => JSON.stringify(p) === JSON.stringify(emptyProfile());

/** ISO 3166-1 alpha-2 codes; names come from Intl.DisplayNames in the viewer's language (no translation table to maintain). */
export const REGION_CODES = "AD AE AF AG AL AM AO AR AT AU AZ BA BB BD BE BF BG BH BI BJ BN BO BR BS BT BW BY BZ CA CD CF CG CH CI CL CM CN CO CR CU CV CY CZ DE DJ DK DM DO DZ EC EE EG ER ES ET FI FJ FM FR GA GB GD GE GH GM GN GQ GR GT GW GY HK HN HR HT HU ID IE IL IN IQ IR IS IT JM JO JP KE KG KH KI KM KN KP KR KW KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MG MH MK ML MM MN MO MR MT MU MV MW MX MY MZ NA NE NG NI NL NO NP NR NZ OM PA PE PG PH PK PL PS PT PW PY QA RO RS RU RW SA SB SC SD SE SG SI SK SL SM SN SO SR SS ST SV SY SZ TD TG TH TJ TL TM TN TO TR TT TV TW TZ UA UG US UY UZ VA VC VE VN VU WS YE ZA ZM ZW".split(" ");
export function regionName(code: string, lang: string) {
  try { return new Intl.DisplayNames([lang], { type: "region" }).of(code) ?? code; } catch { return code; }
}
