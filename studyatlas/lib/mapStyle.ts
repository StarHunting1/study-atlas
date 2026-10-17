/*
 * StudyAtlas map look (Ver.1.3.7b). The background is OpenFreeMap's "liberty" style (OpenStreetMap data, © OpenMapTiles); right after the style loads
 * its layers are recoloured here by what they draw (water, land cover, borders), not by layer id, so a renamed layer in the style cannot silently drop the palette.
 * Only paint/layout properties change: the tile sources, the attribution and the terms of use stay exactly as the provider publishes them.
 */
export const PALETTE = {
  land: "#efe8d6", water: "#a9cde3", wood: "#cddfba", grass: "#dce8c9", park: "#cfe2bd", ice: "#f4f6f8", sand: "#efe2bf",
  border: "#6b604b", borderSoft: "#b9ae98", country: "#2f8f83", countrySel: "#1f7a6e", navy: "#0b2a5b",
} as const;

export type StyleLayer = { id: string; type: string; source?: string; "source-layer"?: string; layout?: Record<string, unknown> };
type Paint = Record<string, unknown>;
const z = (...stops: (number)[]) => ["interpolate", ["linear"], ["zoom"], ...stops] as unknown[];

/** Paint overrides for one style layer, chosen by what the layer draws. null = leave the layer as the provider styled it. */
export function paintOverrides(l: StyleLayer): Paint | null {
  const sl = l["source-layer"];
  if (l.type === "background") return { "background-color": PALETTE.land };
  if (l.type === "fill" && sl === "water") return { "fill-color": PALETTE.water, "fill-outline-color": PALETTE.water };
  if (l.type === "line" && sl === "waterway") return { "line-color": PALETTE.water };
  if (l.type === "fill" && sl === "park") return { "fill-color": PALETTE.park };
  if (l.type === "fill" && sl === "landcover")
    return { "fill-color": ["match", ["get", "class"], ["wood", "forest"], PALETTE.wood, ["grass", "meadow", "farmland"], PALETTE.grass, ["ice", "glacier"], PALETTE.ice, ["sand", "beach"], PALETTE.sand, PALETTE.grass] };
  if (l.type === "line" && sl === "boundary") {
    const country = /(^|_)2($|_)|country/i.test(l.id) && !/disputed/i.test(l.id);
    return country ? { "line-color": PALETTE.border, "line-opacity": 1, "line-width": z(0, 0.8, 3, 1.3, 6, 1.9, 10, 2.6) }
      : { "line-color": PALETTE.borderSoft, "line-opacity": 0.9, "line-width": z(3, 0.4, 8, 1.1, 12, 1.6) };
  }
  return null;
}

/** Labels follow the page language where the tiles carry that name; otherwise the local/Latin name is used (never an empty label). */
export type Lang = "ja" | "en";
export const LABEL_SOURCE_LAYERS = new Set(["place", "water_name", "waterway", "mountain_peak", "aerodrome_label", "poi", "transportation_name", "housenumber"]);
/** Japanese labels need Japanese glyphs from the font server: switched off by `NEXT_PUBLIC_MAP_JA_LABELS=0` (see data/MAP_OPTIONS.md for the check). */
export const JA_LABELS = process.env.NEXT_PUBLIC_MAP_JA_LABELS !== "0";
export function labelExpression(lang: string): unknown[] {
  return lang === "ja" && JA_LABELS ? ["coalesce", ["get", "name:ja"], ["get", "name:ja-Hira"], ["get", "name:latin"], ["get", "name"]]
    : ["coalesce", ["get", "name:en"], ["get", "name_en"], ["get", "name:latin"], ["get", "name"]];
}
export const isLabelLayer = (l: StyleLayer) => l.type === "symbol" && l.source === "openmaptiles" && !!l["source-layer"] && LABEL_SOURCE_LAYERS.has(l["source-layer"]!) && l.layout?.["text-field"] !== undefined;

/** Space kept free around a country when the view is fitted to it: more on big screens, enough on a phone not to cut the outline. */
export function fitPadding(width: number, height: number): { top: number; right: number; bottom: number; left: number } {
  const p = Math.round(Math.min(110, Math.max(28, Math.min(width, height) * 0.12))); return { top: p, right: p, bottom: p, left: p };
}
/** Bounds (west, south, east, north) that contain a country's outline and all its registered cities. */
export function countryFitBounds(outline: [number, number, number, number] | undefined, cityCoords: [number, number][]): [number, number, number, number] | undefined {
  const pts = cityCoords; if (!outline && !pts.length) return undefined;
  let [w, s, e, n] = outline ?? [pts[0][0], pts[0][1], pts[0][0], pts[0][1]]; for (const [x, y] of pts) { w = Math.min(w, x); e = Math.max(e, x); s = Math.min(s, y); n = Math.max(n, y); }
  return [w, s, e, n];
}

/** The country that is "active" on the map: the selected city's country, otherwise the selected country, otherwise none. */
export const activeCountry = (cityList: { id: string; country: string }[], country: string | null, cityId: string | null): string => cityList.find((c) => c.id === cityId)?.country ?? country ?? "";
