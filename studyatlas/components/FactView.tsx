"use client";
import type { Fact, Institution, Money, MonthlyClimate, Status } from "@/data/types";
import type { FieldKind } from "@/data/fields";
import type { Localized } from "@/lib/i18n";
import { useI18n } from "@/lib/i18n";
import { dataText as d } from "@/locales/data";
import Disclosure from "@/components/Disclosure";

const badgeStyle: Record<Status, string> = {
  verified: "bg-sky-50 text-sky-700 ring-1 ring-sky-100",
  unverified: "bg-amber-50 text-amber-800 ring-1 ring-amber-100",
  sample: "bg-amber-100 text-amber-800",
  pending: "bg-slate-100 text-slate-500",
};
export function StatusBadge({ status }: { status: Status }) {
  const { L } = useI18n();
  return <span className={`inline-block whitespace-nowrap rounded-full px-2 py-0.5 align-middle text-[11px] font-medium ${badgeStyle[status]}`}>{L(d[status])}</span>;
}

function MoneyText({ m }: { m: Money }) {
  const { L } = useI18n();
  return <span className="font-medium text-slate-800">{m.amount.toLocaleString()}{m.max ? `–${m.max.toLocaleString()}` : ""} {m.currency} <span className="font-normal text-slate-500">{L(d.per[m.per])}</span></span>;
}
function ClimateTable({ c }: { c: MonthlyClimate }) {
  const { L, lang } = useI18n(); const months = d.months[lang === "ja" ? "ja" : "en"];
  return (
    <div className="overflow-x-auto"><table className="w-full min-w-[560px] text-center text-xs">
      <thead><tr><th /> {months.map((m) => <th key={m} className="px-1 py-1 font-medium text-slate-500">{m}</th>)}</tr></thead>
      <tbody>
        <tr><th className="pr-2 text-left font-medium text-slate-500">{L(d.tempC)}</th>{c.meanTempC.map((v, i) => <td key={i} className="px-1 py-1">{v}</td>)}</tr>
        <tr><th className="pr-2 text-left font-medium text-slate-500">{L(d.precipMm)}</th>{c.precipMm.map((v, i) => <td key={i} className="px-1 py-1">{v}</td>)}</tr>
      </tbody>
    </table><p className="mt-1 text-[11px] text-slate-400">{L(d.station)}: {c.station}</p></div>
  );
}

/** Renders one Fact: value, status badge, period / last-checked / sources, and the note. Pending facts show "Data coming soon". */
export default function FactView({ fact, kind, compact, lean }: { fact: Fact<unknown>; kind: FieldKind; compact?: boolean; /** period, check date and sources go behind "Sources & conditions" */ lean?: boolean }) {
  const { L } = useI18n();
  if (fact.status === "pending" || fact.value === undefined) return <span className="text-sm text-slate-400">{L(d.pending)}</span>;
  const v = fact.value;
  const body =
    kind === "money" ? <MoneyText m={v as Money} /> :
    kind === "climate" ? <ClimateTable c={v as MonthlyClimate} /> :
    kind === "institutions" ? <ul className="space-y-0.5">{(v as Institution[]).map((i) => <li key={i.name}>{i.url ? <a href={i.url} target="_blank" rel="noopener noreferrer" className="text-sky-700 underline">{i.name}</a> : i.name}</li>)}</ul> :
    <span>{L(v as Localized)}</span>;
  const includes = kind === "money" ? (v as Money).includes : undefined;
  const meta = (fact.period || fact.checkedAt || fact.sources?.length) ? (
        <p className="text-[11px] text-slate-400">
          {fact.period && <>{L(d.period)}: {fact.period}</>}
          {fact.checkedAt && <>{fact.period ? " · " : ""}{L(d.checked)}: {fact.checkedAt}</>}
          {fact.sources?.map((s) => <span key={s.url}> · {L(d.source)}: <a href={s.url} target="_blank" rel="noopener noreferrer" className="underline">{s.publisher}</a>{s.terms ? ` (${s.terms})` : ""}</span>)}
        </p>
  ) : null;
  return (
    <div className="space-y-1">
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">{body}{!(lean && fact.status === "verified") && <StatusBadge status={fact.status} />}</div>
      {includes && <p className="text-xs text-slate-500">{L(d.includes)}: {L(includes)}</p>}
      {lean ? (meta && <Disclosure level="sources">{meta}</Disclosure>) : meta}
      {!compact && fact.note && <p className="text-[11px] leading-relaxed text-slate-400">{L(fact.note)}</p>}
    </div>
  );
}
