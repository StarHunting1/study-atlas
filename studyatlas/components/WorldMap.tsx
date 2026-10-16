"use client";
import { useState } from "react";
import InteractiveMap, { type MapProps } from "@/components/InteractiveMap";
import StaticWorldMap from "@/components/StaticWorldMap";

/**
 * Home-page map (Ver.1.3.7): the interactive MapLibre map; if the tile service cannot be reached (or WebGL is missing) it switches to the
 * bundled static SVG map, which uses the same selection, so city exploration never depends on the map service.
 */
export default function WorldMap(p: MapProps & { onUnsupported?: () => void }) {
  const [failed, setFailed] = useState(false);
  const status = (s: "ok" | "failed") => { if (s === "failed") setFailed(true); p.onStatus?.(s); };
  return failed ? <StaticWorldMap country={p.country} selectedCity={p.selectedCity} onCountry={p.onCountry} onCity={p.onCity} onUnsupported={p.onUnsupported ?? (() => {})} onStatus={() => {}} />
    : <InteractiveMap country={p.country} selectedCity={p.selectedCity} onCountry={p.onCountry} onCity={p.onCity} onStatus={status} />;
}
