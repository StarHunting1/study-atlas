"use client";
import Link from "next/link";
import { notFound, useParams, useRouter } from "next/navigation";
import { countries, getCity } from "@/data/cities";
import { useI18n } from "@/lib/i18n";
import { useCompare } from "@/lib/store";
import { pill, pillOff, pillOn } from "@/lib/ui";
import CityPhoto, { PhotoCredit, useCityPhoto } from "@/components/CityPhoto";
import { hasInAppHistory } from "@/lib/history";
import { officialData } from "@/data/official";
import CityOverview from "@/components/overview/CityOverview";
import { listCompareSchools } from "@/data/languageSchools";
import { jn } from "@/locales/schoolCompare";
export default function CityPage() {
  const { id } = useParams<{ id: string }>(); const { t, L } = useI18n(); const { has, toggle, full } = useCompare(); const router = useRouter();
  const c = getCity(id); const [photo, onError] = useCityPhoto(c);
  if (!c) { notFound(); return null; }
  const country = countries.find((x) => x.code === c.country)!; const on = has(c.id);
  const official = officialData(c.id);
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
        {listCompareSchools().some((x) => x.cityId === c.id) && <Link href={`/schools/compare?city=${c.id}`} data-testid="city-schools-link" className={`${pill} bg-sky-100 text-sky-800 hover:bg-sky-200`}>{L(jn.fromCity).replace("{city}", L(c.name))}</Link>}
        <a href={c.officialUrl} target="_blank" rel="noopener noreferrer" className={`${pill} ${pillOff}`}>{t("official")} ↗</a>
      </div>
      {!on && full && <p className="text-sm text-slate-500">{t("compareFull")}</p>}
      {/* Progressive disclosure: five cards, details and sources one click away (Ver.1.8) */}
      <CityOverview city={c} country={country} data={official} />
    </div>
  );
}
