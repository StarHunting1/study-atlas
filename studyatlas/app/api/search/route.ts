import { NextRequest, NextResponse } from "next/server";
import { localSearch } from "@/lib/search";
// Server-side only: keys stay in env. Future: forward to a multilingual/semantic search service
// that translates the query and matches across source languages.
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") ?? "";
  const lang = req.nextUrl.searchParams.get("lang") ?? "en";
  const url = process.env.SEARCH_API_URL, key = process.env.SEARCH_API_KEY;
  if (url && key) {
    try {
      const r = await fetch(url, { method: "POST", headers: { "content-type": "application/json", authorization: `Bearer ${key}` }, body: JSON.stringify({ q, lang }) });
      if (r.ok) return NextResponse.json({ hits: (await r.json()).hits, source: "remote" });
    } catch {}
  }
  return NextResponse.json({ hits: localSearch(q), source: "local" });
}
