import { rightsOfSource } from "../../data/official/rights";
import type { CollectedRecord, Fetched, Source } from "../types";
import { sha256, sleep } from "../util";
import { excelDate, openWorkbook, sheetRows, type CellValue, type Row } from "./xlsx";
/*
 * ONS Price Index of Private Rents (PIPR) – monthly price statistics workbook (Ver.1.2.2).
 * Dataset page: https://www.ons.gov.uk/economy/inflationandpriceindices/datasets/priceindexofprivaterentsukmonthlypricestatistics
 * The ONS API (api.beta.ons.gov.uk) does not carry PIPR, so the official Excel file is the source. Per month this reads ONE number:
 * the average monthly private rent (£) for all dwellings in Manchester local authority (area code E08000003), from "Table 1".
 *
 * What this is NOT: university halls, student housing or an average for international students. PIPR measures private rented
 * dwellings (new and existing tenancies) of one local authority, as one mean rent per month.
 *
 * The record is always "unverified" (a person verifies it). Anything that cannot be checked – a missing value ([x], [z]),
 * a non-integer or implausible price, a month that is not the first of a month, an area code whose name is not Manchester,
 * missing column headers, two editions that disagree on the publication date – stops the import; the earlier record stays.
 * The workbook is read in memory and never written to disk or committed.
 */
export const PIPR_PAGE = "https://www.ons.gov.uk/economy/inflationandpriceindices/datasets/priceindexofprivaterentsukmonthlypricestatistics";
export const AREA_CODE = "E08000003";
export const AREA_NAME = "Manchester";
/** Areas read from Table 1. Manchester is a local authority (E08); London is the English region (E12), a much wider area, so the two are not the same statistic. */
export type Area = { code: string; name: string; cityId: string; kind: "local authority" | "region"; scope: { en: string; ja: string } };
export const MANCHESTER: Area = { code: AREA_CODE, name: AREA_NAME, cityId: "manchester", kind: "local authority", scope: { en: "Mean monthly private rent of ALL privately rented dwellings in Manchester local authority (new and existing tenancies). Not university halls, not student housing, not an average for international students, not by bedroom or property type.", ja: "マンチェスター市（地方自治体）の民間賃貸住宅すべての月額家賃の平均（新規契約と既存契約）。大学寮・学生向け住居・留学生の平均ではなく、寝室数や物件タイプ別でもありません。" } };
export const LONDON: Area = { code: "E12000007", name: "London", cityId: "london", kind: "region", scope: { en: "Mean monthly private rent of ALL privately rented dwellings in the London region (Greater London, 33 local authorities; new and existing tenancies). A region-wide average: not the City of London alone, not a borough, not university halls or student housing, not an average for international students, not by bedroom or property type.", ja: "ロンドン地域（ロンドン広域圏＝33の自治体）の民間賃貸住宅すべての月額家賃の平均（新規契約と既存契約）。地域全体の平均であり、シティ・オブ・ロンドンだけでも特定の区でもなく、大学寮・学生向け住居・留学生の平均ではなく、寝室数や物件タイプ別でもありません。" } };
export const AREAS: Area[] = [MANCHESTER, LONDON];
export const SHEET = "Table 1";
const MONTHS = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
const pad = (n: number) => String(n).padStart(2, "0");

/** The newest edition's workbook link on the dataset page (a person-readable page; no JSON endpoint is used). */
export function latestEdition(html: string, base = PIPR_PAGE): { url: string; date: string } | undefined {
  const found: { url: string; date: string }[] = [];
  for (const m of html.matchAll(/href="([^"]*\/file\?uri=[^"]+?\.xlsx)"/gi)) {
    const href = m[1].replace(/&amp;/g, "&"); const d = /\/(\d{1,2})([a-z]+)(\d{4})\//i.exec(href); if (!d) continue;
    const mi = MONTHS.indexOf(d[2].toLowerCase()); if (mi < 0) continue;
    let url: string; try { url = new URL(href, base).toString(); } catch { continue; }
    found.push({ url, date: `${d[3]}-${pad(mi + 1)}-${pad(Number(d[1]))}` });
  }
  return found.sort((a, b) => b.date.localeCompare(a.date))[0];
}

/** A rent in whole pounds. [x], [z], blanks, decimals, text and implausible values are not accepted. */
export function validRent(v: CellValue | undefined): number | undefined {
  const n = typeof v === "number" ? v : typeof v === "string" && /^\d{3,5}$/.test(v.trim()) ? Number(v.trim()) : NaN;
  return Number.isInteger(n) && n >= 100 && n <= 20000 ? n : undefined;
}
/** Time period cell → "YYYY-MM-01". Only the first day of a month is a valid PIPR period. */
export function monthOf(v: CellValue | undefined): string | undefined {
  const iso = typeof v === "number" ? excelDate(v) : typeof v === "string" ? /^(\d{4}-\d{2}-\d{2})/.exec(v.trim())?.[1] : undefined;
  return iso && /^\d{4}-(0[1-9]|1[0-2])-01$/.test(iso) ? iso : undefined;
}
const longDate = (s: string) => { const m = /(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})/.exec(s); const i = m ? MONTHS.indexOf(m[2].toLowerCase()) : -1; return m && i >= 0 ? `${m[3]}-${pad(i + 1)}-${pad(Number(m[1]))}` : undefined; };

