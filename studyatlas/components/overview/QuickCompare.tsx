"use client";
import Link from "next/link";
import { useState } from "react";
import { getCity, type City } from "@/data/cities";
import { sections } from "@/data/fields";
import { moneyComparability } from "@/data/comparability";
import { climateCompare, climateIssues, compareRows, pickPoint, rowVerdict, type ClimateCompare, type Issue } from "@/data/official/compare";
import { officialData } from "@/data/official";
import type { Fact, Money } from "@/data/types";
import { useI18n } from "@/lib/i18n";
import { compareKeys, EXTRA_TOPICS, extraKey, keyFigure, TOPICS, type Cmp, type ExtraTopic, type Key, type Topic } from "@/lib/overview";
import { panel } from "@/lib/ui";
import { dataText as d } from "@/locales/data";
import { ot } from "@/locales/official";
import { ux } from "@/locales/ux";
import { validForShort } from "@/data/official/validFor";
import Disclosure from "@/components/Disclosure";
import FactView, { StatusBadge } from "@/components/FactView";
import { AmountText } from "@/components/official/DataCard";
import KeyView from "./KeyView";

/*
 * Compare (Ver.1.8): five key topics side by side. Each row shows one short figure per city and a one-word verdict on whether the
 * figures share a basis; "詳しく見る" opens every official figure and profile fact behind it (with sources one more click away).
 * "さらに比較する" adds safety, visa, healthcare and student life. Currencies are never converted and gaps are never filled.
 */
const ROWS_OF: Record<Topic, string[]> = { living: ["livingTotal"], housing: ["uniHalls", "marketRent"], transport: ["single", "monthlyAdult", "studentTransit"], climate: [], education: [] };
const SECTION_OF: Record<Topic, string> = { living: "cost", housing: "housing", transport: "transport", climate: "climate", education: "education" };
const EXTRA_FIELDS: Record<ExtraTopic, string[]> = { safety: ["safety.crimeStats", "safety.advice"], visa: ["visa.official", "visa.notes"], medical: ["living.healthcare"], daily: ["living.studentLife", "living.sim", "living.banking", "living.studentFacilities"] };
const issueText: Record<Issue, keyof typeof ot> = { missing: "cmpMissing", notVerified: "cmpUnverified", period: "cmpPer", audience: "cmpAudience" };
const chip: Record<Exclude<Cmp, "n/a">, { key: keyof typeof ux; cls: string }> = {
  same: { key: "cmpSame", cls: "bg-emerald-50 text-emerald-700 ring-emerald-100" }, differ: { key: "cmpDiff", cls: "bg-amber-50 text-amber-800 ring-amber-200" },
  unverified: { key: "cmpUnverified", cls: "bg-amber-50 text-amber-800 ring-amber-200" }, missing: { key: "cmpMissing", cls: "bg-slate-100 text-slate-500 ring-slate-200" },
};

function Cells({ cities, keys }: { cities: City[]; keys: Key[] }) {
  const { L } = useI18n();
  return (
    <div className="grid gap-x-6 gap-y-3" style={{ gridTemplateColumns: `repeat(${Math.min(cities.length, 4)}, minmax(0, 1fr))` }}>
      {cities.map((c, i) => <div key={c.id} data-city={c.id} className="min-w-0"><p className="mb-1 truncate text-xs font-medium text-slate-500">{L(c.name)}</p><KeyView k={keys[i]} /></div>)}
    </div>
  );
}

/** One detail row: what is compared (and whether it shares a basis) on top, then one block per city. Stacks on narrow screens. */
function DetailRow({ label, note, noteCls = "text-slate-400", extra, cities, cells }: { label: string; note?: string; noteCls?: string; extra?: string; cities: City[]; cells: React.ReactNode[] }) {
  const { L } = useI18n();
  return (
    <div className="space-y-2 border-t border-slate-100 pt-3" data-detail>
      <div><p className="text-sm font-medium text-slate-700">{label}</p>{note && <p className={`text-[11px] leading-snug ${noteCls}`}>{note}</p>}{extra && <p className="text-[11px] leading-snug text-slate-400">{extra}</p>}</div>
      <div className="grid gap-x-4 gap-y-3 sm:grid-cols-[repeat(var(--n),minmax(0,1fr))]" style={{ ["--n" as string]: Math.min(cities.length, 4) }}>
        {cities.map((c, i) => <div key={c.id} className="min-w-0 space-y-1"><p className="text-xs font-medium text-slate-500">{L(c.name)}</p>{cells[i]}</div>)}
      </div>
    </div>
  );
}

