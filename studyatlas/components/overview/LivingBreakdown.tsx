"use client";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { guideLink, guideOf } from "@/data/official/transportGuides";
import { ux } from "@/locales/ux";

/** Ver.1.6.5: the cost categories to think about separately, with only what is backed by an official page. No amount, no model budget and no household average is shown: those would not be a student's cost. */
export function LivingFaresLink({ cityId }: { cityId: string }) {
  const { L } = useI18n(); const g = guideOf(cityId); const l = g && guideLink(g, "fares"); if (!l) return null;
  return <a href={l.url} target="_blank" rel="noopener noreferrer" data-testid="living-fares-link" className="ml-3 inline-flex min-h-[40px] items-center text-sm text-sky-700 underline">{L(ux.living.faresLink)} ↗</a>;
}

export function LivingBreakdown({ cityId }: { cityId: string }) {
  const { L } = useI18n(); const g = guideOf(cityId); const fares = g && guideLink(g, "fares");
  const rows = [
    { key: "transport", label: ux.living.transport, note: fares ? (g!.read ? ux.living.transportRead : ux.living.transportLink) : ux.living.none },
    { key: "food", label: ux.living.food, note: ux.living.noOfficial },
    { key: "telecom", label: ux.living.telecom, note: ux.living.noOfficial },
    { key: "daily", label: ux.living.daily, note: ux.living.noOfficial },
  ];
  return (
    <section className="space-y-2 rounded-xl bg-slate-50 p-3 ring-1 ring-slate-200" data-testid="living-breakdown">
      <h4 className="text-xs font-semibold text-slate-700">{L(ux.living.title)}</h4>
      <p className="text-[11px] leading-snug text-slate-500">{L(ux.living.lead)}</p>
      <ul className="space-y-2">{rows.map((r) => (
        <li key={r.key} data-testid={`living-row-${r.key}`} className="text-xs"><span className="font-medium text-slate-700">{L(r.label)}</span>
          <span className="block text-[11px] leading-snug text-slate-500">{L(r.note)}</span>
          {r.key === "transport" && fares && <a href={fares.url} target="_blank" rel="noopener noreferrer" className="text-sky-700 underline">{L(fares.label)} ↗</a>}
        </li>))}</ul>
      <Link href="/planner" data-testid="living-breakdown-planner" className="inline-flex min-h-[40px] items-center text-sm text-sky-700 underline">{L(ux.livingPlannerLink)}</Link>
    </section>
  );
}
