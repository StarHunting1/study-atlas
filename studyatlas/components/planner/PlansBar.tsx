"use client";
import { useState } from "react";
import { getCity } from "@/data/cities";
import { useI18n } from "@/lib/i18n";
import { CITIES, activePlan, addPlan, deletePlan, duplicatePlan, emptyStore, newPlan, planFromProfile, renamePlan, type CityId, type Store } from "@/lib/planner";
import { isEmptyProfile, type Profile } from "@/lib/profile";
import { pt } from "@/locales/planner";

const btn = "rounded-full px-3 py-1.5 text-xs font-medium ring-1 ring-slate-200 hover:bg-slate-50";
/** Saved plans: switch, create, rename, duplicate, delete, delete everything. */
export default function PlansBar({ store, setStore, profile, onClearAll }: { store: Store; setStore: (f: (s: Store) => Store) => void; profile: Profile; onClearAll: () => void }) {
  const { L } = useI18n(); const cur = activePlan(store); const [renaming, setRenaming] = useState(false);
  const label = (p: { name: string; cityId: CityId }) => p.name || `${L(getCity(p.cityId)!.name)} · ${L(pt.unnamed)}`;
  const create = (cityId?: CityId) => setStore((s) => addPlan(s, cityId ? newPlan({ cityId }) : planFromProfile(profile)));
  return (
    <section aria-labelledby="plans-h" className="space-y-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id="plans-h" className="text-base font-semibold text-[#0b2a5b]">{L(pt.plans)} <span className="text-xs font-normal text-slate-400">({store.plans.length})</span></h2>
        <span className="text-[11px] text-slate-400">🔒 {L(pt.saved)}</span>
      </div>
      {store.plans.length > 0 && (
        <ul className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1" role="tablist" aria-label={L(pt.plans)}>
          {store.plans.map((p) => <li key={p.id}><button role="tab" aria-selected={p.id === store.activeId} onClick={() => { setRenaming(false); setStore((s) => ({ ...s, activeId: p.id })); }} className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium ${p.id === store.activeId ? "bg-[#0b2a5b] text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}>{label(p)}</button></li>)}
        </ul>
      )}
      <div className="flex flex-wrap items-center gap-2">
        {CITIES.map((c) => <button key={c} type="button" onClick={() => create(c)} className={`${btn} bg-white`}>＋ {L(pt.newPlan)} · {L(getCity(c)!.name)}</button>)}
        {!isEmptyProfile(profile) && <button type="button" onClick={() => create()} className={`${btn} bg-sky-50 text-sky-800`}>{L(pt.fromProfile)}</button>}
      </div>
      {cur && (
        <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
          {renaming ? (
            <><label className="sr-only" htmlFor="plan-name">{L(pt.planName)}</label>
              <input id="plan-name" autoFocus value={cur.name} placeholder={L(pt.unnamed)} maxLength={60} onChange={(e) => setStore((s) => renamePlan(s, cur.id, e.target.value))} onKeyDown={(e) => { if (e.key === "Enter" || e.key === "Escape") setRenaming(false); }} className="w-64 max-w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-[#0b2a5b] focus:outline-none" />
              <button type="button" onClick={() => setRenaming(false)} className="rounded-full bg-[#0b2a5b] px-3 py-1.5 text-xs font-medium text-white">{L(pt.done)}</button></>
          ) : (
            <><span className="mr-1 text-sm font-medium text-slate-700">{label(cur)}</span>
              <button type="button" onClick={() => setRenaming(true)} className={btn}>{L(pt.rename)}</button>
              <button type="button" onClick={() => setStore((s) => duplicatePlan(s, cur.id, `${label(cur)} (${L(pt.copy)})`))} className={btn}>{L(pt.duplicate)}</button>
              <button type="button" onClick={() => { if (window.confirm(L(pt.confirmDelete))) { setRenaming(false); setStore((s) => deletePlan(s, cur.id)); } }} className={`${btn} text-rose-700`}>{L(pt.delete)}</button></>
          )}
          <button type="button" onClick={() => { if (window.confirm(L(pt.confirmDeleteAll))) { setRenaming(false); onClearAll(); } }} className="ml-auto text-xs text-slate-500 underline">{L(pt.deleteAll)}</button>
        </div>
      )}
      {cur?.fromProfile && <p className="text-xs text-slate-500">ℹ️ {L(pt.fromProfileNote)}</p>}
    </section>
  );
}
export { emptyStore };
