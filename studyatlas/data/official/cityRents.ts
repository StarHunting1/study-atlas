import type { CollectedRecord } from "../../collector/types";
import { displayModeOf, rightsOfSource } from "./rights";
import { officialSources } from "./sources";
import type { DataPoint } from "./types";
import type { RentApproval } from "./onsRent";
/*
 * Public rent statistics for Toronto and London (Ver.1.5.0) – prepared, NOT published. Same rule as the Manchester ONS figure (onsRent.ts):
 *
 *   - The collector (collector/sources/statcan.ts, onsrent.ts) stores these as "unverified" candidates in data/collected/snapshot.json.
 *   - While TORONTO_RENT_APPROVAL / LONDON_RENT_APPROVAL is null the figures are NOT part of the official data: no card, no key figure, no number in
 *     the comparison. The city page and the comparison show the conditions and the official link instead.
 *   - A person who has compared the figures with the publisher's pages records the approval (name, date, what was compared) in a reviewed PR.
 *     Only then do the points exist, as "verified". The approval covers exactly this reference period and these values.
 *
 * What they are: whole-rental-market statistics. What they are not: student housing, language-school housing or an average for international students.
 * The two are NOT the same kind of statistic: Toronto is a CMHC survey average for a census metropolitan area (like Vancouver); London is the ONS
 * average for the whole London region (unlike Manchester, a single local authority). Reuse permission is recorded in rights.data.ts, apart from this approval.
 */
export const TORONTO_RENT_APPROVAL: RentApproval | null = null;
export const LONDON_RENT_APPROVAL: RentApproval | null = null;

const TABLE = "https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=3410013301";
const PIPR = "https://www.ons.gov.uk/economy/inflationandpriceindices/datasets/priceindexofprivaterentsukmonthlypricestatistics";
const STRUCT = "Row and apartment structures of three units and over";
/** Values read by the collector's Ver.1.5.0 probe on GitHub Actions (run 39058754956, 2026-10-17): StatCan WDS vectors v3822835 / v3822969 / v3823103 / v3823237, reference year 2025, released 2025-12-17. */
export const TORONTO_RENTS = [
  { key: "bachelor", en: "Bachelor (studio)", ja: "バチェラー（ワンルーム）", unit: "Bachelor units", amount: 1491 },
  { key: "1br", en: "1 bedroom", ja: "1ベッドルーム", unit: "One bedroom units", amount: 1761 },
  { key: "2br", en: "2 bedrooms", ja: "2ベッドルーム", unit: "Two bedroom units", amount: 2045 },
  { key: "3br", en: "3 bedrooms", ja: "3ベッドルーム", unit: "Three bedroom units", amount: 2294 },
] as const;
export const torontoRentId = (key: string) => `tor-cmhc-rent-${key}`;
export const torontoCollectedId = (key: string) => `statcan-cmhc-rents:toronto:${key}`;
/** Same wording as the Vancouver figures on purpose: the same table, structure type, reference year and kind of area (census metropolitan area). */
export const CMHC_VALID_FOR = "2025 (latest reference year; released by Statistics Canada 2025-12-17)";

export const TORONTO_RENT_CANDIDATES: Omit<DataPoint, "status" | "checkedAt">[] = TORONTO_RENTS.map((r): Omit<DataPoint, "status" | "checkedAt"> => ({
  id: torontoRentId(r.key), highlight: r.key === "1br", cityId: "toronto", topic: "housing", sourceId: "statcan-cmhc-rents", metric: `housing.marketRent.${r.key}`, collectedId: torontoCollectedId(r.key),
  label: { en: `Average rent – ${r.en} (whole market)`, ja: `平均家賃 – ${r.ja}（市場全体）` }, value: { amount: r.amount, currency: "CAD", per: "month" }, audience: "renter",
  conditions: {
    en: "Average rent of all rented units of this size in row and apartment structures of three units and over, in the area named “Toronto, Ontario” in the Statistics Canada table (census metropolitan area, code 535: the whole Toronto metropolitan area, much wider than the City of Toronto). CMHC Rental Market Survey, reference year 2025 (the survey is taken in October). Whole rental market – not student housing, not language-school housing, not an average for international students, and not the asking rent of a newly listed unit.",
    ja: "Statistics Canadaの表で「Toronto, Ontario」とされる地域（国勢調査の都市圏、コード535：トロント市より大きく広いトロント都市圏全体）の、3戸以上の集合住宅・長屋における、この間取りの全賃貸住戸の平均家賃（CMHC 賃貸市場調査、調査対象年2025、調査は10月実施）。市場全体の値で、学生寮・語学学校の滞在先の料金・留学生の平均ではなく、新規募集物件の希望家賃でもありません。",
  },
  validFor: CMHC_VALID_FOR,
  evidence: [{ url: TABLE, publisher: "Statistics Canada (CMHC data)", section: { en: `Table 34-10-0133-01 – Toronto, Ontario; ${STRUCT}; ${r.unit}`, ja: `表 34-10-0133-01 – Toronto, Ontario; ${r.unit}` }, quote: `Toronto, Ontario; ${STRUCT}; ${r.unit}; 2025: ${r.amount}`, terms: "Statistics Canada Open Licence" }],
  retrievedAt: "2026-10-17",
  note: { en: "Read from the Statistics Canada Web Data Service (member 125 “Toronto, Ontario”; check that it is not “London, Ontario”). Not seasonally adjusted survey averages; the 2025 value is the latest published.", ja: "Statistics Canada の Web Data Service から取得（地域メンバー125「Toronto, Ontario」）。調査の平均値で、2025年が最新の公表値です。" },
}));

