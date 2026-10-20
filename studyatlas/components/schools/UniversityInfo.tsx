"use client";
import { StatusBadge } from "@/components/FactView";
import Disclosure from "@/components/Disclosure";
import { useI18n } from "@/lib/i18n";
import type { University } from "@/data/schools/types";
import { UNI_PAGE_KINDS } from "@/data/schools/types";
import { uinfo } from "@/locales/schoolCompare";

/** Institution-level facts of a university and the state of each official page. Counts only what a person has confirmed; an entered link is not a checked page. */
export const universityInfoCounts = (u: University) => {
  const facts = [u.officialName, u.campuses, ...UNI_PAGE_KINDS.map((k) => u.officialPages?.[k])].filter(Boolean); return { verified: facts.filter((f) => f!.status === "verified").length, total: facts.length, pagesPending: UNI_PAGE_KINDS.filter((k) => !u.officialPages?.[k] || u.officialPages[k].status === "pending").length, programs: u.programs.length };
};
export default function UniversityInfo({ u, defaultOpen = false }: { u: University; defaultOpen?: boolean }) {
  const { L } = useI18n(); const c = universityInfoCounts(u); if (!c.total) return null;
  return (
    <Disclosure level="more" label={L(uinfo.open)} openLabel={L(uinfo.close)} testid="uni-info" defaultOpen={defaultOpen}>
      <div className="space-y-3 text-xs leading-relaxed text-slate-700" data-testid="uni-info-body">
        <p className="rounded-lg bg-slate-50 px-2.5 py-1.5 text-[11px] text-slate-600" data-testid="uni-counts">{L(uinfo.counts).replace("{v}", String(c.verified)).replace("{n}", String(c.total)).replace("{p}", String(c.programs))}</p>
        {u.officialName?.value && <div><p className="font-semibold text-slate-500">{L(uinfo.officialName)} <StatusBadge status={u.officialName.status} /></p><p data-testid="uni-official-name">{L(u.officialName.value)}</p></div>}
        {u.campuses?.value && <div><p className="font-semibold text-slate-500">{L(uinfo.campuses)} <StatusBadge status={u.campuses.status} /></p><p data-testid="uni-campuses">{L(u.campuses.value)}</p>{u.campuses.note && <p className="text-[11px] text-slate-500">{L(u.campuses.note)}</p>}</div>}
        <div><p className="font-semibold text-slate-500">{L(uinfo.pages)}</p>
          <ul className="mt-1 space-y-1" data-testid="uni-pages">{UNI_PAGE_KINDS.map((k) => { const f = u.officialPages?.[k]; return (
            <li key={k} data-kind={k} data-state={f?.status ?? "pending"} className="flex flex-wrap items-center gap-x-2"><span className="font-medium text-slate-600">{L(uinfo.kinds[k])}</span>
              {f?.value ? <><a href={f.value} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-[44px] items-center text-sky-700 underline">{L(uinfo.openPage)} ↗</a><StatusBadge status={f.status} /></> : <span className="text-slate-500">{L(uinfo.pagePending)}</span>}</li>); })}</ul>
          <p className="mt-1 text-[11px] text-slate-500">{L(uinfo.pageNote)}</p></div>
        <p className="text-[11px] text-slate-500">{L(uinfo.programsNote)}</p>
      </div>
    </Disclosure>
  );
}
