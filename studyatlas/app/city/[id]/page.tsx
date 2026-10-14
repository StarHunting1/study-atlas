"use client";
import Link from "next/link";
import { notFound, useParams, useRouter } from "next/navigation";
import { countries, getCity } from "@/data/cities";
import { sections, statusSummary } from "@/data/fields";
import { dataText as d } from "@/locales/data";
import FactView, { StatusBadge } from "@/components/FactView";
import type { Status } from "@/data/types";
import { useI18n } from "@/lib/i18n";
import { useCompare } from "@/lib/store";
import { panel, pill, pillOff, pillOn } from "@/lib/ui";
import CityPhoto, { PhotoCredit, useCityPhoto } from "@/components/CityPhoto";
import { hasInAppHistory } from "@/lib/history";
import { officialData } from "@/data/official";
import CityTabs from "@/components/official/CityTabs";
export default function CityPage() {
  const { id } = useParams<{ id: string }>(); const { t, L } = useI18n(); const { has, toggle, full } = useCompare(); const router = useRouter();
  const c = getCity(id); const [photo, onError] = useCityPhoto(c);
  if (!c) { notFound(); return null; }
  const country = countries.find((x) => x.code === c.country)!; const on = has(c.id);
  const summary = statusSummary(c); const official = officialData(c.id);
  // Opened directly (shared link, new tab, reload) there is no in-app page to return to, so go home instead.
  const back = () => (hasInAppHistory() ? router.back() : router.push("/"));
  return (
    <div className="space-y-6">
      <button onClick={back} className="text-sm text-slate-500 hover:text-slate-900">← {t("back")}</button>
      <section className="relative h-64 overflow-hidden rounded-3xl text-white shadow-sm sm:h-80 lg:h-[420px]">
        <CityPhoto city={c} photo={photo} onError={onError} sizes="(min-width:1280px) 1248px, 100vw" priority />
        {/* Dark overlay keeps the title readable on bright photos */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-black/10" />
        <div className="absolute inset-x-0 bottom-0 p-5 sm:p-8">
          <p className="text-sm font-medium text-white/85">{L(country.name)}</p>
          <h1 className="text-4xl font-bold tracking-tight drop-shadow sm:text-5xl lg:text-6xl">{L(c.name)}</h1>
          <p className="mt-2 max-w-2xl text-base text-white/90 drop-shadow sm:text-lg">{L(c.blurb)}</p>
        </div>
        <PhotoCredit photo={photo} className="absolute right-3 top-3 max-w-[70%] truncate rounded-full bg-black/45 px-3 py-1 text-[10px] text-white/90 backdrop-blur-sm" />
      </section>
      <div className="flex flex-wrap gap-3">
        <button disabled={!on && full} onClick={() => toggle(c.id)} aria-pressed={on} className={`${pill} disabled:opacity-40 ${on ? pillOn : pillOff}`}>{on ? `✓ ${t("remove")}` : `+ ${t("addCompare")}`}</button>
        <Link href="/compare" className={`${pill} bg-sky-100 text-sky-800 hover:bg-sky-200`}>{t("goCompare")}</Link>
        <a href={c.officialUrl} target="_blank" rel="noopener noreferrer" className={`${pill} ${pillOff}`}>{t("official")} ↗</a>
      </div>
      {!on && full && <p className="text-sm text-slate-500">{t("compareFull")}</p>}
      {/* Cities with official data (Ver.1.5) get the tabbed view; the others keep the Ver.1.3 layout */}
      {official ? <CityTabs city={c} country={country} data={official} /> : <>
      {/* Data status: how much of this page is verified */}
      <section className={`${panel} p-5`}>
        <h2 className="text-sm font-semibold text-slate-700">{L(d.statusTitle)}</h2>
        <div className="mt-2 flex flex-wrap gap-2">{(["verified", "unverified", "sample", "pending"] as Status[]).map((s) => <span key={s} className="flex items-center gap-1 text-sm"><StatusBadge status={s} /><span className="text-slate-600">{summary[s] ?? 0}</span></span>)}</div>
        <p className="mt-2 text-xs leading-relaxed text-slate-500">{L(d.statusHelp)}</p>
      </section>
      <div className="grid gap-4 lg:grid-cols-2">
        {sections.map((s) => (
          <section key={s.id} id={s.id} className={`${panel} p-5 ${s.id === "climate" && c.profile.climate.monthly.value ? "lg:col-span-2" : ""}`}>
            <h2 className="mb-3 text-lg font-semibold text-[#0b2a5b]">{L(s.label)}{s.id === "visa" && <span className="ml-2 text-sm font-normal text-slate-500">{L(d.visaCountry)} {L(country.name)}</span>}</h2>
            <dl className="divide-y divide-slate-100">
              {s.fields.map((f) => (
                <div key={f.id} className="grid gap-1 py-2.5 text-sm sm:grid-cols-[9rem_1fr] sm:gap-3">
                  <dt className="text-slate-500">{L(f.label)}</dt>
                  <dd className="text-slate-700"><FactView fact={f.get(c)} kind={f.kind} /></dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
      </div>
      </>}
    </div>
  );
}
