"use client";
import type { DataPoint } from "@/data/official/types";
import { useI18n } from "@/lib/i18n";
import { cardPeriod, validForText } from "@/data/official/validFor";
import { displayModeOf, rightsOfPoint, showsFigure } from "@/data/official/rights";
import { tpl } from "@/components/planner/format";
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
    <span>
      <span className={`${big ? "text-2xl" : "text-base"} whitespace-nowrap font-semibold tabular-nums text-slate-900`}>{money(v.amount, v.currency, lang)}{v.max !== undefined ? `–${money(v.max, v.currency, lang)}` : ""}</span>
      <span className="ml-1 text-xs text-slate-500">{v.currency} · {L(ot.per[v.per])}</span>
    </span>
  );
}

/** What the publisher's terms mean for this figure, in one line (level 3). The long review notes stay in the developer data. */
function RightsLine({ p }: { p: DataPoint }) {
  const { L } = useI18n(); const r = rightsOfPoint(p); const hold = r.display === "hold";
  const text = hold ? L(ot.rights.hold) : r.reuseStatus === "permitted" ? tpl(L(ot.rights.permitted), { licence: r.licence ?? "" }) : r.reuseStatus === "needs-review" ? L(ot.rights.needsReview) : r.reuseStatus === "restricted" ? L(ot.rights.restricted) : L(ot.rights.unknown);
  return (
    <div className="mt-1 space-y-0.5 text-slate-500" data-testid={`rights-${p.id}`} data-reuse={r.reuseStatus}>
      <p>{L(ot.rights.label)}: {text}{r.licenseUrl && <> · <a href={r.licenseUrl} target="_blank" rel="noopener noreferrer" className="text-sky-700 underline">{L(ot.rights.terms)}</a></>}</p>
      {r.attribution && showsFigure(displayModeOf(p)) && <p>{L(ot.rights.attribution)}: {r.attribution}</p>}
      {r.lastReviewedAt && <p className="text-slate-400">{L(ot.rights.reviewedOn)}: {r.lastReviewedAt}</p>}
    </div>
  );
}

/**
 * One official figure. Level 2: amount, who it applies to, a warning when it is not verified. Level 3 (one more click):
 * conditions, contract, validity, sources, retrieval dates, the reuse terms and notes.
 * When the publisher's terms do not allow the figure to be shown (rights.ts: link-only / hold) the card shows a link to the official page instead.
 */
export default function DataCard({ p }: { p: DataPoint }) {
  const { L, lang } = useI18n();
  const mode = displayModeOf(p);
  if (!showsFigure(mode)) {
    return (
      <article data-point={p.id} data-mode={mode} className="flex flex-col gap-2 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
        <h3 className="text-sm font-semibold leading-snug text-[#0b2a5b]">{L(p.label)}</h3>
        <p className="text-xs leading-relaxed text-slate-600">{L(ot.linkOnlyBody)}</p>
        <a href={p.evidence[0].url} target="_blank" rel="noopener noreferrer" data-testid={`link-${p.id}`} className="inline-flex min-h-[40px] w-fit items-center gap-1 rounded-full px-3 text-sm font-medium text-sky-800 ring-1 ring-sky-200 hover:bg-sky-50">{L(ot.linkOnly)} · {p.evidence[0].publisher} ↗</a>
        <Disclosure level="sources" className="mt-auto"><div className="text-[11px] leading-relaxed"><RightsLine p={p} /></div></Disclosure>
      </article>
    );
  }
  const shown = p.status !== "pending";
  return (
    <article data-point={p.id} data-mode={mode} className={`flex flex-col gap-2 rounded-2xl bg-white p-4 shadow-sm ring-1 ${p.status === "verified" ? "ring-slate-200" : "ring-amber-200"}`}>
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-semibold leading-snug text-[#0b2a5b]">{L(p.label)}</h3>
        {p.status !== "verified" && <StatusBadge status={p.status} />}
      </div>
      {shown ? (p.value ? <AmountText p={p} big /> : p.text ? <p className="text-sm text-slate-700">{L(p.text)}</p> : null) : <p className="text-sm text-slate-400">{L(ot.pendingNote)}</p>}
      <p className="text-xs leading-relaxed text-slate-600">{L(ot.audience[p.audience])}{cardPeriod(p, lang) && <span data-testid={`period-${p.id}`}> · {cardPeriod(p, lang)}</span>}</p>
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
          <RightsLine p={p} />
          {p.note && <p className="mt-1 text-slate-400">{L(p.note)}</p>}
        </div>
      </Disclosure>
    </article>
  );
}

/** Figures that may not be shown: one "check the official page" card per source (not one per figure). */
function HeldCard({ points }: { points: DataPoint[] }) {
  const { L } = useI18n(); const first = points[0]; const urls = [...new Set(points.map((p) => p.evidence[0].url))].slice(0, 3);
  return (
    <article data-held-source={first.sourceId} data-mode={displayModeOf(first)} className="flex flex-col gap-2 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
      <h3 className="text-sm font-semibold leading-snug text-[#0b2a5b]">{first.evidence[0].publisher}</h3>
      <p className="text-xs leading-relaxed text-slate-600">{L(ot.linkOnlyBody)}</p>
      <div className="flex flex-wrap gap-2">{urls.map((u) => <a key={u} href={u} target="_blank" rel="noopener noreferrer" data-testid={`link-${first.sourceId}`} className="inline-flex min-h-[40px] items-center gap-1 rounded-full px-3 text-sm font-medium text-sky-800 ring-1 ring-sky-200 hover:bg-sky-50">{L(ot.linkOnly)} ↗</a>)}</div>
      <Disclosure level="sources" className="mt-auto"><div className="text-[11px] leading-relaxed"><RightsLine p={first} /></div></Disclosure>
    </article>
  );
}

export function CardGrid({ points }: { points: DataPoint[] }) {
  const { L } = useI18n();
  if (!points.length) return <p className="text-sm text-slate-500">{L(ot.noData)}</p>;
  const shown = points.filter((p) => showsFigure(displayModeOf(p))); const held = points.filter((p) => !showsFigure(displayModeOf(p)));
  const bySource = [...new Set(held.map((p) => p.sourceId))].map((id) => held.filter((p) => p.sourceId === id));
  return <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{shown.map((p) => <DataCard key={p.id} p={p} />)}{bySource.map((g) => <HeldCard key={g[0].sourceId} points={g} />)}</div>;
}
