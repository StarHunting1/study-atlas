"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { cities, countries } from "@/data/cities";
import { useI18n } from "@/lib/i18n";
import type { Hit } from "@/lib/search";
export default function SearchBox() {
  const { lang, t, L } = useI18n(); const r = useRouter();
  const [q, setQ] = useState(""); const [hits, setHits] = useState<Hit[] | null>(null);
  useEffect(() => {
    if (!q.trim()) return setHits(null);
    const id = setTimeout(async () => { try { setHits((await (await fetch(`/api/search?q=${encodeURIComponent(q)}&lang=${lang}`)).json()).hits); } catch { setHits([]); } }, 200);
    return () => clearTimeout(id);
  }, [q, lang]);
  const go = (h: Hit) => r.push(h.type === "city" ? `/city/${h.id}` : `/?country=${h.id}`);
  const label = (h: Hit) => L(h.type === "country" ? countries.find((c) => c.code === h.id)!.name : cities.find((c) => c.id === h.id)!.name);
  return (
    <div className="relative mx-auto w-full max-w-xl">
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("search")} aria-label={t("search")}
        type="search" className="w-full rounded-full bg-white px-6 py-4 text-base shadow-sm outline-none ring-1 ring-slate-200 transition focus:shadow-md focus:ring-2 focus:ring-sky-400" />
      {hits && (
        <ul className="absolute z-40 mt-2 w-full overflow-hidden rounded-2xl bg-white text-left shadow-xl ring-1 ring-slate-200">
          {hits.length === 0 && <li className="px-5 py-3 text-sm text-slate-400">{t("noResults")} · {t("searchHint")}</li>}
          {hits.map((h) => <li key={h.type + h.id}><button className="w-full px-5 py-3 text-left text-sm hover:bg-slate-50" onClick={() => go(h)}>{h.type === "country" ? "🌐" : "📍"} {label(h)}</button></li>)}
        </ul>)}
    </div>
  );
}
