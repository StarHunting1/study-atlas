"use client";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { cities, countries } from "@/data/cities";
import { officialData } from "@/data/official";
import { useI18n } from "@/lib/i18n";
import { useCompare } from "@/lib/store";
import { panel, pill, pillOff, pillOn } from "@/lib/ui";
import { home } from "@/locales/home";
import CityCard from "@/components/CityCard";
import SearchBox from "@/components/SearchBox";
const WorldMap = dynamic(() => import("@/components/WorldMap"), { ssr: false, loading: () => <div className="h-full animate-pulse bg-slate-100" /> });

/** Cities with researched official data are labelled so; the others say "being prepared" (no number is invented to fill a card). */
const hasData = (id: string) => !!officialData(id);

function Home() {
  const { t, L } = useI18n(); const sp = useSearchParams(); const { has, toggle, full } = useCompare();
  const [country, setCountry] = useState<string | null>(null); const [sel, setSel] = useState<string | null>(null); const [failed, setFailed] = useState(false);
  useEffect(() => { const c = sp.get("country"); if (c && countries.some((x) => x.code === c)) setCountry(c); }, [sp]);
  const list = country ? cities.filter((c) => c.country === country) : cities;
  const chosen = cities.find((c) => c.id === sel); const countryName = (code: string) => L(countries.find((c) => c.code === code)!.name);
  const pickCountry = (code: string | null) => { setCountry(code); setSel(null); };
  const pickCity = (id: string | null) => { setSel(id); if (id) setCountry(cities.find((c) => c.id === id)!.country); };
  return (
    <div className="space-y-10">
      <section className="pt-2 text-center md:pt-8">
        <h1 className="text-balance text-3xl font-bold leading-tight tracking-tight text-[#0b2a5b] md:text-5xl">{t("heroTitle")}</h1>
        <p className="mb-6 mt-3 text-base text-slate-500 md:text-lg">{t("heroSub")}</p>
        <SearchBox />
        <ol className="mx-auto mt-6 grid max-w-2xl grid-cols-3 gap-2 text-left" aria-label="Discover, Compare, Decide">
          {home.steps.map((s) => <li key={s.n}><Link href={s.href} className="block rounded-xl bg-white px-3 py-2 ring-1 ring-slate-200 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-400"><span className="text-[11px] font-semibold text-sky-700">{s.n}</span><span className="block text-sm font-semibold text-[#0b2a5b]">{L(s.title)}</span><span className="hidden text-xs text-slate-500 sm:block">{L(s.text)}</span></Link></li>)}
        </ol>
      </section>
      <section id="discover" className="grid gap-5 lg:grid-cols-5" aria-label={L(home.list)}>
        {/* isolate: keeps the map inside its own stacking context, below the sticky header */}
        <div className={`relative isolate h-[420px] overflow-hidden md:h-[520px] lg:col-span-3 lg:h-[600px] ${panel}`}>
          <WorldMap country={country} selectedCity={sel} onCountry={(c) => pickCountry(c)} onCity={(id) => pickCity(id)} onUnsupported={() => {}} onStatus={(s) => setFailed(s === "failed")} />
          {failed && <div role="status" className="pointer-events-none absolute inset-x-0 top-0 z-10 bg-amber-50 px-4 py-2 text-center text-xs text-amber-800">{L(home.mapFailed)}</div>}
          {chosen && (
            <aside data-testid="city-card" aria-label={L(home.selectedCity)} className="absolute inset-x-3 bottom-3 z-10 max-w-md rounded-2xl bg-white/95 p-4 shadow-lg ring-1 ring-slate-200 backdrop-blur sm:right-auto">
              <div className="flex items-start justify-between gap-2"><div><p className="text-xs text-slate-500">{countryName(chosen.country)}</p><h2 className="text-lg font-semibold text-[#0b2a5b]">{L(chosen.name)}</h2></div>
                <button onClick={() => pickCity(null)} aria-label={L(home.close)} className="-mr-2 -mt-2 h-11 w-11 rounded-full text-xl text-slate-400 hover:bg-slate-100">×</button></div>
              <p className="mt-1 text-sm text-slate-600">{L(chosen.blurb)}</p>
              <p className={`mt-2 inline-block rounded-full px-2 py-0.5 text-[11px] font-medium ${hasData(chosen.id) ? "bg-sky-50 text-sky-800 ring-1 ring-sky-100" : "bg-slate-100 text-slate-500"}`} data-testid="data-badge">{L(hasData(chosen.id) ? home.data.official : home.data.preparing)}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link href={`/city/${chosen.id}`} className="min-h-[44px] rounded-full bg-[#0b2a5b] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#12397a]">{L(home.details)}</Link>
                <button disabled={!has(chosen.id) && full} onClick={() => toggle(chosen.id)} aria-pressed={has(chosen.id)} className={`min-h-[44px] rounded-full px-4 py-2.5 text-sm font-medium ring-1 disabled:opacity-40 ${has(chosen.id) ? "bg-sky-50 text-sky-800 ring-sky-200" : "bg-white ring-slate-300 hover:bg-slate-50"}`}>{has(chosen.id) ? `✓ ${L(home.inCompare)}` : !has(chosen.id) && full ? L(home.full) : L(home.addCompare)}</button>
              </div>
            </aside>)}
        </div>
        <div className="space-y-3 lg:col-span-2">
          <div className="flex flex-wrap gap-2" role="group" aria-label={L(home.list)}>
            <button aria-pressed={country === null} onClick={() => pickCountry(null)} className={`${pill} min-h-[44px] ${country === null ? pillOn : pillOff}`}>{L(home.all)}</button>
            {countries.map((c) => <button key={c.code} aria-pressed={country === c.code} onClick={() => pickCountry(country === c.code ? null : c.code)} className={`${pill} min-h-[44px] ${country === c.code ? pillOn : pillOff}`}>{L(c.name)}</button>)}
          </div>
          <p className="text-sm text-slate-500">{L(home.hint)}</p>
          {list.length === 0 ? <p className="text-sm text-slate-500">{L(home.noCities)}</p> : <ul className="space-y-2" data-testid="city-list">{list.map((c) => (
            <li key={c.id} className={`flex items-center justify-between gap-3 rounded-2xl bg-white px-4 py-2 shadow-sm ${sel === c.id ? "ring-2 ring-sky-500" : "ring-1 ring-slate-200"}`}>
              <button onClick={() => pickCity(c.id)} aria-pressed={sel === c.id} className="min-h-[44px] flex-1 text-left"><span className="block font-medium text-slate-900">{L(c.name)}</span><span className="block text-xs text-slate-500">{countryName(c.country)} · {L(hasData(c.id) ? home.data.official : home.data.preparing)}</span></button>
              <Link href={`/city/${c.id}`} className="inline-flex min-h-[44px] items-center text-sm text-sky-700 underline">{t("details")}</Link></li>))}</ul>}
        </div>
      </section>
      <section>
        <h2 className="mb-4 text-2xl font-semibold text-[#0b2a5b]">{t("popular")}</h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{cities.map((c) => <CityCard key={c.id} city={c} active={c.country === country} />)}</div>
      </section>
      <p className="text-xs text-slate-400">{L(home.credit)} · {t("dataNote")}</p>
    </div>
  );
}
export default function Page() { return <Suspense><Home /></Suspense>; }
