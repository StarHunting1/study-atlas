"use client";
import Link from "next/link";
import { useState } from "react";
import { getCity, type City } from "@/data/cities";
import { sections } from "@/data/fields";
import { moneyComparability } from "@/data/comparability";
import { climateCompare, climateIssues, compareRows, hasHeldNotice, missingReason, pickPoint, rowVerdict, type ClimateCompare, type Issue } from "@/data/official/compare";
import { officialData } from "@/data/official";
import type { Fact, Money } from "@/data/types";
import { useI18n, type Localized } from "@/lib/i18n";
import { availability, compareKeys, EXTRA_TOPICS, extraKey, keyFigure, rentCmp, rentKey, TOPICS, type Availability, type Cmp, type ExtraTopic, type Key, type Topic } from "@/lib/overview";
import { panel } from "@/lib/ui";
import { dataText as d } from "@/locales/data";
import { ot } from "@/locales/official";
import { ux } from "@/locales/ux";
import { cu } from "@/locales/compareUi";
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
const ROWS_OF: Record<Topic, string[]> = { living: ["livingTotal"], housing: ["uniHalls"], transport: ["single", "monthlyAdult", "studentTransit"], climate: [], education: [] };
/** Comparison rows: the five key topics, with the general rental market as its own row right after student housing. */
type CmpTopic = Topic | "rent"; const CMP_TOPICS: CmpTopic[] = ["living", "housing", "rent", "transport", "climate", "education"];
const keysOf = (cities: City[], t: CmpTopic): Key[] => cities.map((c) => (t === "rent" ? rentKey(c) : keyFigure(c, t)));
const cmpOf = (keys: Key[], t: CmpTopic): Cmp => (t === "rent" ? rentCmp(keys) : compareKeys(keys));
const titleOf = (t: CmpTopic, L: (x: Localized) => string) => (t === "rent" ? L(cu.rentTitle) : t === "housing" ? L(cu.studentHousingTitle) : L(ux.topics[t]));
const SECTION_OF: Record<Topic, string> = { living: "cost", housing: "housing", transport: "transport", climate: "climate", education: "education" };
const EXTRA_FIELDS: Record<ExtraTopic, string[]> = { safety: ["safety.crimeStats", "safety.advice"], visa: ["visa.official", "visa.notes"], medical: ["living.healthcare"], daily: ["living.studentLife", "living.sim", "living.banking", "living.studentFacilities"] };
const issueText: Record<Issue, keyof typeof ot> = { missing: "cmpMissing", notVerified: "cmpUnverified", period: "cmpPer", audience: "cmpAudience" };
/** The three states the user sees (comparable / reference only / not obtained) plus "official link only" for figures the publisher's terms keep off the page. */
const chip: Record<Availability, { label: keyof typeof cu; kind: "ok" | "ref" | "link" | "none"; cls: string }> = {
  comparable: { label: "comparable", kind: "ok", cls: "bg-emerald-50 text-emerald-800 ring-emerald-100" }, reference: { label: "reference", kind: "ref", cls: "bg-amber-50 text-amber-800 ring-amber-200" },
  partial: { label: "reference", kind: "ref", cls: "bg-amber-50 text-amber-800 ring-amber-200" }, linkOnly: { label: "linkOnly", kind: "link", cls: "bg-sky-50 text-sky-800 ring-sky-200" },
  notYet: { label: "notYet", kind: "none", cls: "bg-slate-100 text-slate-500 ring-slate-200" },
};
const whyKey = (av: Availability, cmp: Cmp): keyof typeof cu.why => (av === "partial" || av === "linkOnly" ? av : cmp);

/** What exactly the number is, in one line: the statistic and area for market rents, the university for student housing. */
const basisOf = (k: Key, topic?: CmpTopic): Localized | undefined => { if (k.kind !== "point") return undefined;
  if (topic === "rent") return cu.rentBasis[k.point.metric];
  if (topic === "housing" && k.point.housing) return { en: k.point.housing.school, ja: k.point.housing.school }; return undefined; };
