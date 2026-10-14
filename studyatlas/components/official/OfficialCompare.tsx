"use client";
import { getCity } from "@/data/cities";
import { climateCompare, climateIssues, compareIssues, compareRows, pickPoint, type ClimateCompare, type Issue } from "@/data/official/compare";
import { officialData } from "@/data/official";
import { useI18n } from "@/lib/i18n";
import { panel } from "@/lib/ui";
import { ot } from "@/locales/official";
import { validForShort } from "@/data/official/validFor";
import { StatusBadge } from "@/components/FactView";
import { AmountText } from "./DataCard";

const issueText: Record<Issue, keyof typeof ot> = { missing: "cmpMissing", notVerified: "cmpUnverified", period: "cmpPer", audience: "cmpAudience" };

/** Official figures side by side (original currency; the basis of each figure is spelled out; nothing is converted). */
export default function OfficialCompare({ ids }: { ids: string[] }) {
  const { L, lang } = useI18n();
  const cities = ids.map((id) => getCity(id)).filter((c) => c && officialData(c.id));
  if (cities.length < 1 || ids.length < 2) return null;
  const hasClimate = cities.some((c) => climateCompare(c!.id));
  return (
    <section className={`${panel} space-y-3 p-4`}>
      <h2 className="text-lg font-semibold text-[#0b2a5b]">{L(ot.cmpTitle)}</h2>
      <p className="text-xs text-slate-500">{L(ot.cmpIntro)}</p>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead><tr><th className="w-44" />{cities.map((c) => <th key={c!.id} className="p-2 text-left text-base font-semibold">{L(c!.name)}</th>)}</tr></thead>
          <tbody>
            {compareRows.map((row) => {
              const pts = cities.map((c) => pickPoint(c!.id, row));
              if (!pts.some(Boolean)) return null;
              const issues = compareIssues(pts);
              return (
                <tr key={row.id} className="border-t border-slate-100 align-top">
                  <td className="p-2 text-slate-600">{L(row.label)}
                    <p className={`mt-1 text-[11px] leading-snug ${issues.length ? "text-amber-700" : "text-emerald-700"}`}>{issues.length ? issues.map((i) => L(ot[issueText[i]] as never)).join(" / ") : L(ot.cmpOk)}</p>
                    {row.hint && <p className="mt-1 text-[11px] leading-snug text-slate-400">{L(row.hint)}</p>}
                  </td>
                  {pts.map((p, i) => (
                    <td key={cities[i]!.id} className="p-2">
                      {p ? <div className="space-y-1"><AmountText p={p} /> <StatusBadge status={p.status} />
                        <p className="text-[11px] text-slate-500">{L(ot.audience[p.audience])} · {validForShort(p.validFor, lang)}</p>
                        <p className="text-[11px] leading-snug text-slate-500">{L(p.conditions)}</p>
                        <a href={p.evidence[0].url} target="_blank" rel="noopener noreferrer" className="text-[11px] text-sky-700 underline">{p.evidence[0].publisher}</a></div>
                        : <span className="text-xs text-slate-400">{L(ot.cmpMissing)}</span>}
                    </td>
                  ))}
                </tr>
              );
            })}
            {hasClimate && ([
              ["tmax", ot.cmpTmax, (c: ClimateCompare) => c.tmax && `${c.tmax[0].toFixed(1)} – ${c.tmax[1].toFixed(1)} °C`],
              ["tmin", ot.cmpTmin, (c: ClimateCompare) => c.tmin && `${c.tmin[0].toFixed(1)} – ${c.tmin[1].toFixed(1)} °C`],
              ["precip", ot.cmpPrecip, (c: ClimateCompare) => c.precipTotal !== undefined && `${c.precipTotal} mm`],
            ] as const).map(([key, label, fmtv]) => {
              const cs = cities.map((c) => climateCompare(c!.id)); const issues = climateIssues(cs);
              return (
                <tr key={key} className="border-t border-slate-100 align-top">
                  <td className="p-2 text-slate-600">{L(label)}
                    <p className={`mt-1 text-[11px] leading-snug ${issues.length ? "text-amber-700" : "text-emerald-700"}`}>{issues.length ? issues.map((i) => L(i === "period" ? ot.cmpClimatePeriods : ot[issueText[i]] as never)).join(" / ") : L(ot.cmpOkSame)}</p>
                    {key === "precip" && <p className="mt-1 text-[11px] leading-snug text-slate-400">{L(ot.cmpPrecipNote)}</p>}
                  </td>
                  {cs.map((c, i) => (
                    <td key={cities[i]!.id} className="p-2">{c && fmtv(c) ? <div className="space-y-1"><span className="font-semibold tabular-nums">{fmtv(c)}</span> <StatusBadge status={c.status} />
                      <p className="text-[11px] text-slate-500">{L(ot.climateStation)}: {c.station}</p><p className="text-[11px] text-slate-500">{L(ot.climatePeriod)}: {c.period}{c.derived ? ` · ${L(ot.cmpDerived)}` : ""}</p></div> : <span className="text-xs text-slate-400">{L(ot.cmpMissing)}</span>}</td>))}
                </tr>);
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
