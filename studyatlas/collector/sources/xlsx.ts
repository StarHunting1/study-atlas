import { Readable } from "node:stream";
import { StringDecoder } from "node:string_decoder";
import { createInflateRaw, inflateRawSync } from "node:zlib";
/*
 * Minimal read-only .xlsx reader (Ver.1.2.2), built on node:zlib so the project needs no extra dependency.
 * An .xlsx file is a ZIP of XML parts. This reads only what the PIPR workbook needs: the sheet list, the shared strings
 * and the rows of one sheet, streamed so the 18 MB / 50,000-row table is never held as one object. Nothing is written
 * to disk. A file that is not a plain (non-ZIP64) workbook is rejected instead of guessed at.
 */
export type ZipEntry = { name: string; method: number; compressedSize: number; size: number; offset: number };
const MAX_PART = 64 * 1024 * 1024;           // small parts (workbook.xml, sharedStrings.xml): inflated size cap
const MAX_SHEET = 1024 * 1024 * 1024;        // streamed sheet: inflated size cap (guards against a zip bomb)

export function readZipIndex(buf: Buffer): Map<string, ZipEntry> {
  let eocd = -1;
  for (let i = buf.length - 22; i >= Math.max(0, buf.length - 22 - 65535); i--) if (buf.readUInt32LE(i) === 0x06054b50) { eocd = i; break; }
  if (eocd < 0) throw new Error("not a ZIP/xlsx file (no end-of-central-directory record)");
  const total = buf.readUInt16LE(eocd + 10), cdOffset = buf.readUInt32LE(eocd + 16);
  if (total === 0xffff || cdOffset === 0xffffffff) throw new Error("ZIP64 workbooks are not supported");
  const out = new Map<string, ZipEntry>(); let p = cdOffset;
  for (let n = 0; n < total; n++) {
    if (p + 46 > buf.length || buf.readUInt32LE(p) !== 0x02014b50) throw new Error("corrupt ZIP central directory");
    const method = buf.readUInt16LE(p + 10), csize = buf.readUInt32LE(p + 20), size = buf.readUInt32LE(p + 24);
    const nl = buf.readUInt16LE(p + 28), el = buf.readUInt16LE(p + 30), cl = buf.readUInt16LE(p + 32), offset = buf.readUInt32LE(p + 42);
    const name = buf.toString("utf8", p + 46, p + 46 + nl); out.set(name, { name, method, compressedSize: csize, size, offset }); p += 46 + nl + el + cl;
  }
  return out;
}
function dataOf(buf: Buffer, e: ZipEntry): Buffer {
  if (e.offset + 30 > buf.length || buf.readUInt32LE(e.offset) !== 0x04034b50) throw new Error(`corrupt ZIP entry ${e.name}`);
  const start = e.offset + 30 + buf.readUInt16LE(e.offset + 26) + buf.readUInt16LE(e.offset + 28);
  if (start + e.compressedSize > buf.length) throw new Error(`truncated ZIP entry ${e.name}`);
  return buf.subarray(start, start + e.compressedSize);
}
export function zipText(buf: Buffer, e: ZipEntry): string {
  const d = dataOf(buf, e);
  if (e.method === 0) return d.toString("utf8");
  if (e.method === 8) return inflateRawSync(d, { maxOutputLength: MAX_PART }).toString("utf8");
  throw new Error(`unsupported ZIP compression method ${e.method} for ${e.name}`);
}
function zipStream(buf: Buffer, e: ZipEntry): AsyncIterable<Buffer> {
  const d = dataOf(buf, e);
  if (e.method === 0) return Readable.from([d]);
  if (e.method === 8) return Readable.from([d]).pipe(createInflateRaw());
  throw new Error(`unsupported ZIP compression method ${e.method} for ${e.name}`);
}

