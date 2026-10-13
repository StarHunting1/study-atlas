"use client";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { cities, countries } from "@/data/cities";
import { useI18n } from "@/lib/i18n";
import { panel, pill, pillOff, pillOn } from "@/lib/ui";
import CityCard from "@/components/CityCard";
import SearchBox from "@/components/SearchBox";
const WorldMap = dynamic(() => import("@/components/WorldMap"), { ssr: false, loading: () => <div className="h-full animate-pulse bg-slate-200" /> });

function Home() {
  const { t, L } = useI18n(); const sp = useSearchParams();
  const [country, setCountry] = useState<string | null>(null); const [warn, setWarn] = useState(false); const [mapFailed, setMapFailed] = useState(false); const [sel, setSel] = useState<string | null>(null);
  useEffect(() => { const c = sp.get("country"); if (c && countries.some((x) => x.code === c)) setCountry(c); }, [sp]);
  const list = country ? cities.filter((c) => c.country === country) : cities;
  return (
    <div className="space-y-12">
      <section className="pb-4 pt-6 text-center md:pt-12">
        <h1 className="text-balance text-4xl font-bold leading-tight tracking-tight text-[#0b2a5b] md:text-6xl">{t("heroTitle")}</h1>
        <p className="mb-8 mt-4 text-lg text-slate-500">{t("heroSub")}</p>
        <SearchBox />
      </section>
      <section className="grid gap-6 lg:grid-cols-5">
        {/* isolate: keeps MapLibre's controls and markers inside their own stacking context, below the sticky header */}
        <div className={`relative isolate h-[320px] overflow-hidden md:h-[460px] lg:col-span-3 lg:h-[560px] ${panel}`}>
          <WorldMap country={country} onCountry={(c) => { setCountry(c); setSel(null); setWarn(false); }} onUnsupported={() => setWarn(true)} onCity={(id) => { setCountry(cities.find((x) => x.id === id)!.country); setSel(id); setWarn(false); }} onStatus={(s) => setMapFailed(s === "failed")} />
          {mapFailed && <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-amber-50 px-4 py-2 text-center text-xs text-amber-800">{t("mapFailed")}</div>}
        </div>
        <div className="space-y-4 lg:col-span-2">
          <div className="flex flex-wrap gap-2">
            {countries.map((c) => <button key={c.code} aria-pressed={country === c.code} onClick={() => { setCountry(country === c.code ? null : c.code); setSel(null); }} className={`${pill} ${country === c.code ? pillOn : pillOff}`}>{L(c.name)}</button>)}
          </div>
          {warn && <p className="text-sm text-amber-700">{t("noData")}</p>}
          {!country && !mapFailed && <p className="text-slate-500">{t("pickCountry")}</p>}
          {(country || mapFailed) && <ul className="space-y-2">{list.map((c) => <li key={c.id} className={`flex items-center justify-between rounded-2xl bg-white px-4 py-3 shadow-sm ${sel === c.id ? "ring-2 ring-sky-500" : "ring-1 ring-slate-200"}`}>
            <button onClick={() => setSel(c.id)} className="text-left">📍 {L(c.name)}</button>
            <Link href={`/city/${c.id}`} className="text-sm text-sky-700 underline">{t("details")}</Link></li>)}</ul>}
        </div>
      </section>
      <section>
        <h2 className="mb-4 text-2xl font-semibold text-[#0b2a5b]">{t("popular")}</h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{cities.map((c) => <CityCard key={c.id} city={c} active={c.country === country} />)}</div>
      </section>
      <p className="text-xs text-slate-400">{t("mapNote")} · {t("sample")}</p>
    </div>
  );
}
export default function Page() { return <Suspense><Home /></Suspense>; }
