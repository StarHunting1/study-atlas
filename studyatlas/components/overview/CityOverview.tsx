"use client";
import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import type { City, Country } from "@/data/types";
import type { DataPoint, OfficialCityData } from "@/data/official/types";
import { officialSources } from "@/data/official";
import { sections } from "@/data/fields";
import { displayModeOfClimate, showsFigure } from "@/data/official/rights";
import { healthLinks, visaLinks } from "@/data/visa";
import { useI18n } from "@/lib/i18n";
import { panel } from "@/lib/ui";
import { keyFigure, TOPICS, type Topic } from "@/lib/overview";
import { dataText as d } from "@/locales/data";
import { ot } from "@/locales/official";
import { ux } from "@/locales/ux";
import Disclosure from "@/components/Disclosure";
import FactView, { StatusBadge } from "@/components/FactView";
import { CardGrid } from "@/components/official/DataCard";
import { housingKindOf } from "@/data/official/housingKind";
import ClimateCharts from "@/components/official/ClimateCharts";
import KeyView from "./KeyView";
import { sc } from "@/locales/schoolCompare";
import StudyModeSwitch from "./StudyModeSwitch";
import { fitOf, type StudyMode } from "@/data/official/studyType";
import { useStudyMode } from "@/lib/studyMode";
import type { Status } from "@/data/types";

/*
 * City page (Ver.1.8): five cards (living, housing, transport, climate, schools) with one key figure each; "詳しく見る" opens the
 * breakdown (level 2) and every figure keeps its own "出典・適用条件" (level 3). Visa, healthcare, safety, daily life and the data
 * status sit in a separate section below, always reachable. Deep links: /city/manchester#transport (cards) or #visa, #safety, #daily, #data.
 */
/** Card order by study type (Ver.1.2.6): schools and housing lead for both; language study then transport, university study then living costs. Climate stays last. */
export const cardOrder = (m: StudyMode): Topic[] => (m === "language" ? ["education", "housing", "transport", "living", "climate"] : ["education", "housing", "living", "transport", "climate"]);
const ROWS = ["visa", "safety", "daily", "data"] as const; type Row = (typeof ROWS)[number];

function Notices({ data, topic }: { data?: OfficialCityData; topic: DataPoint["topic"] }) {
  const { L } = useI18n(); const ns = (data?.notices ?? []).filter((n) => n.topic === topic); if (!ns.length) return null;
  return <>{ns.map((n) => (
    <section key={n.sourceId} className="space-y-1 rounded-xl bg-slate-50 p-3 ring-1 ring-slate-200">
      <h4 className="text-xs font-semibold text-slate-700">{L(ot.notShownTitle)}</h4><p className="text-xs leading-relaxed text-slate-600">{L(n.text)}</p>
      <ul className="space-y-1 text-xs">{n.links.map((l) => <li key={l.url}><a href={l.url} target="_blank" rel="noopener noreferrer" className="text-sky-700 underline">{L(l.label)} ↗</a></li>)}</ul>
    </section>))}</>;
}