const unxml = (s: string) => s.replace(/&(#x[0-9a-f]+|#\d+|amp|lt|gt|quot|apos);/gi, (_, t: string) => {
  if (t[0] === "#") { const c = t[1].toLowerCase() === "x" ? parseInt(t.slice(2), 16) : parseInt(t.slice(1), 10); return Number.isFinite(c) && c > 0 && c < 0x110000 ? String.fromCodePoint(c) : ""; }
  return ({ amp: "&", lt: "<", gt: ">", quot: '"', apos: "'" } as Record<string, string>)[t.toLowerCase()] ?? "";
});
const attrs = (s: string) => { const o: Record<string, string> = {}; for (const m of s.matchAll(/([A-Za-z_:][\w:.-]*)\s*=\s*"([^"]*)"/g)) o[m[1]] = unxml(m[2]); return o; };

export type Workbook = { buf: Buffer; zip: Map<string, ZipEntry>; sheets: Record<string, string>; shared: string[] };
export function openWorkbook(buf: Buffer): Workbook {
  const zip = readZipIndex(buf); const part = (n: string) => { const e = zip.get(n); if (!e) throw new Error(`xlsx part missing: ${n}`); return zipText(buf, e); };
  const wb = part("xl/workbook.xml"); const rels = part("xl/_rels/workbook.xml.rels"); const target: Record<string, string> = {};
  for (const m of rels.matchAll(/<Relationship\b([^>]*?)\/?>/g)) { const a = attrs(m[1]); if (a.Id && a.Target) target[a.Id] = a.Target.startsWith("/") ? a.Target.slice(1) : `xl/${a.Target}`; }
  const sheets: Record<string, string> = {};
  for (const m of wb.matchAll(/<sheet\b([^>]*?)\/?>/g)) { const a = attrs(m[1]); const t = target[a["r:id"] ?? ""]; if (a.name && t) sheets[a.name] = t; }
  const shared: string[] = [];
  if (zip.has("xl/sharedStrings.xml")) for (const m of part("xl/sharedStrings.xml").matchAll(/<si\b[^>]*?(?:\/>|>([\s\S]*?)<\/si>)/g)) shared.push(unxml([...(m[1] ?? "").matchAll(/<t\b[^>]*>([\s\S]*?)<\/t>/g)].map((t) => t[1]).join("")));
  return { buf, zip, sheets, shared };
}

export type CellValue = string | number | boolean | null;
export type Row = { r: number; cells: Record<string, CellValue> };
/** Parses one <row> element into its cells keyed by column letter ("A", "B", ...). */
export function parseRow(xml: string, shared: string[]): Row {
  const head = /<row\b([^>]*)>/.exec(xml); const r = Number(attrs(head?.[1] ?? "").r ?? 0); const cells: Record<string, CellValue> = {};
  for (const m of xml.matchAll(/<c\b([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g)) {
    const a = attrs(m[1]); const col = /^([A-Z]+)/.exec(a.r ?? "")?.[1]; if (!col) continue; const body = m[2] ?? "";
    const v = /<v\b[^>]*>([\s\S]*?)<\/v>/.exec(body)?.[1]; const t = a.t ?? "n"; let val: CellValue = null;
    if (t === "inlineStr") val = unxml([...body.matchAll(/<t\b[^>]*>([\s\S]*?)<\/t>/g)].map((x) => x[1]).join(""));
    else if (v === undefined) val = null;
    else if (t === "s") val = shared[Number(v)] ?? null;
    else if (t === "str" || t === "d" || t === "e") val = unxml(v);
    else if (t === "b") val = v === "1";
    else { const n = Number(v); val = v.trim() !== "" && Number.isFinite(n) ? n : unxml(v); }
    cells[col] = val;
  }
  return { r, cells };
}

/** Streams the <row> elements of a sheet. `keep` is a cheap raw-text test so most rows are never parsed. */
export async function* sheetRows(wb: Workbook, sheetName: string, keep: (rawRow: string, rowNumber: number) => boolean = () => true): AsyncGenerator<Row> {
  const path = wb.sheets[sheetName]; if (!path) throw new Error(`xlsx sheet missing: ${sheetName}`);
  const e = wb.zip.get(path); if (!e) throw new Error(`xlsx part missing: ${path}`);
  const dec = new StringDecoder("utf8"); let carry = ""; let seen = 0;
  const drain = function* (final: boolean): Generator<Row> {
    for (;;) {
      const s = carry.search(/<row[\s>/]/); if (s < 0) { carry = final ? "" : carry.slice(-8); return; }
      const gt = carry.indexOf(">", s); if (gt < 0) { carry = carry.slice(s); return; }
      const end = carry[gt - 1] === "/" ? gt + 1 : (() => { const c = carry.indexOf("</row>", gt); return c < 0 ? -1 : c + 6; })();
      if (end < 0) { carry = carry.slice(s); return; }
      const raw = carry.slice(s, end); carry = carry.slice(end);
      const num = Number(/\br="(\d+)"/.exec(raw.slice(0, gt - s + 1))?.[1] ?? 0);
      if (keep(raw, num)) yield parseRow(raw, wb.shared);
    }
  };
  for await (const chunk of zipStream(wb.buf, e)) {
    seen += (chunk as Buffer).length; if (seen > MAX_SHEET) throw new Error("xlsx sheet is larger than expected; refusing to read it");
    carry += dec.write(chunk as Buffer); yield* drain(false);
  }
  carry += dec.end(); yield* drain(true);
}

/** Excel stores dates as day counts since 1899-12-30. Returns YYYY-MM-DD, or undefined when the number is not a plausible date. */
export function excelDate(serial: number): string | undefined {
  if (!Number.isFinite(serial) || serial < 1 || serial > 2958465) return undefined;
  return new Date(Date.UTC(1899, 11, 30) + Math.round(serial) * 86400000).toISOString().slice(0, 10);
}
