"use client";
import type { Claim } from "@/data/schema";
import type { City, Country } from "@/data/types";
import { claimsStatus } from "@/data/factStatus";
import { healthLinks, visaLinks } from "@/data/visa";
import { visaGuides, type GuideCard } from "@/data/visaGuide";
import { useI18n } from "@/lib/i18n";
import { panel } from "@/lib/ui";
import { dataText as d } from "@/locales/data";
import { vg } from "@/locales/visaGuide";
import Disclosure from "@/components/Disclosure";
import { StatusBadge } from "@/components/FactView";

/*
 * Visa and healthcare as short route cards (Ver.1.4.1): the route and a hedged one-line summary first; the statements (each with its own status and check date),
 * fees, conditions and exceptions and the official pages one click away. Official pages sit inside the card they belong to; the open-licence notice stays visible.
 */
/** The statements of the country's visa Facts and of the city's healthcare Fact, by id. */
const claimIndex = (city: City, country: Country): Record<string, Claim> => {
  const all = [...(country.profile.visa.official.claims ?? []), ...(country.profile.visa.notes.claims ?? []), ...(city.profile.living.healthcare.claims ?? [])];
  return Object.fromEntries(all.map((c) => [c.id, c]));
};
export const hasGuide = (country: Country) => !!visaGuides[country.code];
/** Cards that apply to this city (provincial / city-specific ones are filtered). Exported for tests. */
export const cardsFor = (city: City, country: Country): GuideCard[] => (visaGuides[country.code]?.cards ?? []).filter((c) => !c.cities || c.cities.includes(city.id));

function CardView({ card, claims }: { card: GuideCard; claims: Claim[] }) {
  const { L } = useI18n(); const pages = [...(visaLinks.GBR ?? []), ...(visaLinks.CAN ?? []), ...(healthLinks.GBR ?? []), ...(healthLinks.CAN ?? [])];
  const status = claimsStatus(claims); const fees = claims.filter((c) => card.fees?.includes(c.id)), body = claims.filter((c) => !card.fees?.includes(c.id));
  const line = (c: Claim) => (
    <li key={c.id} data-testid="guide-claim" data-claim={c.id} data-status={c.status} className="space-y-0.5">
      <p className="text-sm leading-relaxed text-slate-700">{L(c.text)}</p>
      <p className="text-[11px] text-slate-500">{L(d[c.status === "verified" ? "verified" : "unverified"])}{c.checkedAt ? ` · ${L(vg.checked)}: ${c.checkedAt}` : ""}</p>
    </li>);
  const conds = [...new Set(claims.map((c) => L(c.conditions)))];
  return (
    <article data-testid={`guide-${card.id}`} data-status={status} className={`${panel} min-w-0 self-start p-4`}>
      <div className="flex items-start justify-between gap-2"><h3 className="text-sm font-semibold text-[#0b2a5b]">{L(card.title)}</h3>{claims.length > 0 && <StatusBadge status={status} />}</div>
      <p className="mt-0.5 text-base font-semibold text-slate-900">{L(card.route)}</p>
      <p className="mt-1 text-xs leading-relaxed text-slate-600">{L(card.summary)}</p>
      <Disclosure level="more" label={L(vg.more)} openLabel={L(vg.less)} className="mt-2" testid={`guide-more-${card.id}`}>
        <div className="space-y-3">
          {status === "partial" && <p className="text-xs text-slate-500">{L(vg.partlyNote)}</p>}
          {body.length > 0 && <section className="space-y-1.5"><h4 className="text-xs font-semibold text-slate-500">{L(vg.content)}</h4><ul className="space-y-2">{body.map(line)}</ul></section>}
          {fees.length > 0 && <section className="space-y-1.5"><h4 className="text-xs font-semibold text-slate-500">{L(vg.fees)}</h4><ul className="space-y-2">{fees.map(line)}</ul><p className="text-[11px] text-slate-500">{L(vg.feeNote)}</p></section>}
          {conds.length > 0 && <section className="space-y-1"><h4 className="text-xs font-semibold text-slate-500">{L(vg.conditions)}</h4><ul className="list-disc space-y-1 pl-4 text-xs leading-relaxed text-slate-600">{conds.map((x) => <li key={x}>{x}</li>)}</ul></section>}
          <section className="space-y-1"><h4 className="text-xs font-semibold text-slate-500">{L(vg.official)}</h4>
            <ul className="space-y-0.5 text-sm">{card.links.map((u) => { const p = pages.find((x) => x.link.value === u); return <li key={u}><a href={u} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-[36px] items-center text-sky-700 underline">{p ? L(p.label) : u} ↗</a></li>; })}</ul></section>
        </div>
      </Disclosure>
    </article>
  );
}

export default function VisaGuide({ city, country }: { city: City; country: Country }) {
  const { L } = useI18n(); const guide = visaGuides[country.code]; if (!guide) return null;
  const idx = claimIndex(city, country); const cards = cardsFor(city, country);
  const used = [...new Set(cards.flatMap((c) => c.claims).map((id) => idx[id]).filter(Boolean))];
  const srcs = [...new Map(used.flatMap((c) => c.sources).map((s) => [s.url, s])).values()];
  const uk = srcs.some((s) => /Open Government Licence/.test(s.terms ?? ""));
  return (
    <div className="space-y-3" data-testid="visa-guide">
      <p className="rounded-xl bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-900">{L(guide.intro)}</p>
      <div className="grid items-start gap-3 md:grid-cols-2">{cards.map((c) => <CardView key={c.id} card={c} claims={c.claims.map((id) => idx[id]).filter(Boolean)} />)}</div>
      {uk && <p className="text-[11px] text-slate-500" data-testid="ogl-notice">{L(vg.ogl)}</p>}
      <Disclosure level="sources" label={L(vg.sources)} testid="guide-sources"><ul className="space-y-1 text-[11px] leading-relaxed text-slate-500">{srcs.map((s) => <li key={s.url}><a href={s.url} target="_blank" rel="noopener noreferrer" className="text-sky-700 underline">{s.publisher}</a> – {s.terms}</li>)}</ul></Disclosure>
    </div>
  );
}
