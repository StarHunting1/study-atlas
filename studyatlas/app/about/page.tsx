"use client";
import { versionLabel } from "@/lib/version";
import Link from "next/link";
import { cities } from "@/data/cities";
import { useI18n } from "@/lib/i18n";
import { panel, pill } from "@/lib/ui";
import { about, steps } from "@/locales/about";
import StepIcon from "@/components/StepIcon";
export default function About() {
  const { t, L } = useI18n(); const credited = cities.filter((c) => c.photo);
  return (
    <div className="space-y-16">
      {/* Hero */}
      <section className="mx-auto max-w-4xl pt-6 text-center md:pt-12">
        <p className="text-sm font-semibold tracking-wide text-sky-700">{L(about.eyebrow)}</p>
        <h1 className="mt-4 text-balance text-3xl font-bold leading-tight tracking-tight text-[#0b2a5b] sm:text-4xl md:text-5xl lg:text-6xl">{L(about.headline).split("|").map((part) => <span key={part} className="inline-block">{part}</span>)}</h1>
        <p className="mt-4 text-lg text-slate-500">{L(about.subline)}</p>
        <p className="mx-auto mt-6 max-w-2xl leading-relaxed text-slate-600">{L(about.mission)}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/" className={`${pill} bg-[#0b2a5b] px-6 py-3 text-white hover:bg-[#123a7a]`}>{L(about.ctaExplore)}</Link>
          <Link href="/compare" className={`${pill} bg-white px-6 py-3 text-[#0b2a5b] ring-1 ring-slate-200 hover:bg-slate-50`}>{L(about.ctaCompare)}</Link>
        </div>
      </section>

      {/* Discover → Compare → Decide */}
      <section aria-labelledby="steps-title">
        <h2 id="steps-title" className="mb-6 text-center text-2xl font-semibold text-[#0b2a5b]">{L(about.stepsTitle)}</h2>
        <ol className="grid gap-5 lg:grid-cols-3">
          {steps.map((s, i) => (
            <li key={s.key} className={`relative flex flex-col p-6 ${panel}`}>
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-700 ring-1 ring-sky-100"><StepIcon name={s.key} /></span>
                <div><p className="text-xs font-semibold text-slate-400">STEP {i + 1}</p><h3 className="text-xl font-bold text-[#0b2a5b]">{s.title}{L(s.label) !== s.title && <span className="text-base font-medium text-slate-500"> — {L(s.label)}</span>}</h3></div>
              </div>
              <p className="mt-4 font-medium text-slate-800">{L(s.summary)}</p>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">{L(s.detail)}</p>
              <ul className="mt-5 space-y-2 border-t border-slate-100 pt-4 text-sm">
                {s.features.map((f) => (
                  <li key={f.text.en} className="flex items-start justify-between gap-3">
                    <span className={f.status === "available" ? "text-slate-700" : "text-slate-400"}>{f.href ? <Link href={f.href} className="hover:text-sky-700 hover:underline">{L(f.text)}</Link> : L(f.text)}</span>
                    <span className={`shrink-0 whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-medium ${f.status === "available" ? "bg-sky-50 text-sky-700 ring-1 ring-sky-100" : "bg-slate-100 text-slate-500"}`}>{L(f.status === "available" ? about.available : about.soon)}</span>
                  </li>
                ))}
              </ul>
              {i < steps.length - 1 && <span aria-hidden="true" className="absolute -right-4 top-1/2 z-10 hidden h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-white text-sky-700 shadow-sm ring-1 ring-slate-200 lg:flex">→</span>}
            </li>
          ))}
        </ol>
        <p className="mt-4 text-center text-xs text-slate-400">{L(about.legend)}</p>
      </section>

      {/* Closing */}
      <section className="rounded-3xl bg-[#0b2a5b] px-6 py-12 text-center text-white md:py-16">
        <p className="text-balance text-2xl font-bold tracking-tight md:text-4xl">{L(about.closing)}</p>
        <p className="mt-3 text-white/80 md:text-lg">{L(about.closingSub)}</p>
      </section>

      {/* Current version + photo credits (kept from Ver.1.1) */}
      <section className="grid gap-6 md:grid-cols-2">
        <div className={`p-6 ${panel}`}><h2 className="mb-2 text-lg font-semibold">{L(about.currentTitle)} <span className="ml-1 text-sm font-normal text-slate-400" data-testid="version">{versionLabel}</span></h2><p className="text-sm leading-relaxed text-slate-600">{t("aboutBody")}</p></div>
        {credited.length > 0 && <div className={`space-y-2 p-6 ${panel}`}><h2 className="text-lg font-semibold">{t("photoCredits")}</h2><p className="text-sm text-slate-500">{t("photoNote")}</p>
          <ul className="space-y-1 text-sm text-slate-600">{credited.map((c) => <li key={c.id}>{L(c.name)}: <a href={c.photo!.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-sky-700 underline">{c.photo!.author}</a> / <a href={c.photo!.licenseUrl} target="_blank" rel="noopener noreferrer" className="text-sky-700 underline">{c.photo!.license}</a></li>)}</ul></div>}
      </section>
    </div>
  );
}