function OfficialDetail({ cities, topic }: { cities: City[]; topic: Topic }) {
  const { L, lang } = useI18n(); const rows = compareRows.filter((r) => ROWS_OF[topic].includes(r.id));
  const showClimate = topic === "climate" && cities.some((c) => climateCompare(c.id));
  if (!rows.length && !showClimate) return null;
  const none = <span className="text-xs text-slate-400">{L(ot.cmpMissing)}</span>;
  return (
    <div className="space-y-3">
      {rows.map((row) => {
        const pts = cities.map((c) => pickPoint(c.id, row)); if (!pts.some(Boolean)) return null; const { verdict, issues } = rowVerdict(row, pts);
        return <DetailRow key={row.id} label={L(row.label)} note={verdict === "notDirect" ? L(row.basis!) : issues.length ? issues.map((i) => L(ot[issueText[i]] as never)).join(" / ") : L(ot.cmpOk)} noteCls={issues.length || verdict === "notDirect" ? "text-amber-700" : "text-emerald-700"} extra={row.hint ? L(row.hint) : undefined} cities={cities}
          cells={pts.map((p) => p ? <div className="space-y-1"><AmountText p={p} /> {p.status !== "verified" && <StatusBadge status={p.status} />}
            <p className="text-[11px] text-slate-500">{L(ot.audience[p.audience])} · {validForShort(p.validFor, lang)}</p><p className="text-[11px] leading-snug text-slate-500">{L(p.conditions)}</p>
            <Disclosure level="sources"><p className="text-[11px] text-slate-500">{L(ot.source)}: <a href={p.evidence[0].url} target="_blank" rel="noopener noreferrer" className="text-sky-700 underline">{p.evidence[0].publisher}</a> · {L(ot.retrieved)}: {p.retrievedAt}{p.checkedAt ? ` · ${L(ot.checked)}: ${p.checkedAt}` : ""}</p></Disclosure></div> : none)} />;
      })}
      {showClimate && ([["tmax", ot.cmpTmax, (c: ClimateCompare) => c.tmax && `${c.tmax[0].toFixed(1)} – ${c.tmax[1].toFixed(1)} °C`], ["tmin", ot.cmpTmin, (c: ClimateCompare) => c.tmin && `${c.tmin[0].toFixed(1)} – ${c.tmin[1].toFixed(1)} °C`], ["precip", ot.cmpPrecip, (c: ClimateCompare) => c.precipTotal !== undefined && `${c.precipTotal} mm`]] as const).map(([key, label, fmtv]) => {
        const cs = cities.map((c) => climateCompare(c.id)); const issues = climateIssues(cs);
        return <DetailRow key={key} label={L(label)} note={issues.length ? issues.map((i) => L(i === "period" ? ot.cmpClimatePeriods : ot[issueText[i]] as never)).join(" / ") : L(ot.cmpOkSame)} noteCls={issues.length ? "text-amber-700" : "text-emerald-700"} extra={key === "precip" ? L(ot.cmpPrecipNote) : undefined} cities={cities}
          cells={cs.map((c) => c && fmtv(c) ? <div className="space-y-1"><span className="font-semibold tabular-nums">{fmtv(c)}</span> {c.status !== "verified" && <StatusBadge status={c.status} />}<p className="text-[11px] text-slate-500">{L(ot.climateStation)}: {c.station}</p><p className="text-[11px] text-slate-500">{L(ot.climatePeriod)}: {c.period}{c.derived ? ` · ${L(ot.cmpDerived)}` : ""}</p></div> : none)} />;
      })}
    </div>
  );
}

