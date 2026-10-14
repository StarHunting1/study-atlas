"use client";
import { useMemo, useState } from "react";
import { applyCandidate, candidatesFor, noticesFor, type Candidate } from "@/data/official/planner";
import { useI18n } from "@/lib/i18n";
import { CURRENCIES, calcItem, changeCurrency, changeUnit, durationRange, hasCoverage, isOneOff, rangeFor, setItem, setValue, stayWeeks, type Ccy, type ItemId, type Per, type Plan } from "@/lib/planner";
import { validForShort } from "@/data/official/validFor";
import { pt } from "@/locales/planner";
import AnimatedNumber from "./AnimatedNumber";
import SliderField from "./SliderField";
import { fmtMoney, fmtNum, tpl } from "./format";

const seg = (on: boolean) => `rounded-full px-3 py-1.5 text-sm font-medium transition ${on ? "bg-[#0b2a5b] text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"}`;

export default function ItemCard({ id, plan, setPlan }: { id: ItemId; plan: Plan; setPlan: (f: (p: Plan) => Plan) => void }) {
  const { L, lang } = useI18n();
  const it = plan.items[id]; const calc = calcItem(plan, id); const oneOff = isOneOff(id);
  const [editing, setEditing] = useState(false); const [text, setText] = useState("");
  const range = rangeFor(id, it.per, it.currency); const money = (n: number, c: Ccy = it.currency) => fmtMoney(n, c, lang);
  const cands = useMemo(() => candidatesFor(plan.cityId, id, { studyType: plan.studyType, housingType: plan.housingType }), [plan.cityId, plan.studyType, plan.housingType, id]);
  const notices = id === "housing" ? noticesFor(plan.cityId, "housing") : [];
  const stay = stayWeeks(plan); const pers: Per[] = it.per === "year" ? ["week", "month", "term", "once", "year"] : ["week", "month", "term", "once"];
  const official = it.source.kind === "official" ? it.source : null; const active = official ? cands.find((c) => c.id === official.ref) : undefined;

  const setV = (v: number | null) => setPlan((p) => setValue(p, id, v));
  const startEdit = () => { setText(it.value === null ? "" : String(it.value)); setEditing(true); };
  const commit = (t: string) => { const n = t.trim() === "" ? null : Number(t.replace(/,/g, "")); if (n !== null && (!Number.isFinite(n) || n < 0)) return; setV(n); };

  const formula = (() => {
    if (calc.state !== "ok") return "";
    const rate = money(calc.rate); const w = fmtNum(calc.weeks ?? stay, lang);
    const base = { rate, n: fmtNum(calc.qty, lang), w, t: plan.termWeeks };
    return `${tpl(L(pt[({ week: "fWeek", month: "fMonth", term: "fTerm", year: "fYear", once: "fOnce" } as const)[calc.per]]), base)} = ${money(calc.total)}`;
  })();

  return (
    <article data-item={id} className="space-y-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:p-5">
      <header className="flex flex-wrap items-start justify-between gap-2">
        <h3 className="text-base font-semibold text-[#0b2a5b]">{L(pt.items[id])}</h3>
        <span data-testid={`badge-${id}`} className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${official ? "bg-sky-50 text-sky-700 ring-1 ring-sky-100" : it.value === null ? "bg-slate-100 text-slate-500" : "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"}`}>
          {official ? L(pt.badgeOfficial) : it.value === null ? L(pt.badgeUnset) : L(pt.badgeUser)}
        </span>
      </header>

      {/* amount: large, animated; tap to type an exact amount */}
      <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-1">
        {editing ? (
          <div className="flex items-center gap-2">
            <input autoFocus inputMode="decimal" type="number" min={0} step="any" aria-label={`${L(pt.items[id])}: ${L(pt.enterAmount)}`} value={text}
              onChange={(e) => { setText(e.target.value); commit(e.target.value); }} onKeyDown={(e) => { if (e.key === "Enter" || e.key === "Escape") setEditing(false); }}
              className="w-36 rounded-xl border border-slate-300 px-3 py-2 text-xl font-semibold tabular-nums focus:border-[#0b2a5b] focus:outline-none" />
            <span className="text-sm text-slate-500">{it.currency}{!oneOff && ` ${L(pt.perUnit[it.per])}`}</span>
            <button type="button" onClick={() => setEditing(false)} className="rounded-full bg-[#0b2a5b] px-3 py-1.5 text-sm font-medium text-white">{L(pt.done)}</button>
          </div>
        ) : (
          <button type="button" onClick={startEdit} title={L(pt.enterAmount)} aria-label={`${L(pt.items[id])}: ${L(pt.enterAmount)}`} className="group text-left">
            {it.value === null ? <span className="text-2xl font-semibold text-slate-300">{L(pt.notSet)}</span> :
              <><AnimatedNumber value={it.value} format={(n) => money(n)} className="text-3xl font-semibold tracking-tight text-slate-900" />{!oneOff && <span className="ml-1.5 text-sm text-slate-500">{L(pt.perUnit[it.per])}</span>}</>}
            <span className="ml-2 text-[11px] text-slate-400 underline decoration-dotted group-hover:text-slate-600">✎ {L(pt.enterAmount)}</span>
          </button>
        )}
        <div className="flex items-center gap-2">
          <label className="sr-only" htmlFor={`ccy-${id}`}>{L(pt.currency)}</label>
          <select id={`ccy-${id}`} value={it.currency} onChange={(e) => setPlan((p) => changeCurrency(p, id, e.target.value as Ccy))} className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm">{CURRENCIES.map((c) => <option key={c}>{c}</option>)}</select>
          {it.value !== null && <button type="button" onClick={() => setV(null)} className="text-xs text-slate-500 underline">{L(pt.clear)}</button>}
        </div>
      </div>

      {/* billing unit */}
      {!oneOff && (
        <div role="group" aria-label={L(pt.per.week) + " / " + L(pt.per.month)} className="inline-flex flex-wrap gap-1 rounded-full bg-slate-50 p-1 ring-1 ring-slate-200">
          {pers.map((p) => <button key={p} type="button" aria-pressed={it.per === p} onClick={() => setPlan((pl) => changeUnit(pl, id, p))} className={seg(it.per === p)}>{L(pt.per[p])}</button>)}
        </div>
      )}

      <SliderField label={L(pt.items[id])} value={it.value} range={range} format={(n) => money(n)} onChange={(n) => setV(n)} />

      {/* the school course length / housing contract can differ from the stay */}
      {hasCoverage(id) && !oneOff && it.per !== "once" && (
        <div className="space-y-2 rounded-xl bg-slate-50 p-3">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="font-medium text-slate-600">{L(pt.coverage)}</span>
            <div role="group" className="inline-flex gap-1 rounded-full bg-white p-1 ring-1 ring-slate-200">
              <button type="button" aria-pressed={it.coverageWeeks === null} onClick={() => setPlan((p) => setItem(p, id, { coverageWeeks: null, source: p.items[id].source }))} className={seg(it.coverageWeeks === null)}>{L(pt.coverageStay)}</button>
              <button type="button" aria-pressed={it.coverageWeeks !== null} onClick={() => setPlan((p) => setItem(p, id, { coverageWeeks: it.coverageWeeks ?? Math.max(1, Math.round(stay)), source: p.items[id].source }))} className={seg(it.coverageWeeks !== null)}>{L(pt.coverageCustom)}</button>
            </div>
            {it.coverageWeeks !== null && <span className="font-semibold tabular-nums text-slate-800">{fmtNum(it.coverageWeeks, lang)} {L(pt.weeks)}</span>}
          </div>
          {it.coverageWeeks !== null && <SliderField label={`${L(pt.items[id])}: ${L(pt.coverage)}`} value={it.coverageWeeks} range={{ ...durationRange("weeks"), fine: 1 }} format={(n) => `${fmtNum(n, lang)} ${L(pt.weeks)}`} onChange={(n) => setPlan((p) => setItem(p, id, { coverageWeeks: Math.max(1, n), source: p.items[id].source }))} />}
          {calc.state === "ok" && calc.warn && <p role="status" className="text-xs text-amber-700">{tpl(L(pt[calc.warn]), { n: fmtNum(calc.gapWeeks ?? 0, lang) })}</p>}
        </div>
      )}

      {/* the calculation, spelled out */}
      {calc.state === "ok" ? (
        <p data-testid={`formula-${id}`} className="rounded-lg bg-slate-50 px-3 py-2 text-xs leading-relaxed text-slate-600"><span className="font-medium">{L(pt.formula)}: </span>{formula}</p>
      ) : <p className="text-xs text-slate-400">{L(pt.notSetNote)}</p>}

      {/* official figures to start from */}
      {cands.length > 0 ? (
        <div className="space-y-2 border-t border-slate-100 pt-3">
          <p className="text-xs font-medium text-slate-500">{L(pt.officialFigures)}</p>
          <ul className="grid gap-2 sm:grid-cols-2">
            {cands.map((c: Candidate) => {
              const on = official?.ref === c.id && it.value === c.value;
              return (
                <li key={c.id} className={`rounded-xl p-3 text-xs ring-1 ${on ? "bg-sky-50 ring-sky-200" : "bg-white ring-slate-200"}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div><p className="font-medium text-slate-700">{L(c.label)}</p><p className="mt-0.5 text-sm font-semibold tabular-nums text-slate-900">{money(c.value, c.currency)} <span className="text-xs font-normal text-slate-500">{L(pt.perUnit[c.per])}</span></p></div>
                    <button type="button" data-testid={`use-${c.id}`} onClick={() => setPlan((p) => applyCandidate(p, c))} aria-pressed={on} className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium ${on ? "bg-sky-600 text-white" : "bg-[#0b2a5b] text-white hover:bg-[#12397a]"}`}>{on ? L(pt.inUse) : L(pt.useThis)}</button>
                  </div>
                  <p className="mt-1 text-slate-500">{L(pt.source)}: <a href={c.url} target="_blank" rel="noopener noreferrer" className="text-sky-700 underline">{c.publisher}</a> · {L(pt.validFor)}: {validForShort(c.validFor, lang)}</p>
                  <p className="text-slate-500">{L(pt.whoFor)}: {L(c.audience)}</p>
                  {c.caution && <p className="mt-1 text-amber-700">⚠ {L(c.caution)}</p>}
                  {c.termsUnconfirmed && <p className="mt-1 text-slate-400">{L(pt.termsUnconfirmed)}</p>}
                </li>
              );
            })}
          </ul>
        </div>
      ) : (
        <p className="border-t border-slate-100 pt-3 text-xs text-slate-400">{L(pt.noOfficial)}{id === "tuition" && <> {L(pt.schoolHint)}</>}</p>
      )}
      {official && !active && <p className="text-xs text-slate-500">{L(pt.source)}: <a href={official.url} target="_blank" rel="noopener noreferrer" className="text-sky-700 underline">{official.label}</a> · {official.validFor ? validForShort(official.validFor, lang) : ""}</p>}
      {notices.map((n) => (
        <div key={n.sourceId} className="space-y-1 rounded-xl bg-slate-50 p-3 text-xs text-slate-600 ring-1 ring-slate-200">
          <p className="font-medium text-slate-700">{L(pt.notShown)}</p><p>{L(n.text)}</p>
          <ul className="flex flex-wrap gap-x-3 gap-y-1">{n.links.slice(0, 3).map((l) => <li key={l.url}><a href={l.url} target="_blank" rel="noopener noreferrer" className="text-sky-700 underline">{L(l.label)} ↗</a></li>)}</ul>
        </div>
      ))}
    </article>
  );
}
