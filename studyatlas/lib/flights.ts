import type { Ccy } from "./planner";
/*
 * Flights (Ver.1.1.9: search UX only). The price source is replaceable: a FlightProvider returns quotes labelled by what kind
 * of number they are (see PriceBasis). No provider is connected – `skyscannerIndicative` only marks where the Skyscanner Indicative
 * Prices API would plug in (Ver.1.1.10 or later) and never returns a price, because StudyAtlas has no permission to use it.
 * Until then the user opens Skyscanner and may set a reference budget of their own (basis "user"). Nothing is fetched and
 * nothing is presented as a fetched or average price.
 */
export const TRIPS = ["round", "oneway"] as const;
export type TripType = (typeof TRIPS)[number];
export type FlightQuery = { origin: string; destination: string; /** 1-12, or null when the month is undecided */ month: number | null; trip: TripType; currency: Ccy; stayWeeks?: number; now?: Date };

/**
 * What kind of number a price is. Kept apart on purpose so a future provider can never pass one off as another:
 *  - "observed": a fare seen at a given time (may no longer be bookable),
 *  - "average":  an average over a period or route sample,
 *  - "range":    a reference band (low–high),
 *  - "user":     a reference budget the user typed (an assumption; not a fetched price).
 * `bookable` is true only for a live fare that can be purchased.
 */
export const PRICE_BASES = ["observed", "average", "range", "user"] as const;
export type PriceBasis = (typeof PRICE_BASES)[number];
export type FlightQuote = { basis: PriceBasis; bookable: boolean; currency: Ccy; trip: TripType; provider: string; observedAt?: string; sample?: string } & ({ basis: "range"; low: number; high: number } | { basis: Exclude<PriceBasis, "range">; amount: number });
/** A quote is usable only if it is internally consistent (amounts finite and non-negative, a range ordered, a user budget never "bookable"). */
export function isValidQuote(q: FlightQuote): boolean {
  const ok = (n: unknown) => typeof n === "number" && Number.isFinite(n) && n >= 0;
  if (!(PRICE_BASES as readonly string[]).includes(q.basis)) return false;
  if (q.basis === "user" && q.bookable) return false;
  return q.basis === "range" ? ok(q.low) && ok(q.high) && q.low <= q.high : ok((q as { amount: number }).amount);
}
export type ProviderResult = { status: "ok"; quotes: FlightQuote[] } | { status: "not-connected" | "no-permission" | "error"; reason: string };
export interface FlightProvider { id: string; name: string; quote(q: FlightQuery): Promise<ProviderResult> }

export const skyscannerIndicative: FlightProvider = {
  id: "skyscanner-indicative", name: "Skyscanner Indicative Prices API",
  quote: async () => ({ status: "not-connected", reason: "No API access has been granted to StudyAtlas, so no price is fetched." }),
};
/** Providers tried in order. Add a connected provider here; reference and bookable prices stay labelled differently. */
export const FLIGHT_PROVIDERS: FlightProvider[] = [skyscannerIndicative];

export async function fetchQuotes(q: FlightQuery, providers: FlightProvider[] = FLIGHT_PROVIDERS): Promise<{ quotes: FlightQuote[]; failures: { provider: string; status: string; reason: string }[] }> {
  const quotes: FlightQuote[] = []; const failures: { provider: string; status: string; reason: string }[] = [];
  for (const p of providers) {
    try { const r = await p.quote(q); if (r.status === "ok") quotes.push(...r.quotes.filter(isValidQuote)); else failures.push({ provider: p.name, status: r.status, reason: r.reason }); }
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

/*
 * Skyscanner link. The only URL StudyAtlas opens is Skyscanner's own site. Origin, destination and dates are carried into a
 * search URL ONLY for a format that is documented by Skyscanner AND usable without a partner account. Today none qualifies:
 *  - Skyscanner's official Affiliates Link API (https://skyscanner.net/g/referrals/v1/flights/day-view/?origin=…&destination=…&outboundDate=…)
 *    requires a media-partner id (`mediaPartnerId`) that StudyAtlas does not have;
 *  - the path style /transport/flights/<from>/<to>/<yymmdd>/ appears only in third-party pages, not in Skyscanner's documentation.
 * So the button opens the site's home page and the chosen route and dates are shown next to it for the user to enter.
 * A format is switched on by adding an entry with `verified: true` (and its source) – nothing else changes.
 */
export type SkyscannerFormat = { id: string; verified: boolean; source: string; build: (q: FlightQuery) => string };
export const SKYSCANNER_FORMATS: SkyscannerFormat[] = [
  { id: "affiliates-day-view", verified: false, source: "https://developers.skyscanner.net/docs/referrals/overview (needs mediaPartnerId; no partner account)", build: () => "" },
  { id: "transport-path", verified: false, source: "third-party pages only (not in Skyscanner's documentation)", build: () => "" },
];
export const SKYSCANNER_HOME = { ja: "https://www.skyscanner.jp/", en: "https://www.skyscanner.net/" } as const;
export function skyscannerLink(q: FlightQuery, lang: string, formats: SkyscannerFormat[] = SKYSCANNER_FORMATS): { url: string; carriesRoute: boolean; formatId?: string } {
  const f = formats.find((x) => x.verified);
  if (f) { const url = f.build(q); if (/^https:\/\/([a-z]+\.)?skyscanner\.[a-z]+\//.test(url)) return { url, carriesRoute: true, formatId: f.id }; }
  return { url: lang === "ja" ? SKYSCANNER_HOME.ja : SKYSCANNER_HOME.en, carriesRoute: false };
}