export const LONDON_RENT_ID = "lon-ons-pipr-private-rent-region-month";
export const LONDON_RENT_COLLECTED_ID = "ons-private-rents:london:rental-price";
export const LONDON_RENT_MONTH = "2026-08";
export const LONDON_RENT_PUBLISHED = "2026-09-16";
export const LONDON_RENT_AREA = { code: "E12000007", name: "London" };
export const LONDON_RENT_WORKBOOK_QUOTE = "London E12000007 2026-08-01 Rental price 2332";
/** Read from the 16 September 2026 PIPR workbook, Table 1, area code E12000007 (probe run 39058754956, 2026-10-17). */
export const LONDON_RENT_CANDIDATE: Omit<DataPoint, "status" | "checkedAt"> = {
  id: LONDON_RENT_ID, cityId: "london", topic: "housing", sourceId: "ons-private-rents", metric: "housing.privateRent.regionAverage", collectedId: LONDON_RENT_COLLECTED_ID, highlight: true,
  label: { en: "Average private rent – all dwellings in the London region (whole market)", ja: "平均民間家賃・ロンドン地域全域の全住宅（市場全体）" },
  value: { amount: 2332, currency: "GBP", per: "month" }, audience: "renter",
  conditions: {
    en: "Mean monthly rent of all privately rented dwellings in the London region (ONS code E12000007, an English region = Greater London, 33 local authorities), new and existing tenancies, August 2026. A region-wide average: boroughs differ a lot (ONS shows e.g. Camden and Westminster far above it). Not student housing: not university halls, not language-school housing and not an average for international students; not split by bedrooms or property type. ONS marks these series as official statistics in development.",
    ja: "ロンドン地域（ONS地域コード E12000007：イングランドの地域区分でグレーター・ロンドン＝33の自治体）の民間賃貸住宅すべての月額家賃の平均（新規契約と既存契約、2026年8月）。地域全体の平均で、区ごとの差は大きくなっています（ONSの表ではカムデン区やウェストミンスター区はこれを大きく上回ります）。学生向け住居ではありません：大学寮・語学学校の滞在先の料金・留学生の平均ではなく、寝室数や物件タイプ別でもありません。ONSはこの統計を「開発中の公式統計」としています。",
  },
  validFor: "2026-08 (August 2026; ONS Price Index of Private Rents, published 16 September 2026)",
  evidence: [{ url: PIPR, publisher: "Office for National Statistics", section: { en: "PIPR monthly price statistics workbook (16 September 2026 edition), Table 1 – Rental price", ja: "PIPR月次価格統計ワークブック（2026年9月16日版）Table 1 – Rental price" }, quote: LONDON_RENT_WORKBOOK_QUOTE }],
  retrievedAt: "2026-10-17",
  note: { en: "Taken from the official ONS workbook. Rounded to the nearest £1; not seasonally adjusted. Manchester's figure is a single local authority, so the two are never put on the same footing.", ja: "ONS公式のワークブックから取得。1ポンド単位に丸め、季節調整なしです。マンチェスターの値は単一の自治体のもので、同じ基準としては扱いません。" },
};

function check(a: RentApproval) { if (!a.approvedBy.trim() || !/^\d{4}-\d{2}-\d{2}$/.test(a.approvedAt) || !a.basis.trim()) throw new Error("rent approval needs approvedBy, approvedAt (YYYY-MM-DD) and basis"); }
export function torontoRentPoints(approval: RentApproval | null = TORONTO_RENT_APPROVAL): DataPoint[] {
  if (!approval) return []; check(approval);
  const failed = reconcileStatic().filter((c) => !c.ok); if (failed.length) throw new Error(`Toronto rent cannot be approved: ${failed.map((c) => c.name).join(", ")}`);
  return TORONTO_RENT_CANDIDATES.map((c) => ({ ...c, status: "verified" as const, checkedAt: approval.approvedAt }));
}
export function londonRentPoints(approval: RentApproval | null = LONDON_RENT_APPROVAL): DataPoint[] {
  if (!approval) return []; check(approval);
  const failed = reconcileStatic().filter((c) => !c.ok); if (failed.length) throw new Error(`London rent cannot be approved: ${failed.map((c) => c.name).join(", ")}`);
  return [{ ...LONDON_RENT_CANDIDATE, status: "verified", checkedAt: approval.approvedAt }];
}

