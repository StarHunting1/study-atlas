"use client";
import { useState } from "react";
import { cities } from "@/data/cities";
import type { CompareSchool } from "@/data/languageSchools";
import { thirdPartyRecord } from "@/data/languageSchools";
import { CHECK_KINDS, NO_FILTER, cityCounts, filterSchools, isFiltered, type Filters, type RecordFilter, type Sel } from "@/data/schoolFinder";
import { useI18n } from "@/lib/i18n";
import { panel } from "@/lib/ui";
import { fd } from "@/locales/schoolCompare";
import { sc } from "@/locales/schoolCompare";
import Disclosure from "@/components/Disclosure";

const tone = (s: string) => (s === "confirmed" ? "bg-sky-50 text-sky-900 ring-sky-200" : s === "single" || s === "stated" ? "bg-amber-50 text-amber-900 ring-amber-200" : "bg-slate-100 text-slate-600 ring-slate-200");
const fill = (s: string, v: Record<string, string | number>) => Object.entries(v).reduce((t, [k, x]) => t.replace(`{${k}}`, String(x)), s);

/** One school: what a person needs to tell schools apart without opening anything (name, city, campus, courses, official site, what is checked), and the compare button. */
export function SchoolCard({ s, sel, onToggle }: { s: CompareSchool; sel: Sel; onToggle: (id: string) => void }) {
  const { L } = useI18n(); const city = cities.find((c) => c.id === s.cityId)!; const slot = sel.a === s.id ? 1 : sel.b === s.id ? 2 : 0; const tp = thirdPartyRecord(s.inst);
  return (
    <li className={`${panel} flex min-w-0 flex-col gap-2 p-3 sm:p-4 ${slot ? "ring-2 ring-[#0b2a5b]" : ""}`} data-testid="school-card" data-school={s.id} data-city={s.cityId} data-selected={slot || undefined}>
      <div><p className="text-[11px] font-medium text-slate-500" data-testid="card-city">{L(city.name)}</p><h3 className="break-words text-base font-semibold text-[#0b2a5b]">{s.inst.name}</h3></div>
      <p className="text-xs leading-snug text-slate-600" data-testid="card-where"><span className="font-medium text-slate-500">{L(fd.address)}: </span>{s.inst.where ? <span className="line-clamp-3">{L(s.inst.where)}</span> : L(fd.noAddress)}</p>
      <p className="text-xs leading-snug text-slate-600" data-testid="card-courses"><span className="font-medium text-slate-500">{L(fd.course)}: </span>{s.inst.courses ? <span className="line-clamp-2">{L(s.inst.courses)}</span> : L(fd.noCourse)}</p>
      {s.inst.checks?.length ? <ul className="grid grid-cols-2 gap-1" data-testid="card-checks" aria-label={L(fd.checksShort)}>{CHECK_KINDS.map((k) => { const c = s.inst.checks!.find((x) => x.kind === k); return c ? <li key={k} data-kind={k} data-state={c.state} className={`rounded-lg px-2 py-1 text-[11px] leading-tight ring-1 ${tone(c.state)}`}><span className="block font-medium">{L(fd.kindShort[k])}</span><span className="block">{L(fd.stateShort[c.state])}</span></li> : null; })}</ul> : null}
      <div className="flex flex-wrap gap-x-3">
        {s.inst.url && <a href={s.inst.url} target="_blank" rel="noopener noreferrer" data-testid="card-site" className="inline-flex min-h-[44px] items-center text-xs font-medium text-sky-700 underline">{L(sc.website)} ↗</a>}
        {s.inst.feesUrl && <a href={s.inst.feesUrl} target="_blank" rel="noopener noreferrer" data-testid="card-fees" className="inline-flex min-h-[44px] items-center text-xs font-medium text-sky-700 underline">{L(sc.feesLink)}</a>}
        {tp && <a href={tp.url} target="_blank" rel="noopener noreferrer" data-testid="card-record" className="inline-flex min-h-[44px] items-center text-xs font-medium text-sky-700 underline">{tp.publisher} ↗</a>}
      </div>
      <button type="button" onClick={() => onToggle(s.id)} aria-pressed={!!slot} data-testid="card-compare" className={`mt-auto inline-flex min-h-[44px] items-center justify-center rounded-full px-4 py-2 text-sm font-medium ${slot ? "bg-[#0b2a5b] text-white" : "bg-white text-slate-800 ring-1 ring-slate-300 hover:bg-slate-50"}`}>
        {slot === 1 ? L(fd.selectedA) : slot === 2 ? L(fd.selectedB) : L(fd.add)}</button>
    </li>
  );
}

