"use client";
import { useI18n } from "@/lib/i18n";
import { GROUPS, ITEM_IDS, calcPlan, type Ccy, type GroupId, type Money, type Plan } from "@/lib/planner";
import { pt } from "@/locales/planner";
import AnimatedNumber from "./AnimatedNumber";
import { fmtMoney, fmtNum, fmtRound, tpl } from "./format";

/** Validated 8-slot categorical palette, in its fixed order (adjacent colours stay distinguishable, also for colour-blind viewers). */
export const GROUP_COLORS: Record<GroupId, string> = { tuition: "#2a78d6", housing: "#eb6834", food: "#1baf7a", transport: "#eda100", phone: "#e87ba4", leisure: "#008300", otherLiving: "#6250d6", initial: "#e34948" };

const byCcyText = (m: Record<string, number | undefined>, lang: string) => Object.entries(m).filter(([, v]) => v !== undefined).map(([c, v]) => fmtRound(v!, c as Ccy, lang)).join(" + ");

function Stat({ label, money, plan, note, id }: { label: string; money: Money | null; plan: Plan; note?: string; id: string }) {
  const { lang } = useI18n(); const has = money && Object.keys(money.byCurrency).length > 0;
  return (
    <div className="rounded-2xl bg-slate-50 p-4" data-stat={id}>
      <p className="text-xs font-medium text-slate-500">{label}</p>
      {has ? <><p className="mt-1 text-2xl font-semibold text-slate-900"><AnimatedNumber value={money!.converted} format={(n) => fmtRound(n, plan.displayCurrency, lang)} /></p>
        {Object.keys(money!.unconverted).length > 0 && <p className="mt-0.5 text-[11px] text-amber-700">+ {byCcyText(money!.unconverted, lang)} ✕</p>}</> : <p className="mt-1 text-2xl font-semibold text-slate-300">—</p>}
      {note && <p className="mt-1 text-[11px] text-slate-400">{note}</p>}
    </div>
  );
}

