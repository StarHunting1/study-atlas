import type { CollectedRecord, Fetched, Source } from "../types";
import { sha256 } from "../util";
/*
 * Statistics Canada Web Data Service (JSON, no key): https://www.statcan.gc.ca/en/developers/wds
 * Table 34-10-0133-01 "Canada Mortgage and Housing Corporation, average rents for areas with a population of
 * 10,000 and over" — CMHC Rental Market Survey results republished by Statistics Canada under the
 * Statistics Canada Open Licence. This is the whole rental market (all renters), NOT student housing.
 * Member ids below were read from getCubeMetadata in the live probe of 2026-10-13 and are re-checked on every run.
 */
const PID = 34100133;
const TABLE_URL = "https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=3410013301";
type Geo = { memberId: number; name: string; cityId: string };
export const STATCAN_GEOS: Geo[] = [
  { memberId: 184, name: "Vancouver, British Columbia", cityId: "vancouver" },
  /** Toronto census metropolitan area (CMA code 535): member id and name read from getCubeMetadata in the Ver.1.5.0 probe (Actions run 39058754956, 2026-10-17). Not "London, Ontario" (member 96). */
  { memberId: 125, name: "Toronto, Ontario", cityId: "toronto" },
];
/** Type of structure 3 = "Row and apartment structures of three units and over" (the broadest category) */
const STRUCTURE = { memberId: 3, name: "Row and apartment structures of three units and over" };
export const STATCAN_UNITS = [
  { memberId: 1, key: "bachelor", name: "Bachelor units", ja: "ワンルーム（バチェラー）" },
  { memberId: 2, key: "1br", name: "One bedroom units", ja: "1ベッドルーム" },
  { memberId: 3, key: "2br", name: "Two bedroom units", ja: "2ベッドルーム" },
  { memberId: 4, key: "3br", name: "Three bedroom units", ja: "3ベッドルーム" },
];
type Member = { memberId: number; memberNameEn: string };
type Meta = { status: string; object: { cubeTitleEn: string; releaseTime: string; dimension: { dimensionNameEn: string; member: Member[] }[] } }[];
type Data = { status: string; object: { vectorId: number; coordinate: string; vectorDataPoint: { refPer: string; value: number | null; decimals: number; scalarFactorCode: number; symbolCode: number; statusCode: number; releaseTime: string }[] } }[];

export const statcan: Source = {
  id: "statcan-cmhc-rents", name: "Statistics Canada WDS – CMHC average rents (table 34-10-0133-01)", country: "CAN", access: "implemented", cadenceDays: 30,
  docs: "https://www.statcan.gc.ca/en/developers/wds", licence: "Statistics Canada Open Licence",
  domains: ["www150.statcan.gc.ca"], topics: ["housing"],
  note: "Open Web Data Service, no key. CMHC Rental Market Survey average rents by unit type (whole market).",
  async fetch(ctx): Promise<Fetched> {
    const base = "https://www150.statcan.gc.ca/t1/wds/rest";
    const meta = (await ctx.postJson(`${base}/getCubeMetadata`, [{ productId: PID }])) as Meta;
    const m = meta[0]; if (m?.status !== "SUCCESS") throw new Error("getCubeMetadata failed");
    const [geoDim, structDim, unitDim] = m.object.dimension;
    const name = (d: { member: Member[] }, id: number) => d.member.find((x) => x.memberId === id)?.memberNameEn;
    // Member ids are positional; stop if their meaning changed instead of reading the wrong series
    if (name(structDim, STRUCTURE.memberId) !== STRUCTURE.name) throw new Error("structure member changed");
    for (const g of STATCAN_GEOS) if (name(geoDim, g.memberId) !== g.name) throw new Error(`geography member ${g.memberId} is no longer ${g.name}`);
    for (const u of STATCAN_UNITS) if (name(unitDim, u.memberId) !== u.name) throw new Error(`unit member ${u.memberId} is no longer ${u.name}`);
    const coords = STATCAN_GEOS.flatMap((g) => STATCAN_UNITS.map((u) => ({ g, u, coordinate: [g.memberId, STRUCTURE.memberId, u.memberId, 0, 0, 0, 0, 0, 0, 0].join(".") })));
    const apiUrl = `${base}/getDataFromCubePidCoordAndLatestNPeriods`;
    const data = (await ctx.postJson(apiUrl, coords.map((c) => ({ productId: PID, coordinate: c.coordinate, latestN: 1 })))) as Data;
    const records: CollectedRecord[] = []; const failedIds: string[] = [];
    coords.forEach((c, i) => {
      const id = `statcan-cmhc-rents:${c.g.cityId}:${c.u.key}`; const d = data[i];
      const pt = d?.status === "SUCCESS" ? d.object.vectorDataPoint[0] : undefined;
      if (!pt || pt.value === null || pt.scalarFactorCode !== 0) { failedIds.push(id); return; }
      const year = pt.refPer.slice(0, 4);
      records.push({
        id, sourceId: "statcan-cmhc-rents", country: "CAN", cityId: c.g.cityId, field: `housing.marketRent.${c.u.key}`,
        label: { en: `Average rent, ${c.u.name.toLowerCase()} (${c.g.name}, CMHC)`, ja: `平均家賃：${c.u.ja}（${c.g.name}、CMHC）` },
        value: { number: pt.value, currency: "CAD", unit: "month" }, period: year,
        sourceUrl: TABLE_URL, apiUrl, retrievedAt: ctx.now, sourceUpdatedAt: pt.releaseTime,
        evidence: { path: `vector v${d.object.vectorId} (${c.coordinate}) refPer ${pt.refPer}`, quote: `${c.g.name}; ${STRUCTURE.name}; ${c.u.name}; ${year}: ${pt.value}` },
        contentHash: sha256(JSON.stringify([pt.value, pt.refPer, d.object.vectorId])), licence: statcan.licence, status: "unverified", review: "standard",
      });
    });
    if (!records.length) throw new Error("no data points returned");
    return { records, texts: {}, failedIds };
  },
};
