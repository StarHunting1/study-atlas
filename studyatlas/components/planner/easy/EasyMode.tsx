"use client";
import { useMemo, useState } from "react";
import { COUNTRIES, DESTINATIONS, ORIGINS, OTHER_AIRPORT, airportsIn, isIata } from "@/data/airports";
import { useI18n } from "@/lib/i18n";
import { usePersistentState } from "@/lib/persist";
import { CITIES, CITY_CCY, CURRENCIES, HOUSING_TYPES, STUDY_TYPES, durationRange, goalRange, rangeFor, setRate, type Ccy, type Plan } from "@/lib/planner";
import { isEmptyProfile } from "@/lib/profile";
import { useProfile } from "@/lib/useProfile";
import { DRAFT_KEY, SAVED_KEY, ASSUME_ITEMS, cleanEasy, cleanSaved, defaultBudget, defaultEasy, emptySaved, generate, groupPlans, savePlan, type Easy, type PlanGroup, type Saved } from "@/lib/smart";
import Disclosure from "@/components/Disclosure";
import { getCity } from "@/data/cities";
import { pt } from "@/locales/planner";
import { st } from "@/locales/smart";
import AnimatedNumber from "../AnimatedNumber";
import SliderField from "../SliderField";
import { fmtMoney, fmtNum, tpl } from "../format";
import FlightPanel from "./FlightPanel";
import PlanCard from "./PlanCard";
import SavedPanel from "./SavedPanel";
import { monthName, rateRange, today } from "./helpers";

const card = "space-y-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:p-5";
const seg = (on: boolean) => `rounded-full px-4 py-2 text-sm font-medium transition ${on ? "bg-[#0b2a5b] text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"}`;
const sel = "rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm focus:border-[#0b2a5b] focus:outline-none";
const lab = "block text-sm font-medium text-slate-700";

