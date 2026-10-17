"use client";
import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { cities, countries } from "@/data/cities";
import { boundsOf, COUNTRY_SHAPES } from "@/data/countryShapes";
import { useI18n } from "@/lib/i18n";
import { countryName, cityName } from "@/lib/names";
import { classifyWheel, isMacLike, newWheelState, panDelta } from "@/lib/wheel";
import { activeCountry, countryFitBounds, fitPadding, isLabelLayer, labelExpression, paintOverrides, PALETTE, type StyleLayer } from "@/lib/mapStyle";

/**
 * Background map style (Ver.1.3.7): OpenFreeMap "liberty" – a free public vector-tile service (commercial use allowed, no API key, no account, no request limit;
 * data © OpenStreetMap contributors, tiles © OpenMapTiles; the attribution control of the style is kept). See data/MAP_OPTIONS.md for the terms that were checked.
 * The look is recoloured in lib/mapStyle.ts. NEXT_PUBLIC_MAP_STYLE_URL can point to another style (public in the browser: never put a secret key in it).
 */
export const MAP_STYLE_URL = process.env.NEXT_PUBLIC_MAP_STYLE_URL || "https://tiles.openfreemap.org/styles/liberty";
export const LOAD_TIMEOUT_MS = 9000;
export const CITY_ZOOM = 8.5;
export const WORLD_BOUNDS: [[number, number], [number, number]] = [[-170, -50], [175, 72]];

export type MapProps = {
  country: string | null; selectedCity: string | null;
  onCountry: (code: string) => void; onCity: (id: string) => void;
  /** "ok" once the style loaded; "failed" when the tile service could not be reached (the page then shows the fallback map) */
  onStatus?: (s: "ok" | "failed") => void;
};

const reduced = () => typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
const JA_GESTURES = { "CooperativeGesturesHandler.WindowsHelpText": "Ctrl キーを押しながらスクロールで地図を拡大縮小", "CooperativeGesturesHandler.MacHelpText": "⌘ キーを押しながらスクロールで地図を拡大縮小", "CooperativeGesturesHandler.MobileHelpText": "2本指で地図を動かせます" };
const SUPPORTED = countries.map((c) => c.code).filter((code) => COUNTRY_SHAPES.some((f) => f.id === code));

