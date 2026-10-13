"use client";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";
export default function NotFound() { const { t } = useI18n(); return <div className="space-y-3 py-20 text-center"><h1 className="text-3xl font-bold">{t("notFoundTitle")}</h1><p className="text-slate-500">{t("notFoundBody")}</p><Link href="/" className="text-sky-700 underline">← {t("home")}</Link></div>; }
