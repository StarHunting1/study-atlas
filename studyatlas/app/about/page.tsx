"use client";
import { useI18n } from "@/lib/i18n";
export default function About() { const { t } = useI18n(); return <div className="max-w-2xl space-y-4"><h1 className="text-3xl font-bold text-[#0b2a5b]">{t("aboutTitle")}</h1><p className="leading-relaxed text-slate-600">{t("aboutBody")}</p></div>; }
