"use client";
import { useEffect, useMemo } from "react";
import { cities, countries } from "@/data/cities";
import { COUNTRY_PATHS, LAND_PATH, MAP_VIEW, project } from "@/data/worldMap";
import { useI18n } from "@/lib/i18n";

type Props = {
  country: string | null;
  onCountry: (code: string) => void;
  onCity: (id: string) => void;
  onUnsupported: () => void;
  onStatus?: (s: "ok" | "failed") => void;
};

/**
 * Home-page map (Ver.1.3.5): inline SVG drawn from bundled Natural Earth paths (data/worldMap.ts).
 * No map tiles, no third-party request, no API key and no cost: it cannot fail to load and has no usage limit.
 * Supported countries are highlighted and clickable; cities are buttons. Selecting a country zooms the view to it (from Country.center / zoom).
 */
export default function WorldMap({ country, onCountry, onCity, onStatus }: Props) {
  const { L } = useI18n();
  useEffect(() => { onStatus?.("ok"); }, [onStatus]);
  const supported = useMemo(() => countries.filter((c) => COUNTRY_PATHS[c.code]), []);
  const sel = countries.find((x) => x.code === country);
  const factor = sel ? Math.max(1, Math.pow(2, sel.zoom - 1.2)) : 1;
  const w = MAP_VIEW.w / factor, h = MAP_VIEW.h / factor;
  let x = MAP_VIEW.x, y = MAP_VIEW.y;
  if (sel) { const [cx, cy] = project(sel.center[0], sel.center[1]); x = Math.min(Math.max(cx - w / 2, 0), MAP_VIEW.w - w); y = Math.min(Math.max(cy - h / 2, MAP_VIEW.y), MAP_VIEW.y + MAP_VIEW.h - h); }
  const k = w / MAP_VIEW.w; // keeps markers and outlines the same size on screen when zoomed
  return (
    <svg viewBox={`${x} ${y} ${w} ${h}`} preserveAspectRatio="xMidYMid meet" className="h-full w-full bg-sky-50" role="group" aria-label="World map" data-testid="world-map">
      <path d={LAND_PATH} fill="#e2e8f0" stroke="#cbd5e1" strokeWidth={0.6 * k} />
      {supported.map((c) => {
        const on = c.code === country;
        const act = () => onCountry(c.code);
        return <path key={c.code} d={COUNTRY_PATHS[c.code].d} data-testid={`country-${c.code}`} role="button" tabIndex={0} aria-pressed={on} aria-label={L(c.name)}
          fill={on ? "#0284c7" : "#38bdf8"} fillOpacity={on ? 0.75 : 0.5} stroke="#0369a1" strokeWidth={0.8 * k} className="cursor-pointer outline-none focus-visible:stroke-[3px]"
          onClick={act} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); act(); } }} />;
      })}
      {cities.map((c) => {
        const [cx, cy] = project(c.coords[0], c.coords[1]);
        return (
          <g key={c.id} role="button" tabIndex={0} aria-label={c.name.en} data-testid={`city-${c.id}`} className="cursor-pointer outline-none" onClick={(e) => { e.stopPropagation(); onCity(c.id); }}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onCity(c.id); } }}>
            <circle cx={cx} cy={cy} r={16 * k} fill="transparent" />
            <circle cx={cx} cy={cy} r={6 * k} fill="#f43f5e" stroke="#fff" strokeWidth={2 * k} />
          </g>
        );
      })}
    </svg>
  );
}
