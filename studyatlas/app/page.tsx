"use client";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { cities, countries } from "@/data/cities";
import { useI18n } from "@/lib/i18n";
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
      <section className="py-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-[#0b2a5b] md:text-6xl">{t("heroTitle")}</h1>
        <p className="mb-8 mt-4 text-lg text-slate-500">{t("heroSub")}</p>
        <SearchBox />
      </section>
      <section className="grid gap-6 lg:grid-cols-5">
        <div className="relative h-[320px] overflow-hidden rounded-3xl shadow-sm ring-1 ring-slate-200 md:h-[460px] lg:col-span-3 lg:h-[560px]">
          <WorldMap country={country} onCountry={(c) => { setCountry(c); setSel(null); setWarn(false); }} onUnsupported={() => setWarn(true)} onCity={(id) => { setCountry(cities.find((x) => x.id === id)!.country); setSel(id); setWarn(false); }} onStatus={(s) => setMapFailed(s === "failed")} />
          {mapFailed && <div className="pointer-events-none absolute inset-x-0 top-0 bg-amber-50 px-4 py-2 text-center text-xs text-amber-800">{t("mapFailed")}</div>}
        </div>
        <div className="space-y-4 lg:col-span-2">
          <div className="flex flex-wrap gap-2">
            {countries.map((c) => <button key={c.code} onClick={() => { setCountry(country === c.code ? null : c.code); setSel(null); }} className={`rounded-full px-4 py-2 text-sm ${country === c.code ? "bg-[#0b2a5b] text-white" : "bg-white ring-1 ring-slate-200"}`}>{L(c.name)}</button>)}
          </div>
          {mapFailed && <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800">{t("mapFailed")}</p>}
          {warn && <p className="text-sm text-amber-700">{t("noData")}</p>}
          {!country && <p className="text-slate-500">{t("pickCountry")}</p>}
          {(country || mapFailed) && <ul className="space-y-2">{list.map((c) => <li key={c.id} className={`flex items-center justify-between rounded-xl bg-white px-4 py-3 ring-1 ${sel === c.id ? "ring-2 ring-sky-500" : "ring-slate-200"}`}>
            <button onClick={() => setSel(c.id)} className="text-left">📍 {L(c.name)}</button>
            <Link href={`/city/${c.id}`} className="text-sm text-sky-700 underline">{t("details")}</Link></li>)}</ul>}
        </div>
      </section>
      <section>
        <h2 className="mb-4 text-2xl font-semibold">{t("popular")}</h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{cities.map((c) => <CityCard key={c.id} city={c} active={c.country === country} />)}</div>
      </section>
      <p className="text-xs text-slate-400">{t("mapNote")} · {t("sample")}</p>
    </div>
  );
}
export default function Page() { return <Suspense><Home /></Suspense>; }
