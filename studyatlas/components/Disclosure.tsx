"use client";
import { useId, useState, type ReactNode } from "react";
import { useI18n } from "@/lib/i18n";
import { ux } from "@/locales/ux";
/*
 * One "show more" control for the whole site (Progressive Disclosure):
 *   level 2 "more" – "詳しく見る": breakdowns, conditions, extra items,
 *   level 3 "sources" – "出典・適用条件を見る": URLs, years, calculation basis, limits.
 * A real button (keyboard: Enter/Space), aria-expanded + aria-controls, 44px touch target. Closed content is not rendered.
 */
export type DisclosureProps = {
  children: ReactNode; level?: "more" | "sources" | "row"; /** closed label; defaults by level */ label?: string; openLabel?: string;
  open?: boolean; defaultOpen?: boolean; onOpenChange?: (o: boolean) => void; id?: string; testid?: string; className?: string;
  /** row level: the visible heading, short summary under it and right-hand hint */ title?: ReactNode; summary?: ReactNode;
};
export default function Disclosure({ children, level = "more", label, openLabel, open: ctl, defaultOpen = false, onOpenChange, id, testid, className = "", title, summary }: DisclosureProps) {
  const { L } = useI18n(); const [inner, setInner] = useState(defaultOpen); const open = ctl ?? inner; const rid = useId(); const panel = `${rid}-p`;
  const toggle = () => { const n = !open; if (ctl === undefined) setInner(n); onOpenChange?.(n); };
  const closed = label ?? L(level === "sources" ? ux.sources : ux.more); const opened = openLabel ?? L(ux.close);
  if (level === "row") return (
    <div id={id} data-testid={testid} className={className}>
      <button type="button" aria-expanded={open} aria-controls={panel} onClick={toggle} className="flex min-h-[44px] w-full items-center justify-between gap-3 rounded-xl px-1 py-2 text-left hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-300">
        <span className="min-w-0"><span className="block text-base font-semibold text-[#0b2a5b]">{title}</span>{summary && <span className="mt-0.5 block text-xs text-slate-500">{summary}</span>}</span>
        <span className="flex shrink-0 items-center gap-1 text-sm font-medium text-sky-800">{open ? opened : closed}<Chevron open={open} /></span>
      </button>
      {open && <div id={panel} className="sa-fade pt-2">{children}</div>}
    </div>
  );
  const small = level === "sources";
  return (
    <div id={id} data-testid={testid} className={className}>
      <button type="button" aria-expanded={open} aria-controls={panel} onClick={toggle} className={`inline-flex items-center gap-1 rounded-full font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-300 ${small ? "min-h-[36px] px-2 text-xs text-slate-500 hover:text-slate-800" : "-ml-3 min-h-[44px] px-3 text-sm text-sky-800 hover:bg-sky-50"}`}>
        {open ? opened : closed}<Chevron open={open} />
      </button>
      {open && <div id={panel} className="sa-fade mt-2">{children}</div>}
    </div>
  );
}
function Chevron({ open }: { open: boolean }) { return <svg aria-hidden viewBox="0 0 20 20" className={`h-4 w-4 transition-transform motion-reduce:transition-none ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 8l5 5 5-5" strokeLinecap="round" strokeLinejoin="round" /></svg>; }
