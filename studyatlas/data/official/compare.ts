import type { Localized } from "@/lib/i18n";
import { officialData } from "./index";
import { displayModeOfClimate, isFigureShown, showsFigure } from "./rights";
import { sameRentBasis } from "./rentBasis";
import type { DataPoint, NoticeWhy } from "./types";
/*
 * City comparison rows for official data. A row names the kind of figure; for each city the first data point whose
 * `metric` is listed is used. Two figures are put side by side as "comparable" only when both are verified and
 * share the same period unit and the same group of people; anything else is still shown, labelled as not comparable.
 * Currencies are never converted here (see lib/fx.ts for the future exchange-rate hook).
 */
export type CompareRow = {
  id: string; label: Localized; metrics: string[]; hint?: Localized;
  /** Set when the figures chosen for the cities are different statistics (not just different currencies): the row then says so instead of "same basis", and no verdict is ever drawn. */
  basis?: Localized;
};
export const compareRows: CompareRow[] = [
  { id: "single", label: { en: "Single adult fare", ja: "大人の片道運賃" }, metrics: ["transport.single.adult", "transport.single.adult.zone1"],
    hint: { en: "Manchester: Bee Network bus only; Vancouver: any mode, 1 zone, Compass Stored Value.", ja: "マンチェスターはBee Networkのバスのみ、バンクーバーは全交通機関・1ゾーン・Compassストアドバリューです。" } },
  { id: "monthlyAdult", label: { en: "Adult monthly-type pass", ja: "大人の定期券（月単位）" }, metrics: ["transport.periodPass.adult", "transport.monthlyPass.adult.zone1"],
    hint: { en: "Manchester sells 28-day tickets; Vancouver sells calendar-month passes.", ja: "マンチェスターは28日券、バンクーバーは暦月のパスです。" } },
  { id: "studentTransit", label: { en: "Student transit pass", ja: "学生向け交通パス" }, metrics: ["transport.periodPassAllOperators.student", "transport.studentProgramPass"] },
  { id: "uniHalls", label: { en: "University halls", ja: "大学寮" }, metrics: ["housing.universityHalls.selfCatered"] },
  { id: "marketRent", label: { en: "Rent in the private rental market (average or median)", ja: "民間賃貸市場の家賃（平均または中央値）" }, metrics: ["housing.privateRent.average", "housing.privateRent.regionAverage", "housing.marketRent.1br", "housing.marketRent.censusMedianWeekly"],
    hint: { en: "Manchester: all private dwellings in one local authority (ONS). London: all private dwellings in the whole London region (ONS). Vancouver and Toronto: 1-bedroom units in the census metropolitan area (CMHC). Sydney and Melbourne: the median weekly rent of renting households in the 2021 Census (ABS). None is student housing.", ja: "マンチェスター：1つの自治体の民間賃貸住宅すべて（ONS）。ロンドン：ロンドン地域全体の民間賃貸住宅すべて（ONS）。バンクーバー・トロント：都市圏の1ベッドルーム（CMHC）。シドニー・メルボルン：2021年国勢調査（ABS）の賃貸世帯の週あたり家賃の中央値。いずれも学生向け住居ではありません。" },
    basis: { en: "Not directly comparable: the statistic, year, housing type and currency differ (not converted). No “cheaper” verdict is given.", ja: "直接は比較できません：統計の種類・対象年・住居タイプ・通貨が異なります（換算なし）。どちらが安いかは判定しません。" } },
  { id: "livingTotal", label: { en: "Student living-cost estimate (total per month)", ja: "学生の生活費見積もり（月額合計）" }, metrics: ["living.universityEstimate.total"] },
];

export type Issue = "missing" | "notVerified" | "period" | "audience" | "site";
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
/** What a compare row can say about its figures. Never an ordering: StudyAtlas does not call one city's figure cheaper or dearer (currencies are not converted). */
export type RowVerdict = "missing" | "issues" | "notDirect" | "sameBasis";
export function rowVerdict(row: CompareRow, points: (DataPoint | undefined)[]): { verdict: RowVerdict; issues: Issue[]; currenciesDiffer: boolean } {
  const issues = compareIssues(points); const have = points.filter((p): p is DataPoint => !!p?.value);
  const currenciesDiffer = new Set(have.map((p) => p.value!.currency)).size > 1;
  const verdict: RowVerdict = issues.includes("missing") ? "missing" : issues.length ? "issues" : row.basis && !(row.id === "marketRent" && sameRentBasis(have)) ? "notDirect" : "sameBasis";
  return { verdict, issues, currenciesDiffer };
}
/** A figure the publisher's terms allow to be shown (rights.ts); held-back figures are treated as "no figure" and never compared. */
export const pickPoint = (cityId: string, row: CompareRow) => officialData(cityId)?.points.find((p) => row.metrics.includes(p.metric) && isFigureShown(p));

