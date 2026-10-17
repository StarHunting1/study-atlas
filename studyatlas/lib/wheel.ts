/*
 * Trackpad vs mouse wheel on the map (Ver.1.3.7c).
 * Browsers send both as `wheel` events, so the kind is inferred (it cannot be known for certain):
 *  - pinch:    ctrlKey is set (Chrome/Edge/Firefox send a trackpad pinch as ctrl+wheel; a ctrl+mouse-wheel is also zoom). MapLibre zooms as before.
*  - wheel:    ⌘/Option held (always zoom), or a real wheel notch – line/page deltas (Firefox), or a vertical-only delta that is a whole multiple of the 120-unit notch (`wheelDeltaY`),
 *              or, where `wheelDeltaY` does not exist, a whole-number delta of at least 50 px. MapLibre zooms as before.
 *  - trackpad: everything else (a horizontal component, fractional or small deltas, momentum after a swipe) → the map pans.
 *  - on macOS every plain scroll counts as a swipe (⌘/Option+scroll, ctrl+scroll/pinch and the +/- buttons zoom).
 * Once a swipe has started, the events that follow it within `HOLD_MS` (inertia) stay "trackpad" so a swipe never flips into a zoom half-way.
 */
export type WheelLike = { deltaX: number; deltaY: number; deltaMode: number; ctrlKey: boolean; metaKey?: boolean; altKey?: boolean; wheelDeltaY?: number };
export type WheelKind = "pinch" | "trackpad" | "wheel";
export type WheelState = { lastTrackpadAt: number };
export const HOLD_MS = 220;
export const newWheelState = (): WheelState => ({ lastTrackpadAt: -Infinity });

/** macOS (also an iPad that presents itself as a Mac). There the wheel of a mouse cannot be told from a trackpad swipe, so every plain scroll is a swipe: moving the map reliably wins. */
export const isMacLike = (ua: string): boolean => /Mac/i.test(ua);
export function classifyWheel(e: WheelLike, state: WheelState, now: number, mac = false): WheelKind {
  if (e.ctrlKey) return "pinch";
  if (e.metaKey || e.altKey) return "wheel";   // ⌘ / Option + scroll always zooms: the escape hatch for mice whose wheel looks like a trackpad (e.g. many macOS mice)
  if (mac && e.deltaMode === 0) { state.lastTrackpadAt = now; return "trackpad"; }
  const mouseNotch = e.deltaMode !== 0 || (e.deltaX === 0 && (typeof e.wheelDeltaY === "number" && e.wheelDeltaY !== 0 ? Math.abs(e.wheelDeltaY) % 120 === 0 : Number.isInteger(e.deltaY) && Math.abs(e.deltaY) >= 50));
  if (mouseNotch && now - state.lastTrackpadAt > HOLD_MS) return "wheel";
  state.lastTrackpadAt = now; return "trackpad";
}
/** Pixels to pan for a trackpad swipe: the scroll deltas as they arrive (the system's natural-scrolling setting is already in their sign). */
export const panDelta = (e: Pick<WheelLike, "deltaX" | "deltaY">): [number, number] => [e.deltaX, e.deltaY];

/** Zoom levels per pixel of a pinch (ctrl+wheel). Same rate as MapLibre's own trackpad zoom (1/100), but each event is clamped so a ctrl+mouse-wheel notch (±100) or a burst cannot jump the map. */
export const PINCH_RATE = 0.01;
export const PINCH_MAX_STEP = 0.5;
const LINE_PX = 16, PAGE_PX = 400;
/** Zoom change for one pinch wheel event: pinch-out (deltaY < 0) zooms in, pinch-in zooms out. Line/page deltas are converted to pixels first. */
export function pinchZoomDelta(e: Pick<WheelLike, "deltaY" | "deltaMode">): number {
  const px = e.deltaMode === 1 ? e.deltaY * LINE_PX : e.deltaMode === 2 ? e.deltaY * PAGE_PX : e.deltaY;
  if (!Number.isFinite(px)) return 0;
  return Math.max(-PINCH_MAX_STEP, Math.min(PINCH_MAX_STEP, -px * PINCH_RATE));
}
/** Safari's gesture `scale` (1 at gesturestart, cumulative) → absolute zoom: doubling the distance between the fingers is +1 zoom level. Bad values keep the start zoom. */
export function gestureZoom(startZoom: number, scale: number, min = -Infinity, max = Infinity): number {
  if (!Number.isFinite(scale) || scale <= 0) return startZoom;
  return Math.max(min, Math.min(max, startZoom + Math.log2(scale)));
}
