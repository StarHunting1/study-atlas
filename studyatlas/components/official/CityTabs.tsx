"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { City, Country, Status } from "@/data/types";
import type { DataPoint, OfficialCityData } from "@/data/official/types";
import { officialSources } from "@/data/official";
import { sections } from "@/data/fields";
import { healthLinks, visaLinks } from "@/data/visa";
import { useI18n } from "@/lib/i18n";
import { panel } from "@/lib/ui";
import { dataText as d } from "@/locales/data";
import { ot } from "@/locales/official";
import { validForShort } from "@/data/official/validFor";
import FactView, { StatusBadge } from "@/components/FactView";
import DataCard, { AmountText, CardGrid } from "./DataCard";
import ClimateCharts from "./ClimateCharts";

export const TABS = ["overview", "living", "housing", "transport", "climate", "education", "visa"] as const;
type Tab = (typeof TABS)[number];

function Group({ title, note, points }: { title: string; note?: string; points: DataPoint[] }) {
  if (!points.length) return null;
  return (
    <section className="space-y-2">
      <h3 className="text-base font-semibold text-[#0b2a5b]">{title}</h3>
      {note && <p className="text-xs leading-relaxed text-slate-500">{note}</p>}
      <CardGrid points={points} />
    </section>
  );
}

/** Ver.1.3 profile fields (Fact) for a section, rendered as before. */
function ProfileSection({ city, id }: { city: City; id: string }) {
  const { L } = useI18n(); const s = sections.find((x) => x.id === id); if (!s) return null;
  return (
    <section className={`${panel} p-5`}>
      <h3 className="mb-2 text-base font-semibold text-[#0b2a5b]">{L(s.label)}</h3>
      <dl className="divide-y divide-slate-100">
        {s.fields.map((f) => (
          <div key={f.id} className="grid gap-1 py-2.5 text-sm sm:grid-cols-[9rem_1fr] sm:gap-3">
            <dt className="text-slate-500">{L(f.label)}</dt><dd className="text-slate-700"><FactView fact={f.get(city)} kind={f.kind} /></dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export default function CityTabs({ city, country, data }: { city: City; country: Country; data: OfficialCityData }) {
  const { L, lang } = useI18n();
  const [tab, setTab] = useState<Tab>("overview");
  // Deep link: /city/manchester#transport
  useEffect(() => { const h = window.location.hash.slice(1) as Tab; if (TABS.includes(h)) setTab(h); }, []);
  const go = (t: Tab) => { setTab(t); history.replaceState(null, "", `#${t}`); };
  const by = (topic: DataPoint["topic"]) => data.points.filter((p) => p.topic === topic);
  const counts = [...data.points.map((p) => p.status), ...(data.climate ? [data.climate.status] : [])].reduce<Record<string, number>>((a, s) => ({ ...a, [s]: (a[s] ?? 0) + 1 }), {});
  const usedSources = officialSources.filter((s) => s.cityIds.includes(city.id));

  return (
    <div className="space-y-5">
      <div role="tablist" aria-label="City information" className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1">
        {TABS.map((t) => (
          <button key={t} role="tab" aria-selected={tab === t} aria-controls={`panel-${t}`} id={`tab-${t}`} onClick={() => go(t)}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition ${tab === t ? "bg-[#0b2a5b] text-white" : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"}`}>{L(ot.tabs[t])}</button>
        ))}
      </div>

      <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`} className="space-y-5">
        {tab === "overview" && <>
          <section className={`${panel} space-y-3 p-5`}>
            <div className="flex flex-wrap items-center gap-2"><h2 className="text-lg font-semibold text-[#0b2a5b]">{L(ot.highlights)}</h2><span className="rounded-full bg-sky-50 px-2 py-0.5 text-[11px] font-medium text-sky-700 ring-1 ring-sky-100">{L(ot.officialBadge)}</span></div>
            <p className="text-xs text-slate-500">{L(ot.officialIntro)}</p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {data.points.filter((p) => p.highlight).map((p) => (
                <button key={p.id} onClick={() => go(p.topic === "living" ? "living" : p.topic)} className="rounded-xl bg-slate-50 p-3 text-left ring-1 ring-slate-100 hover:bg-sky-50">
                  <p className="text-xs leading-snug text-slate-600">{L(p.label)}</p>
                  <p className="mt-1"><AmountText p={p} /></p>
                  <p className="mt-1 text-[11px] text-slate-500">{L(ot.audience[p.audience])} · {validForShort(p.validFor, lang)}</p>
                </button>
              ))}
              {data.climate && (
                <button onClick={() => go("climate")} className="rounded-xl bg-slate-50 p-3 text-left ring-1 ring-slate-100 hover:bg-sky-50">
                  <p className="text-xs text-slate-600">{L(ot.climateTemp)}</p>
                  <p className="mt-1 text-base font-semibold tabular-nums text-slate-900">{Math.min(...data.climate.months.map((m) => m.meanC ?? Infinity)).toFixed(1)} – {Math.max(...data.climate.months.map((m) => m.meanC ?? -Infinity)).toFixed(1)} °C</p>
                  <p className="mt-1 text-[11px] text-slate-500">{data.climate.station} · {data.climate.period}</p>
                </button>
              )}
            </div>
          </section>
          <section className={`${panel} p-5`}>
            <h2 className="text-sm font-semibold text-slate-700">{L(ot.dataStatus)}</h2>
            <div className="mt-2 flex flex-wrap gap-2">{(["verified", "unverified", "pending"] as Status[]).map((s) => <span key={s} className="flex items-center gap-1 text-sm"><StatusBadge status={s} /><span className="text-slate-600">{counts[s] ?? 0}</span></span>)}</div>
            <ul className="mt-3 space-y-1 text-xs text-slate-500">
              {usedSources.map((s) => <li key={s.id}><a href={s.pages[0]} target="_blank" rel="noopener noreferrer" className="text-sky-700 underline">{s.publisher}</a> – {L(s.name)}</li>)}
            </ul>
          </section>
          <div className="grid gap-4 lg:grid-cols-2"><ProfileSection city={city} id="living" /><ProfileSection city={city} id="safety" /></div>
        </>}

        {tab === "living" && <>
          <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-900">{L(ot.livingIntro)}</p>
          <CardGrid points={by("living")} />
        </>}

        {tab === "housing" && <>
          <p className="text-xs leading-relaxed text-slate-500">{L(ot.housingNote)}</p>
          <Group title={L(ot.housingUni)} points={by("housing").filter((p) => p.housing)} />
          <Group title={L(ot.housingMarket)} points={by("housing").filter((p) => p.audience === "renter")} />
          <Group title={L(ot.housingEstimate)} points={by("housing").filter((p) => !p.housing && p.audience !== "renter")} />
          <ProfileSection city={city} id="housing" />
        </>}

        {tab === "transport" && <>
          <Group title={L(ot.transportAdult)} points={by("transport").filter((p) => p.audience === "adult")} />
          <Group title={L(ot.transportStudent)} points={by("transport").filter((p) => p.audience !== "adult")} />
          <ProfileSection city={city} id="transport" />
        </>}

        {tab === "climate" && (
          <section className={`${panel} space-y-3 p-5`}>
            {data.climate ? <>
              <div className="flex flex-wrap items-center gap-2"><StatusBadge status={data.climate.status} /><span className="text-xs text-slate-500">{L(ot.retrieved)}: {data.climate.retrievedAt}{data.climate.checkedAt ? ` · ${L(ot.checked)}: ${data.climate.checkedAt}` : ""}</span></div>
              <ClimateCharts c={data.climate} />
              <p className="text-[11px] text-slate-500">{data.climate.evidence.map((e) => <span key={e.url}>{L(ot.source)}: <a href={e.url} target="_blank" rel="noopener noreferrer" className="text-sky-700 underline">{e.publisher}</a> — {L(e.section)} </span>)}</p>
              {data.climate.note && <p className="text-[11px] text-slate-400">{L(data.climate.note)}</p>}
            </> : <p className="text-sm text-slate-500">{L(ot.climateMissing)}</p>}
            {data.climateNote && <p className="text-xs text-slate-500">{L(data.climateNote)}</p>}
            <FactView fact={city.profile.climate.overview} kind="text" />
          </section>
        )}

        {tab === "education" && <>
          <ProfileSection city={city} id="education" />
          <Group title={L(ot.housingUni)} points={by("housing").filter((p) => p.housing)} />
          <Link href="/schools" className="inline-block text-sm text-sky-700 underline">{L({ en: "Compare schools →", ja: "学校を比較する →" })}</Link>
        </>}

        {tab === "visa" && (
          <section className={`${panel} space-y-4 p-5`}>
            <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-900">{L(ot.visaIntro)}</p>
            <div>
              <h3 className="mb-2 text-base font-semibold text-[#0b2a5b]">{L(ot.officialPages)} – {L(country.name)}</h3>
              <ul className="space-y-2 text-sm">
                {[...(visaLinks[country.code] ?? []), ...(healthLinks[country.code] ?? [])].map((l) => (
                  <li key={l.link.value}>
                    <a href={l.link.value} target="_blank" rel="noopener noreferrer" className="text-sky-700 underline">{L(l.label)} ↗</a>
                    <span className="ml-2 text-[11px] text-slate-500">{l.link.status === "verified" ? `${L(d.checked)}: ${l.link.checkedAt}` : `(${L(ot.linkUnchecked)})`}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

export { DataCard };
