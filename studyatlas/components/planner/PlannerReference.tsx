"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { cities } from "@/data/cities";
import { getCompareSchool } from "@/data/languageSchools";
import { loadLastPair, parsePlannerRef, schoolsCompareHref } from "@/lib/journey";
import { useI18n } from "@/lib/i18n";
import { useCompare } from "@/lib/store";
import { panel } from "@/lib/ui";
import { pj } from "@/locales/schoolCompare";

/**
 * Candidates the person was looking at (schools and cities), with links back to where they came from. REFERENCE ONLY: it never reads or writes the plan, never enters
 * a price, a rent statistic, a fee, a visa or insurance cost, and never applies a discount. Ids come from the URL (validated) or, if the link carried none, from the
 * comparisons already kept in the browser.
 */
export default function PlannerReference() {
  const { L } = useI18n(); const { ids: cityIds } = useCompare(); const [ref, setRef] = useState<{ schools: string[]; cities: string[]; fromUrl: boolean } | null>(null);
  useEffect(() => {
    const u = parsePlannerRef(window.location.search);
    if (u.schools.length || u.cities.length) setRef({ ...u, fromUrl: true });
    else { const l = loadLastPair(); setRef({ schools: [l.a, l.b].filter(Boolean), cities: [], fromUrl: false }); }
  }, []);
  if (!ref) return null;
  const cityList = ref.fromUrl ? ref.cities : cityIds; const schools = ref.schools.map((id) => getCompareSchool(id)).filter((s): s is NonNullable<ReturnType<typeof getCompareSchool>> => !!s);
  if (!schools.length && !cityList.length) return null;
  const pair = schools.length === 2; const link = "inline-flex min-h-[44px] items-center text-sm text-sky-700 underline";
  return (
    <section className={`${panel} space-y-2 p-3 sm:p-4`} data-testid="planner-reference" aria-label={L(pj.title)}>
      <h2 className="text-sm font-semibold text-[#0b2a5b]">{L(pj.title)}</h2>
      <p className="text-[11px] leading-snug text-slate-500">{L(pj.note)}</p>
      {schools.length > 0 && <div><p className="text-[11px] font-medium text-slate-500">{L(pj.schools)}</p><ul className="flex flex-wrap gap-x-4 text-sm text-slate-800" data-testid="ref-schools">{schools.map((s) => <li key={s.id} className="flex items-center gap-2"><span>{s.inst.name}</span><Link href={`/city/${s.cityId}`} className="text-xs text-sky-700 underline" data-testid="ref-school-city">{L(cities.find((c) => c.id === s.cityId)!.name)}</Link></li>)}</ul></div>}
      {cityList.length > 0 && <div><p className="text-[11px] font-medium text-slate-500">{L(pj.cities)}</p><ul className="flex flex-wrap gap-x-4 text-sm text-slate-800" data-testid="ref-cities">{cityList.map((id) => { const c = cities.find((x) => x.id === id); return c ? <li key={id}><Link href={`/city/${id}`} className="text-sky-700 underline">{L(c.name)}</Link></li> : null; })}</ul></div>}
      <div className="flex flex-wrap gap-x-4">
        {pair && <Link href={schoolsCompareHref({ a: schools[0].id, b: schools[1].id })} data-testid="ref-back-schools" className={link}>{L(ref.fromUrl ? pj.back : pj.compareSchools)}</Link>}
        {cityList.length >= 2 && <Link href="/compare" data-testid="ref-back-cities" className={link}>{L(ref.fromUrl && !pair ? pj.backCities : pj.compareCities)}</Link>}
      </div>
    </section>
  );
}
