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
import type { DataPoint } from "@/data/official/types";
import { validForShort } from "@/data/official/validFor";
import { cu } from "@/locales/compareUi";
import type { Localized } from "@/lib/i18n";

/** Level 1: one short figure. Who it applies to and any non-verified status stay visible, so the summary cannot mislead. */
export default function KeyView({ k, big, languageFirst, noneText }: { k: Key; big?: boolean; /** wording for "no figure" (the comparison page says "not obtained") */ noneText?: Localized; /** schools: name language schools before universities (language-study mode) */ languageFirst?: boolean }) {
  const { L, lang } = useI18n(); const st = keyStatus(k); const warn = st && st !== "verified";
  const badge = warn ? <StatusBadge status={st!} /> : null;
  const num = `${big ? "text-2xl" : "text-lg"} font-semibold tabular-nums text-slate-900`;
  switch (k.kind) {
    case "link": return <div className="space-y-1" data-testid="key-link"><a href={k.url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-[40px] items-center gap-1 rounded-full px-3 text-sm font-medium text-sky-800 ring-1 ring-sky-200 hover:bg-sky-50">{L(ot.linkOnly)} ↗</a><p className="text-xs text-slate-500">{k.publisher}</p></div>;
    case "none": return <p className="text-sm text-slate-400" data-testid={k.prep ? "key-prep" : undefined}>{L(noneText ?? (k.prep ? ux.pricePrep : ux.noData))}</p>;
    case "point": return <div className="space-y-1"><p className="flex flex-wrap items-baseline gap-x-2 gap-y-1"><AmountText p={k.point} big={big} />{badge}</p><p className="text-xs leading-snug text-slate-500">{L(ot.audience[k.point.audience])}</p></div>;
    case "money": { const m = k.fact.value as Money; return <p className="flex flex-wrap items-baseline gap-x-2"><span className={num}>{m.amount.toLocaleString(lang === "ja" ? "ja-JP" : "en-GB")}{m.max ? `–${m.max.toLocaleString(lang === "ja" ? "ja-JP" : "en-GB")}` : ""}</span><span className="text-xs text-slate-500">{m.currency} · {L(d.per[m.per])}</span>{badge}</p>; }
    case "text": return <p className="text-sm leading-relaxed text-slate-700"><span className="line-clamp-3">{L(k.fact.value as never)}</span>{badge}</p>;
    case "temp": return <div className="space-y-1"><p className="flex flex-wrap items-baseline gap-x-2"><span className={num}>{k.lo.toFixed(1)} – {k.hi.toFixed(1)} °C</span>{badge}</p><p className="text-xs text-slate-500">{L(ux.tempLabel)}</p></div>;
    case "schools": return <p className="flex flex-wrap items-baseline gap-x-2 text-sm font-medium text-slate-800">{(() => { const u = k.universities > 0 && tpl(L(ux.schoolsU), { u: k.universities }), l = k.languageSchools > 0 && tpl(L(ux.schoolsL), { l: k.languageSchools }); return (languageFirst ? [l, u] : [u, l]).filter(Boolean).join(" · "); })()}{badge}</p>;
  }
}

/**
 * City-page housing headline when no student price exists yet but a verified whole-market rent does (Ver.1.5.3): the representative figure with its area,
 * period and a plain "not a student price" line. The other figures, conditions and sources stay behind "詳しく見る".
 */
export function MarketRentKey({ point, count, big }: { point: DataPoint; count: number; big?: boolean }) {
  const { L, lang } = useI18n(); const basis = cu.rentBasis[`${point.metric}@${point.cityId}`] ?? cu.rentBasis[point.metric]; const st = keyStatus({ kind: "point", point });
  return (
    <div className="space-y-1" data-testid="key-market-rent">
      <p className="text-xs font-medium text-slate-600">{L(ux.marketKeyTitle)}</p>
      <p className="flex flex-wrap items-baseline gap-x-2"><AmountText p={point} big={big} />{st && st !== "verified" ? <StatusBadge status={st} /> : null}</p>
      <p className="text-xs leading-snug text-slate-500">{basis ? `${L(basis)} · ` : ""}{validForShort(point.validFor, lang)}</p>
      <p className="text-[11px] leading-snug text-amber-800">{L(ux.marketKeyNotStudent)}</p>
      {count > 1 && <p className="text-[11px] leading-snug text-slate-500" data-testid="key-market-more">{tpl(L(ux.marketKeyMore), { n: count })}</p>}
    </div>
  );
}
