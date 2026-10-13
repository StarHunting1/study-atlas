"use client";
import type { Fact } from "@/data/schema";
import type { Price } from "@/data/schools";
import { useI18n } from "@/lib/i18n";
import { dataText as d } from "@/locales/data";
import { schoolsText as s } from "@/locales/my";
import { StatusBadge } from "@/components/FactView";
/** A school fee with all its conditions. Only verified or explicitly fictional sample fees show an amount; anything else is "data coming soon". */
export default function PriceView({ fact }: { fact: Fact<Price> }) {
  const { L } = useI18n();
  if (!fact.value || (fact.status !== "verified" && fact.status !== "sample"))
    return <span className="text-sm text-slate-400">{L(d.pending)}{fact.status === "unverified" && <span className="ml-1"><StatusBadge status="unverified" /></span>}</span>;
  const p = fact.value;
  return (
    <div className="space-y-0.5">
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <span className="font-medium text-slate-800">{p.amount.toLocaleString()}{p.max ? `–${p.max.toLocaleString()}` : ""} {p.currency} <span className="font-normal text-slate-500">{L(s.unit[p.unit])}</span></span>
        <StatusBadge status={fact.status} />
      </div>
      <p className="text-[11px] leading-snug text-slate-500">
        {L(s.tax[p.tax])}{p.feeYear && <> · {L(s.feeYear)}: {p.feeYear}</>}{p.applicability && <> · {L(s.applies)}: {L(p.applicability)}</>}
      </p>
      {p.includes && <p className="text-[11px] leading-snug text-slate-500">{L(s.includes)}: {L(p.includes)}</p>}
      {(fact.checkedAt || fact.sources?.length) && <p className="text-[11px] text-slate-400">{fact.checkedAt && <>{L(d.checked)}: {fact.checkedAt}</>}{fact.sources?.map((x) => <span key={x.url}> · <a href={x.url} target="_blank" rel="noopener noreferrer" className="underline">{x.publisher}</a></span>)}</p>}
    </div>
  );
}
