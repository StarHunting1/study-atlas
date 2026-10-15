"use client";
import { useI18n } from "@/lib/i18n";
import { panel } from "@/lib/ui";
import { ux } from "@/locales/ux";
import { STUDY_MODES, type StudyMode } from "@/data/official/studyType";
/** Ver.1.2.6 – two-button switch at the top of the city page: language study / university study. */
export default function StudyModeSwitch({ mode, onChange }: { mode: StudyMode; onChange: (m: StudyMode) => void }) {
  const { L } = useI18n();
  return (
    <section className={`${panel} space-y-2 p-3 sm:p-4`} data-testid="study-switch" data-mode={mode} aria-label={L(ux.studyMode.label)}>
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm font-semibold text-[#0b2a5b]">{L(ux.studyMode.label)}</span>
        <div role="group" aria-label={L(ux.studyMode.label)} className="inline-flex rounded-full bg-slate-100 p-1">
          {STUDY_MODES.map((m) => (
            <button key={m} type="button" aria-pressed={mode === m} data-testid={`mode-${m}`} onClick={() => onChange(m)}
              className={`min-h-[44px] rounded-full px-4 text-sm font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-300 sm:px-5 ${mode === m ? "bg-white text-[#0b2a5b] shadow-sm" : "text-slate-600 hover:text-slate-900"}`}>{L(ux.studyMode[m])}</button>
          ))}
        </div>
      </div>
      <p className="text-xs leading-relaxed text-slate-500" data-testid="study-hint">{L(ux.studyMode.hint[mode])} {L(ux.studyMode.common)}</p>
    </section>
  );
}
