import type { Ccy } from "./planner";
/*
 * Flight price estimates (Ver.1.7). The data source is replaceable: a FlightProvider returns quotes that are labelled
 *  - "reference": an indicative price (e.g. cached "from" prices); NOT a bookable fare,
 *  - "bookable": a live fare that can be booked,
 *  - "manual": a number the user typed.
 * No provider is connected yet. `skyscannerIndicative` shows where the Skyscanner Indicative Prices API would plug in; it never
 * returns a price, because StudyAtlas has no permission to use it. Until a provider is connected the user enters a price by hand
 * and opens an external search with the same route and dates. Nothing is fetched and nothing is pretended to be fetched.
 */
export const TRIPS = ["round", "oneway"] as const;
export type TripType = (typeof TRIPS)[number];
export type FlightQuery = { origin: string; destination: string; /** 1-12, or null when the month is undecided */ month: number | null; trip: TripType; currency: Ccy; stayWeeks?: number; now?: Date };
export type FlightQuote = { kind: "reference" | "bookable" | "manual"; amount: number; currency: Ccy; trip: TripType; provider: string; fetchedAt?: string; url?: string };
export type ProviderResult = { status: "ok"; quotes: FlightQuote[] } | { status: "not-connected" | "no-permission" | "error"; reason: string };
export interface FlightProvider { id: string; name: string; kind: "reference" | "bookable"; quote(q: FlightQuery): Promise<ProviderResult> }

export const skyscannerIndicative: FlightProvider = {
  id: "skyscanner-indicative", name: "Skyscanner Indicative Prices API", kind: "reference",
  quote: async () => ({ status: "not-connected", reason: "No API access has been granted to StudyAtlas, so no price is fetched." }),
};
/** Providers tried in order. Add a connected provider here; reference and bookable prices stay labelled differently. */
export const FLIGHT_PROVIDERS: FlightProvider[] = [skyscannerIndicative];

export async function fetchQuotes(q: FlightQuery, providers: FlightProvider[] = FLIGHT_PROVIDERS): Promise<{ quotes: FlightQuote[]; failures: { provider: string; status: string; reason: string }[] }> {
  const quotes: FlightQuote[] = []; const failures: { provider: string; status: string; reason: string }[] = [];
  for (const p of providers) {
    try { const r = await p.quote(q); if (r.status === "ok") quotes.push(...r.quotes); else failures.push({ provider: p.name, status: r.status, reason: r.reason }); }
    catch (e) { failures.push({ provider: p.name, status: "error", reason: e instanceof Error ? e.message : "error" }); }
  }
  return { quotes, failures };
}

/** First day of the next occurrence of `month` (never in the past), as YYYY-MM-DD; null when the month is undecided. */
export function departureDate(month: number | null, now = new Date()): string | null {
  if (!month || month < 1 || month > 12) return null;
  const y = now.getUTCFullYear(); const year = month < now.getUTCMonth() + 1 ? y + 1 : y;
  return `${year}-${String(month).padStart(2, "0")}-01`;
}
export function returnDate(depart: string | null, stayWeeks: number | undefined): string | null {
  if (!depart || !stayWeeks || !(stayWeeks > 0)) return null;
  const d = new Date(depart + "T00:00:00Z"); d.setUTCDate(d.getUTCDate() + Math.round(stayWeeks * 7)); return d.toISOString().slice(0, 10);
}
const yymmdd = (iso: string) => iso.slice(2, 4) + iso.slice(5, 7) + iso.slice(8, 10);

/** Links to external flight searches (opened by the user; StudyAtlas does not read their results). */
export function searchLinks(q: FlightQuery): { id: string; name: string; url: string }[] {
  const o = q.origin.toLowerCase(), d = q.destination.toLowerCase(); const dep = departureDate(q.month, q.now); const ret = q.trip === "round" ? returnDate(dep, q.stayWeeks) : null;
  const sky = `https://www.skyscanner.net/transport/flights/${o}/${d}/${dep ? yymmdd(dep) + "/" : ""}${ret ? yymmdd(ret) + "/" : ""}`;
  const gq = `Flights from ${q.origin} to ${q.destination}${dep ? ` on ${dep}` : ""}${ret ? ` through ${ret}` : ""}${q.trip === "oneway" ? " one way" : ""}`;
  return [{ id: "skyscanner", name: "Skyscanner", url: sky }, { id: "google-flights", name: "Google Flights", url: `https://www.google.com/travel/flights?q=${encodeURIComponent(gq)}` }];
}
