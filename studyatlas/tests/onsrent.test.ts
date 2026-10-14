// Tests for Ver.1.2.2 (ONS PIPR Manchester rent import). Local tests only, no network: workbooks are built in memory.
import assert from "node:assert/strict";
import { collect } from "../collector/run";
import { piprWorkbook, buildXlsx, serialOf } from "../collector/fixtures/xlsx-build";
import { emptySnapshot } from "../collector/store";
import { AREA_CODE, extractManchester, latestEdition, monthOf, validRent } from "../collector/sources/onsrent";
import { excelDate, openWorkbook, sheetRows } from "../collector/sources/xlsx";

let n = 0; const t = async (name: string, fn: () => Promise<void> | void) => { await fn(); n++; console.log("ok", name); };
const T1 = "2026-10-14T00:00:00.000Z", T2 = "2026-11-18T00:00:00.000Z";
// Official reference (ONS Manchester page and PIPR workbook, 16 September 2026 edition): August 2026 = £1,373. It is only the expected value
// for the workbook built below – the importer takes whatever month is newest, so later editions are not blocked by it.
const OFFICIAL: Record<string, number> = { "2026-06": 1358, "2026-07": 1365, "2026-08": 1373 };
const official = (extra: Record<string, number | string> = {}, coverPublished?: string) => piprWorkbook({ months: ["2026-06", "2026-07", "2026-08", ...Object.keys(extra)], price: (m) => extra[m] ?? OFFICIAL[m], coverPublished });
const PAGE = "https://www.ons.gov.uk/economy/inflationandpriceindices/datasets/priceindexofprivaterentsukmonthlypricestatistics";
const link = (folder: string) => `<a href="/file?uri=/economy/inflationandpriceindices/datasets/priceindexofprivaterentsukmonthlypricestatistics/${folder}/priceindexofprivaterentsukmonthlypricestatistics.xlsx">xlsx</a>`;
const feed = (book: Buffer, folder = "16september2026") => ({
  fetchText: async (url: string) => /robots\.txt$/.test(url) ? { status: 404, url, body: "" } : { status: 200, url, body: `<html>${link("19august2026")}${link(folder)}${link("22july2026")}</html>` },
  fetchBinary: async (url: string) => ({ status: 200, url, body: book }),
});
const run = (book: Buffer, prev = emptySnapshot(), now = T1, folder?: string) => collect({ only: ["ons-private-rents"], ai: false, fixtures: false, now, prev, force: true, fetchers: feed(book, folder), fetcher: async () => ({}) });

