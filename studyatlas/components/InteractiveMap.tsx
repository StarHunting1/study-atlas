"use client";
import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { cities, countries } from "@/data/cities";
import { useI18n } from "@/lib/i18n";

/**
 * Background map style (Ver.1.3.7): OpenFreeMap "positron" – a free public vector-tile service (no API key, no account, no request limit stated;
 * data © OpenStreetMap contributors, tiles © OpenMapTiles). See data/MAP_OPTIONS.md for the terms that were checked.
 * NEXT_PUBLIC_MAP_STYLE_URL can point to another style (it is public in the browser: never put a secret key in it).
 */
export const MAP_STYLE_URL = process.env.NEXT_PUBLIC_MAP_STYLE_URL || "https://tiles.openfreemap.org/styles/positron";
export const LOAD_TIMEOUT_MS = 9000;
export const CITY_ZOOM = 8.5;

export type MapProps = {
  country: string | null; selectedCity: string | null;
  onCountry: (code: string) => void; onCity: (id: string) => void;
  /** "ok" once the style loaded; "failed" when the tile service could not be reached (the page then shows the fallback map) */
  onStatus?: (s: "ok" | "failed") => void;
};

const reduced = () => typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
const JA_GESTURES = { "CooperativeGesturesHandler.WindowsHelpText": "Ctrl キーを押しながらスクロールで地図を拡大縮小", "CooperativeGesturesHandler.MacHelpText": "⌘ キーを押しながらスクロールで地図を拡大縮小", "CooperativeGesturesHandler.MobileHelpText": "2本指で地図を動かせます" };

export default function InteractiveMap({ country, selectedCity, onCity, onCountry, onStatus }: MapProps) {
  const { L, lang } = useI18n();
  const el = useRef<HTMLDivElement>(null); const map = useRef<maplibregl.Map | null>(null);
  const markers = useRef<Map<string, HTMLButtonElement>>(new Map()); const clusters = useRef<Map<string, HTMLButtonElement>>(new Map());
  const cbc = useRef<(code: string) => void>(() => {});
  const cb = useRef({ onCity, onStatus }); cb.current = { onCity, onStatus }; cbc.current = onCountry;

  useEffect(() => {
    const touch = window.matchMedia?.("(pointer: coarse)").matches ?? false;
    let m: maplibregl.Map;
    try {
      m = new maplibregl.Map({ container: el.current!, style: MAP_STYLE_URL, center: [10, 30], zoom: 1.2, minZoom: 0.8, maxZoom: 14, attributionControl: { compact: true }, cooperativeGestures: touch, ...(lang === "ja" ? { locale: JA_GESTURES } : {}) });
    } catch { cb.current.onStatus?.("failed"); return; }   // e.g. WebGL is not available
    map.current = m;
    m.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
    let loaded = false;
    const fail = () => { if (!loaded) cb.current.onStatus?.("failed"); };
    const timer = setTimeout(fail, LOAD_TIMEOUT_MS);
    m.on("error", fail);                       // a failing style request before the first load
    m.on("load", () => { loaded = true; clearTimeout(timer); cb.current.onStatus?.("ok"); });
    const label = () => el.current?.classList.toggle("sa-zoomed", m.getZoom() >= 3.2);
    m.on("zoom", label); label();
    cities.forEach((c) => {
      const b = document.createElement("button"); b.type = "button"; b.className = "sa-pin"; b.dataset.city = c.id; b.setAttribute("aria-label", `${c.name.en} / ${c.name.ja}`);
      b.innerHTML = `<span class="sa-pin-dot"></span><span class="sa-pin-label">${c.name.en}</span>`;
      b.onclick = (ev) => { ev.stopPropagation(); cb.current.onCity(c.id); };
      markers.current.set(c.id, b); new maplibregl.Marker({ element: b, anchor: "bottom" }).setLngLat(c.coords).addTo(m);
      b.setAttribute("aria-label", `${c.name.en} / ${c.name.ja}`);   // MapLibre sets its own generic label on markers: set ours afterwards
    });
    // Pins of one country that would sit on top of each other (closer than 44px on screen) are shown as one country badge; pressing it zooms to the country's cities.
    const groups = countries.map((co) => ({ co, list: cities.filter((c) => c.country === co.code) })).filter((g) => g.list.length > 1);
    groups.forEach(({ co, list }) => {
      const b = document.createElement("button"); b.type = "button"; b.className = "sa-pin sa-cluster"; b.hidden = true; b.setAttribute("aria-label", `${co.name.en} / ${co.name.ja}: ${list.length}`);
      b.innerHTML = `<span class="sa-pin-dot sa-cluster-dot">${list.length}</span>`; b.onclick = (ev) => { ev.stopPropagation(); cbc.current(co.code); };
      clusters.current.set(co.code, b); const lng = list.reduce((n, c) => n + c.coords[0], 0) / list.length, lat = list.reduce((n, c) => n + c.coords[1], 0) / list.length;
      new maplibregl.Marker({ element: b, anchor: "bottom" }).setLngLat([lng, lat]).addTo(m); b.setAttribute("aria-label", `${co.name.en} / ${co.name.ja}: ${list.length}`);
    });
    const regroup = () => groups.forEach(({ co, list }) => {
      const pts = list.map((c) => m.project(c.coords)); let min = Infinity;
      for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) min = Math.min(min, Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y));
      const together = min < 44; clusters.current.get(co.code)!.hidden = !together; list.forEach((c) => { markers.current.get(c.id)!.hidden = together; });
    });
    m.on("zoom", regroup); m.on("load", regroup); regroup();
    return () => { clearTimeout(timer); markers.current.clear(); clusters.current.clear(); m.remove(); map.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // keep the pin styles and the camera in step with the page (country pills, city cards, pins)
  useEffect(() => {
    markers.current.forEach((b, id) => { b.dataset.selected = String(id === selectedCity); b.setAttribute("aria-pressed", String(id === selectedCity)); });
    const m = map.current; if (!m) return; const duration = reduced() ? 0 : 900;
    const city = cities.find((c) => c.id === selectedCity);
    if (city) { m.flyTo({ center: city.coords, zoom: CITY_ZOOM, duration, essential: false }); return; }
    const co = countries.find((x) => x.code === country); const list = cities.filter((c) => c.country === country);
    if (co && list.length > 1) { const b = new maplibregl.LngLatBounds(list[0].coords, list[0].coords); list.forEach((c) => b.extend(c.coords)); m.fitBounds(b, { padding: 90, maxZoom: 7, duration }); }
    else if (co) m.flyTo({ center: co.center, zoom: co.zoom, duration }); else m.flyTo({ center: [10, 30], zoom: 1.2, duration });
  }, [country, selectedCity]);

  return <div ref={el} className="sa-map h-full w-full" data-testid="interactive-map" role="region" aria-label={L({ en: "Map of study destinations: drag to move, scroll or pinch to zoom, press a pin to see the city", ja: "留学先の地図：ドラッグで移動、スクロールまたはピンチで拡大縮小、ピンを押すと都市の概要が表示されます" })} />;
}
