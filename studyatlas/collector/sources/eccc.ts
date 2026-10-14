import type { CollectedRecord, Fetched, Source } from "../types";
import { sha256 } from "../util";
/*
 * ECCC MSC GeoMet OGC API – climate normals (JSON, no key): https://api.weather.gc.ca/collections/climate-normals
 * The collection holds the 1981–2010 normals (collection description, live probe 2026-10-13). One feature per
 * station × element × month (MONTH 1..12, 13 = annual). Values are copied as published; nothing is computed.
 */
type Station = { climateId: string; cityId: string; label: { en: string; ja: string } };
export const ECCC_STATIONS: Station[] = [
  { climateId: "1108447", cityId: "vancouver", label: { en: "Vancouver Int'l A (ECCC climate normals)", ja: "バンクーバー国際空港（ECCC 気候平年値）" } },
];
/** NORMAL_ID → element, as named in E_NORMAL_ELEMENT_NAME */
export const ECCC_ELEMENTS: { id: number; key: string; name: string; unit: string }[] = [
  { id: 1, key: "temp-mean", name: "Mean daily temperature deg C", unit: "°C" },
  { id: 5, key: "temp-max", name: "Mean daily max temperature deg C", unit: "°C" },
  { id: 8, key: "temp-min", name: "Mean daily min temperature deg C", unit: "°C" },
  { id: 56, key: "precip", name: "Total precipitation mm", unit: "mm" },
];
type Feature = { properties: { STATION_NAME: string; CLIMATE_IDENTIFIER: string; NORMAL_ID: number; E_NORMAL_ELEMENT_NAME: string; MONTH: number; VALUE: number | null; PERIOD_BEGIN?: number; PERIOD_END?: number; DATE_CALCULATED?: string; STN_ID?: number } };

export const eccc: Source = {
  id: "eccc-climate-normals", name: "ECCC MSC GeoMet OGC API (climate normals)", country: "CAN", access: "implemented", cadenceDays: 180,
  docs: "https://api.weather.gc.ca/collections/climate-normals", licence: "Environment and Climate Change Canada Data Servers End-use Licence / Open Government Licence – Canada (confirm in review)",
  domains: ["api.weather.gc.ca"], topics: ["climate"],
  note: "Open OGC API, no key. Climate normals 1981–2010 per station and month.",
  async fetch(ctx): Promise<Fetched> {
    const records: CollectedRecord[] = []; const failedIds: string[] = []; const errors: string[] = [];
    for (const st of ECCC_STATIONS) {
      for (const el of ECCC_ELEMENTS) {
        const apiUrl = `https://api.weather.gc.ca/collections/climate-normals/items?f=json&CLIMATE_IDENTIFIER=${st.climateId}&NORMAL_ID=${el.id}&limit=50`;
        const id = `eccc-climate-normals:${st.climateId}:${el.key}`;
        try {
          const j = (await ctx.fetchJson(apiUrl)) as { features?: Feature[] };
          const fs = (j.features ?? []).filter((f) => f.properties.CLIMATE_IDENTIFIER === st.climateId && f.properties.NORMAL_ID === el.id);
          if (!fs.length) throw new Error("no features");
          if (fs.some((f) => f.properties.E_NORMAL_ELEMENT_NAME !== el.name)) throw new Error(`unexpected element name for NORMAL_ID ${el.id}`);
          const series = Array.from({ length: 12 }, (_, i) => fs.find((f) => f.properties.MONTH === i + 1)?.properties.VALUE ?? null);
          const p = fs[0].properties; const period = p.PERIOD_BEGIN && p.PERIOD_END ? `${p.PERIOD_BEGIN}–${p.PERIOD_END}` : undefined;
          records.push({
            id, sourceId: "eccc-climate-normals", country: "CAN", cityId: st.cityId, field: `climate.${el.key}`,
            label: { en: `${st.label.en}: ${el.name}`, ja: `${st.label.ja}：${el.name}` },
            value: { series, unit: el.unit, text: `${p.STATION_NAME} (${p.CLIMATE_IDENTIFIER})` }, period,
            sourceUrl: "https://climate.weather.gc.ca/climate_normals/", apiUrl, retrievedAt: ctx.now, sourceUpdatedAt: p.DATE_CALCULATED,
            evidence: { path: "features[].properties.{MONTH,VALUE}", quote: `${p.STATION_NAME} ${el.name}: ${series.join(", ")}` },
            contentHash: sha256(JSON.stringify([series, period, p.STATION_NAME])), licence: eccc.licence, status: "unverified", review: "standard",
          });
        } catch (e) { errors.push(`${id}: ${(e as Error).message}`); failedIds.push(id); }
      }
    }
    if (!records.length) throw new Error(errors.join("; ") || "no data");
    if (errors.length) console.warn(`[eccc-climate-normals] partial: ${errors.join("; ")}`);
    return { records, texts: {}, failedIds };
  },
};
