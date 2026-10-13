"use client";
import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { cities, countries } from "@/data/cities";

type Props = {
  country: string | null;
  onCountry: (code: string) => void;
  onCity: (id: string) => void;
  onUnsupported: () => void;
  onStatus?: (s: "ok" | "failed") => void;
};

// Style source. Default: MapLibre's public demo style (no API key; demo use only - see README).
// Override with NEXT_PUBLIC_MAP_STYLE_URL. It is public in the browser, so never put a secret key in it.
const STYLE_URL = process.env.NEXT_PUBLIC_MAP_STYLE_URL || "https://demotiles.maplibre.org/style.json";
const DEMO_STYLE = !process.env.NEXT_PUBLIC_MAP_STYLE_URL;

export default function WorldMap({ country, onCountry, onCity, onUnsupported, onStatus }: Props) {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const cb = useRef({ onCountry, onCity, onUnsupported, onStatus });
  cb.current = { onCountry, onCity, onUnsupported, onStatus };

  useEffect(() => {
    const m = new maplibregl.Map({
      container: el.current!,
      style: STYLE_URL,
      center: [10, 30],
      zoom: 1.2,
      attributionControl: { compact: true },
    });
    map.current = m;
    m.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");

    let loaded = false;
    const timer = setTimeout(() => { if (!loaded) cb.current.onStatus?.("failed"); }, 10000);
    m.on("error", () => { if (!loaded) cb.current.onStatus?.("failed"); });

    m.on("load", () => {
      loaded = true;
      clearTimeout(timer);
      cb.current.onStatus?.("ok");
      const codes = countries.map((c) => c.code);
      // Country highlighting/clicking relies on the demo style's "countries" vector source (ADM0_A3 codes).
      // If you switch to another style, adjust source/layer names here.
      if (DEMO_STYLE && m.getSource("maplibre")) {
        m.addLayer({ id: "supported", type: "fill", source: "maplibre", "source-layer": "countries", paint: { "fill-color": "#38bdf8", "fill-opacity": 0.35 }, filter: ["in", ["get", "ADM0_A3"], ["literal", codes]] });
        m.addLayer({ id: "selected", type: "fill", source: "maplibre", "source-layer": "countries", paint: { "fill-color": "#0284c7", "fill-opacity": 0.6 }, filter: ["==", ["get", "ADM0_A3"], ""] });
        m.on("click", "supported", (e) => {
          const code = e.features?.[0]?.properties?.ADM0_A3 as string | undefined;
          if (code && codes.includes(code)) cb.current.onCountry(code);
        });
        m.on("mouseenter", "supported", () => (m.getCanvas().style.cursor = "pointer"));
        m.on("mouseleave", "supported", () => (m.getCanvas().style.cursor = ""));
      }
      // Fallback for any style: a click near a supported country's centre area is not guessed;
      // users can always pick countries from the buttons/list next to the map.
    });

    const markers = cities.map((c) => {
      const d = document.createElement("button");
      d.setAttribute("aria-label", c.name.en);
      d.className = "h-4 w-4 rounded-full border-2 border-white bg-rose-500 shadow-lg";
      d.onclick = (ev) => { ev.stopPropagation(); cb.current.onCity(c.id); };
      return new maplibregl.Marker({ element: d }).setLngLat(c.coords).addTo(m);
    });

    return () => { clearTimeout(timer); markers.forEach((k) => k.remove()); m.remove(); };
  }, []);

  useEffect(() => {
    const m = map.current;
    if (!m) return;
    const apply = () => { if (m.getLayer("selected")) m.setFilter("selected", ["==", ["get", "ADM0_A3"], country ?? ""]); };
    if (m.isStyleLoaded()) apply(); else m.once("load", apply);
    const c = countries.find((x) => x.code === country);
    if (c) m.flyTo({ center: c.center, zoom: c.zoom, duration: 1200 });
  }, [country]);

  return <div ref={el} className="h-full w-full" />;
}
