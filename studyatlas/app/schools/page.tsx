"use client";
import { cities } from "@/data/cities";
import { getSchool, isComparable, isLanguage, listSchools, optionsOf, type LanguageCourse, type Price, type School, type SchoolKind, type UniversityProgram, type WeeksRange } from "@/data/schools";
import type { Fact } from "@/data/schema";
import { priceIssues } from "@/data/comparability";
import { useI18n, type Localized } from "@/lib/i18n";
import { usePersistentState } from "@/lib/persist";
import { panel, pill, pillOff, pillOn } from "@/lib/ui";
import { dataText as d } from "@/locales/data";
import { schoolsText as s } from "@/locales/my";
import FactView, { StatusBadge } from "@/components/FactView";
import PriceView from "@/components/PriceView";
import Link from "next/link";
import { up } from "@/locales/schoolCompare";

const MAX = 3;
type Pick = { schoolId: string; optionId: string };
type Picks = Record<SchoolKind, Pick[]>;
const cleanPicks = (v: unknown): Picks | undefined => {
  if (!v || typeof v !== "object") return undefined; const o = v as Partial<Picks>;
  const ok = (a: unknown, kind: SchoolKind) => (Array.isArray(a) ? a.filter((p): p is Pick => !!p && typeof p.schoolId === "string" && getSchool(p.schoolId)?.kind === kind).slice(0, MAX) : []);
  return { language: ok(o.language, "language"), university: ok(o.university, "university") };
};
const fill = (tpl: Localized, lang: string, vars: Record<string, string | number>) => Object.entries(vars).reduce((t, [k, v]) => t.replace(`{${k}}`, String(v)), tpl[lang] ?? tpl.en);

