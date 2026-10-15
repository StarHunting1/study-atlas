"use client";
import { useI18n } from "@/lib/i18n";
import { keyStatus, type Key } from "@/lib/overview";
import { ot } from "@/locales/official";
import { ux } from "@/locales/ux";
import { AmountText } from "@/components/official/DataCard";
import { StatusBadge } from "@/components/FactView";
import { tpl } from "@/components/planner/format";
import { dataText as d } from "@/locales/data";
import type { Money } from "@/data/types";

/** Level 1: one short figure. Who it applies to and any non-verified status stay visible, so the summary cannot mislead. */
export default function KeyView({ k, big }: { k: Key; big?: boolean }) {
  const { L, lang } = useI18n(); const st = keyStatus(k); const warn = st && st !== "verified";
  const badge = warn ? <StatusBadge status={st!} /> : null;
  const num = `${big ? "text-2xl" : "text-lg"} font-semibold tabular-nums text-slate-900`;
  switch (k.kind) {
    case "link": return <div className="space-y-1" data-testid="key-link"><a href={k.url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-[40px] items-center gap-1 rounded-full px-3 text-sm font-medium text-sky-800 ring-1 ring-sky-200 hover:bg-sky-50">{L(ot.linkOnly)} ↗</a><p className="text-xs text-slate-500">{k.publisher}</p></div>;
    case "none": return <p className="text-sm text-slate-400" data-testid={k.prep ? "key-prep" : undefined}>{L(k.prep ? ux.pricePrep : ux.noData)}</p>;
    case "point": return <div className="space-y-1"><p className="flex flex-wrap items-baseline gap-x-2 gap-y-1"><AmountText p={k.point} big={big} />{badge}</p><p className="text-xs leading-snug text-slate-500">{L(ot.audience[k.point.audience])}</p></div>;
    case "money": { const m = k.fact.value as Money; return <p className="flex flex-wrap items-baseline gap-x-2"><span className={num}>{m.amount.toLocaleString(lang === "ja" ? "ja-JP" : "en-GB")}{m.max ? `–${m.max.toLocaleString(lang === "ja" ? "ja-JP" : "en-GB")}` : ""}</span><span className="text-xs text-slate-500">{m.currency} · {L(d.per[m.per])}</span>{badge}</p>; }
    case "text": return <p className="text-sm leading-relaxed text-slate-700"><span className="line-clamp-3">{L(k.fact.value as never)}</span>{badge}</p>;
    case "temp": return <div className="space-y-1"><p className="flex flex-wrap items-baseline gap-x-2"><span className={num}>{k.lo.toFixed(1)} – {k.hi.toFixed(1)} °C</span>{badge}</p><p className="text-xs text-slate-500">{L(ux.tempLabel)}</p></div>;
    case "schools": return <p className="flex flex-wrap items-baseline gap-x-2 text-sm font-medium text-slate-800">{[k.universities > 0 && tpl(L(ux.schoolsU), { u: k.universities }), k.languageSchools > 0 && tpl(L(ux.schoolsL), { l: k.languageSchools })].filter(Boolean).join(" · ")}{badge}</p>;
  }
}