export type Check = { name: string; ok: boolean; detail: string };
const chk = (name: string, ok: boolean, detail: string): Check => ({ name, ok, detail });
const nums = (s: string) => (s.match(/\d[\d,]*(\.\d+)?/g) ?? []).map((n) => Number(n.replace(/,/g, "")));
const notStudent = (c: Omit<DataPoint, "status" | "checkedAt">) => c.audience === "renter" && !c.housing && /not student housing/i.test(c.conditions.en) && /学生/.test(c.conditions.ja);

/** Checks that need no collected data: each candidate against the source registry, the rights record and its own evidence. */
export function reconcileStatic(): Check[] {
  const out: Check[] = [];
  for (const c of [...TORONTO_RENT_CANDIDATES, LONDON_RENT_CANDIDATE]) {
    const src = officialSources.find((s) => s.id === c.sourceId); const r = rightsOfSource(c.sourceId); const city = c.cityId; const amount = c.value!.amount; const who = c.id;
    out.push(
      chk(`${who}: source registered for ${city}`, !!src && src.cityIds.includes(city), src?.publisher ?? "missing"),
      chk(`${who}: evidence page belongs to the source`, c.evidence.every((e) => src?.pages.some((u) => e.url.startsWith(u))), c.evidence.map((e) => e.url).join(" | ")),
      chk(`${who}: evidence quote contains the amount`, c.evidence.every((e) => nums(e.quote).includes(amount)), `${amount}`),
      chk(`${who}: unit is ${city === "toronto" ? "CAD" : "GBP"} per month`, c.value!.per === "month" && c.value!.currency === (city === "toronto" ? "CAD" : "GBP"), `${c.value!.currency}/${c.value!.per}`),
      chk(`${who}: licence recorded and reuse permitted`, r.reuseStatus === "permitted" && !!r.lastReviewedAt && !!r.licence, `${r.reuseStatus} · ${r.licence}`),
      chk(`${who}: collection allowed by the rights review`, r.automation === "allowed", r.automation),
      chk(`${who}: shown in full under the rights rules`, displayModeOf({ sourceId: c.sourceId, value: c.value, rights: c.rights }) === "full", displayModeOf({ sourceId: c.sourceId, value: c.value, rights: c.rights })),
      chk(`${who}: not confusable with student housing`, notStudent(c), c.audience),
      chk(`${who}: the area is named in the conditions`, city === "toronto" ? /census metropolitan area/.test(c.conditions.en) && /535/.test(c.conditions.en) : /E12000007/.test(c.conditions.en) && /region/.test(c.conditions.en), c.metric),
    );
  }
  out.push(
    chk("London quote carries area code, name and month", LONDON_RENT_CANDIDATE.evidence[0].quote === LONDON_RENT_WORKBOOK_QUOTE && LONDON_RENT_WORKBOOK_QUOTE.includes(LONDON_RENT_AREA.code) && LONDON_RENT_WORKBOOK_QUOTE.includes(LONDON_RENT_AREA.name), LONDON_RENT_WORKBOOK_QUOTE),
    chk("London period is a single month", LONDON_RENT_CANDIDATE.validFor.slice(0, 7) === LONDON_RENT_MONTH, LONDON_RENT_CANDIDATE.validFor),
    chk("London metric differs from Manchester's local-authority metric", LONDON_RENT_CANDIDATE.metric !== "housing.privateRent.average", LONDON_RENT_CANDIDATE.metric),
  );
  return out;
}

/** Checks of the candidates against the records the collector stored (data/collected/snapshot.json). A missing record = not collected yet (reported, never assumed). */
export function reconcileCollected(records: Record<string, CollectedRecord | undefined>): { id: string; collected: boolean; checks: Check[] }[] {
  const list: { id: string; cand: Omit<DataPoint, "status" | "checkedAt">; period: string }[] = [
    ...TORONTO_RENT_CANDIDATES.map((c) => ({ id: c.collectedId!, cand: c, period: "2025" })), { id: LONDON_RENT_COLLECTED_ID, cand: LONDON_RENT_CANDIDATE, period: LONDON_RENT_MONTH },
  ];
  return list.map(({ id, cand, period }) => {
    const rec = records[id]; if (!rec) return { id, collected: false, checks: [chk("collected record exists", false, id)] };
    return { id, collected: true, checks: [
      chk("same value", rec.value.number === cand.value!.amount, `${rec.value.number} vs ${cand.value!.amount}`),
      chk("same unit", rec.value.currency === cand.value!.currency && rec.value.unit === cand.value!.per, `${rec.value.currency}/${rec.value.unit}`),
      chk("same period", rec.period === period, `${rec.period} vs ${period}`),
      chk("same city", rec.cityId === cand.cityId, String(rec.cityId)),
      chk("same licence as the rights record", rec.licence === rightsOfSource(cand.sourceId).licence, `${rec.licence}`),
      chk("evidence quote matches", rec.evidence.quote === cand.evidence[0].quote, String(rec.evidence.quote)),
      chk("the collector never verifies (record is unverified)", rec.status === "unverified", rec.status),
    ] };
  });
}
