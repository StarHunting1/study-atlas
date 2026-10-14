"use client";
import { useI18n } from "@/lib/i18n";
import { pt } from "@/locales/planner";
import type { Range } from "@/lib/planner";
/**
 * Large slider (native range input: touch, mouse and keyboard — arrows, PageUp/PageDown, Home/End) with − / + buttons for fine steps.
 * `value === null` means "not set": the thumb is shown muted at the start and nothing is counted until the user moves it.
 */
export default function SliderField({ label, value, range, format, onChange, fine, className = "" }: { label: string; value: number | null; range: Range; format: (n: number) => string; onChange: (n: number) => void; fine?: number; className?: string }) {
  const { L } = useI18n(); const unset = value === null; const v = value ?? 0;
  const r = v > range.max ? { ...range, max: Math.ceil(v / range.step) * range.step } : range;
  const pct = r.max > r.min ? Math.min(100, Math.max(0, ((v - r.min) / (r.max - r.min)) * 100)) : 0;
  const stepBy = fine ?? range.fine; const clamp = (n: number) => Math.min(r.max, Math.max(r.min, Math.round(n * 100) / 100));
  return (
    <div className={className}>
      <div className="flex items-center gap-2 sm:gap-3">
        <button type="button" aria-label={`${label}: ${L(pt.decrease)}`} disabled={unset || v <= r.min} onClick={() => onChange(clamp(v - stepBy))} className="sa-step">−</button>
        <input type="range" className="sa-range" aria-label={label} aria-valuetext={unset ? L(pt.notSet) : format(v)} data-unset={unset ? "true" : "false"}
          min={r.min} max={r.max} step={r.step} value={v} style={{ ["--p" as string]: `${pct}%` }} onChange={(e) => onChange(clamp(Number(e.target.value)))} />
        <button type="button" aria-label={`${label}: ${L(pt.increase)}`} disabled={v >= r.max} onClick={() => onChange(clamp(unset ? stepBy : v + stepBy))} className="sa-step">+</button>
      </div>
      <div className="mt-0.5 flex justify-between px-12 text-[11px] text-slate-400 sm:px-14"><span>{format(r.min)}</span><span>{format(r.max)}</span></div>
    </div>
  );
}
