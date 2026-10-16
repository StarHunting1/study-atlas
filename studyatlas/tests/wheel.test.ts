import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { classifyWheel, HOLD_MS, newWheelState, panDelta, type WheelLike } from "@/lib/wheel";
let n = 0; const t = (name: string, f: () => void) => { f(); n++; console.log("ok", name); };
const ev = (o: Partial<WheelLike>): WheelLike => ({ deltaX: 0, deltaY: 0, deltaMode: 0, ctrlKey: false, ...o });

t("mouse wheel notches keep zooming: Chrome/Safari (wheelDeltaY a multiple of 120), Firefox lines/pages, and whole-number deltas of 50px or more", () => {
  const s = newWheelState();
  assert.equal(classifyWheel(ev({ deltaY: 100, wheelDeltaY: -120 }), s, 0), "wheel"); assert.equal(classifyWheel(ev({ deltaY: -100, wheelDeltaY: 120 }), s, 10), "wheel"); assert.equal(classifyWheel(ev({ deltaY: 200, wheelDeltaY: -240 }), s, 20), "wheel");
  assert.equal(classifyWheel(ev({ deltaY: 3, deltaMode: 1 }), s, 30), "wheel", "Firefox mouse wheel: line mode"); assert.equal(classifyWheel(ev({ deltaY: 1, deltaMode: 2 }), s, 40), "wheel");
  assert.equal(classifyWheel(ev({ deltaY: 100 }), s, 50), "wheel", "no wheelDeltaY: a whole 100px notch");
});
t("a two-finger swipe pans: horizontal component, fractional or small deltas, any direction", () => {
  const s = newWheelState();
  assert.equal(classifyWheel(ev({ deltaX: 14, deltaY: 3, wheelDeltaY: -9 }), s, 0), "trackpad"); assert.equal(classifyWheel(ev({ deltaX: -6, deltaY: 0 }), s, 300), "trackpad", "pure horizontal");
  assert.equal(classifyWheel(ev({ deltaY: 7.5 }), s, 600), "trackpad", "fractional"); assert.equal(classifyWheel(ev({ deltaY: -12, wheelDeltaY: 36 }), s, 900), "trackpad", "small vertical (not a 120 multiple)"); assert.equal(classifyWheel(ev({ deltaY: 8 }), s, 1200), "trackpad", "small whole number without wheelDeltaY");
  assert.deepEqual(panDelta({ deltaX: 5, deltaY: -9 }), [5, -9], "the deltas are used as they arrive (natural scrolling is already in their sign)");
});
t("⌘ or Option + scroll always zooms (escape hatch for a mouse that looks like a trackpad)", () => { const s = newWheelState(); assert.equal(classifyWheel({ ...ev({ deltaX: 5, deltaY: 6.5 }), metaKey: true }, s, 0), "wheel"); assert.equal(classifyWheel({ ...ev({ deltaY: 3 }), altKey: true }, s, 10), "wheel"); assert.equal(classifyWheel(ev({ deltaY: 3 }), s, 20), "trackpad"); });
t("a pinch (ctrl+wheel) is always zoom, never a pan", () => { const s = newWheelState(); assert.equal(classifyWheel(ev({ ctrlKey: true, deltaY: -4.2 }), s, 0), "pinch"); assert.equal(classifyWheel(ev({ ctrlKey: true, deltaY: 100, wheelDeltaY: -120 }), s, 5), "pinch"); });
t("inertia after a swipe stays a pan, and a notch-like event right after it is not mistaken for a wheel; a real wheel is recognised again after the pause", () => {
  const s = newWheelState(); assert.equal(classifyWheel(ev({ deltaX: 9, deltaY: 40 }), s, 1000), "trackpad");
  assert.equal(classifyWheel(ev({ deltaY: 100, wheelDeltaY: -120 }), s, 1000 + HOLD_MS - 10), "trackpad", "within the hold time");
  assert.equal(classifyWheel(ev({ deltaY: 100, wheelDeltaY: -120 }), s, 1000 + HOLD_MS - 10 + HOLD_MS + 5), "wheel", "after the pause");
});
t("map wiring: the listener is only installed for non-touch devices, runs first (capture) and stops the event only for a swipe; touch and cooperative gestures are unchanged; cleanup removes it", () => {
  const m = readFileSync("components/InteractiveMap.tsx", "utf8");
  assert.ok(/if \(!touch\)/.test(m) && /capture: true, passive: false/.test(m) && /if \(kind !== "trackpad"\) return;/.test(m) && /e\.preventDefault\(\); e\.stopPropagation\(\)/.test(m) && /m\.panBy\(\[dx, dy\], \{ animate: false \}\)/.test(m));
  assert.ok(/cooperativeGestures: touch/.test(m) && /cleanups\.forEach/.test(m) && /GestureEvent/.test(m) && /gesturechange/.test(m), "touch behaviour, cleanup and Safari pinch");
  assert.ok(/host\.addEventListener\("wheel"/.test(m), "attached to the map host, so wheel events outside the map scroll the page as usual");
});
console.log(n, "wheel tests passed");
