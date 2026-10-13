"use client";
import Link from "next/link";
import Compare from "@/components/Compare";
import { cities } from "@/data/cities";
import { useI18n } from "@/lib/i18n";
import { useCompare } from "@/lib/store";
export default function ComparePage() {
  const { t, L } = useI18n(); const { ids, toggle, clear, has, full } = useCompare();
  return (
    <div className="space-y-6">
      <Link href="/" className="text-sm text-slate-500">← {t("home")}</Link>
      <h1 className="text-3xl font-bold text-[#0b2a5b]">{t("compare")}</h1>
      <div className="flex flex-wrap gap-2 text-sm">
        {cities.map((c) => <button key={c.id} disabled={!has(c.id) && full} onClick={() => toggle(c.id)} className={`rounded-full px-4 py-2 disabled:opacity-40 ${has(c.id) ? "bg-[#0b2a5b] text-white" : "bg-white ring-1 ring-slate-200"}`}>{L(c.name)}</button>)}
        {ids.length > 0 && <button onClick={clear} className="px-2 text-slate-500 underline">{t("clear")}</button>}
      </div>
      {ids.length >= 2 ? <Compare ids={ids} onRemove={toggle} /> : <p className="text-slate-500">{ids.length === 0 ? t("emptyCompare") + " " : ""}{t("maxCompare")}</p>}
    </div>
  );
}