export default function InteractiveMap({ country, selectedCity, onCity, onCountry, onStatus }: MapProps) {
  const { L, lang } = useI18n();
  const el = useRef<HTMLDivElement>(null); const map = useRef<maplibregl.Map | null>(null); const ready = useRef(false);
  const markers = useRef<Map<string, HTMLButtonElement>>(new Map()); const clusters = useRef<Map<string, HTMLButtonElement>>(new Map());
  const cb = useRef({ onCity, onStatus, onCountry }); cb.current = { onCity, onStatus, onCountry };
  const langRef = useRef(lang); langRef.current = lang;

  /** fit the view to a whole country and its registered cities, with padding that suits the screen */
  const fitCountry = (m: maplibregl.Map, code: string, duration: number) => {
    const list = cities.filter((c) => c.country === code); const b = countryFitBounds(boundsOf(code), list.map((c) => c.coords)); if (!b) return;
    m.fitBounds([[b[0], b[1]], [b[2], b[3]]], { padding: fitPadding(el.current?.clientWidth ?? 600, el.current?.clientHeight ?? 400), maxZoom: 6.5, duration });
  };

  useEffect(() => {
    // A touch-first device (phone, iPad): no hover AND a coarse pointer. `(pointer: coarse)` alone is not enough: some laptops/browsers report a coarse primary pointer while a
    // trackpad is in use, and MapLibre's "two fingers" cooperative gestures then block the trackpad completely (Ver.1.3.7d).
    const touch = window.matchMedia?.("(hover: none) and (pointer: coarse)").matches ?? false;
    let m: maplibregl.Map;
    try {
      m = new maplibregl.Map({ container: el.current!, style: MAP_STYLE_URL, bounds: WORLD_BOUNDS, fitBoundsOptions: { padding: 8 }, minZoom: -1, maxZoom: 14, attributionControl: { compact: true }, cooperativeGestures: touch, ...(langRef.current === "ja" ? { locale: JA_GESTURES } : {}) });
    } catch { cb.current.onStatus?.("failed"); return; }   // e.g. WebGL is not available
    map.current = m; const host = el.current!; host.dataset.mapState = "loading";
    if (process.env.NEXT_PUBLIC_MAP_DEBUG) (window as unknown as { __saMap?: maplibregl.Map }).__saMap = m;   // browser checks in CI only (build-time flag)
    m.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
    // Trackpad (Ver.1.3.7c/d): a two-finger swipe pans the map; pinch (ctrl+wheel, or Safari's gesture events) and a real mouse wheel keep zooming; touch screens are left alone.
    // Our listener runs first (capture phase on the map's host); for a swipe it stops the event before MapLibre's own wheel zoom sees it.
    const cleanups: (() => void)[] = [];
    {   // always installed: wheel events only ever come from a wheel or trackpad (never from touch), so this cannot affect touch screens
      const ws = newWheelState(); const mac = isMacLike(navigator.userAgent);
      const onWheel = (e: WheelEvent) => {
        const kind = classifyWheel({ deltaX: e.deltaX, deltaY: e.deltaY, deltaMode: e.deltaMode, ctrlKey: e.ctrlKey, metaKey: e.metaKey, altKey: e.altKey, wheelDeltaY: (e as WheelEvent & { wheelDeltaY?: number }).wheelDeltaY }, ws, performance.now(), mac);
        host.dataset.wheel = kind; if (kind !== "trackpad") return;
        e.preventDefault(); e.stopPropagation(); const [dx, dy] = panDelta(e); m.panBy([dx, dy], { animate: false });
      };
      host.addEventListener("wheel", onWheel, { capture: true, passive: false }); cleanups.push(() => host.removeEventListener("wheel", onWheel, { capture: true } as EventListenerOptions));
      // Safari sends a trackpad pinch as gesture events instead of ctrl+wheel
      if ("GestureEvent" in window) {
        let startZoom = 0; type G = Event & { scale: number; clientX: number; clientY: number };
        const gs = (e: Event) => { e.preventDefault(); startZoom = m.getZoom(); }, gc = (e: Event) => { e.preventDefault(); const g = e as G; const r = host.getBoundingClientRect(); m.easeTo({ zoom: startZoom + Math.log2(g.scale || 1), around: m.unproject([g.clientX - r.left, g.clientY - r.top]), duration: 0 }); };
        host.addEventListener("gesturestart", gs); host.addEventListener("gesturechange", gc); cleanups.push(() => { host.removeEventListener("gesturestart", gs); host.removeEventListener("gesturechange", gc); });
      }
    }
    let loaded = false;
    const fail = () => { if (!loaded) { host.dataset.mapState = "failed"; cb.current.onStatus?.("failed"); } };
    const timer = setTimeout(fail, LOAD_TIMEOUT_MS);
    m.on("error", fail);                       // a failing style request before the first load
    const report = () => { host.dataset.zoom = m.getZoom().toFixed(2); const c = m.getCenter(); host.dataset.center = `${c.lng.toFixed(2)},${c.lat.toFixed(2)}`; };
    m.on("moveend", report);
    const label = () => host.classList.toggle("sa-zoomed", m.getZoom() >= 3.2);
    m.on("zoom", label); label();

    // ---- pins (HTML buttons: keyboard and screen-reader friendly, 44px tap area)
    cities.forEach((c) => {
      const b = document.createElement("button"); b.type = "button"; b.className = "sa-pin"; b.dataset.city = c.id; b.dataset.country = c.country;
      b.innerHTML = `<span class="sa-pin-dot"></span><span class="sa-pin-label"></span>`;
      b.onclick = (ev) => { ev.stopPropagation(); cb.current.onCity(c.id); };
      markers.current.set(c.id, b); new maplibregl.Marker({ element: b, anchor: "bottom" }).setLngLat(c.coords).addTo(m);   // MapLibre sets a generic aria-label: ours is set in the language effect
    });
    // Pins of one country that would sit on top of each other (closer than 44px on screen) are shown as one country badge; pressing it selects the country.
    const groups = countries.map((co) => ({ co, list: cities.filter((c) => c.country === co.code) })).filter((g) => g.list.length > 1);
    groups.forEach(({ co, list }) => {
      const b = document.createElement("button"); b.type = "button"; b.className = "sa-pin sa-cluster"; b.hidden = true; b.dataset.country = co.code;
      b.innerHTML = `<span class="sa-pin-dot sa-cluster-dot">${list.length}</span>`; b.onclick = (ev) => { ev.stopPropagation(); cb.current.onCountry(co.code); };
      clusters.current.set(co.code, b); const lng = list.reduce((n, c) => n + c.coords[0], 0) / list.length, lat = list.reduce((n, c) => n + c.coords[1], 0) / list.length;
      new maplibregl.Marker({ element: b, anchor: "bottom" }).setLngLat([lng, lat]).addTo(m);
    });
    const regroup = () => groups.forEach(({ co, list }) => {
      const pts = list.map((c) => m.project(c.coords)); let min = Infinity;
      for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) min = Math.min(min, Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y));
      const together = min < 44; clusters.current.get(co.code)!.hidden = !together; list.forEach((c) => { markers.current.get(c.id)!.hidden = together; });
    });
    m.on("zoom", regroup); regroup();

    m.on("load", () => {
      loaded = true; clearTimeout(timer);
      // 1. recolour what the style draws (water, land cover, borders) – by what a layer draws, not by its id
      const layers = (m.getStyle().layers ?? []) as StyleLayer[];
      for (const l of layers) { const o = paintOverrides(l); if (o) for (const [k, v] of Object.entries(o)) { try { m.setPaintProperty(l.id, k, v as never); } catch { /* a property this layer does not have */ } } }
      // 2. soft outline + fill for the countries StudyAtlas covers; the selected one is stronger. Fades out when zoomed in (the tiles' own borders take over).
      const firstSymbol = layers.find((l) => l.type === "symbol")?.id;
      m.addSource("sa-countries", { type: "geojson", data: { type: "FeatureCollection", features: COUNTRY_SHAPES.filter((f) => SUPPORTED.includes(f.id)) as never } });
      const sup = ["in", ["get", "code"], ["literal", SUPPORTED]];
      m.addLayer({ id: "sa-country-fill", type: "fill", source: "sa-countries", filter: sup as never, paint: { "fill-color": PALETTE.country, "fill-opacity": ["interpolate", ["linear"], ["zoom"], 0, 0.3, 5, 0.2, 8, 0] } }, firstSymbol);
      m.addLayer({ id: "sa-country-line", type: "line", source: "sa-countries", filter: sup as never, paint: { "line-color": PALETTE.country, "line-width": 1.4, "line-opacity": ["interpolate", ["linear"], ["zoom"], 0, 0.9, 7, 0.5, 9, 0] } }, firstSymbol);
      m.addLayer({ id: "sa-country-sel-fill", type: "fill", source: "sa-countries", filter: ["==", ["get", "code"], ""], paint: { "fill-color": PALETTE.countrySel, "fill-opacity": ["interpolate", ["linear"], ["zoom"], 0, 0.5, 6, 0.32, 9, 0] } }, firstSymbol);
      m.addLayer({ id: "sa-country-sel-line", type: "line", source: "sa-countries", filter: ["==", ["get", "code"], ""], paint: { "line-color": PALETTE.navy, "line-width": 2.6, "line-opacity": ["interpolate", ["linear"], ["zoom"], 0, 1, 8, 0.7, 10, 0] } }, firstSymbol);
      m.on("click", "sa-country-fill", (e) => { const code = e.features?.[0]?.properties?.code as string | undefined; if (code) cb.current.onCountry(code); });
      m.on("mouseenter", "sa-country-fill", () => (m.getCanvas().style.cursor = "pointer")); m.on("mouseleave", "sa-country-fill", () => (m.getCanvas().style.cursor = ""));
      // on a small screen the credit starts collapsed behind the (i) button (it is also printed under the map on the page); on wider screens it stays open
      if (host.clientWidth < 640) host.querySelector(".maplibregl-ctrl-attrib")?.classList.remove("maplibregl-compact-show");
      ready.current = true; host.dataset.mapState = "loaded"; m.once("idle", () => { host.dataset.mapState = "idle"; });
      applyLabels(m); syncSelection(); regroup(); report(); cb.current.onStatus?.("ok");
    });
    return () => { cleanups.forEach((f) => f()); clearTimeout(timer); ready.current = false; markers.current.clear(); clusters.current.clear(); m.remove(); map.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** the page language for place labels drawn by the map tiles (only layers that carry names; falls back to the local name) */
  function applyLabels(m: maplibregl.Map) {
    const expr = labelExpression(langRef.current);
    for (const l of (m.getStyle().layers ?? []) as StyleLayer[]) if (isLabelLayer(l)) { try { m.setLayoutProperty(l.id, "text-field", expr as never); } catch { /* keep the provider's label */ } }
  }
  /** highlight the selected country on the map and mark the active pins */
  function syncSelection() {
    const m = map.current; const active = activeCountry(cities, selectedRef.current.country, selectedRef.current.city);
    if (m && ready.current) for (const id of ["sa-country-sel-fill", "sa-country-sel-line"]) m.setFilter(id, ["==", ["get", "code"], active] as never);
    markers.current.forEach((b, id) => { b.dataset.selected = String(id === selectedRef.current.city); b.dataset.active = String(!!active && b.dataset.country === active); b.setAttribute("aria-pressed", String(id === selectedRef.current.city)); });
    clusters.current.forEach((b, code) => { b.dataset.active = String(code === active); });
  }
  const selectedRef = useRef({ country, city: selectedCity }); selectedRef.current = { country, city: selectedCity };

  // keep the camera and the highlights in step with the page (country buttons, city list/cards, pins)
  useEffect(() => {
    syncSelection(); const m = map.current; if (!m) return; const duration = reduced() ? 0 : 900;
    const city = cities.find((c) => c.id === selectedCity);
    if (city) { const small = (el.current?.clientHeight ?? 600) < 520; m.flyTo({ center: city.coords, zoom: CITY_ZOOM, duration, padding: { top: 0, left: 0, right: 0, bottom: small ? 170 : 0 }, essential: false }); return; }
    if (country) fitCountry(m, country, duration); else m.fitBounds(WORLD_BOUNDS, { padding: 8, duration });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [country, selectedCity]);

  // language: pin names (and accessible names), the tiles' place labels and the map's own hint text
  useEffect(() => {
    markers.current.forEach((b, id) => { const c = cities.find((x) => x.id === id)!; const lbl = b.querySelector(".sa-pin-label"); if (lbl) lbl.textContent = cityName(c, L); b.setAttribute("aria-label", `${cityName(c, L)} (${countryName(c.country, L)})`); });
    clusters.current.forEach((b, code) => { b.setAttribute("aria-label", `${countryName(code, L)}: ${cities.filter((c) => c.country === code).length}`); });
    const m = map.current; if (m && ready.current) applyLabels(m);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  return <div ref={el} className="sa-map h-full w-full" data-testid="interactive-map" role="region" aria-label={L({ en: "Map of study destinations: drag to move, scroll or pinch to zoom, press a pin to see the city", ja: "留学先の地図：ドラッグで移動、スクロールまたはピンチで拡大縮小、ピンを押すと都市の概要が表示されます" })} />;
}
