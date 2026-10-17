import { readFileSync } from "node:fs";
import path from "node:path";
import { allOfficialData } from "../../data/official";
import { piprWorkbook } from "./xlsx-build";
/*
 * LOCAL TEST FIXTURES. Synthetic responses shaped like the real APIs, used by `--fixtures` and the tests.
 * Every value is invented and marked "[FIXTURE]"; nothing here came from GOV.UK or open.canada.ca.
 */
const DIR = path.resolve(process.cwd(), "collector/fixtures/data");
const routes: [RegExp, string][] = [
  [/^https:\/\/www\.gov\.uk\/api\/content\/student-visa$/, "govuk-student-visa.json"],
  [/^https:\/\/www\.gov\.uk\/api\/content\/healthcare-immigration-application$/, "govuk-healthcare.json"],
  [/^https:\/\/open\.canada\.ca\/data\/api\/action\/package_show\?id=c2a1fdbf-d9b7-4c84-b7eb-c845b6ffd5e6$/, "canada-housing.json"],
  [/^https:\/\/open\.canada\.ca\/data\/api\/action\/package_show\?id=51dbf91e-509c-437b-ab9e-eca6d0bf6fa8$/, "canada-climate.json"],
];
export async function fixtureFetch(url: string): Promise<unknown> {
  const hit = routes.find(([re]) => re.test(url));
  if (!hit) throw new Error(`HTTP 404 for ${url} (no fixture)`);
  return JSON.parse(readFileSync(path.join(DIR, hit[1]), "utf8"));
}

/* ECCC: invented normals (clearly not real: 1..12 °C, 100 mm every month) */
const ecccFixture = (url: string) => {
  const id = Number(/NORMAL_ID=(\d+)/.exec(url)?.[1]); const names: Record<number, string> = { 1: "Mean daily temperature deg C", 5: "Mean daily max temperature deg C", 8: "Mean daily min temperature deg C", 56: "Total precipitation mm" };
  return { features: Array.from({ length: 13 }, (_, i) => ({ properties: { STATION_NAME: "[FIXTURE] STATION", CLIMATE_IDENTIFIER: "1108447", NORMAL_ID: id, E_NORMAL_ELEMENT_NAME: names[id], MONTH: i + 1, VALUE: id === 56 ? 100 : i + 1, PERIOD_BEGIN: 1981, PERIOD_END: 2010, DATE_CALCULATED: "2000-01-01 00:00:00" } })) };
};
export async function fixtureFetchAll(url: string): Promise<unknown> {
  if (/^https:\/\/api\.weather\.gc\.ca\/collections\/climate-normals\/items/.test(url)) return ecccFixture(url);
  return fixtureFetch(url);
}
/* Statistics Canada WDS: invented metadata (same member names as the real table) and invented rents (1000, 2000, …) */
export async function fixturePost(url: string, body: unknown): Promise<unknown> {
  if (/getCubeMetadata$/.test(url)) return [{ status: "SUCCESS", object: { cubeTitleEn: "[FIXTURE]", releaseTime: "2000-01-01T08:30", dimension: [
    { dimensionNameEn: "Geography", member: [{ memberId: 125, memberNameEn: "Toronto, Ontario" }, { memberId: 184, memberNameEn: "Vancouver, British Columbia" }] },
    { dimensionNameEn: "Type of structure", member: [{ memberId: 3, memberNameEn: "Row and apartment structures of three units and over" }] },
    { dimensionNameEn: "Type of unit", member: ["Bachelor units", "One bedroom units", "Two bedroom units", "Three bedroom units"].map((n, i) => ({ memberId: i + 1, memberNameEn: n })) },
  ] } }];
  if (/getDataFromCubePidCoordAndLatestNPeriods$/.test(url)) return (body as { coordinate: string }[]).map((b, i) => ({ status: "SUCCESS", object: { vectorId: 900000 + i, coordinate: b.coordinate, vectorDataPoint: [{ refPer: "2000-01-01", value: 1000 * (i + 1), decimals: 0, scalarFactorCode: 0, symbolCode: 0, statusCode: 0, releaseTime: "2000-01-01T08:30" }] } }));
  throw new Error(`HTTP 404 for ${url} (no fixture)`);
}
/* Pages: robots.txt allows everything; a page contains "[FIXTURE]" plus the quotes recorded for it in data/official,
   so the page check finds them. Tests edit the text to simulate a changed page. */
export async function fixtureText(url: string): Promise<{ status: number; url: string; body: string }> {
  if (/\/robots\.txt$/.test(url)) return { status: 200, url, body: "User-agent: *\nAllow: /\n" };
  if (/\/priceindexofprivaterentsukmonthlypricestatistics$/.test(url)) return { status: 200, url, body: `<html><body><a href="/file?uri=/economy/inflationandpriceindices/datasets/priceindexofprivaterentsukmonthlypricestatistics/1february2000/priceindexofprivaterentsukmonthlypricestatistics.xlsx">xlsx (1 MB)</a></body></html>` };
  if (/ringwaydata\.txt$/.test(url)) return { status: 200, url, body: fixtureStationFile() };
  const quotes = allOfficialData().flatMap((c) => c.points).flatMap((p) => p.evidence).filter((e) => e.url === url).map((e) => `<p>${e.quote}</p>`);
  if (!quotes.length) return { status: 404, url, body: "" };
  return { status: 200, url, body: `<html><body><h1>[FIXTURE]</h1>${[...new Set(quotes)].join("\n")}</body></html>` };
}

/* Met Office station file: INVENTED numbers in the real layout (header, column line, one row per month, 1946–2020). */
export function fixtureStationFile(): string {
  const L = ["Ringway [FIXTURE]", "Location: invented", "Estimated data is marked with a * after the value.", "Missing data (more than 2 days missing in month) is marked by ---.", "   yyyy  mm   tmax    tmin      af    rain     sun", "              degC    degC    days      mm   hours"];
  for (let y = 1946; y <= 2020; y++) for (let m = 1; m <= 12; m++) L.push(`  ${y}  ${String(m).padStart(2)}   ${(m + 8).toFixed(1).padStart(5)}${y === 1950 ? "*" : " "}  ${(m + 2).toFixed(1).padStart(5)}   ${String(3).padStart(5)}   ${(50 + m).toFixed(1).padStart(6)}   ${(100).toFixed(1).padStart(6)}`);
  return L.join("\n");
}

/* ONS PIPR workbook: INVENTED values in the real layout (Manchester, E08000003, £1,111 in January 2000), so it can never be mistaken for real data. */
export async function fixtureBinary(url: string): Promise<{ status: number; url: string; body: Buffer }> {
  if (!/\/file\?uri=.*priceindexofprivaterentsukmonthlypricestatistics\.xlsx$/.test(url)) return { status: 404, url, body: Buffer.alloc(0) };
  return { status: 200, url, body: piprWorkbook({ months: ["1999-11", "1999-12", "2000-01"], price: () => 1111, coverPublished: "1 February 2000" }) };
}
