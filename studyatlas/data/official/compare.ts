import type { Localized } from "@/lib/i18n";
import { officialData } from "./index";
import type { DataPoint } from "./types";
/*
 * City comparison rows for official data. A row names the kind of figure; for each city the first data point whose
 * `metric` is listed is used. Two figures are put side by side as "comparable" only when both are verified and
 * share the same period unit and the same group of people; anything else is still shown, labelled as not comparable.
 * Currencies are never converted here (see lib/fx.ts for the future exchange-rate hook).
 */
export type CompareRow = { id: string; label: Localized; metrics: string[]; hint?: Localized };
export const compareRows: CompareRow[] = [
  { id: "single", label: { en: "Single adult fare", ja: "大人の片道運賃" }, metrics: ["transport.single.adult", "transport.single.adult.zone1"],
    hint: { en: "Manchester: Bee Network bus only; Vancouver: any mode, 1 zone, Compass Stored Value.", ja: "マンチェスターはBee Networkのバスのみ、バンクーバーは全交通機関・1ゾーン・Compassストアドバリューです。" } },
  { id: "monthlyAdult", label: { en: "Adult monthly-type pass", ja: "大人の定期券（月単位）" }, metrics: ["transport.periodPass.adult", "transport.monthlyPass.adult.zone1"],
    hint: { en: "Manchester sells 28-day tickets; Vancouver sells calendar-month passes.", ja: "マンチェスターは28日券、バンクーバーは暦月のパスです。" } },
  { id: "studentTransit", label: { en: "Student transit pass", ja: "学生向け交通パス" }, metrics: ["transport.periodPassAllOperators.student", "transport.studentProgramPass"] },
  { id: "uniHalls", label: { en: "University halls", ja: "大学寮" }, metrics: ["housing.universityHalls.selfCatered"] },
  { id: "marketRent", label: { en: "Average rent, 1 bedroom (whole market)", ja: "平均家賃・1ベッドルーム（市場全体）" }, metrics: ["housing.marketRent.1br"] },
  { id: "livingTotal", label: { en: "Student living-cost estimate (total per month)", ja: "学生の生活費見積もり（月額合計）" }, metrics: ["living.universityEstimate.total"] },
];

export type Issue = "missing" | "notVerified" | "period" | "audience";
/** Why a set of data points cannot be compared as one metric. Empty = same basis. */
export function compareIssues(points: (DataPoint | undefined)[]): Issue[] {
  const have = points.filter((p): p is DataPoint => !!p?.value);
  if (have.length < 2) return ["missing"];
  const out: Issue[] = [];
  if (have.some((p) => p.status !== "verified")) out.push("notVerified");
  if (new Set(have.map((p) => p.value!.per)).size > 1) out.push("period");
  if (new Set(have.map((p) => p.audience)).size > 1) out.push("audience");
  return out;
}
export const pickPoint = (cityId: string, row: CompareRow) => officialData(cityId)?.points.find((p) => row.metrics.includes(p.metric));

/** Mean-temperature range over the published monthly values (min and max month), with station and averaging period. */
export function climateSummary(cityId: string) {
  const c = officialData(cityId)?.climate; if (!c || c.status === "pending") return undefined;
  const means = c.months.map((m) => m.meanC).filter((v): v is number => v !== undefined);
  if (means.length !== 12) return undefined;
  return { min: Math.min(...means), max: Math.max(...means), station: c.station, period: c.period, status: c.status };
}
