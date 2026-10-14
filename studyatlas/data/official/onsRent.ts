import type { CollectedRecord } from "../../collector/types";
import { displayModeOf, rightsOfSource } from "./rights";
import { officialSources } from "./sources";
import type { DataPoint } from "./types";
/*
 * ONS private rent for Manchester (Ver.1.2.3) – prepared, NOT published.
 *
 * The collector (collector/sources/onsrent.ts) stores the newest month in data/collected/snapshot.json as an "unverified"
 * candidate. This file holds the one figure a person is asked to approve (August 2026, £1,373) together with the
 * checks that compare it with the collected record, the source registry, the rights record and the ONS page itself.
 *
 *   - While ONS_RENT_APPROVAL is null the figure is NOT part of the official data: no card, no key figure, nothing is shown
 *     and nothing is marked verified.
 *   - A person who has compared the figure with the ONS pages sets ONS_RENT_APPROVAL (name, date, what was compared) in a
 *     reviewed pull request. Only then does the card appear in the existing "City rental market" group of the housing card,
 *     as "verified", with its sources and conditions behind 「出典・適用条件を見る」.
 *   - The approval covers exactly this month and value. A later month in the snapshot is a new candidate that needs its own approval.
 *
 * What it is: the mean monthly private rent of ALL privately rented dwellings in the Manchester local authority (E08000003).
 * What it is not: university halls, student housing, an average for international students, or a figure by bedroom or property type.
 */
export type RentApproval = { approvedBy: string; approvedAt: string; /** what the approver compared, e.g. "ONS Manchester page and PIPR workbook, 16 Sep 2026 edition" */ basis: string };
/** Set by a human reviewer. null = not approved: the figure stays out of the website. */
export const ONS_RENT_APPROVAL: RentApproval | null = null;

export const ONS_RENT_ID = "man-ons-pipr-private-rent-month";
export const ONS_RENT_COLLECTED_ID = "ons-private-rents:manchester:rental-price";
const PAGE = "https://www.ons.gov.uk/visualisations/housingpriceslocal/E08000003";
const DATASET = "https://www.ons.gov.uk/economy/inflationandpriceindices/datasets/priceindexofprivaterentsukmonthlypricestatistics";
const ONS = "Office for National Statistics";
export const ONS_RENT_MONTH = "2026-08";
export const ONS_RENT_PUBLISHED = "2026-09-16";
export const ONS_RENT_AREA = { code: "E08000003", name: "Manchester" };
export const ONS_RENT_PAGE_QUOTE = "The average monthly private rent in Manchester was £1,373 in August 2026.";
export const ONS_RENT_WORKBOOK_QUOTE = "Manchester E08000003 2026-08-01 Rental price 1373";

/** The figure waiting for approval (everything except the verification fields). */
export const ONS_RENT_CANDIDATE: Omit<DataPoint, "status" | "checkedAt"> = {
  id: ONS_RENT_ID, cityId: "manchester", topic: "housing", sourceId: "ons-private-rents", metric: "housing.privateRent.average", collectedId: ONS_RENT_COLLECTED_ID,
  label: { en: "Average private rent – all dwellings in Manchester (whole market)", ja: "平均民間家賃・マンチェスター全域の全住宅（市場全体）" },
  value: { amount: 1373, currency: "GBP", per: "month" }, audience: "renter",
  conditions: {
    en: "Mean monthly rent of all privately rented dwellings in the Manchester local authority (ONS code E08000003), new and existing tenancies, August 2026. Not student housing: not university halls and not an average for international students; not split by bedrooms or property type. ONS marks these series as official statistics in development.",
    ja: "マンチェスター市（ONS地域コード E08000003）の民間賃貸住宅すべての月額家賃の平均（新規契約と既存契約、2026年8月）。学生向け住居ではありません：大学寮の料金でも留学生の平均でもなく、寝室数や物件タイプ別でもありません。ONSはこの統計を「開発中の公式統計」としています。",
  },
  validFor: "2026-08 (August 2026; ONS Price Index of Private Rents, published 16 September 2026)",
  evidence: [
    { url: PAGE, publisher: ONS, section: { en: "Housing prices in Manchester – Average private rents", ja: "Housing prices in Manchester – 平均民間家賃" }, quote: ONS_RENT_PAGE_QUOTE },
    { url: DATASET, publisher: ONS, section: { en: "PIPR monthly price statistics workbook (16 September 2026 edition), Table 1 – Rental price", ja: "PIPR月次価格統計ワークブック（2026年9月16日版）Table 1 – Rental price" }, quote: ONS_RENT_WORKBOOK_QUOTE },
  ],
  retrievedAt: "2026-10-14",
  note: { en: "The collector reads this from the official ONS workbook; the ONS Manchester page shows the same figure. Rounded to the nearest £1; not seasonally adjusted.", ja: "収集処理がONS公式のワークブックから読み取った値で、ONSのマンチェスターのページにも同じ値が表示されています。1ポンド単位に丸め、季節調整なしです。" },
};

