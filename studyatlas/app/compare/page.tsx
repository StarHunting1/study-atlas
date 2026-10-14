"use client";
import Link from "next/link";
import Compare from "@/components/Compare";
import OfficialCompare from "@/components/official/OfficialCompare";
import { cities, getCity } from "@/data/cities";
import { useI18n } from "@/lib/i18n";
import { MAX_COMPARE, useCompare } from "@/lib/store";
import { pill, pillOff, pillOn } from "@/lib/ui";
export default function ComparePage() {
  const { t, L } = useI18n(); const { ids, toggle, clear, has, full } = useCompare();
  const anySample = ids.some((id) => { const c = getCity(id); return c && Object.values(c.profile.cost).some((f) => f.status === "sample"); });
  return (
    <div className="space-y-6">
      <Link href="/" className="text-sm text-slate-500 hover:text-slate-900">← {t("home")}</Link>
      <div className="flex flex-wrap items-baseline gap-3"><h1 className="text-3xl font-bold text-[#0b2a5b]">{t("compare")}</h1><span className="text-sm text-slate-500">{ids.length} / {MAX_COMPARE}</span></div>
      <div className="flex flex-wrap gap-2">
        {cities.map((c) => <button key={c.id} aria-pressed={has(c.id)} disabled={!has(c.id) && full} onClick={() => toggle(c.id)} className={`${pill} disabled:opacity-40 ${has(c.id) ? pillOn : pillOff}`}>{has(c.id) ? "✓ " : ""}{L(c.name)}</button>)}
        {ids.length > 0 && <button onClick={clear} className="px-2 text-sm text-slate-500 underline">{t("clear")}</button>}
      </div>
      {full && <p className="text-sm text-slate-500">{t("compareFull")}</p>}
      {ids.length >= 2 && anySample && <p className="rounded-xl bg-amber-50 px-4 py-2 text-sm text-amber-800">{t("sampleNote")}</p>}
      {ids.length >= 2 ? <><OfficialCompare ids={ids} /><Compare ids={ids} onRemove={toggle} /></> : <p className="text-slate-500">{ids.length === 0 ? t("emptyCompare") + " " : ""}{t("maxCompare")}</p>}
    </div>
  );
}
