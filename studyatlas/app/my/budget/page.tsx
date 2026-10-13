"use client";
import { useEffect, useMemo, useState } from "react";
import { getSchool, isLanguage, listSchools, optionsOf } from "@/data/schools";
import { ITEM_IDS, calculate, cleanPlan, effective, newPlan, type Item, type ItemId, type Plan, type SchoolLink } from "@/lib/budget";
import { useI18n } from "@/lib/i18n";
import { CURRENCIES, durationToWeeks, fmt } from "@/lib/money";
import { usePersistentState } from "@/lib/persist";
import { useProfile } from "@/lib/useProfile";
import { panel, pill, pillOff } from "@/lib/ui";
import { my } from "@/locales/my";
import MyNav from "@/components/MyNav";
import { Field, NumberInput, Select, inputCls } from "@/components/form";
import { StatusBadge } from "@/components/FactView";

const today = () => new Date().toISOString().slice(0, 10);

export default function BudgetPage() {
  const { L, lang } = useI18n();
  const [profile] = useProfile();
  const [plan, setPlan, { loaded }] = usePersistentState<Plan>("studyatlas.budget", newPlan(), cleanPlan);
  const [showSamples] = usePersistentState("studyatlas.schools.samples", false, (v) => (typeof v === "boolean" ? v : undefined));
  const profileWeeks = profile.duration.value ? Math.round(durationToWeeks(profile.duration.value, profile.duration.unit)) : null;
  // First visit: start from the profile's length of stay and currency
  const [seeded, setSeeded] = useState(false);
  useEffect(() => { if (loaded && !seeded) { setSeeded(true); if (plan.weeks === null && profileWeeks) setPlan((p) => ({ ...p, weeks: profileWeeks })); } }, [loaded, seeded, plan.weeks, profileWeeks, setPlan]);

  const result = useMemo(() => calculate(plan), [plan]);
  const setItem = (id: ItemId, patch: Partial<Item>) => setPlan((p) => ({ ...p, items: { ...p.items, [id]: { ...p.items[id], ...patch } } }));
  const budgetCcy = profile.budget.currency;
  // Currencies that need a manual rate: every item's currency (percent items are already in the display currency) and the target budget's
  const foreign = [...new Set([...ITEM_IDS.filter((id) => plan.items[id].per !== "percent").map((id) => effective(plan.items[id]).currency), ...(profile.budget.amount !== null ? [budgetCcy] : [])])].filter((c) => c !== plan.displayCurrency);
  const budgetInDisplay = profile.budget.amount === null ? null : budgetCcy === plan.displayCurrency ? profile.budget.amount : plan.rates[budgetCcy]?.rate ? profile.budget.amount * plan.rates[budgetCcy].rate : undefined;
  const ccy = CURRENCIES.map((c) => ({ value: c, label: c }));
  const money = (v: number, c = plan.displayCurrency) => fmt(v, c, lang);

  return (
    <div className="space-y-6">
      <MyNav />
      <div><h1 className="text-3xl font-bold text-[#0b2a5b]">{L(my.budgetTitle)}</h1><p className="mt-1 max-w-3xl text-sm text-slate-500">{L(my.budgetIntro)}</p></div>

      <section className={`grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3 ${panel}`}>
        <Field label={L(my.weeks)} htmlFor="weeks">
          <div className="flex gap-2"><NumberInput id="weeks" value={plan.weeks} onChange={(v) => setPlan((p) => ({ ...p, weeks: v }))} min={1} step="1" className="min-w-0 flex-1" />
            {profileWeeks && profileWeeks !== plan.weeks && <button type="button" onClick={() => setPlan((p) => ({ ...p, weeks: profileWeeks }))} className={`${pill} ${pillOff} whitespace-nowrap`}>{L(my.fromProfile)} ({profileWeeks})</button>}</div>
        </Field>
        <Field label={L(my.currency)} htmlFor="display"><Select id="display" value={plan.displayCurrency} onChange={(v) => setPlan((p) => ({ ...p, displayCurrency: v, items: { ...p.items, contingency: { ...p.items.contingency, currency: p.items.contingency.per === "percent" ? v : p.items.contingency.currency } } }))} options={ccy} /></Field>
        <SchoolLinker showSamples={showSamples} onLink={(links) => setPlan((p) => { const items = { ...p.items }; for (const [id, link] of links) items[id] = { ...items[id], link }; return { ...p, items }; })} />
      </section>

      <section className={`divide-y divide-slate-100 ${panel}`}>
        {ITEM_IDS.map((id) => {
          const it = plan.items[id]; const e = effective(it); const r = result.items[id];
          return (
            <div key={id} data-item={id} className="grid gap-2 p-4 md:grid-cols-[10rem_1fr_15rem] md:items-center">
              <div className="font-medium text-slate-700">{L(my.items[id])}</div>
              {it.link ? (
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <span className="text-slate-500">{L(my.linked)} {getSchool(it.link.schoolId)?.name}</span>
                  {e.status && <StatusBadge status={e.status} />}
                  {e.amount !== null && <span className="text-slate-700">{e.amount.toLocaleString()} {e.currency} · {L(my.per[e.per as keyof typeof my.per])}</span>}
                  <button type="button" onClick={() => setItem(id, { link: undefined, amount: e.amount, currency: e.currency, per: e.per })} className="text-xs text-slate-500 underline">{L(my.unlink)}</button>
                  {r.termOrCourse && <p className="w-full text-[11px] text-amber-700">{L(my.termOrCourseNote)}</p>}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-[1fr_6rem_9rem]">
                  <NumberInput className="col-span-2 sm:col-span-1" label={`${L(my.items[id])} ${L(my.amount)}`} value={it.amount} onChange={(v) => setItem(id, { amount: v })} placeholder={L(my.state.missing)} />
                  <select aria-label={`${L(my.items[id])} ${L(my.cur)}`} value={it.per === "percent" ? "%" : it.currency} disabled={it.per === "percent"} onChange={(ev) => setItem(id, { currency: ev.target.value })} className={inputCls}>{it.per === "percent" ? <option>%</option> : CURRENCIES.map((c) => <option key={c}>{c}</option>)}</select>
                  <select aria-label={`${L(my.items[id])} ${L(my.unit)}`} value={it.per} onChange={(ev) => setItem(id, { per: ev.target.value as Item["per"], currency: ev.target.value === "percent" ? plan.displayCurrency : it.currency })} className={inputCls}>
                    {(["week", "month", "year", "once", ...(id === "contingency" ? ["percent"] : [])] as const).map((u) => <option key={u} value={u}>{L(my.per[u as keyof typeof my.per])}</option>)}
                  </select>
                </div>
              )}
              <div className="text-sm md:text-right" data-state={r.state}>
                {r.state === "ok" ? <><div className="font-semibold text-slate-800">{money(r.converted)}</div>{r.currency !== plan.displayCurrency && <div className="text-xs text-slate-400">{money(r.original, r.currency)}</div>}</>
                  : <span className={r.state === "missing" ? "text-slate-400" : "text-amber-700"}>{L(my.state[r.state])}</span>}
              </div>
            </div>
          );
        })}
      </section>

      {foreign.length > 0 && (
        <section className={`space-y-3 p-5 ${panel}`}>
          <h2 className="font-semibold text-slate-800">{L(my.rates)}</h2><p className="text-xs text-slate-500">{L(my.ratesHelp)}</p>
          {foreign.map((c) => { const r = plan.rates[c]; return (
            <div key={c} className="flex flex-wrap items-center gap-2 text-sm" data-rate={c}>
              <span className="w-16 font-medium">1 {c} =</span>
              <NumberInput label={`1 ${c} = ? ${plan.displayCurrency}`} value={r?.rate ?? null} onChange={(v) => setPlan((p) => { const rates = { ...p.rates }; if (v === null) delete rates[c]; else rates[c] = { rate: v, date: p.rates[c]?.date ?? today() }; return { ...p, rates }; })} className="!w-36" />
              <span>{plan.displayCurrency}</span>
              <label className="ml-2 flex items-center gap-2 text-xs text-slate-500">{L(my.rateDate)}<input type="date" value={r?.date ?? ""} disabled={!r} onChange={(ev) => setPlan((p) => ({ ...p, rates: { ...p.rates, [c]: { ...p.rates[c], date: ev.target.value } } }))} className={`${inputCls} !w-40`} /></label>
            </div>); })}
        </section>
      )}

      <section className="rounded-2xl bg-[#0b2a5b] p-5 text-white sm:p-6" aria-live="polite">
        <p className="text-sm text-white/70">{L(result.complete ? my.total : my.partial)}{plan.weeks ? ` · ${plan.weeks} ${L(my.units.weeks)}` : ""}</p>
        <p className="mt-1 text-3xl font-bold" data-testid="total">{money(result.total)}</p>
        {result.complete ? <p className="mt-2 text-sm text-white/80">{L(my.complete)}</p> : (
          <div className="mt-3 rounded-xl bg-white/10 p-3 text-sm" data-testid="incomplete"><p>{L(my.incomplete)}</p><p className="mt-1 text-white/80">{result.missing.map((id) => L(my.items[id])).join("、")}</p></div>
        )}
        {result.usedRates.length > 0 && <p className="mt-3 text-xs text-white/70">{L(my.ratesUsed)}: {result.usedRates.map((c) => `1 ${c} = ${plan.rates[c].rate} ${plan.displayCurrency} (${plan.rates[c].date})`).join(" / ")}</p>}
        {profile.budget.amount !== null && (
          <div className="mt-3 border-t border-white/20 pt-3 text-sm">
            <span className="text-white/70">{L(my.vsBudget)}: {money(profile.budget.amount, budgetCcy)} — </span>
            {budgetInDisplay === undefined ? <span>{L(my.budgetCurrencyDiff)}</span> : !result.complete ? <span>{L(my.cantCompareBudget)}</span>
              : <span className="font-semibold">{result.total > budgetInDisplay! ? `${money(result.total - budgetInDisplay!)} ${L(my.over)}` : `${money(budgetInDisplay! - result.total)} ${L(my.under)}`}</span>}
          </div>
        )}
      </section>
      <button type="button" onClick={() => { if (window.confirm(L(my.confirmClear))) setPlan(newPlan(plan.displayCurrency, plan.weeks)); }} className={`${pill} ${pillOff}`}>{L(my.clearPlan)}</button>
    </div>
  );
}

