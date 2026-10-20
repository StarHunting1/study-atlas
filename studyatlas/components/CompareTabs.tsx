"use client";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { jn } from "@/locales/schoolCompare";
/** Cities and schools are two ways to compare; this switch is the same on both pages. Each page keeps its own candidates (cities in the browser, schools in the URL / last pair). */
export default function CompareTabs({ current }: { current: "cities" | "schools" }) {
  const { L } = useI18n();
  const tab = (href: string, on: boolean, label: string, id: string) => <Link href={href} data-testid={`tab-${id}`} aria-current={on ? "page" : undefined} className={`inline-flex min-h-[44px] items-center rounded-full px-5 text-sm font-medium ${on ? "bg-[#0b2a5b] text-white" : "text-slate-700 hover:bg-white"}`}>{label}</Link>;
  return <nav aria-label={L(jn.tabsLabel)} className="inline-flex gap-1 rounded-full bg-slate-100 p-1" data-testid="compare-tabs">{tab("/compare", current === "cities", L(jn.tabCities), "cities")}{tab("/schools/compare", current === "schools", L(jn.tabSchools), "schools")}</nav>;
}
