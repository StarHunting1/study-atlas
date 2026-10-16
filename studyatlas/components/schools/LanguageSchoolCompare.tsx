"use client";
import { useEffect, useState, type ReactNode } from "react";
import { cities } from "@/data/cities";
import { getCompareSchool, listCompareSchools, type CompareSchool } from "@/data/languageSchools";
import { useI18n } from "@/lib/i18n";
import { panel } from "@/lib/ui";
import { dataText as d } from "@/locales/data";
import { sc } from "@/locales/schoolCompare";
import Disclosure from "@/components/Disclosure";
import { StatusBadge } from "@/components/FactView";

/** Two-school comparison (Ver.1.2.8). Facts only: a missing item reads "未取得", an unverified item stays "未確認", and no school is ranked. */
export function SchoolCompareView({ a, b }: { a?: CompareSchool; b?: CompareSchool }) {
  const { L } = useI18n(); const cityName = (id: string) => L(cities.find((c) => c.id === id)!.name);
  if (!a || !b) return <p className={`p-4 text-sm text-slate-500 ${panel}`} data-testid="need-two">{L(sc.needTwo)}</p>;
  const pair = [a, b];
  const miss = <span className="text-slate-400" data-testid="missing">{L(sc.missing)}</span>;
  const row = (key: keyof typeof sc.rows, cell: (s: CompareSchool) => ReactNode) => (
    <section key={key} className="space-y-1.5" data-testid={`row-${key}`}>
      <h3 className="text-xs font-semibold text-slate-500">{L(sc.rows[key])}</h3>
      <div className="grid grid-cols-2 gap-3 text-sm text-slate-700">{pair.map((s) => <div key={s.id} className="min-w-0 break-words rounded-xl bg-slate-50 p-3">{cell(s)}</div>)}</div>
    </section>);
  return (
    <div className="space-y-4" data-testid="school-compare" data-cross-city={a.cityId !== b.cityId}>
      <div className="grid grid-cols-2 gap-3">{pair.map((s) => (
        <div key={s.id} className="min-w-0 rounded-xl bg-white p-3 ring-1 ring-slate-200" data-testid="school-head">
          <p className="text-[11px] text-slate-500">{cityName(s.cityId)}</p>
          <h2 className="break-words text-base font-semibold text-[#0b2a5b]">{s.inst.url ? <a href={s.inst.url} target="_blank" rel="noopener noreferrer" className="underline">{s.inst.name}</a> : s.inst.name}</h2>
        </div>))}</div>
      {a.cityId !== b.cityId && <p className="rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-900" data-testid="cross-city">{L(sc.crossCity)}</p>}
      {row("where", (s) => (s.inst.where ? L(s.inst.where) : miss))}
      {row("courses", (s) => (s.inst.courses ? L(s.inst.courses) : miss))}
      {row("stay", (s) => (s.inst.stay ? L(s.inst.stay) : miss))}
      {row("tuition", (s) => <>{miss}<span className="mt-1 block text-[11px] text-slate-500">{L(sc.tuitionNote)}</span>{s.inst.feesUrl && <a href={s.inst.feesUrl} target="_blank" rel="noopener noreferrer" data-testid="fees-link" className="mt-1 inline-block py-1 text-xs text-sky-700 underline">{L(sc.feesLink)}</a>}</>)}
      <section className="rounded-xl bg-amber-50 p-3 text-xs text-amber-900" data-testid="fee-conditions"><h3 className="font-semibold">{L(sc.feeCondTitle)}</h3><ul className="mt-1 list-disc space-y-0.5 pl-4">{sc.feeConds.map((x) => <li key={x.en}>{L(x)}</li>)}</ul></section>
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
      <p className="text-xs text-slate-500" data-testid="no-verdict">{L(sc.noVerdict)}</p>
    </div>
  );
}

export default function LanguageSchoolCompare() {
  const { L } = useI18n(); const all = listCompareSchools(); const [a, setA] = useState(""); const [b, setB] = useState("");
  useEffect(() => { const q = new URLSearchParams(window.location.search); const x = getCompareSchool(q.get("a")), y = getCompareSchool(q.get("b")); if (x) setA(x.id); if (y && y.id !== x?.id) setB(y.id); }, []);
  const choose = (which: "a" | "b", id: string) => { (which === "a" ? setA : setB)(id); const q = new URLSearchParams({ a: which === "a" ? id : a, b: which === "b" ? id : b }); [...q.keys()].forEach((k) => !q.get(k) && q.delete(k)); try { window.history.replaceState(null, "", `?${q}`); } catch {} };
  if (!all.length) return <p className={`p-4 text-sm text-slate-500 ${panel}`}>{L(sc.none)}</p>;
  const select = (which: "a" | "b", value: string, other: string) => (
    <label className="block min-w-0 text-sm"><span className="mb-1 block text-xs font-semibold text-slate-500">{L(which === "a" ? sc.pickA : sc.pickB)}</span>
      <select value={value} data-testid={`pick-${which}`} onChange={(e) => choose(which, e.target.value)} className="min-h-[44px] w-full rounded-xl border border-slate-200 bg-white px-3 text-sm">
        <option value="">{L(sc.choose)}</option>
        {cities.map((c) => { const g = all.filter((s) => s.cityId === c.id && s.id !== other); return g.length ? <optgroup key={c.id} label={L(c.name)}>{g.map((s) => <option key={s.id} value={s.id}>{s.inst.name}</option>)}</optgroup> : null; })}
      </select></label>);
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">{select("a", a, b)}{select("b", b, a)}</div>
      <SchoolCompareView a={getCompareSchool(a)} b={getCompareSchool(b)} />
    </div>
  );
}
