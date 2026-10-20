"use client";
import { useEffect, useState, type ReactNode } from "react";
import { cities } from "@/data/cities";
import { getCompareSchool, listCompareSchools, thirdPartyRecord, type CompareSchool } from "@/data/languageSchools";
import { useI18n } from "@/lib/i18n";
import { panel } from "@/lib/ui";
import { dataText as d } from "@/locales/data";
import { sc, fd } from "@/locales/schoolCompare";
import { EMPTY_SEL, diffRows, dismissPending, replaceWithPending, toggleSchool, CHECK_KINDS, type Diff, type Sel } from "@/data/schoolFinder";
import { SchoolFinder, SelectionTray } from "@/components/schools/SchoolFinder";
import Disclosure from "@/components/Disclosure";
import { StatusBadge } from "@/components/FactView";

/** Where a third party (register, directory) records this school, kept apart from what the school says about itself. */
function ThirdParty({ inst }: { inst: CompareSchool["inst"] }) {
  const { L } = useI18n(); const r = thirdPartyRecord(inst);
  return r ? <a href={r.url} target="_blank" rel="noopener noreferrer" data-testid="third-party-record" className="mt-1 inline-flex min-h-[44px] items-center text-xs font-medium text-sky-700 underline">{L(sc.thirdParty)}: {r.publisher} ↗</a>
    : <span className="mt-1 block text-[11px] leading-snug text-slate-500" data-testid="third-party-none">{L(sc.thirdPartyNone)}</span>;
}