export type Extracted = {
  month: string; price: number; row: number; col: string; areaName: string; region?: string; manchesterMonths: number;
  published?: string; definition: boolean; unit: boolean; base: boolean; statisticalStatus?: string;
};
const texts = async (rows: AsyncGenerator<Row>) => { const out: string[] = []; for await (const r of rows) for (const v of Object.values(r.cells)) if (typeof v === "string") out.push(v); return out; };

export const extractManchester = (buf: Buffer) => extractArea(buf, MANCHESTER);
export async function extractArea(buf: Buffer, area: Area): Promise<Extracted> {
  const AREA_CODE = area.code, AREA_NAME = area.name;
  const wb = openWorkbook(buf); const idx = wb.shared.indexOf(AREA_CODE);
  let head: Record<string, string> | undefined; const rows: Row[] = [];
  for await (const r of sheetRows(wb, SHEET, (raw, n) => n <= 12 || raw.includes(AREA_CODE) || (idx >= 0 && raw.includes(`>${idx}</v>`)))) {
    if (!head && r.r <= 12) {
      const labels = Object.fromEntries(Object.entries(r.cells).filter(([, v]) => typeof v === "string").map(([c, v]) => [String(v).trim(), c]));
      if (labels["Time period"] && labels["Area code"] && labels["Area name"] && labels["Rental price"]) head = labels;
      continue;
    }
    if (head) rows.push(r);
  }
  if (!head) throw new Error(`"${SHEET}": the header row (Time period / Area code / Area name / Rental price) was not found; the workbook layout changed`);
  const byMonth = new Map<string, { row: number; price: number | undefined; raw: CellValue | undefined }>(); let name = AREA_NAME; let region: string | undefined;
  for (const r of rows) {
    if (String(r.cells[head["Area code"]] ?? "").trim() !== AREA_CODE) continue;
    const nm = String(r.cells[head["Area name"]] ?? "").trim(); if (nm !== AREA_NAME) throw new Error(`row ${r.r}: ${AREA_CODE} is named "${nm}", expected ${AREA_NAME}; the workbook layout changed`);
    name = nm; region = head["Region or country name"] ? String(r.cells[head["Region or country name"]] ?? "").trim() || undefined : undefined;
    const month = monthOf(r.cells[head["Time period"]]); if (!month) throw new Error(`row ${r.r}: "Time period" ${JSON.stringify(r.cells[head["Time period"]])} is not the first day of a month`);
    if (byMonth.has(month)) throw new Error(`${AREA_NAME} has two rows for ${month.slice(0, 7)}`);
    const raw = r.cells[head["Rental price"]]; byMonth.set(month, { row: r.r, price: validRent(raw), raw });
  }
  if (!byMonth.size) throw new Error(`no row for ${AREA_CODE} (${AREA_NAME}) in "${SHEET}"`);
  const latest = [...byMonth.keys()].sort().pop()!; const got = byMonth.get(latest)!;
  if (got.price === undefined) throw new Error(`${AREA_NAME} ${latest.slice(0, 7)}: Rental price ${JSON.stringify(got.raw)} is not a valid whole-pound rent; nothing imported (an earlier month is not used instead)`);
  const cover = (wb.sheets["Cover sheet"] ? await texts(sheetRows(wb, "Cover sheet")) : []).join("\n"); const notes = (wb.sheets["Notes"] ? await texts(sheetRows(wb, "Notes")) : []).join("\n");
  const pub = /published[^.]*?\bon\s+(\d{1,2}\s+[A-Za-z]+\s+\d{4})/i.exec(cover)?.[1];
  return {
    month: latest, price: got.price, row: got.row, col: head["Rental price"], areaName: name, region, manchesterMonths: byMonth.size,
    published: pub ? longDate(pub) : undefined, definition: /both new and existing tenancies/i.test(cover), unit: /rounded to the nearest £1/i.test(notes), base: /January 2023\s*=\s*100/i.test(notes),
    statisticalStatus: /official statistics in development/i.test(cover) ? "official statistics in development" : undefined,
  };
}

