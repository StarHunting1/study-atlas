"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { usePersistentState } from "@/lib/persist";
import { useProfile } from "@/lib/useProfile";
import { ONE_OFF, PLANS_KEY, RECURRING, activePlan, calcPlan, cleanStore, emptyStore, importPlan, updatePlan, type Plan, type Store } from "@/lib/planner";
import { pt } from "@/locales/planner";
import { st } from "@/locales/smart";
import EasyMode from "@/components/planner/easy/EasyMode";
import AnimatedNumber from "@/components/planner/AnimatedNumber";
import ComparePlans from "@/components/planner/ComparePlans";
import FxPanel from "@/components/planner/FxPanel";
import ItemCard from "@/components/planner/ItemCard";
import PlansBar from "@/components/planner/PlansBar";
import ResultsPanel from "@/components/planner/ResultsPanel";
import SetupCard from "@/components/planner/SetupCard";
import { fmtRound, tpl } from "@/components/planner/format";

type Mode = "easy" | "advanced";
export default function PlannerPage() {
  const { L, lang } = useI18n(); const [profile] = useProfile(); const [mode, setMode] = useState<Mode>("easy");
  // Deep link: /planner#advanced
  useEffect(() => { if (window.location.hash === "#advanced") setMode("advanced"); }, []);
  const go = (m: Mode) => { setMode(m); history.replaceState(null, "", m === "advanced" ? "#advanced" : window.location.pathname); window.scrollTo({ top: 0 }); };
  const [store, setStore, { loaded, remove }] = usePersistentState<Store>(PLANS_KEY, emptyStore(), cleanStore, (s) => s.plans.length > 0);
  const plan = activePlan(store);
  const setPlan = (f: (p: Plan) => Plan) => setStore((s) => { const p = activePlan(s); return p ? updatePlan(s, f(p)) : s; });
  const c = plan ? calcPlan(plan) : null; const any = c && Object.keys(c.total.byCurrency).length > 0;
  return (
    <div className="mx-auto max-w-3xl space-y-5 pb-28">
      <Link href="/my" className="text-sm text-slate-500 hover:text-slate-900">← {L({ en: "My Study", ja: "マイ留学" })}</Link>
      <header className="space-y-2"><h1 className="text-3xl font-bold tracking-tight text-[#0b2a5b] sm:text-4xl">{L(mode === "easy" ? st.title : pt.title)}</h1><p className="text-sm leading-relaxed text-slate-600">{L(mode === "easy" ? st.leadShort : st.advancedHint)}</p><p className="text-xs text-slate-500">🔒 {L(st.privacy)}</p>
        <div role="group" aria-label={L(st.modeLabel)} className="inline-flex gap-1 rounded-full bg-slate-50 p-1 ring-1 ring-slate-200">
          {(["easy", "advanced"] as const).map((m) => <button key={m} type="button" data-testid={`mode-${m}`} aria-pressed={mode === m} onClick={() => go(m)} className={`rounded-full px-5 py-2 text-sm font-medium transition ${mode === m ? "bg-[#0b2a5b] text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"}`}>{L(m === "easy" ? st.modeEasy : st.modeAdvanced)}</button>)}
        </div></header>
      {mode === "easy" && <EasyMode onOpenAdvanced={(p) => { setStore((s) => importPlan(s, p)); go("advanced"); }} />}

      {mode === "advanced" && (!loaded ? <div className="h-40 animate-pulse rounded-2xl bg-slate-100" aria-hidden /> : <>
        <PlansBar store={store} setStore={setStore} profile={profile} onClearAll={remove} />
        {!plan ? (
          <section className="rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-200"><h2 className="text-xl font-semibold text-[#0b2a5b]">{L(pt.emptyTitle)}</h2><p className="mt-2 text-sm text-slate-500">{L(pt.emptyText)}</p></section>
        ) : <>
          <SetupCard plan={plan} setPlan={setPlan} />
          <h2 className="pt-2 text-lg font-semibold text-[#0b2a5b]">{L(pt.recurring)}</h2>
          <div className="space-y-4">{RECURRING.map((id) => <ItemCard key={id} id={id} plan={plan} setPlan={setPlan} />)}</div>
          <h2 className="pt-2 text-lg font-semibold text-[#0b2a5b]">{L(pt.initial)}</h2>
          <div className="space-y-4">{ONE_OFF.map((id) => <ItemCard key={id} id={id} plan={plan} setPlan={setPlan} />)}</div>
          <FxPanel plan={plan} setPlan={setPlan} />
          <ResultsPanel plan={plan} />
          <ComparePlans store={store} setStore={setStore} />
        </>}
      </>)}

      {/* always visible: the total follows every slider move */}
      {mode === "advanced" && plan && c && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur" data-testid="sticky-total">
          <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-2.5">
            <div className="min-w-0"><p className="truncate text-[11px] text-slate-500">{L(pt.total)}{(!c.complete || c.missingRates.length > 0) && any ? ` · ${tpl(L(pt.nUnset), { n: c.unset.length })}` : ""}</p>
              <p className="text-xl font-semibold text-[#0b2a5b]">{any ? <AnimatedNumber value={c.total.converted} format={(n) => fmtRound(n, plan.displayCurrency, lang)} /> : "—"}</p></div>
            <a href="#results" className="shrink-0 rounded-full bg-[#0b2a5b] px-4 py-2 text-sm font-medium text-white">{L(pt.jump)}</a>
          </div>
        </div>
      )}
    </div>
  );
}
