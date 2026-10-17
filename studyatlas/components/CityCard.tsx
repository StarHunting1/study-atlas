"use client";
import Link from "next/link";
import { City } from "@/data/cities";
import { useI18n } from "@/lib/i18n";
import { useCompare } from "@/lib/store";
import CityPhoto, { PhotoCredit, useCityPhoto } from "@/components/CityPhoto";
export default function CityCard({ city, active }: { city: City; active?: boolean }) {
  const { t, L } = useI18n(); const { has, toggle, full } = useCompare(); const on = has(city.id);
  const [photo, onError] = useCityPhoto(city);
  return (
    <article className={`group flex flex-col overflow-hidden transition hover:-translate-y-1 hover:shadow-lg rounded-2xl bg-white shadow-sm ${active ? "ring-2 ring-sky-500" : "ring-1 ring-slate-200"}`}>
      <Link href={`/city/${city.id}`} className="block">
        <div className="relative h-44"><CityPhoto city={city} photo={photo} onError={onError} sizes="(min-width:1024px) 400px, (min-width:640px) 50vw, 100vw" className="transition duration-300 group-hover:scale-[1.04]" /></div>
        <div className="p-4"><h3 className="text-lg font-semibold">{L(city.name)}</h3><p className="text-sm text-slate-500">{L(city.blurb)}</p></div>
      </Link>
      <PhotoCredit photo={photo} className="-mt-2 truncate px-4 pb-2 text-[10px] text-slate-400" />
      <div className="mt-auto flex gap-2 px-4 pb-4">
        <button disabled={!on && full} onClick={() => toggle(city.id)} aria-pressed={on} className={`min-h-[44px] flex-1 rounded-full px-3 py-2 text-sm font-medium disabled:opacity-40 ${on ? "bg-[#0b2a5b] text-white" : "bg-slate-100 hover:bg-slate-200"}`}>{on ? `✓ ${t("remove")}` : `+ ${t("addCompare")}`}</button>
      </div>
      {!on && full && <p className="-mt-2 px-4 pb-3 text-center text-[11px] text-slate-400">{t("compareFull")}</p>}
    </article>
  );
}