/** Search + city filter over the schools, the result count, and the cards. The selection lives in the parent so it survives any filter change. */
export function SchoolFinder({ all, sel, onToggle, initial = NO_FILTER }: { all: CompareSchool[]; sel: Sel; onToggle: (id: string) => void; initial?: Filters }) {
  const { L } = useI18n(); const [f, setF] = useState<Filters>(initial); const [more, setMore] = useState(false);
  const shown = filterSchools(all, f, (id) => cities.find((c) => c.id === id)!.name); const counts = cityCounts(all);
  const chip = (on: boolean) => `inline-flex min-h-[44px] items-center rounded-full px-3 text-sm font-medium ring-1 ${on ? "bg-[#0b2a5b] text-white ring-[#0b2a5b]" : "bg-white text-slate-700 ring-slate-300 hover:bg-slate-50"}`;
  const rec = (v: RecordFilter, label: string) => <button key={v} type="button" aria-pressed={f.record === v} data-testid={`record-${v}`} onClick={() => setF({ ...f, record: v })} className={chip(f.record === v)}>{label}</button>;
  return (
    <section className="space-y-3" data-testid="school-finder" aria-label={L(fd.findTitle)}>
      <div className="space-y-2">
        <h2 className="text-lg font-semibold text-[#0b2a5b]">{L(fd.findTitle)}</h2><p className="text-xs text-slate-500">{L(fd.lead)}</p>
        <label className="block"><span className="mb-1 block text-xs font-semibold text-slate-500">{L(fd.search)}</span>
          <input type="search" value={f.q} onChange={(e) => setF({ ...f, q: e.target.value })} placeholder={L(fd.searchPh)} data-testid="school-search" className="min-h-[44px] w-full rounded-xl border border-slate-200 bg-white px-3 text-sm" /></label>
        <div role="group" aria-label={L(fd.cityLabel)} className="flex flex-wrap gap-1.5" data-testid="city-filter">
          <button type="button" aria-pressed={!f.city} data-testid="city-all" onClick={() => setF({ ...f, city: "" })} className={chip(!f.city)}>{L(fd.cityAll)} ({all.length})</button>
          {cities.filter((c) => counts[c.id]).map((c) => <button key={c.id} type="button" aria-pressed={f.city === c.id} data-testid={`city-${c.id}`} onClick={() => setF({ ...f, city: f.city === c.id ? "" : c.id })} className={chip(f.city === c.id)}>{L(c.name)} ({counts[c.id]})</button>)}
        </div>
        <Disclosure level="more" label={L(fd.moreFilters)} openLabel={L(fd.lessFilters)} testid="more-filters" open={more} onOpenChange={setMore}>
          <div role="group" aria-label={L(fd.recordLabel)} className="space-y-1.5"><p className="text-xs font-semibold text-slate-500">{L(fd.recordLabel)}</p><div className="flex flex-wrap gap-1.5">{rec("all", L(fd.recordAll))}{rec("third", L(fd.recordThird))}{rec("own", L(fd.recordOwn))}</div></div>
        </Disclosure>
        <div className="flex flex-wrap items-center gap-x-3" aria-live="polite"><p className="text-sm text-slate-700" data-testid="result-count" role="status">{fill(L(fd.count), { n: shown.length, total: all.length })}</p>
          {isFiltered(f) && <button type="button" onClick={() => setF(NO_FILTER)} data-testid="clear-filters" className="inline-flex min-h-[44px] items-center text-sm font-medium text-sky-700 underline">{L(fd.clear)}</button>}</div>
        <p className="text-[11px] leading-snug text-slate-500" data-testid="not-quality">{L(fd.notQuality)}</p>
      </div>
      {shown.length ? <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3" data-testid="school-cards">{shown.map((s) => <SchoolCard key={s.id} s={s} sel={sel} onToggle={onToggle} />)}</ul>
        : <div className={`${panel} space-y-2 p-4`} data-testid="no-match"><p className="text-sm font-medium text-slate-700">{L(fd.noMatch)}</p><p className="text-xs text-slate-500">{L(fd.noMatchHint)}</p><button type="button" onClick={() => setF(NO_FILTER)} data-testid="clear-filters-empty" className="inline-flex min-h-[44px] items-center rounded-full bg-white px-4 text-sm font-medium ring-1 ring-slate-300">{L(fd.clear)}</button></div>}
    </section>
  );
}

