"use client";
import { getCity } from "@/data/cities";
import { useI18n } from "@/lib/i18n";
import { CITIES, CURRENCIES, HOUSING_TYPES, STUDY_TYPES, changeCity, durationRange, goalRange, setDisplayCurrency, stayWeeks, touch, weeksToMonths, type Ccy, type Plan } from "@/lib/planner";
import { pt } from "@/locales/planner";
import AnimatedNumber from "./AnimatedNumber";
import SliderField from "./SliderField";
import { fmtMoney, fmtNum } from "./format";

const seg = (on: boolean) => `rounded-full px-4 py-2 text-sm font-medium transition ${on ? "bg-[#0b2a5b] text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"}`;
const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="space-y-2 border-b border-slate-100 py-4 last:border-0"><p className="text-sm font-medium text-slate-500">{label}</p>{children}</div>
);

/** Conditions: destination, study type, length of stay, housing, target budget, display currency (grouped like a settings screen). */
export default function SetupCard({ plan, setPlan }: { plan: Plan; setPlan: (f: (p: Plan) => Plan) => void }) {
  const { L, lang } = useI18n(); const upd = (patch: Partial<Plan>) => setPlan((p) => touch({ ...p, ...patch }));
  const w = stayWeeks(plan); const dr = durationRange(plan.duration.unit); const gr = goalRange(plan.goal.currency);
  const switchUnit = (unit: "weeks" | "months") => setPlan((p) => {
    if (p.duration.unit === unit) return p; const weeks = stayWeeks(p); const r = durationRange(unit);
    return touch({ ...p, duration: { unit, value: Math.min(r.max, Math.max(r.min, Math.round(unit === "weeks" ? weeks : weeksToMonths(weeks)))) } });
  });
  return (
    <section aria-labelledby="setup-h" className="rounded-2xl bg-white px-4 shadow-sm ring-1 ring-slate-200 sm:px-6">
      <h2 id="setup-h" className="pt-5 text-lg font-semibold text-[#0b2a5b]">{L(pt.setup)}</h2>
      <Row label={L(pt.destination)}>
        <div role="group" aria-label={L(pt.destination)} className="inline-flex flex-wrap gap-1 rounded-full bg-slate-50 p-1 ring-1 ring-slate-200">
          {CITIES.map((c) => <button key={c} type="button" aria-pressed={plan.cityId === c} onClick={() => setPlan((p) => changeCity(p, c))} className={seg(plan.cityId === c)}>{L(getCity(c)!.name)}</button>)}
        </div>
      </Row>
      <Row label={L(pt.studyType)}>
        <div role="group" aria-label={L(pt.studyType)} className="inline-flex gap-1 rounded-full bg-slate-50 p-1 ring-1 ring-slate-200">
          {STUDY_TYPES.map((s) => <button key={s} type="button" aria-pressed={plan.studyType === s} onClick={() => upd({ studyType: s })} className={seg(plan.studyType === s)}>{L(pt[s])}</button>)}
        </div>
      </Row>
      <Row label={L(pt.duration)}>
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div><AnimatedNumber value={plan.duration.value} format={(n) => fmtNum(Math.round(n), lang)} className="text-4xl font-semibold tracking-tight text-slate-900" /><span className="ml-1.5 text-lg text-slate-600">{L(pt[plan.duration.unit])}</span>
            <p className="mt-1 text-xs text-slate-500" data-testid="duration-note">≈ {plan.duration.unit === "weeks" ? `${fmtNum(weeksToMonths(w), lang)} ${L(pt.months)}` : `${fmtNum(w, lang)} ${L(pt.weeks)}`} · {L(pt.durationRule)}</p></div>
          <div role="group" aria-label={L(pt.duration)} className="inline-flex gap-1 rounded-full bg-slate-50 p-1 ring-1 ring-slate-200">
            {(["weeks", "months"] as const).map((u) => <button key={u} type="button" aria-pressed={plan.duration.unit === u} onClick={() => switchUnit(u)} className={seg(plan.duration.unit === u)}>{L(pt[u])}</button>)}
          </div>
        </div>
        <SliderField label={L(pt.duration)} value={plan.duration.value} range={{ min: dr.min, max: dr.max, step: dr.step, fine: 1 }} format={(n) => `${fmtNum(n, lang)} ${L(pt[plan.duration.unit])}`} onChange={(n) => upd({ duration: { ...plan.duration, value: Math.max(1, n) } })} />
      </Row>
      <Row label={L(pt.housingType)}>
        <div role="group" aria-label={L(pt.housingType)} className="flex flex-wrap gap-1 rounded-2xl bg-slate-50 p-1 ring-1 ring-slate-200 sm:inline-flex sm:rounded-full">
          {HOUSING_TYPES.map((h) => <button key={h} type="button" aria-pressed={plan.housingType === h} onClick={() => upd({ housingType: h })} className={seg(plan.housingType === h)}>{L(pt[h])}</button>)}
        </div>
      </Row>
      <Row label={L(pt.goal)}>
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>{plan.goal.amount === null ? <span className="text-2xl font-semibold text-slate-300">{L(pt.goalUnset)}</span> : <AnimatedNumber value={plan.goal.amount} format={(n) => fmtMoney(n, plan.goal.currency, lang)} className="text-3xl font-semibold tracking-tight text-slate-900" />}
            {plan.goal.amount !== null && <button type="button" onClick={() => upd({ goal: { ...plan.goal, amount: null } })} className="ml-3 text-xs text-slate-500 underline">{L(pt.clear)}</button>}</div>
          <div role="group" aria-label={L(pt.goal)} className="inline-flex gap-1 rounded-full bg-slate-50 p-1 ring-1 ring-slate-200">
            {CURRENCIES.map((c) => <button key={c} type="button" aria-pressed={plan.goal.currency === c} onClick={() => upd({ goal: { amount: plan.goal.currency === c ? plan.goal.amount : null, currency: c as Ccy } })} className={seg(plan.goal.currency === c)}>{c}</button>)}
          </div>
        </div>
        <SliderField label={L(pt.goal)} value={plan.goal.amount} range={{ ...gr, fine: gr.step / 5 }} format={(n) => fmtMoney(n, plan.goal.currency, lang)} onChange={(n) => upd({ goal: { ...plan.goal, amount: n } })} />
      </Row>
      <Row label={L(pt.displayCurrency)}>
        <div role="group" aria-label={L(pt.displayCurrency)} className="inline-flex gap-1 rounded-full bg-slate-50 p-1 ring-1 ring-slate-200">
          {CURRENCIES.map((c) => <button key={c} type="button" aria-pressed={plan.displayCurrency === c} onClick={() => setPlan((p) => setDisplayCurrency(p, c))} className={seg(plan.displayCurrency === c)}>{c}</button>)}
        </div>
      </Row>
      <details className="py-3">
        <summary className="cursor-pointer text-sm font-medium text-slate-500">{L(pt.advanced)}</summary>
        <div className="space-y-1 pt-2"><p className="text-sm text-slate-600">{L(pt.termLength)}: <strong>{plan.termWeeks} {L(pt.weeks)}</strong></p><p className="text-xs text-slate-400">{L(pt.termHint)}</p>
          <SliderField label={L(pt.termLength)} value={plan.termWeeks} range={{ min: 4, max: 26, step: 1, fine: 1 }} format={(n) => `${n} ${L(pt.weeks)}`} onChange={(n) => upd({ termWeeks: Math.max(4, n) })} /></div>
      </details>
    </section>
  );
}
