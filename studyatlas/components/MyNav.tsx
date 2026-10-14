"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import { my } from "@/locales/my";
export default function MyNav() {
  const { L } = useI18n(); const p = usePathname();
  const tabs = [["/my", my.tabs.profile], ["/planner", { en: "Cost planner", ja: "費用プランナー" }], ["/my/budget", my.tabs.budget], ["/my/visa", my.tabs.visa]] as const;
  return (
    <div className="space-y-3">
      <nav className="flex gap-1 overflow-x-auto rounded-full bg-white p-1 shadow-sm ring-1 ring-slate-200 sm:inline-flex">
        {tabs.map(([h, l]) => <Link key={h} href={h} aria-current={p === h ? "page" : undefined} className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium ${p === h ? "bg-[#0b2a5b] text-white" : "text-slate-600 hover:bg-slate-50"}`}>{L(l)}</Link>)}
      </nav>
      <p className="flex items-start gap-2 text-xs text-slate-500"><span aria-hidden>🔒</span>{L(my.privacy)}</p>
    </div>
  );
}
