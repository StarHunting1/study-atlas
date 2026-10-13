"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LOCALES, useI18n } from "@/lib/i18n";
import { useCompare } from "@/lib/store";
import { useTrackNavigation } from "@/lib/history";
export default function Header() {
  const { lang, setLang, t } = useI18n(); const { ids } = useCompare(); const p = usePathname(); useTrackNavigation();
  const nav = [["/", t("explore")], ["/compare", t("compare")], ["/about", t("about")]];
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-2 sm:py-3">
        <Link href="/" className="text-xl font-bold tracking-tight text-[#0b2a5b]">StudyAtlas</Link>
        <nav className="order-3 flex w-full gap-5 text-sm sm:order-none sm:w-auto">
          {nav.map(([h, l]) => <Link key={h} href={h} className={p === h ? "font-semibold text-[#0b2a5b]" : "text-slate-500 hover:text-slate-900"}>{l}{h === "/compare" && ids.length > 0 && <span className="ml-1 rounded-full bg-sky-100 px-1.5 text-xs text-sky-700">{ids.length}</span>}</Link>)}
        </nav>
        <div className="ml-auto flex rounded-full bg-slate-100 p-1 text-xs">
          {LOCALES.map((l) => <button key={l.code} onClick={() => setLang(l.code)} className={`rounded-full px-3 py-1 ${lang === l.code ? "bg-white font-semibold shadow" : "text-slate-500"}`}>{l.label}</button>)}
        </div>
      </div>
    </header>
  );
}
