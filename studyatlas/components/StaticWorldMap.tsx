"use client";
import { useEffect, useMemo } from "react";
import { cities, countries } from "@/data/cities";
import { boundsOf } from "@/data/countryShapes";
import { COUNTRY_PATHS, LAND_PATH, MAP_VIEW, project } from "@/data/worldMap";
import { useI18n } from "@/lib/i18n";
import { countryFitBounds, PALETTE } from "@/lib/mapStyle";
import { cityName } from "@/lib/names";

type Props = {
  country: string | null;
  /** the selected city: its marker is drawn larger */
  selectedCity?: string | null;
  onCountry: (code: string) => void;
  onCity: (id: string) => void;
  onUnsupported: () => void;
  onStatus?: (s: "ok" | "failed") => void;
};

/**
 * Fallback map (Ver.1.3.5, used by components/WorldMap.tsx when the tile service cannot be reached): inline SVG drawn from bundled Natural Earth paths (data/worldMap.ts).
 * No map tiles, no third-party request, no API key and no cost: it cannot fail to load and has no usage limit.
 * Supported countries are highlighted and clickable; cities are buttons. Selecting a country zooms the view to it (from Country.center / zoom).
 */
export default function StaticWorldMap({ country, selectedCity, onCountry, onCity, onStatus }: Props) {
  const { L } = useI18n();
  useEffect(() => { onStatus?.("ok"); }, [onStatus]);
  const supported = useMemo(() => countries.filter((c) => COUNTRY_PATHS[c.code]), []);
  // the view follows the page like the tile map does: a whole country (outline + its cities) fits the view, a selected city is shown close up
  const ratio = MAP_VIEW.w / MAP_VIEW.h; const city = cities.find((c) => c.id === selectedCity);
  const box = country ? countryFitBounds(boundsOf(country), cities.filter((c) => c.country === country).map((c) => c.coords)) : undefined;
  let x = MAP_VIEW.x, y = MAP_VIEW.y, w = MAP_VIEW.w, h = MAP_VIEW.h;
  if (city) { const [cx, cy] = project(city.coords[0], city.coords[1]); w = MAP_VIEW.w / 5; h = w / ratio; x = cx - w / 2; y = cy - h / 2; }
  else if (box) { const [x1, y1] = project(box[0], box[3]), [x2, y2] = project(box[2], box[1]); const bw = Math.max(x2 - x1, 1), bh = Math.max(y2 - y1, 1); w = Math.min(MAP_VIEW.w, Math.max(bw * 1.3, bh * 1.3 * ratio, MAP_VIEW.w / 40)); h = w / ratio; x = (x1 + x2) / 2 - w / 2; y = (y1 + y2) / 2 - h / 2; }
  x = Math.min(Math.max(x, 0), MAP_VIEW.w - w); y = Math.min(Math.max(y, MAP_VIEW.y), MAP_VIEW.y + MAP_VIEW.h - h);
  const k = w / MAP_VIEW.w; // keeps markers and outlines the same size on screen when zoomed
  return (
    <svg viewBox={`${x} ${y} ${w} ${h}`} preserveAspectRatio="xMidYMid meet" className="h-full w-full" style={{ background: PALETTE.water }} role="group" aria-label="World map" data-testid="world-map">
      <path d={LAND_PATH} fill={PALETTE.land} stroke={PALETTE.borderSoft} strokeWidth={0.6 * k} />
      {supported.map((c) => {
        const on = c.code === country;
        const act = () => onCountry(c.code);
        return <path key={c.code} d={COUNTRY_PATHS[c.code].d} data-testid={`country-${c.code}`} role="button" tabIndex={0} aria-pressed={on} aria-label={L(c.name)}
          fill={on ? PALETTE.countrySel : PALETTE.country} fillOpacity={on ? 0.7 : 0.42} stroke={on ? PALETTE.navy : PALETTE.country} strokeWidth={(on ? 1.8 : 1) * k} className="cursor-pointer outline-none focus-visible:stroke-[3px]"
          onClick={act} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); act(); } }} />;
      })}
      {cities.map((c) => {
        const [cx, cy] = project(c.coords[0], c.coords[1]);
        return (
          <g key={c.id} role="button" tabIndex={0} aria-label={c.name.en} data-testid={`city-${c.id}`} className="cursor-pointer outline-none" onClick={(e) => { e.stopPropagation(); onCity(c.id); }}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onCity(c.id); } }}>
            <circle cx={cx} cy={cy} r={16 * k} fill="transparent" />
            {(c.id === selectedCity || (country && c.country === country)) && <text x={cx} y={cy - 14 * k} textAnchor="middle" fontSize={13 * k} fontWeight={600} fill={PALETTE.navy} stroke="#fff" strokeWidth={3.5 * k} paintOrder="stroke" data-testid={`label-${c.id}`}>{cityName(c, L)}</text>}
            <circle cx={cx} cy={cy} r={(c.id === selectedCity ? 9 : 6.5) * k} fill={c.id === selectedCity ? PALETTE.navy : c.country === country ? PALETTE.countrySel : PALETTE.navy} stroke="#fff" strokeWidth={2.5 * k} />
          </g>
        );
      })}
    </svg>
  );
}
