"use client";
import Link from "next/link";
import QuickCompare from "@/components/overview/QuickCompare";
import { cities } from "@/data/cities";
import { useI18n } from "@/lib/i18n";
import { MAX_COMPARE, useCompare } from "@/lib/store";
import { panel, pill, pillOff, pillOn } from "@/lib/ui";
import { cu } from "@/locales/compareUi";
export default function ComparePage() {
  const { t, L } = useI18n(); const { ids, toggle, clear, has, full } = useCompare();
  return (
    <div className="space-y-6">
      <Link href="/" className="text-sm text-slate-500 hover:text-slate-900">← {t("home")}</Link>
      <div className="flex flex-wrap items-baseline gap-3"><h1 className="text-3xl font-bold text-[#0b2a5b]">{t("compare")}</h1><span className="text-sm text-slate-500">{ids.length} / {MAX_COMPARE}</span></div>
      <div className="flex flex-wrap gap-2">
        {cities.map((c) => <button key={c.id} aria-pressed={has(c.id)} disabled={!has(c.id) && full} onClick={() => toggle(c.id)} className={`${pill} disabled:opacity-40 ${has(c.id) ? pillOn : pillOff}`}>{has(c.id) ? "✓ " : ""}{L(c.name)}</button>)}
        {ids.length > 0 && <button onClick={clear} className="px-2 text-sm text-slate-500 underline">{t("clear")}</button>}
      </div>
      {full && <p className="text-sm text-slate-500">{t("compareFull")}</p>}
      {ids.length > 0 && <ul className="grid gap-3" style={{ gridTemplateColumns: `repeat(${Math.min(ids.length, 4)}, minmax(0, 1fr))` }} data-testid="compare-header">
        {ids.map((id) => { const c = cities.find((x) => x.id === id); if (!c) return null; return (
          <li key={id} className={`${panel} min-w-0 p-3`}><p className="truncate text-xs text-slate-500">{L(c.blurb)}</p><h2 className="truncate text-base font-semibold text-[#0b2a5b]">{L(c.name)}</h2>
            <div className="mt-1 flex flex-wrap items-center gap-x-3"><Link href={`/city/${id}`} className="inline-flex min-h-[44px] items-center text-xs text-sky-700 underline">{L(cu.details)}</Link><button onClick={() => toggle(id)} className="min-h-[44px] text-xs text-slate-500 underline">{L(cu.remove)}</button></div></li>); })}</ul>}
      {ids.length >= 2 ? <QuickCompare ids={ids} /> : <p className="text-slate-500">{ids.length === 0 ? t("emptyCompare") + " " : ""}{t("maxCompare")}</p>}
    </div>
  );
}
