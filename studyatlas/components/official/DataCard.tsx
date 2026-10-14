"use client";
import type { DataPoint } from "@/data/official/types";
import { useI18n } from "@/lib/i18n";
import { validForText } from "@/data/official/validFor";
import { officialSources } from "@/data/official/sources";
import { ot } from "@/locales/official";
import { StatusBadge } from "@/components/FactView";
import Disclosure from "@/components/Disclosure";

/** Currency amount without needless ".00" (whole amounts stay whole; 2.85 keeps its pence/cents). */
export function money(amount: number, currency: string, lang: string) {
  try { return new Intl.NumberFormat(lang === "ja" ? "ja-JP" : "en-GB", { style: "currency", currency, currencyDisplay: "narrowSymbol", minimumFractionDigits: Number.isInteger(amount) ? 0 : 2, maximumFractionDigits: 2 }).format(amount); }
  catch { return `${amount} ${currency}`; }
}

export function AmountText({ p, big }: { p: DataPoint; big?: boolean }) {
  const { L, lang } = useI18n();
  if (!p.value) return null;
  const v = p.value;
  return (
    <span className="whitespace-nowrap">
      <span className={`${big ? "text-2xl" : "text-base"} font-semibold tabular-nums text-slate-900`}>{money(v.amount, v.currency, lang)}{v.max !== undefined ? `–${money(v.max, v.currency, lang)}` : ""}</span>
      <span className="ml-1 text-xs text-slate-500">{v.currency} · {L(ot.per[v.per])}</span>
    </span>
  );
}

/**
 * One official figure. Level 2: amount, who it applies to, a warning when it is not verified. Level 3 (one more click):
 * conditions, contract, validity, sources, retrieval dates, reuse terms and notes.
 */
export default function DataCard({ p }: { p: DataPoint }) {
  const { L, lang } = useI18n();
  const shown = p.status !== "pending";
  return (
    <article data-point={p.id} className={`flex flex-col gap-2 rounded-2xl bg-white p-4 shadow-sm ring-1 ${p.status === "verified" ? "ring-slate-200" : "ring-amber-200"}`}>
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-semibold leading-snug text-[#0b2a5b]">{L(p.label)}</h3>
        {p.status !== "verified" && <StatusBadge status={p.status} />}
      </div>
      {shown ? (p.value ? <AmountText p={p} big /> : p.text ? <p className="text-sm text-slate-700">{L(p.text)}</p> : null) : <p className="text-sm text-slate-400">{L(ot.pendingNote)}</p>}
      <p className="text-xs leading-relaxed text-slate-600">{L(ot.audience[p.audience])}</p>
      {p.status === "unverified" && <p className="text-xs text-amber-700">{L(ot.unverifiedNote)}</p>}
      <Disclosure level="sources" className="mt-auto">
        <dl className="grid gap-1 text-xs leading-relaxed text-slate-600">
          <div><dt className="inline font-medium text-slate-500">{L(ot.conditions)}: </dt><dd className="inline">{L(p.conditions)}</dd></div>
          {p.housing?.contract && <div><dt className="inline font-medium text-slate-500">{L(ot.contract)}: </dt><dd className="inline">{L(p.housing.contract)}</dd></div>}
          {p.housing?.includes && <div><dt className="inline font-medium text-slate-500">{L(ot.includes)}: </dt><dd className="inline">{L(p.housing.includes)}</dd></div>}
          <div><dt className="inline font-medium text-slate-500">{L(ot.validFor)}: </dt><dd className="inline">{validForText(p.validFor, lang)}</dd></div>
        </dl>
        <div className="mt-2 border-t border-slate-100 pt-2 text-[11px] leading-relaxed text-slate-500">
          {p.evidence.map((e) => (
            <p key={e.url + e.quote}>{L(ot.source)}: <a href={e.url} target="_blank" rel="noopener noreferrer" className="text-sky-700 underline">{e.publisher}</a> — {L(ot.section)}: {L(e.section)}</p>
          ))}
          <p>{L(ot.retrieved)}: {p.retrievedAt}{p.checkedAt ? ` · ${L(ot.checked)}: ${p.checkedAt}` : ""}</p>
          {officialSources.find((x) => x.id === p.sourceId)?.terms.status === "page-check-only" && <p className="mt-1 text-slate-400">{L(ot.termsPageOnly)}</p>}
          {p.note && <p className="mt-1 text-slate-400">{L(p.note)}</p>}
        </div>
      </Disclosure>
    </article>
  );
}

export function CardGrid({ points }: { points: DataPoint[] }) {
  const { L } = useI18n();
  if (!points.length) return <p className="text-sm text-slate-500">{L(ot.noData)}</p>;
  return <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{points.map((p) => <DataCard key={p.id} p={p} />)}</div>;
}
