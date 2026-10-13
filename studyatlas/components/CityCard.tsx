"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { City } from "@/data/cities";
import { useI18n } from "@/lib/i18n";
import { useCompare } from "@/lib/store";
export default function CityCard({ city, active }: { city: City; active?: boolean }) {
  const { t, L } = useI18n(); const { has, toggle, full } = useCompare(); const on = has(city.id);
  const [imgFailed, setImgFailed] = useState(false); const photo = !imgFailed ? city.photo : undefined;
  return (
    <article className={`group overflow-hidden rounded-2xl bg-white shadow-sm ring-1 transition hover:-translate-y-1 hover:shadow-lg ${active ? "ring-sky-500" : "ring-slate-200"}`}>
      <Link href={`/city/${city.id}`} className="block">
        {/* Gradient stays as the fallback while loading, when no photo is set, or if the photo fails */}
        <div className="relative h-40 overflow-hidden" style={{ background: `linear-gradient(135deg,hsl(${city.hue} 80% 72%),hsl(${city.hue + 40} 70% 40%))` }}>
          {photo && <Image src={photo.src} alt={L(photo.alt)} fill sizes="(min-width:1024px) 400px, (min-width:640px) 50vw, 100vw" className="object-cover transition duration-300 group-hover:scale-[1.04]" onError={() => setImgFailed(true)} />}
        </div>
        <div className="p-4"><h3 className="text-lg font-semibold">{L(city.name)}</h3><p className="text-sm text-slate-500">{L(city.blurb)}</p></div>
      </Link>
      {photo && <p className="-mt-2 truncate px-4 pb-2 text-[10px] text-slate-400">{t("photo")}: <a href={photo.sourceUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">{photo.author}</a> / <a href={photo.licenseUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">{photo.license}</a></p>}
      <div className="flex gap-2 px-4 pb-4">
        <button disabled={!on && full} onClick={() => toggle(city.id)} className={`flex-1 rounded-full px-3 py-2 text-sm font-medium disabled:opacity-40 ${on ? "bg-[#0b2a5b] text-white" : "bg-slate-100"}`}>{on ? `✓ ${t("remove")}` : `+ ${t("addCompare")}`}</button>
      </div>
    </article>
  );
}
