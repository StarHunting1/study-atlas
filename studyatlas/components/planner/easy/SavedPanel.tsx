"use client";
import { useState } from "react";
import { DESTINATIONS } from "@/data/airports";
import { useI18n, type Localized } from "@/lib/i18n";
import { calcPlan, moneyOf } from "@/lib/planner";
import { MAX_COMPARE, deleteSaved, originCode, renameSaved, toggleCompare, type Saved, type SavedStore } from "@/lib/smart";
import { pt } from "@/locales/planner";
import { st } from "@/locales/smart";
import { fmtRound, tpl } from "../format";
import Disclosure from "@/components/Disclosure";
import { fmtSum } from "./helpers";

const btn = "rounded-full px-3 py-1.5 text-xs font-medium ring-1 ring-slate-200 hover:bg-slate-50";
const label = (s: Saved, L: (x: Localized) => string) => s.name || `${L(st.tiers[s.tier])} · ${L(DESTINATIONS[s.easy.cityId].city)}`;

export default function SavedPanel({ store, setStore, onEdit, onOpenAdvanced, onClearAll }: { store: SavedStore; setStore: (f: (s: SavedStore) => SavedStore) => void; onEdit: (s: Saved) => void; onOpenAdvanced: (s: Saved) => void; onClearAll: () => void }) {
  const { L, lang } = useI18n(); const [renaming, setRenaming] = useState<string | null>(null);
  const picked = store.compare.map((id) => store.saved.find((s) => s.id === id)).filter((s): s is Saved => !!s);
  return (
    <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:p-5" data-testid="saved-panel">
      <Disclosure level="row" testid="saved-toggle" title={`${L(st.savedTitle)} (${store.saved.length})`} summary={`🔒 ${L(pt.saved)}`}>
      <div className="space-y-3">
      {store.saved.length === 0 ? <p className="text-sm text-slate-500">{L(st.savedEmpty)}</p> : <>
        <ul className="space-y-2">
          {[...store.saved].reverse().map((s) => {
            const c = calcPlan(s.plan); const on = store.compare.includes(s.id); const full = !on && store.compare.length >= MAX_COMPARE;
            return (
              <li key={s.id} data-saved={s.id} className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl p-3 ring-1 ring-slate-200">
                <label className="flex items-center gap-2 text-xs text-slate-600"><input type="checkbox" checked={on} disabled={full} onChange={() => setStore((x) => toggleCompare(x, s.id))} className="h-5 w-5 accent-[#0b2a5b]" aria-label={`${L(st.compare)}: ${label(s, L)}`} />{L(st.compare)}</label>
                <div className="min-w-0 flex-1">
                  {renaming === s.id
                    ? <input autoFocus aria-label={L(st.rename)} value={s.name} maxLength={60} placeholder={label({ ...s, name: "" }, L)} onChange={(e) => setStore((x) => renameSaved(x, s.id, e.target.value))} onKeyDown={(e) => { if (e.key === "Enter" || e.key === "Escape") setRenaming(null); }} onBlur={() => setRenaming(null)} className="w-full rounded-lg border border-slate-300 px-2 py-1 text-sm focus:border-[#0b2a5b] focus:outline-none" />
                    : <p className="truncate text-sm font-medium text-slate-800">{label(s, L)}</p>}
                  <p className="text-[11px] text-slate-500">{L(st.tiers[s.tier])} · {originCode(s.easy)} → {DESTINATIONS[s.easy.cityId].code} · {tpl(L(st.savedAt), { date: s.savedAt.slice(0, 10) })} · {Object.keys(c.total.byCurrency).length ? fmtSum(c.total, s.plan.displayCurrency, lang) : "—"}</p>
                </div>
                <div className="flex flex-wrap gap-1.5"><button type="button" className={btn} onClick={() => onEdit(s)}>{L(st.edit)}</button><button type="button" className={btn} onClick={() => onOpenAdvanced(s)}>{L(st.openAdvanced)}</button>
                  <button type="button" className={btn} onClick={() => setRenaming(s.id)}>{L(st.rename)}</button>
                  <button type="button" className={`${btn} text-rose-700`} onClick={() => { if (window.confirm(L(st.confirmDelete))) setStore((x) => deleteSaved(x, s.id)); }}>{L(st.delete)}</button></div>
              </li>
            );
          })}
        </ul>
        <div className="flex items-center justify-between gap-2"><p className="text-[11px] text-slate-500">{L(st.compareMax)}</p><button type="button" onClick={() => { if (window.confirm(L(st.confirmDeleteAll))) onClearAll(); }} className="text-xs text-slate-500 underline">{L(st.deleteAll)}</button></div>
        <div className="space-y-2 border-t border-slate-100 pt-3" data-testid="compare-saved">
          <h3 className="text-sm font-semibold text-[#0b2a5b]">{L(st.compareTitle)}</h3>
          {picked.length < 2 ? <p className="text-xs text-slate-500">{L(st.compareNeed)}</p> : (
            <div className="overflow-x-auto"><table className="w-full min-w-[32rem] text-left text-xs">
              <thead><tr className="text-slate-500"><th className="py-1 pr-2 font-medium" />{picked.map((s) => <th key={s.id} className="py-1 pr-2 font-semibold text-slate-800">{label(s, L)}</th>)}</tr></thead>
              <tbody className="divide-y divide-slate-100">
                {(() => {
                  const cs = picked.map((s) => ({ s, c: calcPlan(s.plan) }));
                  const rows: [string, (x: { s: Saved; c: ReturnType<typeof calcPlan> }) => string][] = [
                    [L(st.route), ({ s }) => `${originCode(s.easy)} → ${DESTINATIONS[s.easy.cityId].code}`],
                    [L(st.total), ({ s, c }) => (Object.keys(c.total.byCurrency).length ? fmtSum(c.total, s.plan.displayCurrency, lang) : "—")],
                    [L(st.monthlyLiving), ({ s, c }) => (c.monthlyLiving && !Object.keys(c.living.unconverted).length ? fmtRound(c.monthlyLiving.converted, s.plan.displayCurrency, lang) : "—")],
                    [L(st.tuition), ({ s, c }) => fmtSum(c.groups.tuition, s.plan.displayCurrency, lang)], [L(st.housing), ({ s, c }) => fmtSum(c.groups.housing, s.plan.displayCurrency, lang)],
                    [L(st.flights), ({ s, c }) => fmtSum(moneyOf(s.plan, c, ["flights"]), s.plan.displayCurrency, lang)],
                    [L(st.vsBudget), ({ s, c }) => (c.goal && c.goal.diff !== null ? (c.goal.diff >= 0 ? "+" : "−") + fmtRound(Math.abs(c.goal.diff), s.plan.displayCurrency, lang) : "—")],
                    [L(st.itemsFilled), ({ c }) => `${c.sources.official + c.sources.user}/${c.sources.official + c.sources.user + c.sources.unset}`],
                  ];
                  return rows.map(([k, f]) => <tr key={k}><th scope="row" className="py-1.5 pr-2 font-normal text-slate-500">{k}</th>{cs.map((x) => <td key={x.s.id} className="py-1.5 pr-2 tabular-nums text-slate-800">{f(x).replace(/^$/, "—")}</td>)}</tr>);
                })()}
              </tbody>
            </table></div>
          )}
        </div>
      </>}
      </div>
      </Disclosure>
    </section>
  );
}
