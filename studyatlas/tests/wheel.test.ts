import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { classifyWheel, HOLD_MS, isMacLike, newWheelState, panDelta, type WheelLike } from "@/lib/wheel";
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
t("macOS: every plain scroll is a swipe (a mouse wheel cannot be told from a trackpad there), while ctrl/⌘/Option still zoom; Windows/Linux keep the notch rule", () => {
  const s = newWheelState();
  assert.equal(classifyWheel(ev({ deltaY: 100, wheelDeltaY: -120 }), s, 0, true), "trackpad"); assert.equal(classifyWheel(ev({ deltaY: 40 }), s, 500, true), "trackpad"); assert.equal(classifyWheel(ev({ deltaX: 3, deltaY: 40, wheelDeltaY: -120 }), s, 1000, true), "trackpad", "a swipe whose legacy delta happens to be a multiple of 120 is still a swipe");
  assert.equal(classifyWheel(ev({ ctrlKey: true, deltaY: -5 }), s, 1500, true), "pinch"); assert.equal(classifyWheel({ ...ev({ deltaY: 4 }), metaKey: true }, s, 1600, true), "wheel"); assert.equal(classifyWheel({ ...ev({ deltaY: 4 }), altKey: true }, s, 1700, true), "wheel");
  assert.equal(classifyWheel(ev({ deltaY: 3, deltaMode: 1 }), newWheelState(), 0, true), "wheel", "line-mode (Firefox mouse) is still a wheel"); assert.equal(classifyWheel(ev({ deltaY: 100, wheelDeltaY: -120 }), newWheelState(), 0, false), "wheel");
  assert.equal(isMacLike("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Safari/605.1.15"), true); assert.equal(isMacLike("Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/130"), false);
});
t("regression (Ver.1.3.7d): a laptop whose browser reports a coarse pointer must not get MapLibre's two-finger cooperative gestures; the swipe/pinch handlers are installed on every device; cooperative gestures only for hover:none + coarse (phones/iPads)", () => {
  const m = readFileSync("components/InteractiveMap.tsx", "utf8");
  assert.ok(/\(hover: none\) and \(pointer: coarse\)/.test(m) && !/matchMedia\?\.\("\(pointer: coarse\)"\)/.test(m), "touch = no hover AND coarse, never coarse alone");
  assert.ok(/cooperativeGestures: touch/.test(m), "phones and iPads keep the two-finger behaviour (the page still scrolls with one finger)");
  assert.ok(!/if \(!touch\)/.test(m), "the wheel/gesture handlers are not gated by the touch flag (a wrongly detected 'touch' used to disable them and leave only the two-finger message)");
});
t("map wiring: the wheel listener is on the map host in the capture phase and stops the event only for a swipe; mac detection is passed in; cleanup removes the listeners; Safari pinch uses gesture events", () => {
  const m = readFileSync("components/InteractiveMap.tsx", "utf8");
  assert.ok(/capture: true, passive: false/.test(m) && /if \(kind !== "trackpad"\) return;/.test(m) && /e\.preventDefault\(\); e\.stopPropagation\(\)/.test(m) && /m\.panBy\(\[dx, dy\], \{ animate: false \}\)/.test(m) && /isMacLike\(navigator\.userAgent\)/.test(m));
  assert.ok(/cleanups\.forEach/.test(m) && /GestureEvent/.test(m) && /gesturechange/.test(m) && /host\.addEventListener\("wheel"/.test(m), "attached to the map host only, so the page scrolls as usual outside the map");
});
console.log(n, "wheel tests passed");