/** The two chosen schools, what to do next, and – when a third one was clicked – the question of which one it replaces (never a silent swap). */
export function SelectionTray({ all, sel, onRemove, onClear, onReplace, onCancel, onGo }: { all: CompareSchool[]; sel: Sel; onRemove: (slot: "a" | "b") => void; onClear: () => void; onReplace: (slot: "a" | "b") => void; onCancel: () => void; onGo?: () => void }) {
  const { L } = useI18n(); const get = (id: string) => all.find((s) => s.id === id); const A = get(sel.a), B = get(sel.b), P = get(sel.pending);
  const slot = (S: CompareSchool | undefined, key: "a" | "b", label: string) => (
    <div className="flex min-w-0 flex-1 items-center justify-between gap-1 rounded-xl bg-slate-50 py-1 pl-2.5 pr-0.5" data-testid={`tray-${key}`} data-filled={!!S}>
      <span className="min-w-0"><span className="block text-[11px] text-slate-500">{label}</span><span className="block truncate text-sm font-medium text-slate-800">{S ? S.inst.name : L(fd.trayEmpty)}</span></span>
      {S && <button type="button" onClick={() => onRemove(key)} aria-label={`${L(fd.trayRemove)}: ${S.inst.name}`} data-testid={`tray-remove-${key}`} className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center text-slate-500 hover:text-slate-900">✕</button>}
    </div>);
  if (!A && !B && !P) return <div data-testid="selection-tray" data-empty="true" className="space-y-1"><p className="text-xs text-slate-600" data-testid="tray-hint">{L(fd.trayNone)}</p><span className="hidden" data-testid="tray-a" data-filled="false" /><span className="hidden" data-testid="tray-b" data-filled="false" /></div>;
  return (
    <div className={`${panel} sticky bottom-2 z-10 space-y-1.5 p-2 sm:p-3`} data-testid="selection-tray">
      {P && A && B && <div role="alert" className="space-y-2 rounded-xl bg-amber-50 p-3 text-sm text-amber-900" data-testid="pending-notice"><p>{fill(L(fd.full), { name: P.inst.name })}</p>
        <div className="flex flex-wrap gap-2"><button type="button" onClick={() => onReplace("a")} data-testid="replace-a" className="inline-flex min-h-[44px] items-center rounded-full bg-white px-4 text-sm font-medium ring-1 ring-amber-300">{fill(L(fd.replace), { name: A.inst.name })}</button>
          <button type="button" onClick={() => onReplace("b")} data-testid="replace-b" className="inline-flex min-h-[44px] items-center rounded-full bg-white px-4 text-sm font-medium ring-1 ring-amber-300">{fill(L(fd.replace), { name: B.inst.name })}</button>
          <button type="button" onClick={onCancel} data-testid="replace-cancel" className="inline-flex min-h-[44px] items-center px-2 text-sm underline">{L(fd.cancel)}</button></div></div>}
      <div className="flex gap-2">{slot(A, "a", L(fd.traySlot1))}{slot(B, "b", L(fd.traySlot2))}</div>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1"><p className="text-xs text-slate-600" data-testid="tray-hint">{A && B ? L(fd.trayReady) : A || B ? L(fd.trayOne) : L(fd.trayNone)}</p>
        {A && B && <button type="button" onClick={onGo} data-testid="tray-go" className="inline-flex min-h-[44px] items-center rounded-full bg-[#0b2a5b] px-4 text-sm font-medium text-white">{L(fd.trayGo)}</button>}
        {(A || B) && <button type="button" onClick={onClear} data-testid="tray-clear" className="inline-flex min-h-[44px] items-center text-sm text-slate-600 underline">{L(fd.trayClear)}</button>}</div>
    </div>
  );
}