async function buildRecord(ctx: { now: string }, buf: Buffer, ed: { url: string; date: string }, area: Area, id: string): Promise<CollectedRecord> {
  const x = await extractArea(buf, area);
  if (x.published && x.published !== ed.date) throw new Error(`the workbook says it was published on ${x.published} but its edition folder is ${ed.date}; not imported`);
  const published = x.published ?? ed.date; const period = x.month.slice(0, 7);
  const rights = rightsOfSource("ons-private-rents");
  const checks = {
    valueIsWholePounds: true, monthIsFirstOfMonth: true, areaCodeMatchesName: true, publishedDateCrossChecked: !!x.published,
    unitConfirmedInNotes: x.unit, definitionConfirmedInCover: x.definition, indexBaseConfirmedInNotes: x.base, licenceRecorded: rights.reuseStatus === "permitted" && !!rights.lastReviewedAt,
  };
  const unconfirmed = [
    ...(x.unit ? [] : ["unit: the workbook notes did not state that rents are rounded to the nearest £1"]),
    ...(x.definition ? [] : ["definition: the cover sheet did not state that PIPR covers new and existing tenancies"]),
    ...(x.published ? [] : ["publication date: taken from the edition folder name only; the cover sheet statement was not found"]),
  ];
  const record: CollectedRecord = {
    id, sourceId: "ons-private-rents", country: "GBR", cityId: area.cityId, field: "housing.privateRentAverage",
    label: { en: `Average monthly private rent, all dwellings (${x.areaName}, ONS PIPR)`, ja: `平均月額民間家賃・全住宅（${x.areaName}、ONS PIPR）` },
    value: { number: x.price, currency: "GBP", unit: "month", text: `£${x.price.toLocaleString("en-GB")} per month, mean rent of all privately rented dwellings in ${x.areaName} ${area.kind} (${area.code}), ${period}; new and existing tenancies. Not university halls or student housing.` },
    period, sourceUrl: PIPR_PAGE, apiUrl: ed.url, retrievedAt: ctx.now, sourcePublishedAt: published, sourceUpdatedAt: published,
    evidence: { path: `${SHEET} row ${x.row}, column ${x.col} (Rental price)`, quote: `${x.areaName} ${area.code} ${x.month} Rental price ${x.price}` },
    contentHash: sha256(JSON.stringify([x.price, period, published, checks])), licence: rights.licence, status: "unverified", review: "standard",
    meta: {
      areaCode: area.code, areaName: x.areaName, region: x.region, edition: ed.date, workbook: ed.url, attribution: rights.attribution,
      scope: area.scope,
      unit: "GBP per month, rounded to the nearest £1", statisticalStatus: x.statisticalStatus, monthsInWorkbook: x.manchesterMonths, areaKind: area.kind, checks, unconfirmed,
      fairUse: "ONS fair use policy (last updated 30 April 2026): bots must follow the technical guidance and identify themselves with a contact in the User-Agent.",
    },
  };
  return record;
}
export const onsRent: Source = {
  id: "ons-private-rents", name: "ONS Price Index of Private Rents (PIPR) – average monthly rent: Manchester (local authority) and London (region)", country: "GBR", access: "implemented", cadenceDays: 30,
  docs: "https://developer.ons.gov.uk/bots/", licence: rightsOfSource("ons-private-rents").licence,
  domains: ["www.ons.gov.uk"], topics: ["housing"],
  note: "Official Excel workbook (not the API: PIPR is not in it). One monthly request pair: the dataset page, then the newest workbook; the rows of Table 1 for area codes E08000003 (Manchester) and E12000007 (London region) only; a London row that cannot be read is skipped. Average private rent of all dwellings in the local authority – not university halls or student housing.",
  async fetch(ctx): Promise<Fetched> {
    const rb = await ctx.robots(PIPR_PAGE); if (!rb.allowed) throw new Error(`${PIPR_PAGE}: ${rb.reason} – not requested`);
    const page = await ctx.fetchText(PIPR_PAGE); if (page.status !== 200) throw new Error(`HTTP ${page.status} for ${PIPR_PAGE}`);
    const ed = latestEdition(page.body); if (!ed) throw new Error("no workbook link (.xlsx) found on the PIPR dataset page");
    const rb2 = await ctx.robots(ed.url); if (!rb2.allowed) throw new Error(`${ed.url}: ${rb2.reason} – not requested`);
    if (ctx.paceMs) await sleep(ctx.paceMs); // ONS bot guide: well under 15 requests / 10 s; this is two requests a month
    const file = await ctx.fetchBinary(ed.url); if (file.status !== 200 || !file.body.length) throw new Error(`HTTP ${file.status} for ${ed.url}`);
    const records: CollectedRecord[] = []; const failedIds: string[] = [];
    for (const area of AREAS) {
      const id = `ons-private-rents:${area.cityId}:rental-price`;
      try { records.push(await buildRecord(ctx, file.body, ed, area, id)); }
      catch (e) { if (area === MANCHESTER) throw e; failedIds.push(id); } // an additional area that cannot be read is skipped, never guessed; the earlier record stays
    }
    return { records, texts: failedIds.length ? {} : {}, failedIds };
  },
};
