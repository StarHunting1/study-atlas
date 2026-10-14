import type { CollectedRecord, Fetched, Source } from "../types";
import { sha256 } from "../util";
/*
 * Met Office "Historical monthly data for meteorological stations" (UK Open Government Licence v3.0):
 * https://www.data.gov.uk/dataset/17ba3bbe-0e98-4a8c-9937-bd1d50fdc3c5  — one plain-text file per station with monthly
 * tmax / tmin (°C), air-frost days, rainfall (mm) and sunshine (hours).
 *
 * StudyAtlas derives its own calendar-month averages from the published monthly values for a fixed period
 * (these are NOT the Met Office's official 1991–2020 "climate averages"; the method is stated wherever they are shown).
 * Rule: every calendar month of every year in the period must have a published value, otherwise nothing is derived.
 * Values marked "*" (estimated by the Met Office) are used as published; "---" (missing) makes the period incomplete.
 */
export type StationRow = { year: number; month: number; tmax?: number; tmin?: number; af?: number; rain?: number; sun?: number };
export type StationFile = { name: string; header: string[]; rows: StationRow[] };

const num = (t: string | undefined) => { if (!t) return undefined; const m = /^(-?\d+(\.\d+)?)[*#]*$/.exec(t); return m ? Number(m[1]) : undefined; };

/** Parses the station text file: a few header lines, a column line (yyyy mm tmax tmin af rain sun), then one row per month. */
export function parseStationData(text: string): StationFile {
  const lines = text.split(/\r?\n/); const header: string[] = []; const rows: StationRow[] = [];
  for (const raw of lines) {
    const t = raw.trim(); if (!t) continue;
    const cols = t.split(/\s+/);
    if (/^\d{4}$/.test(cols[0]) && /^\d{1,2}$/.test(cols[1] ?? "") && cols.length >= 7) {
      const month = Number(cols[1]); if (month < 1 || month > 12) continue;
      rows.push({ year: Number(cols[0]), month, tmax: num(cols[2]), tmin: num(cols[3]), af: num(cols[4]), rain: num(cols[5]), sun: num(cols[6]) });
    } else if (!rows.length) header.push(t);
  }
  return { name: (header[0] ?? "").trim(), header, rows };
}

export type MonthlyMeans = { period: string; years: number; values: (number | null)[]; complete: boolean; missing: string[] };
/** Calendar-month means over [from, to] for one element. A month with any missing year stays null (never filled). */
export function monthlyMeans(rows: StationRow[], key: "tmax" | "tmin" | "rain", from: number, to: number): MonthlyMeans {
  const years = to - from + 1; const values: (number | null)[] = []; const missing: string[] = [];
  for (let m = 1; m <= 12; m++) {
    const got = rows.filter((r) => r.month === m && r.year >= from && r.year <= to && r[key] !== undefined);
    if (got.length !== years || new Set(got.map((r) => r.year)).size !== years) { values.push(null); missing.push(`${m}: ${got.length}/${years}`); continue; }
    values.push(Math.round((got.reduce((a, r) => a + r[key]!, 0) / years) * 100) / 100);
  }
  return { period: `${from}–${to}`, years, values, complete: missing.length === 0, missing };
}

export type MetStation = { id: string; fileUrl: string; cityId: string; label: { en: string; ja: string } };
export const MET_STATIONS: MetStation[] = [
  { id: "ringway", fileUrl: "https://www.metoffice.gov.uk/pub/data/weather/uk/climate/stationdata/ringwaydata.txt", cityId: "manchester", label: { en: "Ringway (Manchester Airport), Met Office monthly station data", ja: "リングウェイ（マンチェスター空港）Met Office 月別観測データ" } },
];
/** Periods StudyAtlas derives. The Ringway file ends in October 2004 ("Site Closed"), so 1981–2010 and 1991–2020 cannot be
 *  derived from it; 1971–2000 is the latest standard 30-year period fully covered (checked by the run before it is published). */
export const MET_PERIODS: [number, number][] = [[1971, 2000]];
/** Extra periods the probe reports on (coverage check only; nothing is stored for them). */
export const MET_PROBE_PERIODS: [number, number][] = [[1961, 1990], [1971, 2000], [1981, 2010], [1991, 2020]];
export const MET_ELEMENTS = [
  { key: "tmax" as const, name: "Mean daily maximum temperature (tmax)", unit: "°C" },
  { key: "tmin" as const, name: "Mean daily minimum temperature (tmin)", unit: "°C" },
  { key: "rain" as const, name: "Total rainfall (rain)", unit: "mm" },
];

export const metoffice: Source = {
  id: "metoffice-station-data", name: "Met Office historical monthly station data (data.gov.uk)", country: "GBR", access: "implemented", cadenceDays: 90,
  docs: "https://www.data.gov.uk/dataset/17ba3bbe-0e98-4a8c-9937-bd1d50fdc3c5", licence: "UK Open Government Licence v3.0",
  domains: ["www.metoffice.gov.uk"], topics: ["climate"],
  note: "Open data text files, no key (robots.txt respected). StudyAtlas derives calendar-month means for fixed 30-year periods; incomplete periods are not derived.",
  async fetch(ctx): Promise<Fetched> {
    const records: CollectedRecord[] = []; const failedIds: string[] = []; const errors: string[] = [];
    for (const st of MET_STATIONS) {
      try {
        const rb = await ctx.robots(st.fileUrl); if (!rb.allowed) throw new Error(`${st.fileUrl}: ${rb.reason}`);
        const res = await ctx.fetchText(st.fileUrl); if (res.status !== 200) throw new Error(`HTTP ${res.status} for ${st.fileUrl}`);
        const file = parseStationData(res.body); if (file.rows.length < 360) throw new Error(`unexpected file: ${file.rows.length} rows`);
        for (const [from, to] of MET_PERIODS) for (const el of MET_ELEMENTS) {
          const id = `metoffice-station-data:${st.id}:${from}-${to}:${el.key}`;
          const mm = monthlyMeans(file.rows, el.key, from, to);
          if (!mm.complete) { failedIds.push(id); errors.push(`${id}: incomplete (${mm.missing.join(", ")})`); continue; }
          records.push({
            id, sourceId: "metoffice-station-data", country: "GBR", cityId: st.cityId, field: `climate.${el.key}`,
            label: { en: `${st.label.en}: ${el.name}, mean by calendar month ${mm.period}`, ja: `${st.label.ja}：${el.name}（${mm.period} 暦月平均）` },
            value: { series: mm.values, unit: el.unit, text: `${file.name} (${mm.years} years, derived by StudyAtlas)` }, period: mm.period,
            sourceUrl: "https://www.data.gov.uk/dataset/17ba3bbe-0e98-4a8c-9937-bd1d50fdc3c5", apiUrl: st.fileUrl, retrievedAt: ctx.now,
            evidence: { path: `rows ${from}–${to}, column ${el.key}`, quote: `${file.name} ${el.key} ${mm.period} calendar-month means: ${mm.values.join(", ")}` },
            contentHash: sha256(JSON.stringify([mm.values, mm.period, file.name])), licence: metoffice.licence, status: "unverified", review: "standard",
          });
        }
      } catch (e) { errors.push((e as Error).message); for (const [from, to] of MET_PERIODS) for (const el of MET_ELEMENTS) failedIds.push(`metoffice-station-data:${st.id}:${from}-${to}:${el.key}`); }
    }
    if (!records.length) throw new Error(errors.join("; ") || "no data");
    if (errors.length) console.warn(`[metoffice-station-data] partial: ${errors.join("; ")}`);
    return { records, texts: {}, failedIds };
  },
};
