"use client";
import { useEffect, useState } from "react";
import { countries } from "@/data/cities";
import { visaLinks, type VisaFactors, type VisaPurpose } from "@/data/visa";
import { useI18n } from "@/lib/i18n";
import { durationToWeeks } from "@/lib/money";
import { usePersistentState } from "@/lib/persist";
import { AGE_GROUPS, regionName } from "@/lib/profile";
import { useProfile } from "@/lib/useProfile";
import { useRegions } from "@/lib/useRegions";
import { panel, pill, pillOff } from "@/lib/ui";
import { my } from "@/locales/my";
import MyNav from "@/components/MyNav";
import { Field, NumberInput, Select } from "@/components/form";
import { StatusBadge } from "@/components/FactView";

const PURPOSES: VisaPurpose[] = ["language", "degree", "exchange", "shortCourse"];
const empty: VisaFactors = { destination: "", nationality: "", residence: "", purpose: "", durationWeeks: null, ageGroup: "", entryDate: "" };
const clean = (v: unknown): VisaFactors | undefined => (v && typeof v === "object" ? { ...empty, ...(v as Partial<VisaFactors>) } : undefined);

export default function VisaPage() {
  const { L, lang } = useI18n();
  const [profile, , { loaded: profileLoaded }] = useProfile();
  const [f, setF, { loaded }] = usePersistentState<VisaFactors>("studyatlas.visa", empty, clean);
  const [copied, setCopied] = useState(false);
  // Pre-fill empty fields from the saved profile (never overwrite what the user typed here)
  useEffect(() => {
    if (!loaded || !profileLoaded) return;
    setF((cur) => ({
      destination: cur.destination || profile.destCountry, nationality: cur.nationality || profile.nationality, residence: cur.residence || profile.residence,
      purpose: cur.purpose || (profile.studyType === "language" ? "language" : profile.studyType === "university" ? "degree" : ""),
      durationWeeks: cur.durationWeeks ?? (profile.duration.value ? Math.round(durationToWeeks(profile.duration.value, profile.duration.unit)) : null),
      ageGroup: cur.ageGroup || profile.ageGroup, entryDate: cur.entryDate || (profile.departure ? `${profile.departure}-01` : ""),
    }));
  }, [loaded, profileLoaded]); // eslint-disable-line react-hooks/exhaustive-deps
  const set = <K extends keyof VisaFactors>(k: K, v: VisaFactors[K]) => setF((c) => ({ ...c, [k]: v }));
  const regions = useRegions(lang);
  const dest = countries.find((c) => c.code === f.destination);
  const nd = L(my.notSet);
  const summary: [string, string][] = [
    [L(my.destCountry), dest ? L(dest.name) : nd], [L(my.nationality), f.nationality ? regionName(f.nationality, lang) : nd], [L(my.residence), f.residence ? regionName(f.residence, lang) : nd],
    [L(my.purpose), f.purpose ? L(my.purposes[f.purpose]) : nd], [L(my.durationWeeks), f.durationWeeks ? `${f.durationWeeks}` : nd],
    [L(my.ageGroup), f.ageGroup ? L(my.ages[f.ageGroup as keyof typeof my.ages]) : nd], [L(my.entryDate), f.entryDate || nd],
  ];
  const copy = async () => { try { await navigator.clipboard.writeText(summary.map(([k, v]) => `${k}: ${v}`).join("\n")); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch {} };

  return (
    <div className="space-y-6">
      <MyNav />
      <h1 className="text-3xl font-bold text-[#0b2a5b]">{L(my.visaTitle)}</h1>
      <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-900">{L(my.visaNoAuto)}</p>
      <div className="grid gap-6 lg:grid-cols-2">
        <form onSubmit={(e) => e.preventDefault()} className={`grid gap-4 p-5 sm:grid-cols-2 ${panel}`}>
          <Field label={L(my.destCountry)} htmlFor="vdest"><Select id="vdest" value={f.destination} onChange={(v) => set("destination", v)} options={countries.map((c) => ({ value: c.code, label: L(c.name) }))} placeholder={L(my.select)} /></Field>
          <Field label={L(my.purpose)} htmlFor="vpurpose"><Select id="vpurpose" value={f.purpose} onChange={(v) => set("purpose", v as VisaPurpose)} options={PURPOSES.map((p) => ({ value: p, label: L(my.purposes[p]) }))} placeholder={L(my.select)} /></Field>
          <Field label={L(my.nationality)} htmlFor="vnat"><Select id="vnat" value={f.nationality} onChange={(v) => set("nationality", v)} options={regions} placeholder={L(my.select)} /></Field>
          <Field label={L(my.residence)} htmlFor="vres"><Select id="vres" value={f.residence} onChange={(v) => set("residence", v)} options={regions} placeholder={L(my.select)} /></Field>
          <Field label={L(my.durationWeeks)} htmlFor="vweeks"><NumberInput id="vweeks" value={f.durationWeeks} onChange={(v) => set("durationWeeks", v)} min={1} step="1" /></Field>
          <Field label={L(my.ageGroup)} htmlFor="vage"><Select id="vage" value={f.ageGroup} onChange={(v) => set("ageGroup", v)} options={AGE_GROUPS.map((a) => ({ value: a, label: L(my.ages[a]) }))} placeholder={L(my.select)} /></Field>
          <Field label={L(my.entryDate)} htmlFor="ventry"><input id="ventry" type="date" value={f.entryDate} onChange={(e) => set("entryDate", e.target.value)} className="w-full rounded-xl bg-white px-3 py-2 text-sm ring-1 ring-slate-200 outline-none focus:ring-2 focus:ring-sky-400" /></Field>
        </form>
        <div className="space-y-4">
          <section className={`p-5 ${panel}`}>
            <h2 className="mb-3 font-semibold text-slate-800">{L(my.officialLinks)}</h2>
            {!dest ? <p className="text-sm text-slate-500">{L(my.pickDest)}</p> : (
              <ul className="space-y-2">{(visaLinks[dest.code] ?? []).map((l) => (
                <li key={l.link.value} className="flex flex-wrap items-center gap-2 text-sm"><a href={l.link.value} target="_blank" rel="noopener noreferrer" className="text-sky-700 underline">{L(l.label)} ↗</a>{l.link.status !== "verified" && <StatusBadge status={l.link.status} />}</li>))}</ul>
            )}
            <p className="mt-3 text-xs text-slate-400">{L(my.autoNotice)}</p>
          </section>
          <section className={`p-5 ${panel}`}>
            <div className="mb-3 flex items-center justify-between gap-2"><h2 className="font-semibold text-slate-800">{L(my.summary)}</h2><button type="button" onClick={copy} className={`${pill} ${pillOff} text-xs`}>{copied ? L(my.copied) : L(my.copy)}</button></div>
            <dl className="divide-y divide-slate-100 text-sm" data-testid="visa-summary">{summary.map(([k, v]) => <div key={k} className="grid grid-cols-[10rem_1fr] gap-2 py-1.5"><dt className="text-slate-500">{k}</dt><dd className={v === nd ? "text-slate-400" : "text-slate-800"}>{v}</dd></div>)}</dl>
          </section>
        </div>
      </div>
    </div>
  );
}
