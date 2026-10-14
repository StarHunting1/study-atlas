import { deflateRawSync } from "node:zlib";
/*
 * Builds a small .xlsx in memory for tests and --fixtures runs (nothing is read from disk, nothing is real data).
 * Same structure as the PIPR workbook: workbook.xml + rels + sharedStrings.xml + one sheet per table; text cells are shared
 * strings, numbers are plain numbers, dates are Excel serial numbers.
 */
const CRC = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
const crc32 = (b: Buffer) => { let c = 0xffffffff; for (const x of b) c = CRC[(c ^ x) & 0xff] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export function zip(files: Record<string, string>, store = false): Buffer {
  const parts: Buffer[] = []; const central: Buffer[] = []; let offset = 0;
  for (const [name, text] of Object.entries(files)) {
    const raw = Buffer.from(text, "utf8"); const data = store ? raw : deflateRawSync(raw); const nm = Buffer.from(name, "utf8"); const crc = crc32(raw);
    const lh = Buffer.alloc(30); lh.writeUInt32LE(0x04034b50, 0); lh.writeUInt16LE(20, 4); lh.writeUInt16LE(store ? 0 : 8, 8); lh.writeUInt32LE(crc, 14); lh.writeUInt32LE(data.length, 18); lh.writeUInt32LE(raw.length, 22); lh.writeUInt16LE(nm.length, 26);
    const ch = Buffer.alloc(46); ch.writeUInt32LE(0x02014b50, 0); ch.writeUInt16LE(20, 4); ch.writeUInt16LE(20, 6); ch.writeUInt16LE(store ? 0 : 8, 10); ch.writeUInt32LE(crc, 16); ch.writeUInt32LE(data.length, 20); ch.writeUInt32LE(raw.length, 24); ch.writeUInt16LE(nm.length, 28); ch.writeUInt32LE(offset, 42);
    parts.push(lh, nm, data); central.push(Buffer.concat([ch, nm])); offset += 30 + nm.length + data.length;
  }
  const cd = Buffer.concat(central); const end = Buffer.alloc(22); end.writeUInt32LE(0x06054b50, 0); end.writeUInt16LE(central.length, 8); end.writeUInt16LE(central.length, 10); end.writeUInt32LE(cd.length, 12); end.writeUInt32LE(offset, 16);
  return Buffer.concat([...parts, cd, end]);
}

export type SheetSpec = { name: string; rows: (string | number | null)[][] };
const colName = (i: number) => { let s = ""; for (let n = i + 1; n > 0; n = Math.floor((n - 1) / 26)) s = String.fromCharCode(65 + ((n - 1) % 26)) + s; return s; };
export function buildXlsx(sheets: SheetSpec[], opts: { store?: boolean } = {}): Buffer {
  const shared: string[] = []; const idx = new Map<string, number>(); const sid = (s: string) => { if (!idx.has(s)) { idx.set(s, shared.length); shared.push(s); } return idx.get(s)!; };
  const sheetXml = sheets.map((sh) => `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>${sh.rows.map((row, r) => `<row r="${r + 1}">${row.map((v, c) => v === null ? "" : typeof v === "number" ? `<c r="${colName(c)}${r + 1}"><v>${v}</v></c>` : `<c r="${colName(c)}${r + 1}" t="s"><v>${sid(v)}</v></c>`).join("")}</row>`).join("")}</sheetData></worksheet>`);
  const files: Record<string, string> = {
    "[Content_Types].xml": `<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"/>`,
    "xl/workbook.xml": `<?xml version="1.0" encoding="UTF-8"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>${sheets.map((s, i) => `<sheet name="${esc(s.name)}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`).join("")}</sheets></workbook>`,
    "xl/_rels/workbook.xml.rels": `<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${sheets.map((_, i) => `<Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`).join("")}</Relationships>`,
    ...Object.fromEntries(sheetXml.map((x, i) => [`xl/worksheets/sheet${i + 1}.xml`, x])),
  };
  files["xl/sharedStrings.xml"] = `<?xml version="1.0" encoding="UTF-8"?><sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" count="${shared.length}" uniqueCount="${shared.length}">${shared.map((s) => `<si><t xml:space="preserve">${esc(s)}</t></si>`).join("")}</sst>`;
  return zip(files, opts.store);
}

/** Excel serial number of a YYYY-MM-DD date (inverse of excelDate). */
export const serialOf = (iso: string) => Math.round((Date.UTC(+iso.slice(0, 4), +iso.slice(5, 7) - 1, +iso.slice(8, 10)) - Date.UTC(1899, 11, 30)) / 86400000);

/* A PIPR-shaped workbook. `months` are the Manchester months to include (the last one is the newest); `price` gives the all-dwellings rent. */
export const PIPR_HEADERS = ["Time period", "Area code", "Area name", "Region or country name", "Index", "Monthly change", "Annual change", "Rental price", "Index one bed", "Monthly change one bed", "Annual change one bed", "Rental price one bed"];
export type PiprOpts = { months: string[]; price: (month: string) => number | string; edition?: string; coverPublished?: string; notes?: string[]; cover?: string[]; otherAreas?: boolean; extraHeaders?: boolean };
export function piprWorkbook(o: PiprOpts): Buffer {
  const header = o.extraHeaders === false ? PIPR_HEADERS.slice(0, 8) : PIPR_HEADERS;
  const pad = (a: (string | number | null)[]) => a.concat(Array(Math.max(0, header.length - a.length)).fill("[x]"));
  const rows: (string | number | null)[][] = [["Price Index of Private Rents, UK: monthly price statistics [note 1]"], ["This worksheet contains one table."], header];
  if (o.otherAreas !== false) for (const m of o.months) rows.push(pad([serialOf(`${m}-01`), "K02000001", "United Kingdom", "[z]", 100, 0.1, 1.2, 999]));
  for (const m of o.months) { const p = o.price(m); rows.push(pad([serialOf(`${m}-01`), "E08000003", "Manchester", "North West", 120.5, 0.4, "[x]", p as string | number])); }
  if (o.otherAreas !== false) rows.push(pad([serialOf(`${o.months[o.months.length - 1]}-01`), "E08000002", "Bolton", "North West", 110, 0.1, 1, 850]));
  const cover = o.cover ?? [
    "Price Index of Private Rents (PIPR), UK: monthly price statistics",
    "This spreadsheet includes Price Index of Private Rents (PIPR) data from January 2015 to present. These series are official statistics in development. PIPR covers both new and existing tenancies in the private rental sector. PIPR is updated monthly and uses January 2023 as the base period for indexing.",
    "Publication dates", `The data tables in this spreadsheet were originally published at 9:30am on ${o.coverPublished ?? "16 September 2026"}. Crown copyright © 2026.`,
  ];
  const notes = o.notes ?? ["The data in this table is not seasonally adjusted.", "The index level in January 2023 = 100.", "Private rental prices are rounded to the nearest £1. All other data in this table are rounded to 6 decimal places and visually-rounded to 1 decimal place."];
  return buildXlsx([
    { name: "Cover sheet", rows: cover.map((c) => [c]) },
    { name: "Notes", rows: [["Notes"], ["Note number", "Note text"], ...notes.map((n, i) => [`note ${i + 1}`, n])] },
    { name: "Table 1", rows },
  ]);
}