(async () => {
  await t("xlsx reader: sheets, shared strings, rows and Excel dates (deflated and stored ZIP)", async () => {
    for (const store of [false, true]) {
      const wb = openWorkbook(buildXlsx([{ name: "A", rows: [["x & y", 5]] }, { name: "Table 1", rows: [["h"], ["é€", serialOf("2026-08-01"), null, "[x]"]] }], { store }));
      assert.deepEqual(Object.keys(wb.sheets), ["A", "Table 1"]);
      const rows: Record<string, unknown>[] = []; for await (const r of sheetRows(wb, "Table 1")) rows.push(r.cells);
      assert.deepEqual(rows[1], { A: "é€", B: serialOf("2026-08-01"), D: "[x]" });
    }
    assert.equal(excelDate(serialOf("2026-08-01")), "2026-08-01"); assert.equal(excelDate(-5), undefined);
    assert.throws(() => openWorkbook(Buffer.from("not a zip")), /not a ZIP/);
  });

  await t("the newest Manchester month is read: August 2026 = £1,373 (official reference)", async () => {
    const x = await extractManchester(official());
    assert.equal(x.month, "2026-08-01"); assert.equal(x.price, 1373); assert.equal(x.areaName, "Manchester"); assert.equal(x.manchesterMonths, 3);
    assert.equal(x.published, "2026-09-16"); assert.equal(x.definition, true); assert.equal(x.unit, true); assert.equal(x.base, true); assert.equal(x.statisticalStatus, "official statistics in development");
  });

  await t("a later month is picked up: nothing is fixed to £1,373", async () => {
    const x = await extractManchester(official({ "2026-09": 1390, "2026-10": 1402 }));
    assert.equal(x.month, "2026-10-01"); assert.equal(x.price, 1402);
  });

  await t("only the E08000003 row is used: other areas never leak in", async () => {
    const x = await extractManchester(piprWorkbook({ months: ["2026-08"], price: () => 1373 }));
    assert.equal(x.price, 1373); assert.equal(x.row, 5); assert.equal(AREA_CODE, "E08000003");   // header is row 3, UK row 4, Manchester row 5
  });

  await t("missing or invalid values are never imported (no fallback to an earlier month)", async () => {
    for (const bad of ["[x]", "[z]", "", "abc", 1373.5, -4, 0, 99999, "12"]) await assert.rejects(() => extractManchester(official({ "2026-09": bad as string | number })), /not a valid whole-pound rent|nothing imported/, String(bad));
    assert.equal(validRent("1373"), 1373); assert.equal(validRent(1373), 1373); assert.equal(validRent("[x]"), undefined); assert.equal(validRent(undefined), undefined); assert.equal(validRent(null), undefined);
  });

  await t("layout changes stop the import: header, area name, month, duplicates, absent area", async () => {
    await assert.rejects(() => extractManchester(buildXlsx([{ name: "Table 1", rows: [["a"], ["Time period", "Area code"]] }])), /header row/);
    await assert.rejects(() => extractManchester(buildXlsx([{ name: "Other", rows: [["a"]] }])), /sheet missing/);
    const hdr = ["Time period", "Area code", "Area name", "Region or country name", "Index", "Monthly change", "Annual change", "Rental price"];
    const book = (rows: (string | number)[][]) => buildXlsx([{ name: "Table 1", rows: [["t"], ["n"], hdr, ...rows] }]);
    await assert.rejects(() => extractManchester(book([[serialOf("2026-08-01"), "E08000003", "Salford", "NW", 1, 1, 1, 1373]])), /expected Manchester/);
    await assert.rejects(() => extractManchester(book([[serialOf("2026-08-15"), "E08000003", "Manchester", "NW", 1, 1, 1, 1373]])), /first day of a month/);
    await assert.rejects(() => extractManchester(book([[serialOf("2026-08-01"), "E08000003", "Manchester", "NW", 1, 1, 1, 1373], [serialOf("2026-08-01"), "E08000003", "Manchester", "NW", 1, 1, 1, 1380]])), /two rows/);
    await assert.rejects(() => extractManchester(book([[serialOf("2026-08-01"), "E08000002", "Bolton", "NW", 1, 1, 1, 850]])), /no row for E08000003/);
    assert.equal(monthOf(serialOf("2026-08-01")), "2026-08-01"); assert.equal(monthOf("2026-08-01 00:00:00"), "2026-08-01"); assert.equal(monthOf("2026-08-02"), undefined); assert.equal(monthOf("[x]"), undefined);
  });

  await t("latest edition: chosen by date, whatever the order of the links; none found is reported", () => {
    const e = latestEdition(`<html>${link("19august2026")}${link("16september2026")}${link("22july2026")}</html>`);
    assert.match(e!.url, /^https:\/\/www\.ons\.gov\.uk\/file\?uri=.*\/16september2026\//); assert.equal(e!.date, "2026-09-16");
    assert.equal(latestEdition("<html>no links</html>"), undefined); assert.equal(latestEdition(`<a href="/file?uri=/x/notadate/a.xlsx">x</a>`), undefined);
  });

  await t("collector run stores the record with period, publication date, retrieval date, area code, source URL, licence and scope", async () => {
    const r = await run(official());
    assert.equal(r.runs[0].ok, true); const rec = r.next.records["ons-private-rents:manchester:rental-price"];
    assert.equal(rec.value.number, 1373); assert.equal(rec.value.currency, "GBP"); assert.equal(rec.value.unit, "month"); assert.equal(rec.period, "2026-08");
    assert.equal(rec.sourcePublishedAt, "2026-09-16"); assert.equal(rec.retrievedAt, T1); assert.equal(rec.cityId, "manchester");
    assert.equal(rec.sourceUrl, PAGE); assert.match(rec.apiUrl, /16september2026\/priceindexofprivaterentsukmonthlypricestatistics\.xlsx$/);
    assert.match(rec.licence ?? "", /Open Government Licence v3\.0/); assert.equal(rec.status, "unverified");
    const meta = rec.meta as { areaCode: string; scope: { en: string; ja: string }; checks: Record<string, boolean>; unconfirmed: string[] };
    assert.equal(meta.areaCode, "E08000003"); assert.match(meta.scope.en, /Not university halls/); assert.match(meta.scope.ja, /大学寮/);
    assert.ok(Object.values(meta.checks).every(Boolean)); assert.deepEqual(meta.unconfirmed, []);
    assert.equal(r.changes.length, 1);
  });

  await t("the same data again is no change; a new month is one change", async () => {
    const first = await run(official());
    const same = await run(official(), first.next, T2); assert.equal(same.changes.length, 0);
    const next = await run(official({ "2026-09": 1390 }, "21 October 2026"), first.next, T2, "21october2026");
    assert.equal(next.changes.length, 1); assert.equal(next.next.records["ons-private-rents:manchester:rental-price"].value.number, 1390); assert.equal(next.next.records["ons-private-rents:manchester:rental-price"].period, "2026-09");
  });

  await t("when the download or the data fails the earlier value is kept", async () => {
    const first = await run(official());
    const bad = await run(official({ "2026-09": "[x]" }), first.next, T2, "21october2026");
    assert.equal(bad.runs[0].ok, false); assert.match(bad.runs[0].error ?? "", /not a valid whole-pound rent/);
    assert.deepEqual(bad.next.records, first.next.records); assert.equal(bad.changes.length, 0);
    const down = await collect({ only: ["ons-private-rents"], ai: false, fixtures: false, now: T2, prev: first.next, force: true, fetcher: async () => ({}), fetchers: { ...feed(official()), fetchBinary: async () => { throw new Error("HTTP 503"); } } });
    assert.equal(down.runs[0].ok, false); assert.deepEqual(down.next.records, first.next.records);
    const e429 = await collect({ only: ["ons-private-rents"], ai: false, fixtures: false, now: T2, prev: first.next, force: true, fetcher: async () => ({}), fetchers: { ...feed(official()), fetchBinary: async (url) => ({ status: 429, url, body: Buffer.alloc(0) }) } });
    assert.equal(e429.runs[0].ok, false); assert.deepEqual(e429.next.records, first.next.records);
  });

  await t("edition folder and cover-sheet publication date must agree; a missing cover date is recorded as unconfirmed", async () => {
    const mismatch = await run(official(), emptySnapshot(), T1, "19august2026");
    assert.equal(mismatch.runs[0].ok, false); assert.match(mismatch.runs[0].error ?? "", /publication date|published on/);
    const noCover = await run(piprWorkbook({ months: ["2026-08"], price: () => 1373, cover: ["Price Index of Private Rents"], notes: ["The data in this table is not seasonally adjusted."] }));
    const meta = noCover.next.records["ons-private-rents:manchester:rental-price"].meta as { checks: Record<string, boolean>; unconfirmed: string[] };
    assert.equal(noCover.next.records["ons-private-rents:manchester:rental-price"].sourcePublishedAt, "2026-09-16"); assert.equal(meta.checks.unitConfirmedInNotes, false); assert.equal(meta.checks.definitionConfirmedInCover, false); assert.equal(meta.unconfirmed.length, 3);
    assert.equal(noCover.next.records["ons-private-rents:manchester:rental-price"].status, "unverified");
  });

  await t("fixtures mode (--fixtures) works end to end with invented values and never contacts ONS", async () => {
    const r = await collect({ only: ["ons-private-rents"], ai: false, fixtures: true, now: T1, prev: emptySnapshot(), force: true });
    assert.equal(r.runs[0].ok, true); const rec = r.next.records["ons-private-rents:manchester:rental-price"]; assert.equal(rec.value.number, 1111); assert.equal(rec.period, "2000-01"); assert.equal(rec.sourcePublishedAt, "2000-02-01");
  });

  console.log(`${n} ONS rent tests passed`);
})().catch((e) => { console.error(e); process.exit(1); });
