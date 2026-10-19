"use client";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { schoolsText as s } from "@/locales/my";
import { sc } from "@/locales/schoolCompare";
import LanguageSchoolCompare from "@/components/schools/LanguageSchoolCompare";

export default function LanguageSchoolComparePage() {
  const { L } = useI18n();
  return (
    <div className="space-y-6">
      <Link href="/schools" className="text-sm text-slate-500 hover:text-slate-900">← {L(s.title)}</Link>
      <div><h1 className="text-3xl font-bold text-[#0b2a5b]">{L(sc.title)}</h1><p className="mt-1 text-slate-500">{L(sc.intro)}</p></div>
      <LanguageSchoolCompare />
      <section className="space-y-1 rounded-2xl bg-white p-4 ring-1 ring-slate-200" data-testid="school-planner"><p className="text-xs leading-relaxed text-slate-600">{L(sc.toPlanner)}</p><Link href="/planner" data-testid="school-planner-link" className="inline-flex min-h-[44px] items-center text-sm text-sky-700 underline">{L(sc.toPlannerLink)}</Link></section>
    </div>
  );
}