export default function ResultsPanel({ plan }: { plan: Plan }) {
  const { L, lang } = useI18n(); const c = calcPlan(plan); const dc = plan.displayCurrency;
  const any = Object.keys(c.total.byCurrency).length > 0; const partial = !c.complete || c.missingRates.length > 0;
  const seg = GROUPS.map((g) => ({ g, v: c.groups[g].converted, has: Object.keys(c.groups[g].byCurrency).length > 0 })).filter((s) => s.v > 0);
  const sum = seg.reduce((a, s) => a + s.v, 0);
  const goal = c.goal;
  return (
    <section id="results" aria-labelledby="results-h" className="space-y-5 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:p-6">
      <h2 id="results-h" className="text-lg font-semibold text-[#0b2a5b]">{L(pt.results)}</h2>

      <div className="rounded-2xl bg-[#0b2a5b] p-5 text-white">
        <p className="text-sm text-white/80">{partial && any ? L(pt.totalPartial) : L(pt.total)}</p>
        <p className="mt-1 text-4xl font-semibold tracking-tight sm:text-5xl" data-testid="total">{any ? <AnimatedNumber value={c.total.converted} format={(n) => fmtRound(n, dc, lang)} /> : "—"}</p>
        <p className="mt-2 text-xs text-white/70">{tpl(L(pt.stayIs), { w: fmtNum(c.weeks, lang), m: fmtNum(c.months, lang) })}</p>
        {Object.keys(c.total.byCurrency).length > 1 || (Object.keys(c.total.byCurrency)[0] && Object.keys(c.total.byCurrency)[0] !== dc) ? <p className="mt-1 text-xs text-white/70">{L(pt.perCurrency)}: {byCcyText(c.total.byCurrency, lang)}</p> : null}
        <div className="mt-3 border-t border-white/15 pt-3 text-sm" data-testid="goal">
          {!goal ? <span className="text-white/70">{L(pt.goalNone)}</span> : goal.state === "noRate" ? <span className="text-amber-200">{L(pt.goalNoRate)}</span> :
            goal.state === "equal" ? <span>{L(pt.equal)}</span> :
            <span className={goal.state === "over" ? "text-rose-200" : "text-emerald-200"}>{tpl(L(goal.state === "over" ? pt.over : pt.under), { x: fmtRound(Math.abs(goal.diff!), goal.currency, lang) })}</span>}
        </div>
      </div>

      {Object.keys(c.total.unconverted).length > 0 && (
        <p role="status" className="rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-900">{tpl(L(pt.fxMissing), { c: c.missingRates.join(", ") })} {byCcyText(c.total.unconverted, lang)}. {L(pt.fxSetRate)}</p>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat id="monthly" label={L(pt.monthly)} money={c.monthlyLiving ? { byCurrency: c.monthlyLiving.byCurrency, converted: c.monthlyLiving.converted, unconverted: Object.fromEntries(Object.entries(c.living.unconverted).map(([k, v]) => [k, v! / c.months])) } : null} plan={plan} note={L(pt.monthlyNote)} />
        <Stat id="tuition" label={L(pt.tuitionTotal)} money={c.groups.tuition} plan={plan} />
        <Stat id="housing" label={L(pt.housingTotal)} money={c.groups.housing} plan={plan} />
        <Stat id="initial" label={L(pt.initialTotal)} money={c.groups.initial} plan={plan} />
      </div>

      {/* breakdown */}
      <div>
        <h3 className="mb-2 text-sm font-semibold text-slate-700">{L(pt.breakdown)}</h3>
        {sum > 0 ? <>
          <div role="img" aria-label={seg.map((s) => `${L(pt.groups[s.g])} ${Math.round((s.v / sum) * 100)}%`).join(", ")} className="flex h-8 gap-[2px] overflow-hidden rounded-lg" data-testid="bar">
            {seg.map((s) => <div key={s.g} title={`${L(pt.groups[s.g])}: ${fmtRound(s.v, dc, lang)}`} style={{ flexGrow: s.v, flexBasis: 0, backgroundColor: GROUP_COLORS[s.g], transition: "flex-grow .35s ease" }} className="first:rounded-l-md last:rounded-r-md" />)}
          </div>
          <ul className="mt-3 grid gap-x-6 gap-y-1.5 sm:grid-cols-2">
            {seg.map((s) => (
              <li key={s.g} className="flex items-center justify-between gap-3 text-sm"><span className="flex items-center gap-2 text-slate-700"><span aria-hidden className="inline-block h-3 w-3 rounded-sm" style={{ backgroundColor: GROUP_COLORS[s.g] }} />{L(pt.groups[s.g])}</span>
                <span className="tabular-nums text-slate-900">{fmtRound(s.v, dc, lang)} <span className="text-xs text-slate-400">{Math.round((s.v / sum) * 100)}%</span></span></li>))}
          </ul></> : <p className="text-sm text-slate-400">{L(pt.breakdownNone)}</p>}
      </div>

      {/* what is missing */}
      <div className="rounded-2xl bg-slate-50 p-4" data-testid="unaccounted">
        <h3 className="text-sm font-semibold text-slate-700">{L(pt.unaccounted)}</h3>
        {c.unset.length ? <><p className="mt-1 text-xs text-slate-500">{L(pt.unaccountedNote)}</p><ul className="mt-2 flex flex-wrap gap-1.5">{c.unset.map((id) => <li key={id} className="rounded-full bg-white px-3 py-1 text-xs text-slate-600 ring-1 ring-slate-200">{L(pt.items[id])}</li>)}</ul></> : <p className="mt-1 text-xs text-emerald-700">{L(pt.unaccountedNone)}</p>}
      </div>

      {/* official vs own */}
      <div>
        <h3 className="mb-2 text-sm font-semibold text-slate-700">{L(pt.sources)}</h3>
        <div className="flex flex-wrap gap-2 text-xs" data-testid="sources">
          <span className="rounded-full bg-sky-50 px-3 py-1 text-sky-700 ring-1 ring-sky-100">{tpl(L(pt.nOfficial), { n: c.sources.official })}</span>
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700 ring-1 ring-emerald-100">{tpl(L(pt.nUser), { n: c.sources.user })}</span>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">{tpl(L(pt.nUnset), { n: c.sources.unset })}</span>
        </div>
      </div>

      {c.usedRates.length > 0 ? <ul className="space-y-1 text-xs text-slate-500">{c.usedRates.map((r) => <li key={r.from}>{tpl(L(pt.fxUsed), { c: r.from, r: fmtNum(r.rate, lang), d: r.to, date: r.date })}</li>)}</ul> : null}

      <details>
        <summary className="cursor-pointer text-sm font-medium text-slate-600">{L(pt.details)}</summary>
        <table className="mt-2 w-full text-left text-xs"><tbody>
          {ITEM_IDS.map((id) => { const r = c.items[id]; const it = plan.items[id];
            return <tr key={id} className="border-t border-slate-100"><th className="py-1.5 pr-2 font-medium text-slate-600">{L(pt.items[id])}</th>
              <td className="py-1.5 pr-2 text-slate-500">{r.state === "unset" ? L(pt.notSet) : `${fmtMoney(r.rate, r.currency, lang)} ${r.per === "once" ? "" : L(pt.perUnit[r.per])} × ${fmtNum(r.qty, lang)}`}</td>
              <td className="py-1.5 pr-2 text-slate-500">{it.value === null ? "" : it.source.kind === "official" ? L(pt.badgeOfficial) : L(pt.badgeUser)}</td>
              <td className="py-1.5 text-right tabular-nums text-slate-800">{r.state === "ok" ? fmtMoney(r.total, r.currency, lang) : "—"}</td></tr>; })}
        </tbody></table>
      </details>

      <div className="border-t border-slate-100 pt-3"><p className="text-xs font-medium text-slate-500">{L(pt.ruleTitle)}</p><ul className="mt-1 list-disc space-y-0.5 pl-4 text-xs text-slate-500">{pt.rules.map((r, i) => <li key={i}>{L(r)}</li>)}</ul><p className="mt-2 text-xs text-slate-400">{L(pt.estimateNote)}</p></div>
    </section>
  );
}
