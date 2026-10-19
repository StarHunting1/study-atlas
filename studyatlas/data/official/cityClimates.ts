import type { ClimateNormals } from "./types";
import { CLIMATE_APPROVALS, approveClimate } from "../approvals";
import { officialSources } from "./sources";
import { displayModeOfClimate, rightsOfSource, showsFigure } from "./rights";
/*
 * Climate normals prepared for approval (Ver.1.6.3) – NOT published. Same rule as the Vancouver and Manchester climate records:
 *   - a candidate without its own entry in CLIMATE_APPROVALS (data/approvals.ts) is not part of the official data: no chart, no table, no number in the comparison;
 *     the city page says that the official normals exist and are being checked, and links the official source.
 *   - a person who has compared all 48 monthly values and the annual values with the publisher's file records the approval; the approval then fixes the station, period, values
 *     and sources: editing any of them later makes the build fail until a person approves again.
 *
 * Toronto: ECCC's Canadian Climate Normals 1991–2020, bulk download for Ontario (one request, robots.txt allowed, read on GitHub Actions on 2026-10-19, run 39303865202).
 * Composite station "TORONTO (CITY)" (normals code C) = climate IDs 6158350 (TORONTO) and 6158355 (TORONTO CITY), 43.67 N / -79.40 W, elevation 112.5 m: the downtown station, NOT the airport
 * (Toronto Pearson / "TORONTO INTL A" is a different composite station and is not used). Rows used: "Daily Average (°C)", "Daily Maximum (°C)", "Daily Minimum (°C)" (quality code A) and
 * "Precipitation (mm)" (code C), January–December and the "Year" column, copied as published. Nothing is calculated or filled in.
 * Licence: ECCC Data Services End-use Licence (as recorded for the Vancouver normals in rights.data.ts: commercial use allowed, attribution required).
 */
const URL_ECCC = "https://climate.weather.gc.ca/climate_normals/index_e.html";
const mean = [-3.5, -2.7, 1.7, 7.8, 14.5, 19.8, 22.5, 21.9, 17.9, 11.2, 5.2, -0.1];
const max = [-0.3, 0.6, 5.1, 11.7, 18.8, 24.2, 27.0, 26.1, 22.0, 14.6, 8.1, 2.6];
const min = [-6.7, -6.0, -1.8, 3.9, 10.0, 15.3, 18.1, 17.7, 13.8, 7.7, 2.3, -2.7];
const precip = [64.6, 53.9, 52.8, 78.0, 76.4, 81.6, 76.5, 71.9, 69.4, 69.1, 70.8, 57.8];
export const TORONTO_CLIMATE_ID = "tor-climate-eccc-1991-2020";
export const TORONTO_CLIMATE_CANDIDATE: ClimateNormals = {
  id: TORONTO_CLIMATE_ID, cityId: "toronto", sourceId: "eccc-climate-normals", station: "TORONTO (CITY) – composite of 6158350 and 6158355", stationId: "6158350+6158355", period: "1991–2020",
  months: mean.map((m, i) => ({ meanC: m, maxC: max[i], minC: min[i], precipMm: precip[i] })),
  annual: { meanC: 9.7, maxC: 13.4, minC: 6.0, precipMm: 822.7 },
  stationInfo: {
    kind: "city", lat: 43.67, lon: -79.4, elevationM: 112.5, quality: "A (temperature) · C (precipitation)",
    where: { en: "Downtown Toronto (ECCC composite station “TORONTO (CITY)”, 43.67 N, 79.40 W, 112.5 m). This is the city-centre station, not Toronto Pearson Airport.", ja: "トロント市内中心部（ECCCの複合観測地点「TORONTO (CITY)」、北緯43.67度・西経79.40度、標高112.5 m）。市内中心部の観測地点で、トロント・ピアソン空港ではありません。" },
  },
  evidence: [{ url: URL_ECCC, publisher: "Environment and Climate Change Canada", section: { en: "Canadian Climate Normals 1991–2020, bulk download for Ontario (CSV): composite station TORONTO (CITY): Daily Average / Daily Maximum / Daily Minimum (°C) and Precipitation (mm), January–December and Year", ja: "カナダ気候平年値 1991–2020、オンタリオ州の一括ダウンロード（CSV）：複合観測地点 TORONTO (CITY) の日平均・日最高・日最低気温（°C）と降水量（mm）、1〜12月と年値" },
    quote: `"TORONTO (CITY)","ON","Normal","Temperature","Daily Average (°C)": ${mean.join(", ")} | Year 9.7 | Daily Maximum (°C): ${max.join(", ")} | Year 13.4 | Daily Minimum (°C): ${min.join(", ")} | Year 6.0 | Precipitation (mm): ${precip.join(", ")} | Year 822.7`, terms: "ECCC Data Services End-use Licence" }],
  retrievedAt: "2026-10-19", status: "unverified",
  note: { en: "Official 1991–2020 normals of ECCC's composite downtown station TORONTO (CITY) (climate IDs 6158350 and 6158355), copied from ECCC's Ontario bulk CSV on 2026-10-19: all 48 monthly values and the annual mean, maximum, minimum and precipitation as published. Collected but not yet checked and approved by a person, so the numbers are not shown on the site.", ja: "ECCCの市内中心部の複合観測地点 TORONTO (CITY)（気候ID 6158350・6158355）の公式1991–2020平年値を、2026-10-19にECCCのオンタリオ州CSVから転記したものです（月別48値と、年平均気温・年平均最高・最低気温・年降水量。公表値のまま）。人による確認・承認が済んでいないため、サイトには数値を表示していません。" },
};
export const CLIMATE_CANDIDATES: ClimateNormals[] = [TORONTO_CLIMATE_CANDIDATE];

