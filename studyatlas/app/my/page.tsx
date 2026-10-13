"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { cities, countries } from "@/data/cities";
import { LOCALES, useI18n } from "@/lib/i18n";
import { AGE_GROUPS, STUDY_TYPES, emptyProfile, isEmptyProfile, type Profile } from "@/lib/profile";
import { useProfile } from "@/lib/useProfile";
import { useRegions } from "@/lib/useRegions";
import { CURRENCIES } from "@/lib/money";
import { panel, pill, pillOff } from "@/lib/ui";
import { my } from "@/locales/my";
import MyNav from "@/components/MyNav";
import { Field, NumberInput, Select } from "@/components/form";

export default function ProfilePage() {
  const { L, lang, setLang } = useI18n();
  const [saved, setSaved, { loaded, remove }] = useProfile();
  const [draft, setDraft] = useState<Profile>(emptyProfile()); const [msg, setMsg] = useState("");
  useEffect(() => { if (loaded) setDraft(saved); }, [loaded, saved]);
  const dirty = JSON.stringify(draft) !== JSON.stringify(saved);
  const set = <K extends keyof Profile>(k: K, v: Profile[K]) => { setDraft((d) => ({ ...d, [k]: v })); setMsg(""); };
  const regions = useRegions(lang);
  const cityOptions = cities.filter((c) => !draft.destCountry || c.country === draft.destCountry).map((c) => ({ value: c.id, label: L(c.name) }));
  const save = () => { setSaved(draft); setMsg(L(my.saved)); };
  const del = () => { if (window.confirm(L(my.confirmDel))) { remove(); setDraft(emptyProfile()); setMsg(L(my.deleted)); } };
  const ccy = CURRENCIES.map((c) => ({ value: c, label: c }));

  return (
    <div className="space-y-6">
      <MyNav />
      <h1 className="text-3xl font-bold text-[#0b2a5b]">{L(my.profileTitle)}</h1>
      <form onSubmit={(e) => { e.preventDefault(); save(); }} className={`grid gap-5 p-5 sm:p-6 md:grid-cols-2 ${panel}`}>
        <Field label={L(my.nationality)} htmlFor="nationality"><Select id="nationality" value={draft.nationality} onChange={(v) => set("nationality", v)} options={regions} placeholder={L(my.select)} /></Field>
        <Field label={L(my.residence)} htmlFor="residence"><Select id="residence" value={draft.residence} onChange={(v) => set("residence", v)} options={regions} placeholder={L(my.select)} /></Field>
        <Field label={L(my.ageGroup)} htmlFor="age"><Select id="age" value={draft.ageGroup} onChange={(v) => set("ageGroup", v as Profile["ageGroup"])} options={AGE_GROUPS.map((a) => ({ value: a, label: L(my.ages[a]) }))} placeholder={L(my.select)} /></Field>
        <Field label={L(my.studyType)} htmlFor="type"><Select id="type" value={draft.studyType} onChange={(v) => set("studyType", v as Profile["studyType"])} options={STUDY_TYPES.map((s) => ({ value: s, label: L(my.studyTypes[s]) }))} placeholder={L(my.select)} /></Field>
        <Field label={L(my.destCountry)} htmlFor="destCountry"><Select id="destCountry" value={draft.destCountry} onChange={(v) => setDraft((d) => ({ ...d, destCountry: v, destCity: cities.find((c) => c.id === d.destCity)?.country === v ? d.destCity : "" }))} options={countries.map((c) => ({ value: c.code, label: L(c.name) }))} placeholder={L(my.undecided)} /></Field>
        <Field label={L(my.destCity)} htmlFor="destCity"><Select id="destCity" value={draft.destCity} onChange={(v) => setDraft((d) => ({ ...d, destCity: v, destCountry: cities.find((c) => c.id === v)?.country ?? d.destCountry }))} options={cityOptions} placeholder={L(my.undecided)} /></Field>
        <Field label={L(my.duration)} htmlFor="duration">
          <div className="flex gap-2"><NumberInput id="duration" value={draft.duration.value} onChange={(v) => set("duration", { ...draft.duration, value: v })} min={1} step="1" className="min-w-0 flex-1" />
            <Select value={draft.duration.unit} onChange={(v) => set("duration", { ...draft.duration, unit: v as Profile["duration"]["unit"] })} options={(["weeks", "months", "years"] as const).map((u) => ({ value: u, label: L(my.units[u]) }))} className="!w-32 shrink-0" /></div>
        </Field>
        <Field label={L(my.departure)} htmlFor="departure"><input id="departure" type="month" value={draft.departure} onChange={(e) => set("departure", e.target.value)} className="w-full rounded-xl bg-white px-3 py-2 text-sm ring-1 ring-slate-200 outline-none focus:ring-2 focus:ring-sky-400" /></Field>
        <Field label={L(my.budget)} htmlFor="budget">
          <div className="flex gap-2"><NumberInput id="budget" value={draft.budget.amount} onChange={(v) => set("budget", { ...draft.budget, amount: v })} className="min-w-0 flex-1" />
            <Select value={draft.budget.currency} onChange={(v) => set("budget", { ...draft.budget, currency: v })} options={ccy} className="!w-28 shrink-0" /></div>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label={L(my.language)} htmlFor="lang"><Select id="lang" value={lang} onChange={setLang} options={LOCALES.map((l) => ({ value: l.code, label: l.label }))} /></Field>
          <Field label={L(my.currency)} htmlFor="currency"><Select id="currency" value={draft.currency} onChange={(v) => set("currency", v)} options={ccy} /></Field>
        </div>
        <div className="flex flex-wrap items-center gap-3 md:col-span-2">
          <button type="submit" disabled={!dirty} className={`${pill} bg-[#0b2a5b] px-6 text-white disabled:opacity-40`}>{L(my.save)}</button>
          {dirty && <button type="button" onClick={() => { setDraft(saved); setMsg(""); }} className={`${pill} ${pillOff}`}>{L(my.reset)}</button>}
          {!isEmptyProfile(saved) && <button type="button" onClick={del} className={`${pill} text-red-700 ring-1 ring-red-200 hover:bg-red-50`}>{L(my.del)}</button>}
          <span role="status" className="text-sm text-slate-500">{dirty ? L(my.unsaved) : msg}</span>
        </div>
      </form>
      <section className="flex flex-wrap items-center gap-3">
        <span className="text-sm font-semibold text-slate-600">{L(my.nextSteps)}:</span>
        <Link href="/my/budget" className={`${pill} ${pillOff}`}>{L(my.toBudget)} →</Link>
        <Link href="/my/visa" className={`${pill} ${pillOff}`}>{L(my.toVisa)} →</Link>
        <Link href="/schools" className={`${pill} ${pillOff}`}>{L(my.toSchools)} →</Link>
      </section>
    </div>
  );
}