/** Ver.1.2.5 – the housing card leads with what a student pays per person (halls, homestay, a room in a shared house); a missing price says so instead of showing anything else. */
export function HousingStudentFirst({ city, data, points, mode }: { city: City; data?: OfficialCityData; points: DataPoint[]; mode?: StudyMode }) {
  const { L } = useI18n(); const kinds = mode === "language" ? (["homestay", "share", "dorm"] as const) : (["dorm", "share", "homestay"] as const);
  return (
    <div className="space-y-4" data-testid="housing-student">
      <p className="text-xs leading-relaxed text-slate-500">{L(ot.housingNote)}</p>
      <section className="space-y-3"><h3 className="text-sm font-semibold text-[#0b2a5b]">{L(ot.housingPricesTitle)}</h3>
        {kinds.map((k) => { const pts = points.filter((p) => housingKindOf(p) === k);
          return <div key={k} data-testid={`kind-${k}`} data-count={pts.length} className="space-y-1.5">
            <h4 className="text-sm font-medium text-slate-800">{L(ot.housingKinds[k])} <span className="text-[11px] font-normal text-slate-500">· {L(ot.housingKindUnit[k])}</span></h4>
            {pts.length ? <CardGrid points={pts} /> : <p className="rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-500 ring-1 ring-slate-200" data-testid={`prep-${k}`}>{L(ot.pricePrep)}</p>}
          </div>; })}
        <Notices data={data} topic="housing" />
      </section>
      <section className="space-y-1.5" data-testid="housing-types"><h3 className="text-sm font-semibold text-[#0b2a5b]">{L(ot.housingTypesTitle)}</h3>
        <dl className="space-y-1.5 text-xs leading-relaxed text-slate-600">{[...kinds, "market" as const].map((k) => <div key={k} data-testid={`type-${k}`}><dt className="inline font-medium text-slate-700">{L(ot.housingKinds[k])}: </dt><dd className="inline">{L(ot.housingTypes[k])} <span className="text-slate-500">{L(ot.housingChecks[k])}</span></dd></div>)}</dl>
        <p className="text-xs text-slate-500">{L(ot.housingTypesCheck)}</p></section>
    </div>
  );
}
function Group({ title, note, points }: { title: string; note?: string; points: DataPoint[] }) {
  if (!points.length) return null;
  return <section className="space-y-2"><h4 className="text-sm font-semibold text-[#0b2a5b]">{title}</h4>{note && <p className="text-xs leading-relaxed text-slate-500">{note}</p>}<CardGrid points={points} /></section>;
}
/** A profile section (Ver.1.3 facts) with sources behind "出典・適用条件". */
function Profile({ city, id, order }: { city: City; id: string; /** field ids to show first (study type) */ order?: string[] }) {
  const { L } = useI18n(); const s = sections.find((x) => x.id === id); if (!s) return null;
  const rank = (f: string) => { const i = order?.indexOf(f) ?? -1; return i < 0 ? 99 : i; }; const fields = order ? [...s.fields].sort((a, b) => rank(a.id) - rank(b.id)) : s.fields;
  return (
    <dl className="divide-y divide-slate-100">
      {fields.map((f) => (
        <div key={f.id} className="grid gap-1 py-2.5 text-sm sm:grid-cols-[9rem_1fr] sm:gap-3">
          <dt className="text-slate-500">{L(f.label)}</dt><dd className="text-slate-700"><FactView fact={f.get(city)} kind={f.kind} lean /></dd>
        </div>
      ))}
    </dl>
  );
}

/** Figures that do not apply to the chosen study type: kept reachable, but never shown as usable. */
function OtherFit({ topic, mode, points }: { topic: Topic; mode: StudyMode; points: DataPoint[] }) {
  const { L } = useI18n(); const unconf = points.filter((p) => fitOf(p, mode) === "unconfirmed"), not = points.filter((p) => fitOf(p, mode) === "not");
  if (!unconf.length && !not.length) return null;
  return <Disclosure level="more" label={L(ux.studyMode.otherMore[mode])} testid={`other-${topic}`}><div className="space-y-3">
    <Group title={L(ux.studyMode.unconfirmedTitle)} note={L(ux.studyMode.unconfirmed)} points={unconf} />
    <Group title={L(ux.studyMode.notForTitle)} note={L(ux.studyMode.notFor)} points={not} /></div></Disclosure>;
}
const LANG_FIRST: Record<string, string[]> = { education: ["education.languageSchools", "education.tuition", "education.universities"], housing: ["housing.homestay", "housing.shareHouse", "housing.dorm", "housing.overview"] };
const UNI_FIRST: Record<string, string[]> = { education: ["education.universities", "education.tuition", "education.languageSchools"], housing: ["housing.dorm", "housing.shareHouse", "housing.homestay", "housing.overview"] };

