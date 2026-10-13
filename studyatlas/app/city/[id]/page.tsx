"use client";
import Link from "next/link";
import { notFound, useParams, useRouter } from "next/navigation";
import { countries, getCity } from "@/data/cities";
import { useI18n } from "@/lib/i18n";
import { useCompare } from "@/lib/store";
export default function CityPage() {
  const { id } = useParams<{ id: string }>(); const { t, L } = useI18n(); const { has, toggle, full } = useCompare(); const router = useRouter();
  const c = getCity(id); if (!c) { notFound(); return null; }
  const country = countries.find((x) => x.code === c.country)!; const on = has(c.id);
  const money = (v: number) => <>{v.toLocaleString()} {c.cost.currency} <span className="rounded bg-amber-100 px-1 text-[10px] text-amber-800">{t("sample")}</span></>;
  const Box = ({ k, children }: { k: string; children: React.ReactNode }) => <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-200"><h3 className="mb-2 font-semibold">{k}</h3><div className="text-sm text-slate-600">{children}</div></div>;
  return (
    <div className="space-y-6">
      <button onClick={() => router.back()} className="text-sm text-slate-500 hover:text-slate-900">← {t("back")}</button>
      <div className="flex h-56 items-end rounded-3xl p-6 text-white md:h-72" style={{ background: `linear-gradient(135deg,hsl(${c.hue} 80% 65%),hsl(${c.hue + 40} 70% 35%))` }}>
        <div><h1 className="text-4xl font-bold">{L(c.name)}</h1><p>{L(country.name)} · {L(c.blurb)}</p></div>
      </div>
      <div className="flex flex-wrap gap-3">
        <button disabled={!on && full} onClick={() => toggle(c.id)} className={`rounded-full px-5 py-2 text-sm font-medium disabled:opacity-40 ${on ? "bg-[#0b2a5b] text-white" : "bg-white ring-1 ring-slate-300"}`}>{on ? t("remove") : t("addCompare")}</button>
        <Link href="/compare" className="rounded-full bg-sky-100 px-5 py-2 text-sm font-medium text-sky-800">{t("goCompare")}</Link>
        <a href={c.officialUrl} target="_blank" rel="noopener noreferrer" className="rounded-full bg-white px-5 py-2 text-sm ring-1 ring-slate-300">{t("official")} ↗</a>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Box k={t("cost")}><p>{t("monthly")}: {money(c.cost.monthly)}</p><p>{t("rent")}: {money(c.cost.rent)}</p></Box>
        <Box k={t("transport")}><p>{L(c.transport)}</p><p>{t("transportCost")}: {money(c.cost.transport)}</p></Box>
        <Box k={t("housing")}>{L(c.housing)}</Box><Box k={t("climate")}>{L(c.climate)}</Box>
        <Box k={t("student")}>{L(c.student)}</Box><Box k={t("areas")}>{c.areas.join(" · ")}</Box>
        <Box k={t("schools")}>{c.schools.join(" · ")}</Box>
      </div>
      <p className="text-xs text-slate-400">{t("updated")}: {c.updated}</p>
    </div>
  );
}