/** The climate record of a city: the candidate becomes `verified` and visible ONLY through its own approval record (data/approvals.ts); a changed candidate throws until it is approved again. */
export function approvedClimate(c: ClimateNormals, approvals: Record<string, unknown> = CLIMATE_APPROVALS): ClimateNormals | undefined {
  if (!approvals[c.id]) return undefined;
  const r = approveClimate(c); return r.status === "verified" ? r : undefined; // a record that is not verified by its approval is never exposed
}

export type ClimateCheck = { name: string; ok: boolean; detail: string };
const chk = (name: string, ok: boolean, detail: string): ClimateCheck => ({ name, ok, detail });
const near = (a: number, b: number, tol: number) => Math.abs(a - b) <= tol;
/** Consistency checks of a candidate: 48 values present, units and order plausible, annual values consistent with the months, station/period/source/licence recorded. (A match with the publisher's own file is checked by a person.) */
export function climateCandidateChecks(c: ClimateNormals): ClimateCheck[] {
  const col = (k: "meanC" | "maxC" | "minC" | "precipMm") => c.months.map((m) => m[k]);
  const nums = (v: (number | undefined)[]) => v.length === 12 && v.every((x) => typeof x === "number" && Number.isFinite(x));
  const raw = [col("meanC"), col("maxC"), col("minC"), col("precipMm")]; const all48 = raw.every(nums); const [mean, max, min, rain] = raw as number[][]; const out: ClimateCheck[] = [];
  out.push(chk("12 months × 4 elements = 48 values, none missing", c.months.length === 12 && all48, `${c.months.length} months`));
  if (all48) {
    out.push(chk("every month: minimum ≤ mean ≤ maximum", mean.every((m, i) => min[i] <= m && m <= max[i]), "temperatures"));
    out.push(chk("precipitation values are non-negative", rain.every((x) => x >= 0), "mm"));
    const a = c.annual; out.push(chk("annual mean temperature matches the monthly means (±0.2 °C)", a?.meanC !== undefined && near(a.meanC, mean.reduce((s, x) => s + x, 0) / 12, 0.2), `${a?.meanC}`));
    out.push(chk("annual precipitation matches the sum of the months (±0.5 mm: rounding)", a?.precipMm !== undefined && near(a.precipMm, rain.reduce((s, x) => s + x, 0), 0.5), `${a?.precipMm}`));
    out.push(chk("annual maximum / minimum lie within the monthly range", a?.maxC !== undefined && a?.minC !== undefined && a.maxC <= Math.max(...max) && a.maxC >= Math.min(...max) && a.minC >= Math.min(...min) && a.minC <= Math.max(...min), `${a?.maxC}/${a?.minC}`));
  }
  const src = officialSources.find((s) => s.id === c.sourceId); const r = rightsOfSource(c.sourceId);
  out.push(chk("source registered for the city", !!src && src.cityIds.includes(c.cityId), src?.publisher ?? "missing"));
  out.push(chk("evidence page belongs to the source", c.evidence.every((e) => !!src?.pages.some((u) => e.url.startsWith(u.replace(/\/$/, "")))), c.evidence.map((e) => e.url).join(" | ")));
  out.push(chk("station name, id, period and a plain-language location are recorded", !!c.station && !!c.stationId && /^\d{4}–\d{4}$/.test(c.period) && !!c.stationInfo?.where.en && !!c.stationInfo?.where.ja, `${c.station} · ${c.period}`));
  out.push(chk("licence recorded and reuse permitted, shown in full", r.reuseStatus === "permitted" && !!r.licence && showsFigure(displayModeOfClimate(c)), `${r.reuseStatus} · ${r.licence}`));
  out.push(chk("the quote contains every value", [...mean, ...max, ...min, ...rain].every((v) => c.evidence[0].quote.includes(String(v))), "quote"));
  out.push(chk("still a candidate: status is unverified and there is no approval inside the record", c.status === "unverified" && !c.approval, c.status));
  return out;
}