/** Two-school comparison (Ver.1.2.8). Facts only: a missing item reads "未取得", an unverified item stays "未確認", and no school is ranked. */
export function SchoolCompareView({ a, b }: { a?: CompareSchool; b?: CompareSchool }) {
  const { L } = useI18n(); const cityName = (id: string) => L(cities.find((c) => c.id === id)!.name);
  if (!a || !b) return <p className={`p-4 text-sm text-slate-500 ${panel}`} data-testid="need-two">{L(sc.needTwo)}</p>;
  const pair = [a, b];
  const miss = <span className="text-slate-400" data-testid="missing">{L(sc.missing)}</span>;
  const dd = diffRows(a, b); const badge = (d: Diff, id: string) => <span data-testid={`diff-${id}`} data-diff={d} className={`ml-2 inline-block rounded-full px-2 py-0.5 align-middle text-[11px] font-medium ring-1 ${d === "same" ? "bg-slate-100 text-slate-700 ring-slate-200" : d === "differ" ? "bg-sky-50 text-sky-900 ring-sky-200" : d === "unconfirmed" ? "bg-amber-50 text-amber-900 ring-amber-200" : "bg-white text-slate-500 ring-slate-300"}`}>{L(fd.diff[d])}</span>;
  const row = (key: keyof typeof sc.rows, cell: (s: CompareSchool) => ReactNode) => (
    <section key={key} className="space-y-1.5" data-testid={`row-${key}`}>
      <h3 className="text-xs font-semibold text-slate-500">{L(sc.rows[key])}{key !== "status" ? badge(dd[key], key) : null}</h3>
      <div className="grid gap-2 text-sm text-slate-700 sm:grid-cols-2 sm:gap-3">{pair.map((s) => <div key={s.id} className="min-w-0 break-words rounded-xl bg-slate-50 p-3"><p className="mb-1 text-[11px] font-medium text-slate-400 sm:hidden">{s.inst.name}</p>{cell(s)}</div>)}</div>
    </section>);
  return (
    <div className="space-y-4" data-testid="school-compare" data-cross-city={a.cityId !== b.cityId}>
      <div className="grid grid-cols-2 gap-3">{pair.map((s) => (
        <div key={s.id} className="min-w-0 rounded-xl bg-white p-3 ring-1 ring-slate-200" data-testid="school-head">
          <p className="text-[11px] text-slate-500">{cityName(s.cityId)}</p>
          <h2 className="break-words text-base font-semibold text-[#0b2a5b]">{s.inst.name}</h2>{s.inst.officialName && s.inst.officialName !== s.inst.name && <p className="mt-0.5 break-words text-[11px] text-slate-500" data-testid="official-name">{L(sc.officialName)}: {s.inst.officialName}</p>}
          <div className="mt-1"><StatusBadge status={s.status} /></div>
          <div className="mt-2 flex flex-wrap gap-x-3">
            {s.inst.url && <a href={s.inst.url} target="_blank" rel="noopener noreferrer" data-testid="school-site" className="inline-flex min-h-[44px] items-center text-xs font-medium text-sky-700 underline">{L(sc.website)} ↗</a>}
            {s.inst.feesUrl && <a href={s.inst.feesUrl} target="_blank" rel="noopener noreferrer" data-testid="fees-link-head" className="inline-flex min-h-[44px] items-center text-xs font-medium text-sky-700 underline">{L(sc.feesLink)}</a>}
          </div>
        </div>))}</div>
      {a.cityId !== b.cityId && <p className="rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-900" data-testid="cross-city">{L(sc.crossCity)}</p>}
      {row("where", (s) => (s.inst.where ? L(s.inst.where) : miss))}
      {row("courses", (s) => (s.inst.courses ? L(s.inst.courses) : miss))}
      {row("stay", (s) => (s.inst.stay ? L(s.inst.stay) : miss))}
      {row("tuition", (s) => <>{miss}<span className="mt-1 block text-[11px] text-slate-500">{L(sc.tuitionNote)}</span>{s.inst.feesUrl && <a href={s.inst.feesUrl} target="_blank" rel="noopener noreferrer" data-testid="fees-link" className="mt-1 inline-block py-1 text-xs text-sky-700 underline">{L(sc.feesLink)}</a>}</>)}
      <section className="rounded-xl bg-amber-50 p-3 text-xs text-amber-900" data-testid="fee-conditions"><h3 className="font-semibold">{L(sc.feeCondTitle)}</h3><ul className="mt-1 list-disc space-y-0.5 pl-4">{sc.feeConds.map((x) => <li key={x.en}>{L(x)}</li>)}</ul></section>
      {row("checks", (s) => (s.inst.checks?.length ? <><ul className="space-y-1.5" data-testid="school-checks">{s.inst.checks.map((c) => <li key={c.kind} data-kind={c.kind} data-state={c.state}><span className="block text-[11px] font-medium text-slate-500">{L(sc.checkKinds[c.kind])}</span><span className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ${c.state === "confirmed" ? "bg-emerald-50 text-emerald-800 ring-emerald-100" : c.state === "notConfirmed" || c.state === "notChecked" ? "bg-slate-100 text-slate-600 ring-slate-200" : "bg-amber-50 text-amber-800 ring-amber-200"}`}>{L(sc.checkStates[c.state])}</span>{c.detail && <span className="mt-0.5 block text-[11px] leading-snug text-slate-500">{L(c.detail)}</span>}</li>)}</ul><ThirdParty inst={s.inst} /></> : <span className="text-[11px] leading-snug text-slate-500" data-testid="school-checks-none">{L(sc.checksNone)}</span>))}
      <ul className="flex flex-wrap gap-1.5" data-testid="check-diffs" aria-label={L(fd.diffTitle)}>{CHECK_KINDS.map((k) => <li key={k} className="text-[11px] text-slate-600">{L(sc.checkKinds[k]).replace(/（.*$|\(.*$/, "")}{badge(dd.kinds[k], `kind-${k}`)}</li>)}</ul>
      <p className="-mt-2 text-[11px] text-slate-500">{L(sc.checksNote)}</p>
      {row("status", (s) => (<div className="space-y-1"><StatusBadge status={s.status} />{s.checkedAt && <span className="block text-[11px] text-slate-500">{L(sc.checked)}: {s.checkedAt}</span>}{s.status !== "verified" && <span className="block text-[11px] text-slate-500">{L(sc.statusNote)}</span>}</div>))}
      <Disclosure level="more" testid="compare-more"><div className="space-y-3">
        <section className="space-y-1.5"><h3 className="text-xs font-semibold text-slate-500">{L(sc.details)}</h3>
          <div className="grid grid-cols-2 gap-3 text-xs text-slate-600">{pair.map((s) => <div key={s.id} className="min-w-0 break-words">{s.inst.note ? L(s.inst.note) : miss}</div>)}</div></section>
        <Disclosure level="sources" testid="compare-sources"><div className="grid grid-cols-2 gap-3 text-xs">{pair.map((s) => (
          <ul key={s.id} className="min-w-0 space-y-1 break-words">
            {s.inst.source && <li>{L(sc.sourceLabel)}: <a href={s.inst.source.url} target="_blank" rel="noopener noreferrer" className="text-sky-700 underline">{s.inst.source.publisher}</a></li>}
            {s.factSources.map((x) => <li key={x.url}>{L(d.source)}: <a href={x.url} target="_blank" rel="noopener noreferrer" className="text-sky-700 underline">{x.publisher}</a></li>)}
            {s.inst.url && <li>{L(sc.website)}: <a href={s.inst.url} target="_blank" rel="noopener noreferrer" className="text-sky-700 underline">{s.inst.url.replace(/^https?:\/\//, "")}</a></li>}
            {!s.inst.source && !s.factSources.length && <li>{miss}</li>}
          </ul>))}</div></Disclosure>
      </div></Disclosure>
      <p className="text-xs text-slate-500" data-testid="no-verdict">{L(sc.noVerdict)} {L(fd.diffNote)}</p>
    </div>
  );
}

export default function LanguageSchoolCompare() {
  const { L } = useI18n(); const all = listCompareSchools(); const [sel, setSel] = useState<Sel>(EMPTY_SEL);
  useEffect(() => { const q = new URLSearchParams(window.location.search); const x = getCompareSchool(q.get("a")), y = getCompareSchool(q.get("b")); setSel({ a: x?.id ?? "", b: y && y.id !== x?.id ? y.id : "", pending: "" }); }, []);
  const apply = (n: Sel) => { setSel(n); try { const q = new URLSearchParams(); if (n.a) q.set("a", n.a); if (n.b) q.set("b", n.b); window.history.replaceState(null, "", q.toString() ? `?${q}` : window.location.pathname); } catch {} };
  const choose = (which: "a" | "b", id: string) => apply({ ...sel, [which]: id, pending: "" });
  if (!all.length) return <p className={`p-4 text-sm text-slate-500 ${panel}`}>{L(sc.none)}</p>;
  const select = (which: "a" | "b", value: string, other: string) => (
    <label className="block min-w-0 text-sm"><span className="mb-1 block text-xs font-semibold text-slate-500">{L(which === "a" ? sc.pickA : sc.pickB)}</span>
      <select value={value} data-testid={`pick-${which}`} onChange={(e) => choose(which, e.target.value)} className="min-h-[44px] w-full rounded-xl border border-slate-200 bg-white px-3 text-sm">
        <option value="">{L(sc.choose)}</option>
        {cities.map((c) => { const g = all.filter((s) => s.cityId === c.id && s.id !== other); return g.length ? <optgroup key={c.id} label={L(c.name)}>{g.map((s) => <option key={s.id} value={s.id}>{s.inst.name}</option>)}</optgroup> : null; })}
      </select></label>);
  return (
    <div className="space-y-5">
      <SchoolFinder all={all} sel={sel} onToggle={(id) => apply(toggleSchool(sel, id))} />
      <SelectionTray all={all} sel={sel} onRemove={(slot) => apply({ ...sel, [slot]: "", pending: "" })} onClear={() => apply(EMPTY_SEL)} onReplace={(slot) => apply(replaceWithPending(sel, slot))} onCancel={() => apply(dismissPending(sel))} />
      <Disclosure level="more" label={L(fd.pickList)} testid="pick-by-list"><div className="grid gap-3 sm:grid-cols-2">{select("a", sel.a, sel.b)}{select("b", sel.b, sel.a)}</div></Disclosure>
      <div id="school-compare-result" className="scroll-mt-4"><SchoolCompareView a={getCompareSchool(sel.a)} b={getCompareSchool(sel.b)} /></div>
    </div>
  );
}