/** Profile facts (Ver.1.3) of one or more sections, side by side. */
function FactDetail({ cities, sectionIds, fieldIds }: { cities: City[]; sectionIds: string[]; fieldIds?: string[] }) {
  const { L } = useI18n(); const cmpNote = { notVerified: d.cmpNotVerified, currency: d.cmpCurrency, basis: d.cmpBasis } as const;
  const fields = sections.filter((s) => sectionIds.includes(s.id)).flatMap((s) => s.fields.filter((f) => (fieldIds ? fieldIds.includes(f.id) : f.compare)));
  if (!fields.length) return null;
  return (
    <div className="space-y-3">
      {fields.map((f) => {
        const facts = cities.map((c) => f.get(c)); const cmp = f.kind === "money" ? moneyComparability(facts as Fact<Money>[]) : "ok";
        return <DetailRow key={f.id} label={L(f.label)} note={cmp !== "ok" ? L(cmpNote[cmp]) : undefined} noteCls="text-amber-700" cities={cities} cells={facts.map((fact) => <FactView fact={fact} kind={f.kind} compact lean />)} />;
      })}
    </div>
  );
}

function Row({ id, title, cities, keys, cmp, children }: { id: string; title: string; cities: City[]; keys: Key[]; cmp: Cmp; children: React.ReactNode }) {
  const { L } = useI18n(); const c = cmp === "n/a" ? null : chip[cmp];
  return (
    <section data-testid={`cmp-${id}`} data-cmp={cmp} className={`${panel} space-y-3 p-4 sm:p-5`}>
      <div className="flex flex-wrap items-center justify-between gap-2"><h2 className="text-base font-semibold text-[#0b2a5b]">{title}</h2>{c && <span data-testid={`chip-${id}`} className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ring-1 ${c.cls}`}>{L(ux[c.key] as never)}</span>}</div>
      <Cells cities={cities} keys={keys} />
      <Disclosure level="more" testid={`more-${id}`}><div className="space-y-4">{children}</div></Disclosure>
    </section>
  );
}

export default function QuickCompare({ ids }: { ids: string[] }) {
  const { L } = useI18n(); const [more, setMore] = useState(false);
  const cities = ids.map((id) => getCity(id)).filter((c): c is City => !!c);
  if (cities.length < 2) return null;
  const anyOfficial = cities.some((c) => officialData(c.id));
  return (
    <div className="space-y-4" data-testid="quick-compare">
      <p className="text-xs text-slate-500">{L(ux.cmpIntro)}</p>
      {TOPICS.map((t) => { const keys = cities.map((c) => keyFigure(c, t));
        return <Row key={t} id={t} title={L(ux.topics[t])} cities={cities} keys={keys} cmp={compareKeys(keys)}>
          {anyOfficial && <OfficialDetail cities={cities} topic={t} />}<FactDetail cities={cities} sectionIds={[SECTION_OF[t]]} />
          {t === "education" && <Link href="/schools" className="inline-block text-sm text-sky-700 underline">{L(ux.seeSchools)}</Link>}
        </Row>; })}
      <div className="flex justify-center"><button type="button" data-testid="more-compare" aria-expanded={more} onClick={() => setMore(!more)} className="min-h-[44px] rounded-full bg-white px-6 text-sm font-medium text-[#0b2a5b] ring-1 ring-slate-300 hover:bg-slate-50">{more ? L(ux.lessCompare) : L(ux.moreCompare)}</button></div>
      {more && <div className="sa-fade space-y-4" data-testid="extra-compare">
        {EXTRA_TOPICS.map((t: ExtraTopic) => { const keys = cities.map((c) => extraKey(c, t));
          return <Row key={t} id={t} title={L(ux.extra[t])} cities={cities} keys={keys} cmp={compareKeys(keys)}>
            <FactDetail cities={cities} sectionIds={[t === "safety" ? "safety" : t === "visa" ? "visa" : "living"]} fieldIds={EXTRA_FIELDS[t]} /></Row>; })}
      </div>}
    </div>
  );
}