function Cells({ cities, keys, topic }: { cities: City[]; keys: Key[]; topic?: CmpTopic }) {
  const { L, lang } = useI18n();
  return (
    <div className="grid gap-x-6 gap-y-3" style={{ gridTemplateColumns: `repeat(${Math.min(cities.length, 4)}, minmax(0, 1fr))` }}>
      {cities.map((c, i) => <div key={c.id} data-city={c.id} className="min-w-0"><p className="mb-1 truncate text-xs font-medium text-slate-500">{L(c.name)}</p><KeyView k={keys[i]} noneText={topic === "housing" && hasHeldNotice(c.id, "housing") ? cu.noticeHere : cu.notYet} />{keys[i].kind === "point" && <p className="mt-0.5 text-[11px] leading-snug text-slate-400" data-testid="key-period">{validForShort(keys[i].point.validFor, lang)}</p>}{basisOf(keys[i], topic) && <p className="text-[11px] leading-snug text-slate-500" data-testid="key-basis">{L(basisOf(keys[i], topic)!)}</p>}</div>)}
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

function OfficialDetail({ cities, topic }: { cities: City[]; topic: CmpTopic }) {
  const { L, lang } = useI18n(); const rows = compareRows.filter((r) => (topic === "rent" ? ["marketRent"] : ROWS_OF[topic]).includes(r.id));
  const showClimate = topic === "climate" && cities.some((c) => climateCompare(c.id));
  if (!rows.length && !showClimate) return null;
  const none = <span className="text-xs text-slate-400">{L(ot.cmpMissing)}</span>;
  /** A city without a shown figure: say why (terms allow only a link / reviewed and held back) instead of a bare "no data". */
  const gap = (cityId: string, row: (typeof compareRows)[number]) => { const m = missingReason(cityId, row); if (!m) return none;
    return m.kind === "link"
      ? <div className="space-y-1" data-testid="gap-link"><p className="text-xs text-slate-500">{L(cu.heldHere)}</p><a href={m.url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-[40px] items-center text-xs font-medium text-sky-700 underline">{L(cu.heldLink)} ↗ <span className="ml-1 font-normal text-slate-500">{m.publisher}</span></a></div>
      : <div className="space-y-1" data-testid="gap-notice"><p className="text-xs font-medium text-slate-600">{L(cu.noticeHere)}</p><p className="text-[11px] leading-snug text-slate-500">{L(cu.heldDetail)}</p><Disclosure level="sources"><p className="text-[11px] leading-snug text-slate-500">{L(m.text)}</p><ul className="mt-1 space-y-0.5">{m.links.map((l) => <li key={l.url}><a href={l.url} target="_blank" rel="noopener noreferrer" className="text-[11px] text-sky-700 underline">{L(l.label)} ↗</a></li>)}</ul></Disclosure></div>; };
  return (
    <div className="space-y-3">
      {rows.map((row) => {
        const pts = cities.map((c) => pickPoint(c.id, row)); if (!pts.some(Boolean) && !cities.some((c) => missingReason(c.id, row)?.kind === "link")) return null; const { verdict, issues } = rowVerdict(row, pts);
        return <DetailRow key={row.id} label={L(row.label)} note={verdict === "notDirect" ? L(row.basis!) : verdict === "missing" && cities.some((c) => missingReason(c.id, row)?.kind === "link") ? L(cu.why.linkOnly) : cities.some((c) => missingReason(c.id, row)?.kind === "notice") && (verdict === "missing" || verdict === "issues") ? undefined : issues.length ? issues.map((i) => L(ot[issueText[i]] as never)).join(" / ") : L(ot.cmpOk)} noteCls={issues.length || verdict === "notDirect" ? "text-amber-700" : "text-emerald-700"} extra={row.hint ? L(row.hint) : undefined} cities={cities}
          cells={pts.map((p, i) => p ? <div className="space-y-1"><AmountText p={p} /> {p.status !== "verified" && <StatusBadge status={p.status} />}
            <p className="text-[11px] text-slate-500">{L(ot.audience[p.audience])} · {validForShort(p.validFor, lang)}</p><p className="text-[11px] leading-snug text-slate-500">{L(p.conditions)}</p>
            <Disclosure level="sources"><p className="text-[11px] text-slate-500">{L(ot.source)}: <a href={p.evidence[0].url} target="_blank" rel="noopener noreferrer" className="text-sky-700 underline">{p.evidence[0].publisher}</a> · {L(ot.retrieved)}: {p.retrievedAt}{p.checkedAt ? ` · ${L(ot.checked)}: ${p.checkedAt}` : ""}</p></Disclosure></div> : gap(cities[i].id, row))} />;
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

function Row({ id, title, cities, keys, cmp, topic, note, why, children }: { id: string; title: string; cities: City[]; keys: Key[]; cmp: Cmp; topic?: CmpTopic; note?: Localized; why?: Localized; children: React.ReactNode }) {
  const { L } = useI18n(); const av = availability(keys, cmp); const c = cmp === "n/a" ? null : chip[av];
  return (
    <section id={`cmp-${id}`} data-testid={`cmp-${id}`} data-cmp={cmp} data-av={av} className={`${panel} space-y-3 p-4 sm:p-5`}>
      <div className="flex flex-wrap items-center justify-between gap-2"><h2 className="text-base font-semibold text-[#0b2a5b]">{title}</h2>{c && <span data-testid={`chip-${id}`} className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ring-1 ${c.cls}`}>{L(cu[c.label] as never)}</span>}</div>
      <p data-testid={`why-${id}`} className="-mt-1 text-xs leading-snug text-slate-500">{L(why ?? cu.why[whyKey(av, cmp)])}</p>
      {note && <p className="-mt-1 text-xs leading-snug text-slate-500" data-testid={`note-${id}`}>{L(note)}</p>}
      <Cells cities={cities} keys={keys} topic={topic} />
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
      <nav aria-label={L(cu.glanceTitle)} data-testid="glance" className={`${panel} p-4`}>
        <h2 className="text-sm font-semibold text-[#0b2a5b]">{L(cu.glanceTitle)}</h2><p className="mb-2 text-[11px] text-slate-500">{L(cu.glanceNote)}</p>
        <ul className="flex flex-wrap gap-2">{CMP_TOPICS.map((t) => { const keys = keysOf(cities, t); const av = availability(keys, cmpOf(keys, t)); const kind = chip[av].kind;
          return <li key={t}><a href={`#cmp-${t}`} data-testid={`glance-${t}`} data-kind={kind} className={`inline-flex min-h-[36px] items-center gap-1.5 rounded-full px-3 text-xs font-medium ring-1 ${chip[av].cls}`}>{titleOf(t, L)}<span className="font-normal">· {L(cu[chip[av].label] as never)}</span></a></li>; })}</ul>
      </nav>
      {CMP_TOPICS.map((t) => { const keys = keysOf(cities, t); const cmp = cmpOf(keys, t); const av = availability(keys, cmp);
        return <Row key={t} id={t} title={titleOf(t, L)} cities={cities} keys={keys} cmp={cmp} topic={t} note={t === "housing" ? cu.studentHousingNote : undefined} why={t === "rent" && av !== "partial" && av !== "notYet" ? cu.rentWhy[cmp === "same" ? "same" : "differ"] : undefined}>
          {anyOfficial && <OfficialDetail cities={cities} topic={t} />}{t !== "rent" && <FactDetail cities={cities} sectionIds={[SECTION_OF[t]]} />}
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
