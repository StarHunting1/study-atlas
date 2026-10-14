"use client";
import { COUNTRIES, DESTINATIONS, OTHER_AIRPORT, airportsIn, findOrigin, isIata } from "@/data/airports";
import Disclosure from "@/components/Disclosure";
import { TRIPS, skyscannerLink } from "@/lib/flights";
import { useI18n } from "@/lib/i18n";
import { rangeFor, stayWeeks } from "@/lib/planner";
import { destCode, flightPrice, originCode, type Easy } from "@/lib/smart";
import { pt } from "@/locales/planner";
import { st } from "@/locales/smart";
import SliderField from "../SliderField";
import { fmtMoney, tpl } from "../format";
import { monthName } from "./helpers";

const sel = "w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm focus:border-[#0b2a5b] focus:outline-none";
const lab = "block text-sm font-medium text-slate-700";

/**
 * Flight card (inside 「条件を追加する」). Level 1: departure airport, destination, month (or "not decided"), one way / round trip and
 * the Skyscanner button. Level 2: the reference budget that feeds the plan. No price is fetched, estimated or shown as an average.
 */
export default function FlightPanel({ easy, setEasy }: { easy: Easy; setEasy: (f: (e: Easy) => Easy) => void }) {
  const { L, lang } = useI18n(); const ccy = easy.budget.currency; const code = originCode(easy); const valid = isIata(code); const price = flightPrice(easy);
  const dest = DESTINATIONS[easy.cityId]; const origin = findOrigin(easy.origin.airport); const tripName = L(st.tripName[easy.trip]);
  const link = skyscannerLink({ origin: code, destination: destCode(easy.cityId), month: easy.month, trip: easy.trip, currency: ccy, stayWeeks: stayWeeks({ duration: easy.duration }) }, lang);
  const set = (v: number | null) => setEasy((e) => ({ ...e, assume: { ...e.assume, flight: { ...e.assume.flight, [e.trip]: v } } }));
  const routeText = `${valid ? `${origin ? L(origin.city) + " " : ""}${code}` : "—"} → ${L(dest.city)} ${dest.code} · ${L(st.tripName[easy.trip])}`;
  const monthText = easy.month ? ` · ${monthName(easy.month, lang)}` : ` · ${L(st.fcUndecided)}`;
  return (
    <section className="space-y-4 rounded-xl bg-slate-50/70 p-4" aria-labelledby="flight-h" data-testid="flight-panel">
      <h3 id="flight-h" className="text-sm font-semibold text-[#0b2a5b]">✈ {L(st.fcTitle)}</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="space-y-1"><span className={lab}>{L(st.originCountry)}</span>
          <select data-testid="origin-country" value={easy.origin.country} onChange={(e) => { const c = e.target.value; const first = airportsIn(c)[0]; setEasy((x) => ({ ...x, origin: { country: c, airport: first?.code ?? OTHER_AIRPORT, custom: "" } })); }} className={sel}>{COUNTRIES.map((c) => <option key={c.code} value={c.code}>{L(c.name)}</option>)}</select></label>
        <label className="space-y-1"><span className={lab}>{L(st.originAirport)}</span>
          <select data-testid="origin-airport" value={easy.origin.airport} onChange={(e) => setEasy((x) => ({ ...x, origin: { ...x.origin, airport: e.target.value } }))} className={sel}>{airportsIn(easy.origin.country).map((a) => <option key={a.code} value={a.code}>{L(a.city)} {L(a.name)} ({a.code})</option>)}<option value={OTHER_AIRPORT}>{L(st.otherAirport)}</option></select></label>
        {easy.origin.airport === OTHER_AIRPORT && <label className="space-y-1 sm:col-span-2"><span className={lab}>{L(st.otherAirport)}</span>
          <input data-testid="origin-custom" value={easy.origin.custom} maxLength={3} placeholder={L(st.iataHint)} onChange={(e) => setEasy((x) => ({ ...x, origin: { ...x.origin, custom: e.target.value.replace(/[^a-zA-Z]/g, "").toUpperCase() } }))} className={`${sel} w-32 uppercase`} aria-invalid={!isIata(easy.origin.custom)} />
          {!isIata(easy.origin.custom) && <p className="text-xs text-amber-700">{L(st.iataInvalid)}</p>}</label>}
        <div className="space-y-1"><span className={lab}>{L(st.fcTo)}</span><p className="rounded-xl bg-white px-3 py-2.5 text-sm text-slate-700 ring-1 ring-slate-200" data-testid="flight-dest">{L(dest.city)} · {L(dest.name)} ({dest.code})</p><p className="text-[11px] text-slate-400">{L(st.fcToHint)}</p></div>
        <label className="space-y-1"><span className={lab}>{L(st.fcMonth)}</span>
          <select data-testid="month-select" value={easy.month ?? ""} onChange={(e) => setEasy((x) => ({ ...x, month: e.target.value === "" ? null : Number(e.target.value) }))} className={sel}>
            <option value="">{L(st.fcUndecided)}</option>{Array.from({ length: 12 }, (_, i) => i + 1).map((m) => <option key={m} value={m}>{monthName(m, lang)}</option>)}</select></label>
      </div>
      <div role="group" aria-label={L(st.trip)} className="inline-flex gap-1 rounded-full bg-white p-1 ring-1 ring-slate-200">
        {TRIPS.map((t) => <button key={t} type="button" data-testid={`trip-${t}`} aria-pressed={easy.trip === t} onClick={() => setEasy((e) => ({ ...e, trip: t }))} className={`min-h-[40px] rounded-full px-4 text-sm font-medium ${easy.trip === t ? "bg-[#0b2a5b] text-white" : "text-slate-600 hover:bg-slate-100"}`}>{L(st[t])}</button>)}
      </div>

      <div className="space-y-2">
        <a href={link.url} target="_blank" rel="noopener noreferrer" data-testid="skyscanner-link" data-carries-route={link.carriesRoute ? "true" : "false"} className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-[#0b2a5b] px-5 text-sm font-medium text-white hover:bg-[#12397a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300">{L(st.fcSearch)} <span aria-hidden>↗</span></a>
        <p className="text-xs leading-relaxed text-slate-600" data-testid="flight-route">{link.carriesRoute ? routeText : tpl(L(st.fcSearchNote), { route: routeText, month: monthText })}</p>
      </div>

      <Disclosure level="more" label={L(st.fcDetails)} testid="flight-details">
        <div className="space-y-3">
          <div className="space-y-1">
            <div className="flex items-end justify-between gap-2"><span className={lab}>{tpl(L(st.fcBudget), { trip: tripName })}</span>
              <span className="flex items-center gap-2" data-testid="flight-amount"><span className="text-2xl font-semibold tabular-nums text-slate-900">{price === null ? <span className="text-slate-300">{L(pt.notSet)}</span> : fmtMoney(price, ccy, lang)}</span>{price !== null && <button type="button" onClick={() => set(null)} className="text-xs text-slate-500 underline">{L(pt.clear)}</button>}</span></div>
            <SliderField label={tpl(L(st.fcBudget), { trip: tripName })} value={price} range={rangeFor("flights", "once", ccy)} format={(n) => fmtMoney(n, ccy, lang)} onChange={set} />
            <p className="text-xs text-slate-500">{price === null ? L(st.fcBudgetUnset) : L(st.fcBudgetSet)}</p>
          </div>
          <p className="rounded-xl bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-900">{L(st.fcNoPrice)}</p>
          <p className="text-[11px] leading-relaxed text-slate-500">{L(st.fcBases)}</p>
          <p className="text-[11px] leading-relaxed text-slate-400">{L(st.fcSearchRoute)}</p>
        </div>
      </Disclosure>
    </section>
  );
}
