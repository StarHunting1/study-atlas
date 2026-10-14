import type { Ccy } from "@/lib/planner";
/** Currency amount with symbol and thousands separators in the viewer's language (JPY has no decimals; whole GBP/CAD amounts show no ".00"). */
export function fmtMoney(amount: number, currency: Ccy, lang: string): string {
  const whole = currency === "JPY" || Math.abs(amount - Math.round(amount)) < 0.005;
  try {
    return new Intl.NumberFormat(lang === "ja" ? "ja-JP" : "en-GB", { style: "currency", currency, currencyDisplay: "symbol", minimumFractionDigits: whole ? 0 : 2, maximumFractionDigits: whole ? 0 : 2 }).format(whole ? Math.round(amount) : amount);
  } catch { return `${Math.round(amount).toLocaleString()} ${currency}`; }
}
/** Plain number with at most 2 decimals (weeks, months, terms). */
export const fmtNum = (n: number, lang: string) => new Intl.NumberFormat(lang === "ja" ? "ja-JP" : "en-GB", { maximumFractionDigits: 2 }).format(n);
export const tpl = (s: string, v: Record<string, string | number>) => s.replace(/\{(\w+)\}/g, (_, k) => String(v[k] ?? ""));
/** Totals and shares are estimates: shown in whole currency units (item amounts and formulas keep their cents). */
export const fmtRound = (amount: number, currency: Ccy, lang: string) => fmtMoney(Math.round(amount), currency, lang);
