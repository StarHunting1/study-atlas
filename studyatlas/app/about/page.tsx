"use client";
import { cities } from "@/data/cities";
import { useI18n } from "@/lib/i18n";
export default function About() {
  const { t, L } = useI18n(); const credited = cities.filter((c) => c.photo);
  return (
    <div className="max-w-2xl space-y-4">
      <h1 className="text-3xl font-bold text-[#0b2a5b]">{t("aboutTitle")}</h1><p className="leading-relaxed text-slate-600">{t("aboutBody")}</p>
      {credited.length > 0 && <section className="space-y-2 pt-4"><h2 className="text-xl font-semibold">{t("photoCredits")}</h2>
        <ul className="space-y-1 text-sm text-slate-600">{credited.map((c) => <li key={c.id}>{L(c.name)}: <a href={c.photo!.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-sky-700 underline">{c.photo!.author}</a> / <a href={c.photo!.licenseUrl} target="_blank" rel="noopener noreferrer" className="text-sky-700 underline">{c.photo!.license}</a></li>)}</ul></section>}
    </div>
  );
}
