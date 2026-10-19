import { createHash } from "node:crypto";
import { guardedFetch, type AccessKind } from "./guard";
export const sha256 = (s: string) => createHash("sha256").update(s).digest("hex").slice(0, 16);
/** Very small HTML → text for hashing, evidence and AI input (GOV.UK bodies are simple HTML). */
export const htmlToText = (html: string) =>
  html.replace(/<(script|style)[\s\S]*?<\/\1>/gi, " ").replace(/<\/(p|li|h\d|tr|div)>/gi, "\n").replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&pound;/g, "£").replace(/&#39;|&rsquo;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/[ \t]+/g, " ").replace(/\n\s*/g, "\n").trim();
export const normalize = (s: string) => s.replace(/\s+/g, " ").trim().toLowerCase();

const UA = "StudyAtlasCollector/1.0 (+https://github.com/StarHunting1/study-atlas)";
/** JSON GET with timeout and a polite retry on 429/5xx. Sequential use only (one request at a time). */
export async function fetchJson(url: string, opts: { retries?: number; timeoutMs?: number } = {}): Promise<unknown> {
  const { retries = 2, timeoutMs = 20000 } = opts;
  for (let attempt = 0; ; attempt++) {
    const ctrl = new AbortController(); const t = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
      const res = await guardedFetch(url, "api", { headers: { "User-Agent": UA, Accept: "application/json" }, signal: ctrl.signal });
      if ((res.status === 429 || res.status >= 500) && attempt < retries) { await sleep(2000 * 2 ** attempt); continue; }
      if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
      return await res.json();
    } catch (e) {
      if (attempt < retries && !(e instanceof Error && /^HTTP 4/.test(e.message))) { await sleep(2000 * 2 ** attempt); continue; }
      throw e;
    } finally { clearTimeout(t); }
  }
}
export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export type TextResponse = { status: number; url: string; contentType: string; body: string };
/** GET returning the raw body (HTML pages, robots.txt, CSV). Same timeout/retry policy as fetchJson; non-2xx is returned, not thrown. */
/** Which way of access a text GET is: robots.txt, a JSON API, a data file, or a page body. The rights check (guard.ts) depends on it, so it is never guessed loosely. */
export const kindOfText = (url: string, accept = ""): AccessKind => (/\/robots\.txt$/.test(new URL(url).pathname) ? "robots" : /json/i.test(accept) ? "api" : /\.(csv|zip|xlsx?|txt)$/i.test(new URL(url).pathname) ? "dataset" : "html");
export async function fetchText(url: string, opts: { retries?: number; timeoutMs?: number; accept?: string; kind?: AccessKind } = {}): Promise<TextResponse> {
  const { retries = 1, timeoutMs = 20000, accept = "text/html,text/plain,*/*;q=0.8" } = opts;
  for (let attempt = 0; ; attempt++) {
    const ctrl = new AbortController(); const t = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
      const res = await guardedFetch(url, opts.kind ?? kindOfText(url, accept), { headers: { "User-Agent": UA, Accept: accept, "Accept-Language": "en" }, signal: ctrl.signal, redirect: "follow" });
      if ((res.status === 429 || res.status >= 500) && attempt < retries) { await sleep(3000 * 2 ** attempt); continue; }
      return { status: res.status, url: res.url, contentType: res.headers.get("content-type") ?? "", body: await res.text() };
    } catch (e) {
      if (attempt < retries) { await sleep(3000 * 2 ** attempt); continue; }
      throw e;
    } finally { clearTimeout(t); }
  }
}
/** JSON POST (Statistics Canada WDS uses POST for metadata/coordinate queries). */
export async function postJson(url: string, body: unknown, timeoutMs = 30000): Promise<unknown> {
  const ctrl = new AbortController(); const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await guardedFetch(url, "api", { method: "POST", headers: { "User-Agent": UA, Accept: "application/json", "Content-Type": "application/json" }, body: JSON.stringify(body), signal: ctrl.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
    return await res.json();
  } finally { clearTimeout(t); }
}
/** GET returning raw bytes (an .xlsx workbook). One polite retry: 429 waits for Retry-After (at most 60 s), 5xx waits 3 s. A larger body than `maxBytes` is refused. */
export async function fetchBinary(url: string, opts: { timeoutMs?: number; maxBytes?: number } = {}): Promise<{ status: number; url: string; body: Buffer }> {
  const { timeoutMs = 120000, maxBytes = 64 * 1024 * 1024 } = opts;
  for (let attempt = 0; ; attempt++) {
    const ctrl = new AbortController(); const t = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
      const res = await guardedFetch(url, "dataset", { headers: { "User-Agent": UA, Accept: "*/*" }, signal: ctrl.signal, redirect: "follow" });
      if ((res.status === 429 || res.status >= 500) && attempt < 1) {
        const ra = Number(res.headers.get("retry-after")); await res.arrayBuffer().catch(() => undefined);
        await sleep(res.status === 429 && Number.isFinite(ra) && ra > 0 ? Math.min(ra, 60) * 1000 : 3000); continue;
      }
      if (res.status === 429) throw new Error(`HTTP 429 for ${url} (Retry-After: ${res.headers.get("retry-after") ?? "not given"}); not retried again`);
      const len = Number(res.headers.get("content-length")); if (Number.isFinite(len) && len > maxBytes) throw new Error(`${url}: ${len} bytes is larger than the ${maxBytes} byte limit`);
      const body = Buffer.from(await res.arrayBuffer()); if (body.length > maxBytes) throw new Error(`${url}: ${body.length} bytes is larger than the ${maxBytes} byte limit`);
      return { status: res.status, url: res.url, body };
    } finally { clearTimeout(t); }
  }
}
export const USER_AGENT = UA;
