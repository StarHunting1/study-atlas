"use client";
import Link from "next/link";
import { City } from "@/data/cities";
import { useI18n } from "@/lib/i18n";
import { useCompare } from "@/lib/store";
export default function CityCard({ city, active }: { city: City; active?: boolean }) {
  const { t, L } = useI18n(); const { has, toggle, full } = useCompare(); const on = has(city.id);
  return (
    <article className={`group overflow-hidden rounded-2xl bg-white shadow-sm ring-1 transition hover:-translate-y-1 hover:shadow-lg ${active ? "ring-sky-500" : "ring-slate-200"}`}>
      <Link href={`/city/${city.id}`} className="block">
        {/* Gradient placeholder: replace with licensed photo (add `image` to City) */}
        <div className="h-40 transition group-hover:scale-[1.02]" style={{ background: `linear-gradient(135deg,hsl(${city.hue} 80% 72%),hsl(${city.hue + 40} 70% 40%))` }} />
        <div className="p-4"><h3 className="text-lg font-semibold">{L(city.name)}</h3><p className="text-sm text-slate-500">{L(city.blurb)}</p></div>
      </Link>
      <div className="flex gap-2 px-4 pb-4">
        <button disabled={!on && full} onClick={() => toggle(city.id)} className={`flex-1 rounded-full px-3 py-2 text-sm font-medium disabled:opacity-40 ${on ? "bg-[#0b2a5b] text-white" : "bg-slate-100"}`}>{on ? `✓ ${t("remove")}` : `+ ${t("addCompare")}`}</button>
      </div>
    </article>
  );
}