function SchoolLinker({ showSamples, onLink }: { showSamples: boolean; onLink: (links: [ItemId, SchoolLink][]) => void }) {
  const { L } = useI18n();
  const schools = [...listSchools("language", { includeSamples: showSamples }), ...listSchools("university", { includeSamples: showSamples })].filter((s) => optionsOf(s).length > 0);
  const [schoolId, setSchoolId] = useState(""); const [optionId, setOptionId] = useState("");
  const sc = schools.find((s) => s.id === schoolId);
  const apply = () => {
    if (!sc || !optionId) return;
    onLink(isLanguage(sc)
      ? [["tuition", { schoolId, optionId, field: "tuition" }], ["registration", { schoolId, optionId, field: "registrationFee" }], ["materials", { schoolId, optionId, field: "materialsFee" }]]
      : [["tuition", { schoolId, optionId, field: "tuitionInternational" }]]);
  };
  return (
    <div className="space-y-1 sm:col-span-2 lg:col-span-1">
      <p className="text-sm font-medium text-slate-700">{L(my.linkSchool)}</p>
      {schools.length === 0 ? <p className="text-xs text-slate-400">{L(my.sampleSchoolsOff)}</p> : (
        <div className="flex flex-wrap gap-2">
          <Select value={schoolId} onChange={(v) => { setSchoolId(v); const s = schools.find((x) => x.id === v); setOptionId(s ? optionsOf(s)[0]?.id ?? "" : ""); }} options={schools.map((s) => ({ value: s.id, label: s.name }))} placeholder={L(my.school)} className="min-w-0 flex-1" />
          {sc && <Select value={optionId} onChange={setOptionId} options={optionsOf(sc).map((o) => ({ value: o.id, label: L(o.label) }))} className="min-w-0 flex-1" />}
          <button type="button" disabled={!sc || !optionId} onClick={apply} className={`${pill} bg-sky-100 text-sky-800 hover:bg-sky-200 disabled:opacity-40`}>{L(my.apply)}</button>
        </div>
      )}
      <p className="text-[11px] text-slate-400">{L(my.linkHelp)}</p>
    </div>
  );
}
