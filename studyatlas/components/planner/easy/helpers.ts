import type { Ccy, Money } from "@/lib/planner";
import { fmtRound } from "../format";
/** A sum of money for display: one converted number when everything could be converted, otherwise each currency on its own. */
export function fmtSum(m: Money, display: Ccy, lang: string): string {
  const cs = Object.keys(m.byCurrency) as Ccy[]; if (!cs.length) return "—";
  if (!Object.keys(m.unconverted).length) return fmtRound(m.converted, display, lang);
  return cs.map((c) => fmtRound(m.byCurrency[c]!, c, lang)).join(" + ");
}
/** Slider range of a manually entered exchange rate "1 from = x to". UI only. */
export function rateRange(from: Ccy, to: Ccy) {
  if (to === "JPY") return from === "GBP" ? { min: 80, max: 300, step: 1, fine: 1 } : { min: 50, max: 200, step: 1, fine: 1 };
  if (to === "CAD") return from === "GBP" ? { min: 1.2, max: 2.4, step: 0.01, fine: 0.01 } : { min: 0.005, max: 0.02, step: 0.0005, fine: 0.0005 };
  return from === "CAD" ? { min: 0.4, max: 0.8, step: 0.01, fine: 0.01 } : { min: 0.002, max: 0.01, step: 0.0005, fine: 0.0005 };
}
export const today = () => new Date().toISOString().slice(0, 10);
export const monthName = (m: number, lang: string) => new Intl.DateTimeFormat(lang === "ja" ? "ja-JP" : "en-GB", { month: "short", timeZone: "UTC" }).format(new Date(Date.UTC(2026, m - 1, 1)));
