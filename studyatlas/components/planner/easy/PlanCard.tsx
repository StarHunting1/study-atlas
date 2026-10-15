"use client";
import { useI18n } from "@/lib/i18n";
import { ITEM_IDS, stayWeeks, type ItemId } from "@/lib/planner";
import { MAIN_ITEMS, headroom, type Easy, type PlanGroup, type Suggestion, type Why } from "@/lib/smart";
import { validForShort } from "@/data/official/validFor";
import Disclosure from "@/components/Disclosure";
import { pt } from "@/locales/planner";
import { st } from "@/locales/smart";
import AnimatedNumber from "../AnimatedNumber";
import { fmtMoney, fmtNum, fmtRound, tpl } from "../format";
import { fmtSum } from "./helpers";

/**
 * Plan card. Level 1: name, one-line character, counted total, difference to the budget (when it can be judged) and the
 * provisional mark. Level 2 "費用の内訳を見る": breakdown, suggestions, notes. Level 3 "計算根拠・出典を見る": every item's source and conditions.
 */
export default function PlanCard({ g, easy, onSave, onOpenAdvanced, onSetRate, onEnter, saved }: { g: PlanGroup; easy: Easy; onSave: () => void; onOpenAdvanced: () => void; onSetRate: () => void; /** open the "known costs" inputs */ onEnter?: () => void; saved?: boolean }) {
  const { L, lang } = useI18n(); const sp = g.plan; const ccy = easy.budget.currency; const c = sp.calc; const weeks = stayWeeks(sp.plan);
  const any = Object.keys(c.total.byCurrency).length > 0; const names = (ids: readonly ItemId[]) => ids.map((i) => L(pt.items[i])).join(lang === "ja" ? "、" : ", ");
  const diff = sp.remaining; const head = headroom(sp, weeks); const monthlyUnconv = Object.keys(c.living.unconverted).length > 0; const money = (n: number) => fmtRound(n, ccy, lang);
  const title = g.tiers.map((t) => L(st.tiers[t]).split("（")[0]).join(" / "); const over = sp.verdict === "over" || sp.verdict === "overAlready";
  const sug = (s: Suggestion) => s.kind === "duration" ? tpl(L(st.suggest.duration), { weeks: s.weeks, saving: s.saving === null ? "" : money(s.saving) }) : s.kind === "durationNotEnough" ? L(st.suggest.durationNotEnough) : tpl(L(st.suggest.housing), { housing: L(pt[s.housing]), saving: money(s.saving) });
  const why = (w?: Why) => L(st.why[w ?? "noVerified"]); const key = g.tiers[0];
  return (
    <article data-testid={`plan-${key}`} data-tiers={g.tiers.join(",")} className="flex flex-col gap-3 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <header className="space-y-1">
        <div className="flex flex-wrap items-center justify-between gap-2"><h3 className="text-lg font-semibold text-[#0b2a5b]">{title}</h3>
          {sp.provisional && <span data-testid={`prov-${key}`} className="rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-medium text-amber-800 ring-1 ring-amber-200">{L(st.provisional)}</span>}</div>
        <p className="text-sm text-slate-500">{g.tiers.map((t) => L(st.feature[t])).join(" · ")}</p>
        {g.tiers.length > 1 && <p className="text-[11px] text-slate-400">{L(st.merged)}</p>}
      </header>

      <div>
        <p className="text-xs text-slate-500">{sp.provisional ? L(st.countedSoFar) : L(st.estimate)}</p>
        <p className="text-3xl font-semibold tracking-tight text-[#0b2a5b]" data-testid={`total-${key}`}>{!any ? "—" : Object.keys(c.total.unconverted).length ? fmtSum(c.total, ccy, lang) : <AnimatedNumber value={c.total.converted} format={(n) => fmtRound(n, ccy, lang)} />}</p>
        {sp.provisional && sp.mainMissing.length > 0 && <p className="mt-1 text-xs text-amber-800" data-testid={`missing-${key}`}>{tpl(L(st.missingMain), { items: names(sp.mainMissing) })}</p>}
        {sp.provisional && onEnter && <button type="button" onClick={onEnter} data-testid={`enter-${key}`} className="mt-1.5 min-h-[40px] rounded-full bg-amber-50 px-4 text-xs font-medium text-amber-900 ring-1 ring-amber-200 hover:bg-amber-100">{L(st.enterCosts)}</button>}
      </div>

      <div data-testid={`verdict-${key}`} data-verdict={sp.verdict} className="min-h-[1.5rem] text-sm">
        {sp.verdict === "needsRate" ? <p className="text-amber-800">{L(st.rateShort)} <button type="button" onClick={onSetRate} className="font-medium underline">{L(st.setRate)}</button></p>
          : diff === null ? null
          : over ? <p className="font-semibold text-rose-700" data-testid={`diff-${key}`}>{L(st.overShort)} −{money(-diff)}</p>
          : <div><p className={`font-medium ${sp.provisional ? "text-slate-600" : "text-emerald-700"}`} data-testid={`diff-${key}`}>{sp.provisional ? L(st.leftAfter) : L(st.vsBudget)}: +{money(diff)}</p>{sp.provisional && <p className="mt-0.5 text-[11px] leading-snug text-slate-500" data-testid={`provnote-${key}`}>{L(st.provBalNote)}</p>}</div>}
      </div>

      <Disclosure level="more" label={L(st.breakdown)} testid={`breakdown-${key}`}>
        <div className="space-y-3">
          <p className="text-[11px] text-slate-500" data-testid={`units-${key}`}>{tpl(L(st.unitsLegend), { weeks: fmtNum(Math.round(weeks * 10) / 10, lang) })}</p>
          <div data-testid={`status-${key}`}><p className="mb-1 text-xs font-semibold text-slate-600">{L(st.statusTitle)}</p>
            <ul className="grid gap-1 sm:grid-cols-2">{MAIN_ITEMS.map((id) => { const p = sp.picks[id]; return (
              <li key={id} data-status-item={id} data-status={p.status} className="flex items-center justify-between gap-2 rounded-lg bg-slate-50 px-2.5 py-1.5 text-xs"><span className="text-slate-700">{L(pt.items[id])}</span>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${p.status === "official" ? "bg-sky-50 text-sky-700" : p.status === "assumption" ? "bg-emerald-50 text-emerald-700" : "bg-white text-slate-400 ring-1 ring-dashed ring-slate-300"}`}>{p.status === "official" ? L(st.statusOfficial) : p.status === "assumption" ? L(st.statusManual) : L(st.statusNone)}</span></li>); })}</ul></div>
          <dl className="divide-y divide-slate-100 text-sm">
            {([["monthly", L(st.monthlyLiving), c.monthlyLiving ? (monthlyUnconv ? Object.entries(c.monthlyLiving.byCurrency).map(([k, v]) => fmtRound(v!, k as typeof ccy, lang)).join(" + ") : money(c.monthlyLiving.converted)) : "—"],
              ["tuition", L(st.tuition), fmtSum(c.groups.tuition, ccy, lang)], ["housing", L(st.housing), fmtSum(c.groups.housing, ccy, lang)], ["flights", L(st.flights), fmtSum(sp.flights, ccy, lang)], ["initial", L(st.otherInitial), fmtSum(sp.initialOther, ccy, lang)]] as const).map(([k, label, v]) => (
              <div key={k} className="flex items-baseline justify-between gap-3 py-1.5" data-row={k}><dt className="text-slate-500">{label}</dt><dd className={`tabular-nums ${v === "—" ? "text-slate-300" : "font-medium text-slate-800"}`}>{v === "—" ? L(st.notCounted) : v}</dd></div>))}
            <div className="flex items-baseline justify-between gap-3 py-1.5"><dt className="text-slate-500">{sp.provisional ? L(st.diffProv) : L(st.vsBudget)} ({money(easy.budget.amount)})</dt><dd className={`font-semibold tabular-nums ${diff === null ? "text-slate-300" : diff >= 0 ? "text-emerald-700" : "text-rose-700"}`}>{diff === null ? "—" : diff >= 0 ? `+${money(diff)}` : `−${money(-diff)}`}</dd></div>
          </dl>
          {head && sp.provisional && <p className="text-xs text-slate-600">{tpl(L(st.headroom), { perWeek: money(head.perWeek), total: money(head.total) })}</p>}
          {sp.suggestions.length > 0 && <div className="space-y-1 rounded-xl bg-slate-50 p-3 text-xs text-slate-700" data-testid={`suggest-${key}`}><p className="font-semibold">{L(st.suggestTitle)}</p><ul className="list-disc space-y-1 pl-4">{sp.suggestions.map((s, i) => <li key={i}>{sug(s)}</li>)}</ul></div>}
          {sp.notes.length > 0 && <ul className="space-y-1 text-xs text-slate-600" data-testid={`notes-${key}`}>{sp.notes.map((n, i) => <li key={i}>ℹ️ {tpl(L(st.notes[n.code]), { items: n.items ? names(n.items) : "" })}</li>)}</ul>}
          <Disclosure level="sources" label={L(st.basisBtn)} testid={`basis-btn-${key}`}>
            <ul className="divide-y divide-slate-100 text-xs" data-testid={`basis-${key}`}>
              {[...MAIN_ITEMS, ...ITEM_IDS.filter((i) => !MAIN_ITEMS.includes(i))].map((id) => {
                const p = sp.picks[id]; const it = sp.plan.items[id]; const r = c.items[id]; const o = it.source.kind === "official" ? it.source : null;
                return (
                  <li key={id} className="space-y-0.5 py-2" data-basis={id}>
                    <div className="flex flex-wrap items-center justify-between gap-2"><span className="font-medium text-slate-700">{L(pt.items[id])}</span>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${p.status === "official" ? "bg-sky-50 text-sky-700" : p.status === "assumption" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>{p.status === "official" ? L(st.badgeOfficial) : p.status === "assumption" ? L(st.badgeAssumption) : L(st.badgeUnset)}</span></div>
                    {r.state === "ok" ? <p className="tabular-nums text-slate-600">{fmtMoney(r.rate, r.currency, lang)}{r.per === "once" ? "" : ` / ${L(pt.per[r.per])}`} {r.per === "once" ? "" : `× ${fmtNum(r.qty, lang)}`} = <b>{fmtMoney(r.total, r.currency, lang)}</b></p> : <p className="text-slate-400">{why(p.why)}</p>}
                    {o && <p className="text-slate-500">{L(st.sourceLabel)}: {o.url ? <a href={o.url} target="_blank" rel="noopener noreferrer" className="text-sky-700 underline">{o.label}</a> : o.label} · {L(st.validFor)}: {validForShort(o.validFor ?? "", lang)}</p>}
                    {p.cand && <p className="text-slate-500">{L(p.cand.label)} · {L(st.whoFor)}: {L(p.cand.audience)}</p>}
                    {p.cand?.caution && <p className="text-amber-700">⚠ {L(p.cand.caution)}</p>}
                    {p.cand?.termsUnconfirmed && <p className="text-slate-400">{L(st.termsUnconfirmed)}</p>}
                  </li>
                );
              })}
            </ul>
            {sp.excluded.length > 0 && <div className="mt-2 border-t border-slate-100 pt-2 text-xs text-slate-500"><p className="font-medium">{L(st.excludedTitle)}</p><ul className="mt-1 list-disc space-y-0.5 pl-4">{sp.excluded.map((e, i) => <li key={i}>{tpl(L(st.excluded[e.kind]), { label: L(e.cand.label), weeks: e.cand.coverageWeeks ?? "", stay: fmtNum(weeks, lang) })}</li>)}</ul></div>}
            <p className="mt-2 text-[11px] text-slate-400">{L(st.rule)} {L(st.rangeNote)}</p>
            <p className="text-[11px] text-slate-500">{tpl(L(st.completeness), { n: sp.setCount, m: ITEM_IDS.length })}</p>
          </Disclosure>
        </div>
      </Disclosure>

      <div className="mt-auto flex flex-wrap gap-2 pt-1">
        <button type="button" data-testid={`save-${key}`} onClick={onSave} className="min-h-[40px] rounded-full bg-[#0b2a5b] px-4 text-sm font-medium text-white hover:bg-[#12397a]">{saved ? `✓ ${L(st.savedOk)}` : L(st.save)}</button>
        <button type="button" data-testid={`adv-${key}`} onClick={onOpenAdvanced} className="min-h-[40px] rounded-full px-4 text-sm font-medium text-[#0b2a5b] ring-1 ring-slate-300 hover:bg-slate-50">{L(st.openAdvanced)}</button>
      </div>
    </article>
  );
}
