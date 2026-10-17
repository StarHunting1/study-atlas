import type { DataPoint } from "./types";
/*
 * What exactly a whole-market rent figure measures (Ver.1.5.1). Two rents are put on the same footing ("comparable") only when EVERY part below is equal;
 * a shared publisher or table is not enough. Any difference keeps the pair at "reference only".
 *   publisher / table – who made the number and from which statistic
 *   measure           – what is averaged (units counted, tenancies covered)
 *   structure         – the dwelling types that are included
 *   unitKey           – bedroom size or "all sizes"
 *   area              – the kind of geography (a metropolitan area, a single local authority and a whole region are three different things)
 *   year              – the reference year or month
 */
export type RentBasis = { publisher: string; table: string; measure: string; structure: string; unitKey: string; area: string; year: string; currency: string; per: string };
type Fixed = Pick<RentBasis, "publisher" | "table" | "measure" | "area"> & { structure?: string };
/** The parts that cannot be read from a data point itself, recorded per city and source after checking the publisher's definitions. */
const FIXED: Record<string, Fixed> = {
  "vancouver|statcan-cmhc-rents": { publisher: "CMHC via Statistics Canada", table: "34-10-0133-01", measure: "average rent of the units in the CMHC Rental Market Survey (October)", area: "census metropolitan area" },
  "toronto|statcan-cmhc-rents": { publisher: "CMHC via Statistics Canada", table: "34-10-0133-01", measure: "average rent of the units in the CMHC Rental Market Survey (October)", area: "census metropolitan area" },
  "manchester|ons-private-rents": { publisher: "ONS", table: "PIPR Table 1", measure: "mean monthly rent of all private dwellings, new and existing tenancies", area: "local authority", structure: "all dwellings" },
  "london|ons-private-rents": { publisher: "ONS", table: "PIPR Table 1", measure: "mean monthly rent of all private dwellings, new and existing tenancies", area: "region", structure: "all dwellings" },
};
/** The basis of a rent data point, or undefined when it is not a recorded whole-market rent (then it is never treated as comparable). */
export function rentBasisOf(p: DataPoint): RentBasis | undefined {
  const f = FIXED[`${p.cityId}|${p.sourceId}`]; if (!f || !p.value) return undefined;
  // CMHC quotes read "<area>; <structure>; <unit>; <year>: <amount>"
  const parts = p.evidence[0]?.quote.split(";").map((x) => x.trim()) ?? [];
  const structure = f.structure ?? parts[1]; const unit = p.sourceId === "statcan-cmhc-rents" ? parts[2] : "all sizes";
  const year = /^(\d{4}(?:-\d{2})?)/.exec(p.validFor)?.[1];
  if (!structure || !unit || !year) return undefined;
  return { publisher: f.publisher, table: f.table, measure: f.measure, structure, unitKey: unit, area: f.area, year, currency: p.value.currency, per: p.value.per };
}
export const rentBasisKey = (p: DataPoint): string | undefined => { const b = rentBasisOf(p); return b ? JSON.stringify(b) : undefined; };
/** The parts in which two rent bases differ (empty = same footing). */
export function rentBasisDiff(a: RentBasis, b: RentBasis): (keyof RentBasis)[] { return (Object.keys(a) as (keyof RentBasis)[]).filter((k) => a[k] !== b[k]); }
/** True only when every point has a recorded basis and all bases are identical. */
export const sameRentBasis = (points: DataPoint[]) => { const ks = points.map(rentBasisKey); return ks.length > 1 && ks.every((k) => !!k) && new Set(ks).size === 1; };
