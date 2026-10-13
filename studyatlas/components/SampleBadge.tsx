"use client";
import { useI18n } from "@/lib/i18n";
export default function SampleBadge({ show = true }: { show?: boolean }) {
  const { t } = useI18n(); if (!show) return null;
  return <span className="ml-1 whitespace-nowrap rounded bg-amber-100 px-1 align-middle text-[10px] font-normal text-amber-800">{t("sample")}</span>;
}