/** The published DataPoint: the candidate plus the human approval (verified). Without an approval nothing is published. */
export function onsRentPoints(approval: RentApproval | null = ONS_RENT_APPROVAL): DataPoint[] {
  if (!approval) return [];
  if (!approval.approvedBy.trim() || !/^\d{4}-\d{2}-\d{2}$/.test(approval.approvedAt) || !approval.basis.trim()) throw new Error("ONS_RENT_APPROVAL needs approvedBy, approvedAt (YYYY-MM-DD) and basis");
  const failed = reconcileStatic().filter((c) => !c.ok); if (failed.length) throw new Error(`ONS rent cannot be approved: ${failed.map((c) => c.name).join(", ")}`);
  return [{ ...ONS_RENT_CANDIDATE, status: "verified", checkedAt: approval.approvedAt }];
}

export type Check = { name: string; ok: boolean; detail: string };
const chk = (name: string, ok: boolean, detail: string): Check => ({ name, ok, detail });
const nums = (s: string) => (s.match(/\d[\d,]*(\.\d+)?/g) ?? []).map((n) => Number(n.replace(/,/g, "")));

/** Checks that need no collected data: the candidate against the source registry, the rights record and its own evidence. */
export function reconcileStatic(): Check[] {
  const c = ONS_RENT_CANDIDATE; const src = officialSources.find((s) => s.id === c.sourceId); const r = rightsOfSource(c.sourceId); const amount = c.value!.amount;
  return [
    chk("source registered for Manchester", !!src && src.cityIds.includes("manchester") && src.publisher === ONS, src?.publisher ?? "missing"),
    chk("evidence pages belong to the source", c.evidence.every((e) => src?.pages.some((u) => e.url.startsWith(u))), c.evidence.map((e) => e.url).join(" | ")),
    chk("area code E08000003 is in the ONS page URL and the workbook quote", c.evidence[0].url.endsWith(`/${ONS_RENT_AREA.code}`) && c.evidence[1].quote.includes(ONS_RENT_AREA.code) && c.evidence[1].quote.includes(ONS_RENT_AREA.name), c.evidence[1].quote),
    chk("unit is GBP per month", c.value!.currency === "GBP" && c.value!.per === "month", `${c.value!.currency}/${c.value!.per}`),
    chk("period is a single month", c.validFor.slice(0, 7) === ONS_RENT_MONTH && ONS_RENT_CANDIDATE.evidence[0].quote.includes("August 2026"), c.validFor),
    chk("both evidence quotes contain the amount", c.evidence.every((e) => nums(e.quote).includes(amount)), `${amount}`),
    chk("licence recorded and reuse permitted", r.reuseStatus === "permitted" && !!r.lastReviewedAt && /Open Government Licence v3\.0/.test(r.licence ?? ""), `${r.reuseStatus} · ${r.licence}`),
    chk("collection allowed by the rights review", r.automation === "allowed", r.automation),
    chk("shown in full under the rights rules", displayModeOf({ sourceId: c.sourceId, value: c.value, rights: c.rights }) === "full", displayModeOf({ sourceId: c.sourceId, value: c.value, rights: c.rights })),
    chk("not confusable with student housing", c.audience === "renter" && !c.housing && /Not student housing/.test(c.conditions.en) && /学生向け住居ではありません/.test(c.conditions.ja), c.audience),
  ];
}

/** Checks of the candidate against the record the collector stored (data/collected/snapshot.json). `current` = the record is for the same month. */
export function reconcileCollected(rec: CollectedRecord | undefined): { current: boolean; checks: Check[] } {
  if (!rec) return { current: false, checks: [chk("collected record exists", false, ONS_RENT_COLLECTED_ID)] };
  const c = ONS_RENT_CANDIDATE; const meta = (rec.meta ?? {}) as { areaCode?: string; areaName?: string; checks?: Record<string, boolean>; unconfirmed?: string[]; scope?: { en?: string } };
  const current = rec.period === ONS_RENT_MONTH;
  const checks = [
    chk("same value", rec.value.number === c.value!.amount, `${rec.value.number} vs ${c.value!.amount}`),
    chk("same unit (GBP per month)", rec.value.currency === c.value!.currency && rec.value.unit === c.value!.per, `${rec.value.currency}/${rec.value.unit}`),
    chk("same month", current, `${rec.period} vs ${ONS_RENT_MONTH}`),
    chk("same area code and name", meta.areaCode === ONS_RENT_AREA.code && meta.areaName === ONS_RENT_AREA.name && rec.cityId === c.cityId, `${meta.areaCode} ${meta.areaName}`),
    chk("same source page", rec.sourceUrl === c.evidence[1].url, rec.sourceUrl),
    chk("same publication date", rec.sourcePublishedAt === ONS_RENT_PUBLISHED, `${rec.sourcePublishedAt}`),
    chk("same licence as the rights record", rec.licence === rightsOfSource(c.sourceId).licence, `${rec.licence}`),
    chk("workbook evidence quote matches", rec.evidence.quote === c.evidence[1].quote, `${rec.evidence.quote}`),
    chk("collector checks all passed, nothing unconfirmed", Object.values(meta.checks ?? {}).length > 0 && Object.values(meta.checks ?? {}).every(Boolean) && (meta.unconfirmed ?? []).length === 0, JSON.stringify(meta.checks)),
    chk("collector scope says: not student housing", /Not university halls/.test(meta.scope?.en ?? "") , meta.scope?.en ?? ""),
    chk("the collector never verifies (record is unverified)", rec.status === "unverified", rec.status),
  ];
  return { current, checks };
}
