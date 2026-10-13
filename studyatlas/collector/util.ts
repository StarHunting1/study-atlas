import { createHash } from "node:crypto";
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
      const res = await fetch(url, { headers: { "User-Agent": UA, Accept: "application/json" }, signal: ctrl.signal });
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
