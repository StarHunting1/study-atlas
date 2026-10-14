"use client";
import { getCity } from "@/data/cities";
import { useI18n } from "@/lib/i18n";
import { calcPlan, type Plan, type Store } from "@/lib/planner";
import { pt } from "@/locales/planner";
import { fmtNum, fmtRound } from "./format";

/** Two saved plans side by side. A difference is computed only when both totals are in the same display currency and fully converted. */
export default function ComparePlans({ store, setStore }: { store: Store; setStore: (f: (s: Store) => Store) => void }) {
  const { L, lang } = useI18n();
  if (store.plans.length < 2) return <section className="rounded-2xl bg-white p-4 text-sm text-slate-500 shadow-sm ring-1 ring-slate-200 sm:p-5"><h2 className="mb-1 text-base font-semibold text-[#0b2a5b]">{L(pt.comparePlans)}</h2>{L(pt.compareNeed)}</section>;
  const [ia, ib] = store.compare; const a = store.plans.find((p) => p.id === ia) ?? store.plans[0]; const b = store.plans.find((p) => p.id === ib) ?? store.plans.find((p) => p.id !== a.id) ?? store.plans[1];
  const label = (p: Plan) => p.name || `${L(getCity(p.cityId)!.name)} · ${L(pt.unnamed)}`;
  const ca = calcPlan(a), cb = calcPlan(b);
  const full = (c: ReturnType<typeof calcPlan>) => Object.keys(c.total.unconverted).length === 0 && Object.keys(c.total.byCurrency).length > 0;
  const comparable = a.displayCurrency === b.displayCurrency && full(ca) && full(cb);
  const cell = (c: ReturnType<typeof calcPlan>, p: Plan, v: number | null, has: boolean) => (has && v !== null ? fmtRound(v, p.displayCurrency, lang) : "—");
  const rows: [string, (c: ReturnType<typeof calcPlan>) => number | null, (c: ReturnType<typeof calcPlan>) => boolean][] = [
    [L(pt.total), (c) => c.total.converted, (c) => Object.keys(c.total.byCurrency).length > 0],
    [L(pt.monthly), (c) => c.monthlyLiving?.converted ?? null, (c) => !!c.monthlyLiving],
    [L(pt.tuitionTotal), (c) => c.groups.tuition.converted, (c) => Object.keys(c.groups.tuition.byCurrency).length > 0],
    [L(pt.housingTotal), (c) => c.groups.housing.converted, (c) => Object.keys(c.groups.housing.byCurrency).length > 0],
    [L(pt.initialTotal), (c) => c.groups.initial.converted, (c) => Object.keys(c.groups.initial.byCurrency).length > 0],
  ];
  const pick = (which: 0 | 1, id: string) => setStore((s) => ({ ...s, compare: which === 0 ? [id, s.compare[1]] : [s.compare[0], id] }));
  return (
    <section aria-labelledby="cmp-h" className="space-y-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:p-5" data-testid="compare-plans">
      <h2 id="cmp-h" className="text-base font-semibold text-[#0b2a5b]">{L(pt.comparePlans)}</h2>
      <div className="grid gap-2 sm:grid-cols-2">
        {([[0, a, pt.compareLeft], [1, b, pt.compareRight]] as const).map(([i, p, l]) => (
          <label key={i} className="text-xs text-slate-500">{L(l)}<select value={p.id} onChange={(e) => pick(i, e.target.value)} className="mt-1 block w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800">{store.plans.map((x) => <option key={x.id} value={x.id}>{label(x)}</option>)}</select></label>))}
      </div>
      <div className="overflow-x-auto"><table className="w-full min-w-[420px] text-sm">
        <thead><tr className="text-left text-xs text-slate-500"><th /><th className="p-2">{label(a)}<br /><span className="font-normal">{L(getCity(a.cityId)!.name)} · {fmtNum(ca.weeks, lang)} {L(pt.weeks)} · {a.displayCurrency}</span></th><th className="p-2">{label(b)}<br /><span className="font-normal">{L(getCity(b.cityId)!.name)} · {fmtNum(cb.weeks, lang)} {L(pt.weeks)} · {b.displayCurrency}</span></th>{comparable && <th className="p-2">{L(pt.gapLabel)}</th>}</tr></thead>
        <tbody>{rows.map(([name, get, has], i) => (
          <tr key={i} className="border-t border-slate-100"><th className="p-2 text-left text-xs font-medium text-slate-600">{name}</th>
            <td className="p-2 tabular-nums">{cell(ca, a, get(ca), has(ca))}</td><td className="p-2 tabular-nums">{cell(cb, b, get(cb), has(cb))}</td>
            {comparable && <td className="p-2 tabular-nums">{has(ca) && has(cb) ? fmtRound((get(ca) ?? 0) - (get(cb) ?? 0), a.displayCurrency, lang) : "—"}</td>}</tr>))}
          <tr className="border-t border-slate-100"><th className="p-2 text-left text-xs font-medium text-slate-600">{L(pt.unaccounted)}</th><td className="p-2">{ca.unset.length}</td><td className="p-2">{cb.unset.length}</td>{comparable && <td />}</tr></tbody>
      </table></div>
      <p className="text-xs text-slate-500">{comparable ? L(pt.compareSame) : L(pt.compareDiff)}{Math.abs(ca.weeks - cb.weeks) > 0.01 ? ` ${L(pt.compareLen)}` : ""}</p>
    </section>
  );
}