/** Easy mode: a few choices in, three plans out. Plans are recomputed on every change (pure functions, no network). */
export default function EasyMode({ onOpenAdvanced }: { onOpenAdvanced: (plan: Plan) => void }) {
  const { L, lang } = useI18n(); const [profile] = useProfile();
  const [easy, setEasy, { loaded }] = usePersistentState<Easy>(DRAFT_KEY, defaultEasy(), cleanEasy);
  const [saved, setSaved, { remove: clearSaved }] = usePersistentState(SAVED_KEY, emptySaved(), cleanSaved, (s) => s.saved.length > 0);
  const [justSaved, setJustSaved] = useState<string | null>(null); const [extras, setExtras] = useState(false);
  const groups = useMemo(() => groupPlans(generate(easy)), [easy]);
  const upd = (f: (e: Easy) => Easy) => { setJustSaved(null); setEasy(f); };
  const ccy = easy.budget.currency; const cityCcy = CITY_CCY[easy.cityId]; const dur = durationRange(easy.duration.unit);
  const needRate: Ccy[] = (cityCcy !== ccy ? [cityCcy] : []); const code = easy.origin.airport === OTHER_AIRPORT ? easy.origin.custom : easy.origin.airport;
  const setBudgetCcy = (c: Ccy) => upd((e) => ({ ...e, budget: { currency: c, amount: defaultBudget(c) }, rates: Object.fromEntries(Object.entries(e.rates).filter(([k]) => k !== c)) as Easy["rates"] }));
  const setRateOf = (c: Ccy, v: number | null) => upd((e) => ({ ...e, rates: setRate({ rates: e.rates } as Plan, c, v, today()).rates }));
  const useProfile_ = () => upd((e) => { const cityId = (CITIES as readonly string[]).includes(profile.destCity) ? (profile.destCity as Easy["cityId"]) : e.cityId; const c = (CURRENCIES as readonly string[]).includes(profile.currency) ? (profile.currency as Ccy) : CITY_CCY[cityId];
    const dv = profile.duration.value; const d: Easy["duration"] = dv && dv > 0 ? (profile.duration.unit === "weeks" ? { value: Math.min(104, dv), unit: "weeks" } : { value: Math.min(24, profile.duration.unit === "years" ? dv * 12 : dv), unit: "months" }) : e.duration;
    return { ...e, cityId, studyType: (profile.studyType || e.studyType) as Easy["studyType"], duration: d, budget: { currency: c, amount: profile.budget.amount ?? defaultBudget(c) }, rates: {} }; });
  const doSave = (g: PlanGroup) => { setSaved((s) => savePlan(s, g.plan, easy, "")); setJustSaved(g.tiers[0]); };
  const goRate = () => { setExtras(true); setTimeout(() => document.getElementById("rate-panel")?.scrollIntoView({ block: "center" }), 60); };
  const edit = (s: Saved) => { setJustSaved(null); setEasy(s.easy); window.scrollTo({ top: 0, behavior: "smooth" }); };
  if (!loaded) return <div className="h-40 animate-pulse rounded-2xl bg-slate-100" aria-hidden />;

  const cityBtn = (c: Easy["cityId"]) => upd((e) => ({ ...e, cityId: c, budget: e.budget.currency === CITY_CCY[e.cityId] && e.budget.amount === defaultBudget(e.budget.currency) ? { currency: CITY_CCY[c], amount: defaultBudget(CITY_CCY[c]) } : e.budget, rates: {} }));
  const cols = groups.length === 1 ? "" : groups.length === 2 ? "lg:grid-cols-2" : "lg:grid-cols-3";

  return (
    <div className="space-y-6" data-testid="easy-mode">
      {/* Level 1: four choices */}
      <section className={`${card} space-y-5`} aria-label={L(st.title)} data-testid="core-form">
        <div className="space-y-1"><span className={lab}>{L(st.destination)}</span>
          <div role="group" aria-label={L(st.destination)} className="flex flex-wrap gap-1 rounded-full bg-slate-50 p-1 ring-1 ring-slate-200 sm:inline-flex">
            {CITIES.map((c) => <button key={c} type="button" data-testid={`city-${c}`} aria-pressed={easy.cityId === c} onClick={() => cityBtn(c)} className={seg(easy.cityId === c)}>{L(getCity(c)!.name)}</button>)}</div></div>
        <div className="space-y-1"><span className={lab}>{L(st.studyType)}</span>
          <div role="group" aria-label={L(st.studyType)} className="inline-flex gap-1 rounded-full bg-slate-50 p-1 ring-1 ring-slate-200">
            {STUDY_TYPES.map((t) => <button key={t} type="button" data-testid={`type-${t}`} aria-pressed={easy.studyType === t} onClick={() => upd((e) => ({ ...e, studyType: t }))} className={seg(easy.studyType === t)}>{L(pt[t])}</button>)}</div></div>
        <div className="space-y-1">
          <div className="flex flex-wrap items-end justify-between gap-2"><span className={lab}>{L(st.duration)}</span>
            <span className="text-2xl font-semibold tabular-nums text-slate-900" data-testid="duration-value"><AnimatedNumber value={easy.duration.value} format={(n) => `${fmtNum(Math.round(n), lang)} ${L(pt[easy.duration.unit])}`} /></span></div>
          <SliderField label={L(st.duration)} value={easy.duration.value} range={{ ...dur, fine: 1 }} format={(n) => `${fmtNum(n, lang)} ${L(pt[easy.duration.unit])}`} onChange={(n) => upd((e) => ({ ...e, duration: { ...e.duration, value: n } }))} />
          <div role="group" aria-label={L(st.duration)} className="mt-1 inline-flex gap-1 rounded-full bg-slate-50 p-1 ring-1 ring-slate-200">
            {(["weeks", "months"] as const).map((u) => <button key={u} type="button" data-testid={`unit-${u}`} aria-pressed={easy.duration.unit === u} onClick={() => upd((e) => e.duration.unit === u ? e : { ...e, duration: u === "weeks" ? { unit: u, value: Math.min(104, Math.max(1, Math.round(e.duration.value * 52 / 12))) } : { unit: u, value: Math.min(24, Math.max(1, Math.round(e.duration.value * 12 / 52))) } })} className={seg(easy.duration.unit === u)}>{L(pt[u])}</button>)}</div></div>
        <div className="space-y-1">
          <div className="flex flex-wrap items-end justify-between gap-2"><span className={lab}>{L(st.budget)}</span><span className="text-3xl font-semibold tracking-tight text-[#0b2a5b]" data-testid="budget-value"><AnimatedNumber value={easy.budget.amount} format={(n) => fmtMoney(Math.round(n), ccy, lang)} /></span></div>
          <SliderField label={L(st.budget)} value={easy.budget.amount} range={{ ...goalRange(ccy), min: goalRange(ccy).step, fine: ccy === "JPY" ? 10_000 : 100 }} format={(n) => fmtMoney(n, ccy, lang)} onChange={(n) => upd((e) => ({ ...e, budget: { ...e.budget, amount: n } }))} /></div>
      </section>

      {/* Level 2: everything else, one click away */}
      <section className={card}>
        <Disclosure level="row" open={extras} onOpenChange={setExtras} testid="extras" title={L(st.addConditions)} summary={L(st.addHint)}>
          <div className="space-y-6" data-testid="extras-body">
            <div className="space-y-3"><h3 className="text-sm font-semibold text-[#0b2a5b]">{L(st.stepRoute)}</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="space-y-1"><span className={lab}>{L(st.originCountry)}</span>
                  <select data-testid="origin-country" value={easy.origin.country} onChange={(e) => { const c = e.target.value; const first = airportsIn(c)[0]; upd((x) => ({ ...x, origin: { country: c, airport: first?.code ?? OTHER_AIRPORT, custom: "" } })); }} className={`${sel} w-full`}>{COUNTRIES.map((c) => <option key={c.code} value={c.code}>{L(c.name)}</option>)}</select></label>
                <label className="space-y-1"><span className={lab}>{L(st.originAirport)}</span>
                  <select data-testid="origin-airport" value={easy.origin.airport} onChange={(e) => upd((x) => ({ ...x, origin: { ...x.origin, airport: e.target.value } }))} className={`${sel} w-full`}>{airportsIn(easy.origin.country).map((a) => <option key={a.code} value={a.code}>{L(a.city)} {L(a.name)} ({a.code})</option>)}<option value={OTHER_AIRPORT}>{L(st.otherAirport)}</option></select></label>
                {easy.origin.airport === OTHER_AIRPORT && <label className="space-y-1 sm:col-span-2"><span className={lab}>{L(st.otherAirport)}</span>
                  <input data-testid="origin-custom" value={easy.origin.custom} maxLength={3} placeholder={L(st.iataHint)} onChange={(e) => upd((x) => ({ ...x, origin: { ...x.origin, custom: e.target.value.replace(/[^a-zA-Z]/g, "").toUpperCase() } }))} className={`${sel} w-32 uppercase`} aria-invalid={!isIata(easy.origin.custom)} />
                  {!isIata(easy.origin.custom) && <p className="text-xs text-amber-700">{L(st.iataInvalid)}</p>}</label>}
              </div>
              <p className="text-xs text-slate-500">{L(st.destAirport)}: {L(DESTINATIONS[easy.cityId].name)} ({DESTINATIONS[easy.cityId].code})</p>
              <div className="space-y-1"><span className={lab}>{L(st.month)}</span>
                <div role="group" aria-label={L(st.month)} className="flex flex-wrap gap-1.5">
                  <button type="button" data-testid="month-none" aria-pressed={easy.month === null} onClick={() => upd((e) => ({ ...e, month: null }))} className={seg(easy.month === null)}>{L(st.monthUndecided)}</button>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => <button key={m} type="button" data-testid={`month-${m}`} aria-pressed={easy.month === m} onClick={() => upd((e) => ({ ...e, month: m }))} className={seg(easy.month === m)}>{monthName(m, lang)}</button>)}</div></div>
            </div>

            <div className="space-y-2"><h3 className="text-sm font-semibold text-[#0b2a5b]">{L(st.stepHousing)}</h3>
              <div role="group" aria-label={L(st.stepHousing)} className="flex flex-wrap gap-1.5">
                <button type="button" data-testid="housing-any" aria-pressed={easy.housing === null} onClick={() => upd((e) => ({ ...e, housing: null }))} className={seg(easy.housing === null)}>{L(st.housingAny)}</button>
                {HOUSING_TYPES.map((h) => <button key={h} type="button" data-testid={`housing-${h}`} aria-pressed={easy.housing === h} onClick={() => upd((e) => ({ ...e, housing: h }))} className={seg(easy.housing === h)}>{L(pt[h])}</button>)}</div></div>

            <div className="space-y-3" id="rate-panel"><h3 className="text-sm font-semibold text-[#0b2a5b]">{L(st.budgetCurrency)}</h3>
              <label className="flex items-center gap-2 text-sm text-slate-600"><span className="sr-only">{L(st.budgetCurrency)}</span><select data-testid="budget-ccy" aria-label={L(st.budgetCurrency)} value={ccy} onChange={(e) => setBudgetCcy(e.target.value as Ccy)} className={sel}>{CURRENCIES.map((c) => <option key={c}>{c}</option>)}</select></label>
              {needRate.map((c) => {
                const r = easy.rates[c]; const rr = rateRange(c, ccy);
                return (
                  <div key={c} className="space-y-2 rounded-xl bg-amber-50/60 p-3 ring-1 ring-amber-100" data-testid={`rate-${c}`}>
                    <p className="text-sm font-medium text-slate-800">{L(st.rateTitle)}: {tpl(L(st.rateLine), { from: c, to: ccy, rate: r ? fmtNum(r.rate, lang) : "?" })}</p>
                    {!r && <p className="text-xs text-amber-900">{tpl(L(st.rateNeeded), { from: c, to: ccy })}</p>}
                    <SliderField label={`${L(st.rateTitle)} ${c}→${ccy}`} value={r?.rate ?? null} range={rr} format={(n) => fmtNum(n, lang)} onChange={(n) => setRateOf(c, n)} />
                    <div className="flex flex-wrap items-center gap-2"><label className="text-xs text-slate-600" htmlFor={`rate-in-${c}`}>{L(st.rateExact)}</label>
                      <input id={`rate-in-${c}`} type="number" inputMode="decimal" min={0} step="any" value={r?.rate ?? ""} onChange={(e) => setRateOf(c, e.target.value === "" ? null : Number(e.target.value))} className="w-28 rounded-lg border border-slate-300 px-2 py-1.5 text-sm" />
                      {r && <><span className="text-xs text-slate-500">{tpl(L(st.rateApprox), { date: r.date })}</span><button type="button" onClick={() => setRateOf(c, null)} className="text-xs text-slate-500 underline">{L(pt.clear)}</button></>}</div>
                  </div>);
              })}
            </div>

            <FlightPanel easy={easy} setEasy={upd} />

            <div className="space-y-3" data-testid="assume"><h3 className="text-sm font-semibold text-[#0b2a5b]">{L(st.assumeTitle)}</h3><p className="text-xs text-slate-500">{L(st.assumeLead)}</p>
              {ASSUME_ITEMS.map((k) => {
                const v = k === "tuition" ? easy.assume.tuitionWeek : easy.assume[k]; const r = rangeFor(k, k === "tuition" ? "week" : "once", cityCcy);
                const set = (n: number | null) => upd((e) => ({ ...e, assume: { ...e.assume, ...(k === "tuition" ? { tuitionWeek: n } : { [k]: n }) } }));
                const name = L(k === "tuition" ? st.assumeTuition : k === "visa" ? st.assumeVisa : st.assumeInsurance);
                return (
                  <div key={k} className="space-y-1" data-assume={k}><div className="flex items-end justify-between gap-2"><span className={lab}>{name}</span>
                    <span className="flex items-center gap-2"><span className="text-xl font-semibold tabular-nums text-slate-900">{v === null ? <span className="text-slate-300">{L(pt.notSet)}</span> : fmtMoney(v, cityCcy, lang)}</span>{v !== null && <button type="button" onClick={() => set(null)} className="text-xs text-slate-500 underline">{L(pt.clear)}</button>}</span></div>
                    <SliderField label={name} value={v} range={r} format={(n) => fmtMoney(n, cityCcy, lang)} onChange={set} /></div>);
              })}</div>

            <div className="flex flex-wrap items-center gap-2">
              {!isEmptyProfile(profile) && <button type="button" onClick={useProfile_} className="rounded-full bg-sky-50 px-4 py-2 text-xs font-medium text-sky-800 ring-1 ring-sky-100">{L(st.useProfile)}</button>}
              <button type="button" onClick={() => upd(() => defaultEasy())} className="rounded-full px-4 py-2 text-xs font-medium text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50">{L(st.reset)}</button>
              <span className="text-xs text-slate-400">{code && isIata(code) ? `${code} → ${DESTINATIONS[easy.cityId].code}` : ""}</span>
            </div>
          </div>
        </Disclosure>
      </section>

      {/* results */}
      <h2 id="results" className="scroll-mt-20 text-xl font-semibold text-[#0b2a5b]">{L(st.featuresTitle)}</h2>
      <div className={`grid gap-4 ${cols}`} data-testid="plans" data-count={groups.length}>
        {groups.map((g) => <PlanCard key={g.tiers[0]} g={g} easy={easy} saved={justSaved === g.tiers[0]} onSave={() => doSave(g)} onOpenAdvanced={() => onOpenAdvanced(g.plan.plan)} onSetRate={goRate} />)}
      </div>

      <SavedPanel store={saved} setStore={setSaved} onEdit={edit} onOpenAdvanced={(s) => onOpenAdvanced(s.plan)} onClearAll={clearSaved} />
    </div>
  );
}