export default function SchoolsPage() {
  const { L, lang } = useI18n();
  const [kind, setKind] = usePersistentState<SchoolKind>("studyatlas.schools.kind", "language", (v) => (v === "language" || v === "university" ? v : undefined));
  const [showSamples, setShowSamples] = usePersistentState("studyatlas.schools.samples", false, (v) => (typeof v === "boolean" ? v : undefined));
  const [picks, setPicks] = usePersistentState<Picks>("studyatlas.schools.compare", { language: [], university: [] }, cleanPicks);
  const list = listSchools(kind, { includeSamples: showSamples });
  // Hide picked sample schools while samples are switched off
  const selected = picks[kind].filter((p) => list.some((x) => x.id === p.schoolId));
  const has = (id: string) => selected.some((p) => p.schoolId === id);
  const toggle = (sc: School) => setPicks((all) => {
    const cur = all[kind].filter((p) => list.some((x) => x.id === p.schoolId));
    const next = cur.some((p) => p.schoolId === sc.id) ? cur.filter((p) => p.schoolId !== sc.id) : cur.length >= MAX ? cur : [...cur, { schoolId: sc.id, optionId: optionsOf(sc)[0]?.id ?? "" }];
    return { ...all, [kind]: next };
  });
  const setOption = (schoolId: string, optionId: string) => setPicks((all) => ({ ...all, [kind]: all[kind].map((p) => (p.schoolId === schoolId ? { ...p, optionId } : p)) }));
  const cityName = (id: string) => { const c = cities.find((x) => x.id === id); return c ? L(c.name) : id; };
  /** A school can be compared only when it has something to compare (programmes / courses) or is an explicit sample. Listed universities without data are shown as "coming soon", and a choice made earlier is kept untouched. */
  const comparable = isComparable;
  const usable = selected.filter((p) => { const x = getSchool(p.schoolId); return !!x && comparable(x); }); const keptOnly = selected.length > usable.length;
  const noneComparable = list.length > 0 && !list.some(comparable);
  const byCity = cities.map((c) => ({ city: c, schools: list.filter((x) => x.cityId === c.id) })).filter((g) => g.schools.length);

  return (
    <div className="space-y-6">
      <div><h1 className="text-3xl font-bold text-[#0b2a5b]">{L(s.title)}</h1><p className="mt-1 text-slate-500">{L(s.intro)}</p></div>
      <div className="flex flex-wrap items-center gap-3">
        <div role="tablist" className="flex gap-1 rounded-full bg-white p-1 shadow-sm ring-1 ring-slate-200">
          {(["language", "university"] as const).map((k) => <button key={k} role="tab" aria-selected={kind === k} onClick={() => setKind(k)} className={`rounded-full px-4 py-2 text-sm font-medium ${kind === k ? pillOn : "text-slate-600 hover:bg-slate-50"}`}>{L(s.kinds[k])}</button>)}
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-600"><input type="checkbox" checked={showSamples} onChange={(e) => setShowSamples(e.target.checked)} className="h-4 w-4 accent-[#0b2a5b]" />{L(s.showSamples)}</label>
      </div>
      {showSamples && <p className="rounded-xl bg-amber-50 px-4 py-2 text-sm text-amber-800">{L(s.samplesBanner)}</p>}
      {kind === "language" && <div className={`${panel} space-y-1 p-4`} data-testid="lang-banner"><p className="text-sm text-slate-700">{L(up.langBanner)}</p><Link href="/schools/compare" data-testid="lang-banner-link" className="inline-flex min-h-[44px] items-center text-sm font-medium text-sky-700 underline">{L(up.goLanguage)}</Link></div>}
      {kind === "university" && noneComparable && <div role="note" className="space-y-2 rounded-2xl bg-amber-50 p-4 text-amber-900 ring-1 ring-amber-200" data-testid="uni-coming-soon"><h2 className="text-base font-semibold">{L(up.title)}</h2><p className="text-sm leading-relaxed">{L(up.lead)}</p><Link href="/schools/compare" data-testid="uni-to-language" className="inline-flex min-h-[44px] items-center text-sm font-medium text-sky-800 underline">{L(up.goLanguage)}</Link></div>}

      {list.length === 0 ? <p className={`p-5 text-sm text-slate-500 ${panel}`}>{L(s.none)}</p> : (
        <div className="space-y-4">
          {byCity.map(({ city, schools }) => (
            <section key={city.id}>
              <h2 className="mb-2 text-sm font-semibold text-slate-500">{L(city.name)}</h2>
              <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {schools.map((sc) => {
                  const on = has(sc.id); const n = optionsOf(sc).length; const can = comparable(sc);
                  return (
                    <li key={sc.id} className={`flex flex-col justify-between gap-3 p-4 rounded-2xl bg-white shadow-sm ${on ? "ring-2 ring-sky-500" : "ring-1 ring-slate-200"}`}>
                      <div>
                        <p className="font-semibold text-slate-800">{sc.name}</p>
                        <div className="mt-1 flex flex-wrap gap-1">{sc.demo ? <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-800">{L(s.sample)}</span> : <StatusBadge status={sc.record.status} />}</div>
                        {can ? <p className="mt-1 text-xs text-slate-500">{n > 0 ? `${n} ${L(isLanguage(sc) ? s.course : s.program)}` : `${L(isLanguage(sc) ? s.course : s.program)}: ${L(d.pending)}`}</p>
                          : <div className="mt-1 space-y-1" data-testid="uni-listed"><p className="text-xs text-slate-500">{L(up.listed)}</p>{sc.website.value && <a href={sc.website.value} target="_blank" rel="noopener noreferrer" data-testid="uni-site" className="inline-flex min-h-[44px] items-center text-xs font-medium text-sky-700 underline">{L(s.visit)} ↗ <span className="ml-1 text-[11px] font-normal text-slate-500">({L(up.linkNote)})</span></a>}</div>}
                      </div>
                      {can ? <button disabled={!on && usable.length >= MAX} aria-pressed={on} onClick={() => toggle(sc)} className={`${pill} disabled:opacity-40 ${on ? pillOn : pillOff}`}>{on ? `✓ ${L(s.selected)}` : `+ ${L(s.add)}`}</button>
                        : <span className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-slate-100 px-4 text-sm text-slate-500" data-testid="uni-disabled" aria-disabled="true">{L(up.soon)} · {L(up.disabled)}</span>}
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
          {!noneComparable && <p className="text-sm text-slate-500">{usable.length} / {MAX} · {usable.length >= MAX ? L(s.max) : usable.length < 2 ? L(s.pickTwo) : ""}</p>}
          {keptOnly && <p className="text-xs text-slate-500" data-testid="uni-kept">{L(up.kept)}</p>}
        </div>
      )}
      {usable.length >= 2 && <CompareTable kind={kind} picks={usable} setOption={setOption} remove={(id) => toggle(getSchool(id)!)} cityName={cityName} fill={(t, v) => fill(t, lang, v)} />}
    </div>
  );
}

function CompareTable({ kind, picks, setOption, remove, cityName, fill }: { kind: SchoolKind; picks: Pick[]; setOption: (s: string, o: string) => void; remove: (id: string) => void; cityName: (id: string) => string; fill: (t: Localized, v: Record<string, string | number>) => string }) {
  const { L } = useI18n();
  const cols = picks.map((p) => { const sc = getSchool(p.schoolId)!; const opt = isLanguage(sc) ? sc.courses.find((c) => c.id === p.optionId) : sc.programs.find((c) => c.id === p.optionId); return { sc, opt, pick: p }; });
  const text = (f: Fact<Localized> | undefined, k = "text" as const) => (f ? <FactView fact={f} kind={k} compact /> : <span className="text-sm text-slate-400">{L(d.pending)}</span>);
  const pend = <span className="text-sm text-slate-400">{L(d.pending)}</span>;
  const num = (f: Fact<number> | undefined, tpl: Localized) => (f?.value !== undefined && (f.status === "verified" || f.status === "sample") ? <span>{fill(tpl, { n: f.value })} <StatusBadge status={f.status} /></span> : pend);
  const weeks = (c?: LanguageCourse) => { const f = c?.duration; if (!f?.value || (f.status !== "verified" && f.status !== "sample")) return pend; const v = f.value; return <span>{v.maxWeeks === undefined ? fill(s.weeksMin, { min: v.minWeeks }) : v.maxWeeks === v.minWeeks ? `${v.minWeeks} ${L(s.weeks)}` : fill(s.weeksRange, { min: v.minWeeks, max: v.maxWeeks })} <StatusBadge status={f.status} /></span>; };
  const price = (f?: Fact<Price>) => (f ? <PriceView fact={f} /> : pend);
  const site = (sc: School) => (sc.website.value && sc.website.status !== "pending" ? <span className="flex flex-wrap items-center gap-1"><a href={sc.website.value} target="_blank" rel="noopener noreferrer" className="text-sky-700 underline">{L(s.visit)} ↗</a>{sc.website.status !== "verified" && <StatusBadge status={sc.website.status} />}</span> : pend);
  const lang = (c: { opt?: LanguageCourse | UniversityProgram }) => c.opt as LanguageCourse | undefined;
  const uni = (c: { opt?: LanguageCourse | UniversityProgram }) => c.opt as UniversityProgram | undefined;
  type Row = [Localized, (c: (typeof cols)[number]) => React.ReactNode];
  const rows: Row[] = kind === "language" ? [
    [s.rows.location, (c) => <>{cityName(c.sc.cityId)}<div className="text-xs text-slate-500">{text(c.sc.address)}</div></>],
    [s.rows.hours, (c) => num(lang(c)?.hoursPerWeek, s.hours)], [s.rows.duration, (c) => weeks(lang(c))],
    [s.rows.tuition, (c) => price(lang(c)?.tuition)], [s.rows.registration, (c) => price(lang(c)?.registrationFee)], [s.rows.materials, (c) => price(lang(c)?.materialsFee)],
    [s.rows.accommodation, (c) => (isLanguage(c.sc) ? text(c.sc.accommodation) : pend)], [s.rows.website, (c) => site(c.sc)],
  ] : [
    [s.rows.location, (c) => <>{cityName(c.sc.cityId)}<div className="text-xs text-slate-500">{text(c.sc.address)}</div></>],
    [s.rows.years, (c) => num(uni(c)?.years, s.yearsN)], [s.rows.tuitionIntl, (c) => price(uni(c)?.tuitionInternational)],
    [s.rows.entry, (c) => (uni(c) ? text(uni(c)!.entryRequirements) : pend)], [s.rows.apply, (c) => (uni(c) ? text(uni(c)!.applicationPeriod) : pend)], [s.rows.website, (c) => site(c.sc)],
  ];
  const tuitionFacts = cols.map((c) => (kind === "language" ? lang(c)?.tuition : uni(c)?.tuitionInternational)).filter(Boolean) as Fact<Price>[];
  const issues = priceIssues(tuitionFacts, kind === "language" ? (cols.map((c) => lang(c)?.duration).filter(Boolean) as Fact<WeeksRange>[]) : []);
  return (
    <section className="space-y-3">
      {issues.length > 0 && <div role="note" className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900"><p className="font-semibold">⚠ {L(s.rows.tuition)}</p><ul className="mt-1 list-disc space-y-0.5 pl-5">{issues.map((i) => <li key={i}>{L(s.issues[i])}</li>)}</ul></div>}
      <div className={`overflow-x-auto p-4 ${panel}`}>
        <table className="w-full min-w-[680px] text-sm">
          <thead><tr><th className="w-36" />{cols.map((c) => (
            <th key={c.sc.id} className="p-2 text-left align-top font-normal">
              <p className="text-base font-semibold text-slate-800">{c.sc.name}</p>
              {c.sc.demo && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-800">{L(s.sample)}</span>}
              {optionsOf(c.sc).length > 0
                ? <select aria-label={L(kind === "language" ? s.course : s.program)} value={c.pick.optionId} onChange={(e) => setOption(c.sc.id, e.target.value)} className="mt-2 block w-full rounded-lg bg-white px-2 py-1 text-sm ring-1 ring-slate-200">{optionsOf(c.sc).map((o) => <option key={o.id} value={o.id}>{L(o.label)}</option>)}</select>
                : <p className="mt-2 text-xs text-slate-400">{L(kind === "language" ? s.course : s.program)}: {L(d.pending)}</p>}
              <button onClick={() => remove(c.sc.id)} className="mt-1 text-xs text-slate-500 underline">{L(s.remove)}</button>
            </th>))}</tr></thead>
          <tbody>{rows.map(([label, f]) => {
            const isTuition = label === s.rows.tuition || label === s.rows.tuitionIntl;
            return <tr key={label.en} className="border-t border-slate-100"><td className="p-2 align-top text-slate-500">{L(label)}{isTuition && issues.length > 0 && <p className="mt-1 text-[11px] text-amber-700">⚠ {issues.length}</p>}</td>{cols.map((c) => <td key={c.sc.id} className="p-2 align-top">{f(c)}</td>)}</tr>;
          })}</tbody>
        </table>
      </div>
    </section>
  );
}
