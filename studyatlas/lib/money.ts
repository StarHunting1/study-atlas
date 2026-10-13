// Period and currency helpers shared by the school compare table and the budget simulator. No external rates are fetched.
export type Period = "week" | "month" | "year" | "once";
export const WEEKS_PER_MONTH = 52 / 12; // average month, used for all week <-> month conversions
export const WEEKS_PER_YEAR = 52;
/** Total for a stay of `weeks`. "once" is a single payment regardless of length. Returns null when the length is needed but unknown. */
export function totalFor(amount: number, per: Period, weeks: number | null): number | null {
  if (per === "once") return amount;
  if (weeks === null || !(weeks > 0)) return null;
  return per === "week" ? amount * weeks : per === "month" ? amount * (weeks / WEEKS_PER_MONTH) : amount * (weeks / WEEKS_PER_YEAR);
}
export const durationToWeeks = (n: number, unit: "weeks" | "months" | "years") => (unit === "weeks" ? n : unit === "months" ? n * WEEKS_PER_MONTH : n * WEEKS_PER_YEAR);

/** Currencies offered in selectors (display currency, manual amounts). */
export const CURRENCIES = ["JPY", "GBP", "CAD", "AUD", "USD", "EUR", "NZD", "KRW", "CNY", "TWD"];
/** Minor-unit-free formatting in the viewer's language. */
export function fmt(amount: number, currency: string, lang: string) {
  try { return new Intl.NumberFormat(lang === "ja" ? "ja-JP" : "en-GB", { style: "currency", currency, maximumFractionDigits: currency === "JPY" || currency === "KRW" ? 0 : 2 }).format(amount); }
  catch { return `${amount.toLocaleString()} ${currency}`; }
}