/**
 * Why a city has no figure in a compare row although the row exists for others: the figure is recorded but the publisher's terms allow only a link
 * ("link"), or the topic was reviewed and held back with a notice ("notice"). Nothing is shown from either; undefined = really no data.
 */
export type MissingReason = { kind: "link"; url: string; publisher: string } | { kind: "notice"; why: NoticeWhy; text: Localized; links: { label: Localized; url: string }[] };
export function missingReason(cityId: string, row: CompareRow): MissingReason | undefined {
  const d = officialData(cityId); if (!d) return undefined;
  const held = d.points.find((p) => row.metrics.includes(p.metric) && p.value && !isFigureShown(p));
  if (held) return { kind: "link", url: held.evidence[0].url, publisher: held.evidence[0].publisher };
  const topic = row.metrics[0].split(".")[0];
  // a notice belongs to the row it is about: "awaiting approval" notices are the whole-market rent statistic, never the student-housing row
  const n = (d.notices ?? []).find((x) => x.topic === topic && ((x.why ?? "restricted") === "awaiting-approval") === (row.id === "marketRent"));
  return n ? { kind: "notice", why: n.why ?? "restricted", text: n.text, links: n.links } : undefined;
}

export const hasHeldNotice = (cityId: string, topic: string) => !!officialData(cityId)?.notices?.some((n) => n.topic === topic && n.why !== "awaiting-approval");
/** The whole-market rent statistic of this city is collected but waits for a person's approval (nothing is shown). */
export const hasRentPending = (cityId: string) => !!officialData(cityId)?.notices?.some((n) => n.topic === "housing" && n.why === "awaiting-approval");

/** Climate figures per city for the compare table: warmest/coolest month of the mean daily max and min, and the sum of the 12 monthly precipitation values. */
export type ClimateCompare = { tmax?: [number, number]; tmin?: [number, number]; mean?: [number, number]; precipTotal?: number; station: string; period: string; derived: boolean; status: DataPoint["status"]; /** kind of observing site: an airport station and a city-centre station are never put on the same footing */ site: "city" | "airport" | "other"; where?: Localized };
/** Kind of observing site: recorded (stationInfo) where known, otherwise read from the station name ("Airport", "Int'l A", "Ringway"…). */
export const siteKindOf = (c: { station: string; stationInfo?: { kind: "city" | "airport" | "other" } }): "city" | "airport" | "other" => c.stationInfo?.kind ?? (/airport|int.?l\s?a\b|intl\s?a\b|ringway/i.test(c.station) ? "airport" : "other");
export function climateCompare(cityId: string): ClimateCompare | undefined {
  const c = officialData(cityId)?.climate; if (!c || c.status === "pending" || !showsFigure(displayModeOfClimate(c))) return undefined;
  const col = (k: "maxC" | "minC" | "meanC" | "precipMm") => c.months.map((m) => m[k]).filter((v): v is number => v !== undefined);
  const rng = (v: number[]): [number, number] | undefined => (v.length === 12 ? [Math.min(...v), Math.max(...v)] : undefined);
  const rain = col("precipMm");
  return { tmax: rng(col("maxC")), tmin: rng(col("minC")), mean: rng(col("meanC")), precipTotal: c.annual?.precipMm !== undefined ? c.annual.precipMm : rain.length === 12 ? Math.round(rain.reduce((a, b) => a + b, 0)) : undefined, station: c.station, period: c.period, derived: !!c.derived, site: siteKindOf(c), where: c.stationInfo?.where, status: c.status };
}
/** Climate rows can be compared only when the averaging periods AND the kind of observing site are the same (and all are verified): an airport and a city-centre station differ even in the same period. */
export function climateIssues(list: (ClimateCompare | undefined)[]): Issue[] {
  const have = list.filter((x): x is ClimateCompare => !!x);
  if (have.length < 2) return ["missing"];
  const out: Issue[] = [];
  if (have.some((x) => x.status !== "verified")) out.push("notVerified");
  if (new Set(have.map((x) => x.period)).size > 1) out.push("period");
  if (new Set(have.map((x) => x.site)).size > 1) out.push("site");
  return out;
}