function Card({ topic, city, data, open, setOpen, mode }: { topic: Topic; city: City; data?: OfficialCityData; open: boolean; setOpen: (o: boolean) => void; mode: StudyMode }) {
  const { L } = useI18n(); const k = keyFigure(city, topic, mode); const all = (t: DataPoint["topic"]) => (data?.points ?? []).filter((p) => p.topic === t);
  const by = (t: DataPoint["topic"]) => all(t).filter((p) => fitOf(p, mode) === "applies"); const order = (mode === "language" ? LANG_FIRST : UNI_FIRST)[topic];
  let body: ReactNode = null;
  if (topic === "living") body = <>{by("living").length > 0 && <><p className="rounded-xl bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-900">{L(ot.livingIntro)}</p><CardGrid points={by("living")} /></>}{all("living").length > 0 && by("living").length === 0 && <p className="rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-500 ring-1 ring-slate-200" data-testid="prep-living">{L(ot.pricePrep)}</p>}<Profile city={city} id="cost" /></>;
  if (topic === "housing") body = <><HousingStudentFirst city={city} data={data} points={by("housing")} mode={mode} />
    <Disclosure level="more" label={L(ot.housingMarketMore)} testid="market-more"><div className="space-y-3"><p className="text-xs leading-relaxed text-slate-500">{L(ot.housingMarketMoreNote)}</p>
      <Group title={L(ot.housingMarket)} points={by("housing").filter((p) => housingKindOf(p) === "market")} /></div></Disclosure><Profile city={city} id="housing" order={order} /></>;
  if (topic === "transport") body = <><Group title={L(ot.transportAdult)} points={by("transport").filter((p) => p.audience === "adult")} /><Group title={L(ot.transportStudent)} points={by("transport").filter((p) => p.audience !== "adult")} /><Profile city={city} id="transport" /></>;
  if (topic === "climate") body = <>{data?.climate && showsFigure(displayModeOfClimate(data.climate)) && <><div className="flex flex-wrap items-center gap-2"><StatusBadge status={data.climate.status} /><span className="text-xs text-slate-500">{L(ot.retrieved)}: {data.climate.retrievedAt}</span></div><ClimateCharts c={data.climate} />
    {data.climate.derived && <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-900">{L(ot.climateDerived)}</p>}
    <Disclosure level="sources"><p className="text-[11px] text-slate-500">{data.climate.evidence.map((e) => <span key={e.url}>{L(ot.source)}: <a href={e.url} target="_blank" rel="noopener noreferrer" className="text-sky-700 underline">{e.publisher}</a> — {L(e.section)} </span>)}</p>{data.climate.note && <p className="mt-1 text-[11px] text-slate-400">{L(data.climate.note)}</p>}</Disclosure></>}
    {data?.climateNote && <p className="text-xs text-slate-500">{L(data.climateNote)}</p>}<Profile city={city} id="climate" /></>;
  if (topic === "education") body = <><Profile city={city} id="education" order={order} /><Group title={L(ot.housingUni)} points={by("housing").filter((p) => p.housing)} />{mode === "language" && <Link href="/schools/compare" data-testid="compare-schools" className="mr-4 inline-block py-1 text-sm text-sky-700 underline">{L(sc.openCompareCity)}</Link>}<Link href="/schools" className="inline-block py-1 text-sm text-sky-700 underline">{L(ux.seeSchools)}</Link></>;
  const otherPts = topic === "education" ? all("housing").filter((p) => !!p.housing) : topic === "climate" ? [] : all(topic);
  body = <>{body}<OtherFit topic={topic} mode={mode} points={otherPts} /></>;
  return (
    <article id={topic} data-testid={`card-${topic}`} className={`${panel} scroll-mt-24 self-start p-4 sm:p-5 ${open ? "md:col-span-2" : ""}`}>
      <h2 className="text-base font-semibold text-[#0b2a5b]">{L(ux.topics[topic])}</h2>
      <p className="mb-2 text-xs text-slate-500">{L(ux.blurb[topic])}</p>
      <div data-testid={`key-${topic}`}><KeyView k={k} big languageFirst={mode === "language"} /></div>
      <Disclosure level="more" open={open} onOpenChange={setOpen} testid={`more-${topic}`} className="mt-3"><div className="space-y-4">{body}</div></Disclosure>
    </article>
  );
}

export default function CityOverview({ city, country, data }: { city: City; country: Country; data?: OfficialCityData }) {
  const { L } = useI18n(); const { mode, setMode } = useStudyMode(); const [openT, setOpenT] = useState<Partial<Record<Topic, boolean>>>({}); const [openR, setOpenR] = useState<Partial<Record<Row, boolean>>>({});
  useEffect(() => { // deep link
    const h = window.location.hash.slice(1); if ((TOPICS as readonly string[]).includes(h)) setOpenT({ [h]: true }); else if ((ROWS as readonly string[]).includes(h)) setOpenR({ [h]: true });
    if (h) setTimeout(() => document.getElementById(h)?.scrollIntoView({ block: "start" }), 50);
  }, []);
  const counts = [...(data?.points ?? []).map((p) => p.status), ...(data?.climate ? [data.climate.status] : [])].reduce<Record<string, number>>((a, s) => ({ ...a, [s]: (a[s] ?? 0) + 1 }), {});
  const used = officialSources.filter((s) => s.cityIds.includes(city.id));
  const rowProps = (r: Row) => ({ level: "row" as const, id: r, testid: `row-${r}`, open: !!openR[r], onOpenChange: (o: boolean) => setOpenR((x) => ({ ...x, [r]: o })), title: L(ux.rows[r]), summary: L(ux.rowHint[r]) });
  return (
    <div className="space-y-6">
      <StudyModeSwitch mode={mode} onChange={setMode} />
      <div className="grid items-start gap-4 md:grid-cols-2" data-testid="cards" data-mode={mode}>
        {cardOrder(mode).map((t) => <Card key={t} topic={t} mode={mode} city={city} data={data} open={!!openT[t]} setOpen={(o) => setOpenT((x) => ({ ...x, [t]: o }))} />)}
      </div>

      <section className={`${panel} p-4 sm:p-5`} aria-labelledby="more-info">
        <h2 id="more-info" className="text-base font-semibold text-[#0b2a5b]">{L(ux.moreInfo)}</h2><p className="mb-2 text-xs text-slate-500">{L(ux.moreInfoLead)}</p>
        <div className="divide-y divide-slate-100">
          <Disclosure {...rowProps("visa")}>
            <div className="space-y-3"><p className="rounded-xl bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-900">{L(ot.visaIntro)}</p>
              <h3 className="text-sm font-semibold text-[#0b2a5b]">{L(ot.officialPages)} – {L(country.name)}</h3>
              <ul className="space-y-2 text-sm">{[...(visaLinks[country.code] ?? []), ...(healthLinks[country.code] ?? [])].map((l) => (
                <li key={l.link.value}><a href={l.link.value} target="_blank" rel="noopener noreferrer" className="text-sky-700 underline">{L(l.label)} ↗</a><span className="ml-2 text-[11px] text-slate-500">{l.link.status === "verified" ? `${L(d.checked)}: ${l.link.checkedAt}` : `(${L(ot.linkUnchecked)})`}</span></li>))}</ul>
              <Profile city={city} id="visa" /></div>
          </Disclosure>
          <Disclosure {...rowProps("safety")}><Profile city={city} id="safety" /></Disclosure>
          <Disclosure {...rowProps("daily")}><Profile city={city} id="living" /></Disclosure>
          <Disclosure {...rowProps("data")}>
            <div className="space-y-3"><p className="text-xs text-slate-500">{L(ot.officialIntro)}</p>
              <div className="flex flex-wrap gap-2">{(["verified", "unverified", "sample", "pending"] as Status[]).map((s) => <span key={s} className="flex items-center gap-1 text-sm"><StatusBadge status={s} /><span className="text-slate-600">{counts[s] ?? 0}</span></span>)}</div>
              <p className="text-xs leading-relaxed text-slate-500">{L(d.statusHelp)}</p>
              <ul className="space-y-1 text-xs text-slate-500">{used.map((s) => <li key={s.id}><a href={s.pages[0]} target="_blank" rel="noopener noreferrer" className="text-sky-700 underline">{s.publisher}</a> – {L(s.name)}</li>)}</ul></div>
          </Disclosure>
        </div>
      </section>
    </div>
  );
}
