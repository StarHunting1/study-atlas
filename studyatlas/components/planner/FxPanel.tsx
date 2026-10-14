"use client";
import { useI18n } from "@/lib/i18n";
import { ITEM_IDS, setRate, type Ccy, type Plan } from "@/lib/planner";
import { pt } from "@/locales/planner";
import { tpl } from "./format";

/** Manual exchange rates (no live service connected). Rates are applied only where an item (or the target) is in another currency. */
export default function FxPanel({ plan, setPlan }: { plan: Plan; setPlan: (f: (p: Plan) => Plan) => void }) {
  const { L } = useI18n(); const today = new Date().toISOString().slice(0, 10);
  const used = new Set<Ccy>(); for (const id of ITEM_IDS) { const it = plan.items[id]; if (it.value !== null && it.currency !== plan.displayCurrency) used.add(it.currency); }
  if (plan.goal.amount !== null && plan.goal.currency !== plan.displayCurrency) used.add(plan.goal.currency);
  const list = [...used];
  return (
    <section aria-labelledby="fx-h" className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:p-5">
      <h2 id="fx-h" className="text-base font-semibold text-[#0b2a5b]">{L(pt.fx)}</h2>
      <p className="mt-1 text-xs text-slate-500">{L(pt.fxNote)}</p>
      {list.length === 0 ? <p className="mt-2 text-xs text-slate-400">{L(pt.fxNone)}</p> : (
        <ul className="mt-3 space-y-3">
          {list.map((c) => { const r = plan.rates[c]; return (
            <li key={c} className="flex flex-wrap items-center gap-2 text-sm" data-fx={c}>
              <label htmlFor={`fx-${c}`} className="text-slate-600">{tpl(L(pt.fxRate), { c })}</label>
              <input id={`fx-${c}`} type="number" inputMode="decimal" min={0} step="any" value={r?.rate ?? ""} placeholder="—" onChange={(e) => { const n = e.target.value === "" ? null : Number(e.target.value); setPlan((p) => setRate(p, c, n, p.rates[c]?.date || today)); }} className="w-28 rounded-xl border border-slate-300 px-3 py-2 tabular-nums focus:border-[#0b2a5b] focus:outline-none" />
              <span className="text-slate-600">{plan.displayCurrency}</span>
              <label htmlFor={`fxd-${c}`} className="ml-2 text-xs text-slate-500">{L(pt.fxDate)}</label>
              <input id={`fxd-${c}`} type="date" value={r?.date ?? today} disabled={!r} onChange={(e) => setPlan((p) => (p.rates[c] ? setRate(p, c, p.rates[c]!.rate, e.target.value) : p))} className="rounded-xl border border-slate-300 px-2 py-1.5 text-xs disabled:opacity-40" />
            </li>); })}
        </ul>)}
    </section>
  );
}
