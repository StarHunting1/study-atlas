"use client";
import { COUNTRIES, DESTINATIONS, OTHER_AIRPORT, airportsIn, findOrigin, isIata } from "@/data/airports";
import { TRIPS, searchLinks } from "@/lib/flights";
import { useI18n } from "@/lib/i18n";
import { rangeFor, stayWeeks } from "@/lib/planner";
import { destCode, flightPrice, originCode, type Easy } from "@/lib/smart";
import { pt } from "@/locales/planner";
import { st } from "@/locales/smart";
import SliderField from "../SliderField";
import { fmtMoney, tpl } from "../format";
import { monthName } from "./helpers";

/** Flight estimate: airports, trip type, an optional price the user enters (their assumption) and links to external searches. */
export default function FlightPanel({ easy, setEasy }: { easy: Easy; setEasy: (f: (e: Easy) => Easy) => void }) {
  const { L, lang } = useI18n(); const ccy = easy.budget.currency; const code = originCode(easy); const valid = isIata(code); const price = flightPrice(easy);
  const links = valid ? searchLinks({ origin: code, destination: destCode(easy.cityId), month: easy.month, trip: easy.trip, currency: ccy, stayWeeks: stayWeeks({ duration: easy.duration }) }) : [];
  const set = (v: number | null) => setEasy((e) => ({ ...e, assume: { ...e.assume, flight: { ...e.assume.flight, [e.trip]: v } } }));
  const tripName = L(st.tripName[easy.trip]); const origin = findOrigin(easy.origin.airport);
  return (
    <section className="space-y-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:p-5" aria-labelledby="flight-h" data-testid="flight-panel">
      <h2 id="flight-h" className="text-base font-semibold text-[#0b2a5b]">✈ {L(st.flightTitle)}</h2>
      <p className="text-sm text-slate-700" data-testid="flight-route">{tpl(L(st.flightRoute), { from: valid ? `${origin ? L(origin.city) + " " : ""}${code}` : "—", to: `${L(DESTINATIONS[easy.cityId].city)} ${destCode(easy.cityId)}` })} · {easy.month ? tpl(L(st.flightMonth), { month: monthName(easy.month, lang) }) : L(st.flightNoDate)}</p>
      <div role="group" aria-label={L(st.trip)} className="inline-flex gap-1 rounded-full bg-slate-50 p-1 ring-1 ring-slate-200">
        {TRIPS.map((t) => <button key={t} type="button" aria-pressed={easy.trip === t} onClick={() => setEasy((e) => ({ ...e, trip: t }))} className={`rounded-full px-4 py-1.5 text-sm font-medium ${easy.trip === t ? "bg-[#0b2a5b] text-white" : "text-slate-600 hover:bg-slate-100"}`}>{L(st.tripName[t]).replace(/^./, (c) => c.toUpperCase())}</button>)}
      </div>
      <div className="space-y-1">
        <div className="flex items-end justify-between gap-2"><span className="text-sm font-medium text-slate-700">{tpl(L(st.flightPrice), { trip: tripName })}</span>
          <span className="flex items-center gap-2" data-testid="flight-amount"><span className="text-2xl font-semibold tabular-nums text-slate-900">{price === null ? <span className="text-slate-300">{L(pt.notSet)}</span> : fmtMoney(price, ccy, lang)}</span>{price !== null && <button type="button" onClick={() => set(null)} className="text-xs text-slate-500 underline">{L(pt.clear)}</button>}</span></div>
        <SliderField label={tpl(L(st.flightPrice), { trip: tripName })} value={price} range={rangeFor("flights", "once", ccy)} format={(n) => fmtMoney(n, ccy, lang)} onChange={set} />
        <p className="text-xs text-slate-500">{price === null ? L(st.flightUnset) : `${L(st.flightAssumption)} · ${L(st.flightKinds).split("。")[0]}`}</p>
      </div>
      <p className="rounded-xl bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-900">{L(st.flightNoApi)}</p>
      <p className="text-xs text-slate-500">{L(st.flightKinds)}</p>
      {links.length > 0 && <div className="flex flex-wrap items-center gap-2"><span className="text-xs text-slate-500">{L(st.flightSearch)}:</span>{links.map((l) => <a key={l.id} href={l.url} target="_blank" rel="noopener noreferrer" className="rounded-full px-3 py-1.5 text-xs font-medium text-sky-700 ring-1 ring-sky-200 hover:bg-sky-50">{l.name} ↗</a>)}<span className="text-[11px] text-slate-400">{L(st.flightSearchNote)}</span></div>}
    </section>
  );
}
export { COUNTRIES, OTHER_AIRPORT, airportsIn };
