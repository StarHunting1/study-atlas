"use client";
import { useI18n, type Localized } from "@/lib/i18n";
import { guideLink, guideOf, type GuideLinkKind, type TransportGuide } from "@/data/official/transportGuides";
import { ux } from "@/locales/ux";

const KINDS: { kind: GuideLinkKind; label: keyof typeof ux.guide }[] = [{ kind: "fares", label: "fares" }, { kind: "map", label: "map" }, { kind: "student", label: "student" }];

/** First-screen block of the transport card (Ver.1.6.3): where the official fares, the map and the student-eligibility pages are – nothing is copied, nothing is promised. A link that is not confirmed to work, or a page that could not be read, is labelled as such. */
export function TransportGuideLinks({ cityId }: { cityId: string }) {
  const { L } = useI18n(); const g = guideOf(cityId); if (!g) return null;
  return (
    <div className="mt-2 space-y-1.5" data-testid="transport-guide-links">
      {g.operator && <p className="text-xs font-medium text-slate-700" data-testid="guide-operator">{L(ux.guide.operator)}: {L(g.operator)}</p>}
      {g.read && g.paymentShort && <p className="text-xs text-slate-600" data-testid="guide-payment-short">{L(ux.guide.payNow)}: {L(g.paymentShort)}</p>}
      <ul className="flex flex-wrap gap-2">{KINDS.map(({ kind, label }) => { const l = guideLink(g, kind);
        return <li key={kind}>{l
          ? <a href={l.url} target="_blank" rel="noopener noreferrer" data-testid={`guide-${kind}`} className="inline-flex min-h-[40px] items-center gap-1 rounded-full px-3 text-xs font-medium text-sky-800 ring-1 ring-sky-200 hover:bg-sky-50">{L(ux.guide[label])} ↗</a>
          : <span data-testid={`guide-${kind}-none`} className="inline-flex min-h-[40px] items-center rounded-full bg-slate-100 px-3 text-xs text-slate-500">{L(ux.guide[label])}：{L(ux.guide.checking)}</span>}</li>; })}</ul>
      <p className="text-[11px] leading-snug text-slate-500" data-testid="guide-status">{g.read && g.checkedAt ? `${L(ux.guide.checked)}: ${g.checkedAt} · ${L(ux.guide.paraphrase)}` : L(ux.guide.notRead)}</p>
    </div>
  );
}

/** Details of the transport card: modes, how to pay, how fares are set, and where student eligibility is decided (own words, unverified). */
export function TransportGuideDetail({ cityId }: { cityId: string }) {
  const { L } = useI18n(); const g = guideOf(cityId); if (!g) return null;
  const row = (k: keyof typeof ux.guide, v?: Localized) => (v ? <div><dt className="text-[11px] font-semibold text-slate-500">{L(ux.guide[k])}</dt><dd className="text-xs leading-relaxed text-slate-700">{L(v)}</dd></div> : null);
  return (
    <section className="space-y-2 rounded-xl bg-slate-50 p-3 ring-1 ring-slate-200" data-testid="transport-guide">
      <h4 className="text-xs font-semibold text-slate-700">{L(ux.guide.title)}</h4>
      <dl className="space-y-2">{row("modes", g.modes)}{row("payment", g.payment)}{row("fareSystem", g.fareSystem)}{row("zones", g.zones)}{row("passes", g.passes)}{row("studentTitle", g.student)}</dl>
      <ul className="space-y-1 text-xs">{g.links.map((l) => <li key={l.url}><a href={l.url} target="_blank" rel="noopener noreferrer" className="text-sky-700 underline">{L(l.label)} ↗</a><span className="ml-1 text-[11px] text-slate-500" data-testid="guide-link-status">({L(!l.opened ? ux.guide.unopened : l.read ? ux.guide.readOk : ux.guide.opened)})</span></li>)}</ul>
      <p className="text-[11px] leading-snug text-slate-500">{g.read ? L(ux.guide.paraphraseNote) : L(ux.guide.notRead)}</p>
    </section>
  );
}

/** Comparison: the systems side by side (payment, student-eligibility checkpoint, official pages). No amounts and no verdict. */
export function TransportGuideCompare({ ids, names }: { ids: string[]; names: Record<string, Localized> }) {
  const { L } = useI18n(); const gs = ids.map((id) => [id, guideOf(id)] as const);
  if (!gs.some(([, g]) => g)) return null;
  const cell = (g: TransportGuide | undefined, f: (g: TransportGuide) => React.ReactNode) => (g ? f(g) : <span className="text-xs text-slate-400">{L(ux.guide.none)}</span>);
  const link = (g: TransportGuide, kind: GuideLinkKind) => { const l = guideLink(g, kind); return l ? <a href={l.url} target="_blank" rel="noopener noreferrer" className="text-xs text-sky-700 underline">{L(ux.guide[kind === "fares" ? "fares" : kind === "map" ? "map" : "student"])} ↗</a> : <span className="text-xs text-slate-500">{L(ux.guide.checking)}</span>; };
  const rows: { key: string; label: string; f: (g: TransportGuide) => React.ReactNode }[] = [
    { key: "payment", label: L(ux.guide.payment), f: (g) => (g.payment ? <span className="text-xs leading-relaxed text-slate-700">{L(g.payment)}</span> : <span className="text-xs text-slate-500">{L(ux.guide.checking)}</span>) },
    { key: "student", label: L(ux.guide.studentTitle), f: (g) => <span className="text-xs leading-relaxed text-slate-700">{L(g.student)}</span> },
    { key: "links", label: L(ux.guide.officialPages), f: (g) => <span className="flex flex-wrap gap-x-3 gap-y-1">{(["fares", "map", "student"] as const).map((k) => <span key={k}>{link(g, k)}</span>)}</span> },
  ];
  return (
    <div className="space-y-3 border-t border-slate-100 pt-3" data-testid="guide-compare">
      <div><p className="text-sm font-medium text-slate-700">{L(ux.guide.compareTitle)}</p><p className="text-[11px] leading-snug text-slate-500">{L(ux.guide.compareNote)}</p></div>
      {rows.map((r) => (
        <div key={r.key} className="space-y-1" data-testid={`guide-row-${r.key}`}><p className="text-[11px] font-semibold text-slate-500">{r.label}</p>
          <div className="grid gap-x-4 gap-y-2 sm:grid-cols-[repeat(var(--n),minmax(0,1fr))]" style={{ ["--n" as string]: Math.min(ids.length, 4) }}>
            {gs.map(([id, g]) => <div key={id} className="min-w-0 space-y-0.5"><p className="text-xs font-medium text-slate-500">{L(names[id])}</p>{cell(g, r.f)}</div>)}</div></div>))}
    </div>
  );
}
