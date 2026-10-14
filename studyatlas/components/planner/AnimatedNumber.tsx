"use client";
import { useEffect, useRef, useState } from "react";
/**
 * Shows `value` formatted by `format`, easing from the previous number to the new one (≈350 ms).
 * With "reduce motion" the number jumps. `data-value` always holds the exact final value (used by tests).
 */
export default function AnimatedNumber({ value, format, className }: { value: number; format: (n: number) => string; className?: string }) {
  const [shown, setShown] = useState(value); const from = useRef(value); const raf = useRef(0); const cur = useRef(value);
  useEffect(() => {
    const reduce = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce || from.current === value) { cur.current = value; setShown(value); from.current = value; return; }
    const start = performance.now(); const a = cur.current; const dur = 350; cancelAnimationFrame(raf.current);
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / dur); const e = 1 - Math.pow(1 - t, 3); const v = a + (value - a) * e;
      cur.current = v; setShown(v); if (t < 1) raf.current = requestAnimationFrame(tick); else { from.current = value; cur.current = value; setShown(value); }
    };
    raf.current = requestAnimationFrame(tick); return () => cancelAnimationFrame(raf.current);
  }, [value]);
  return <span className={className} data-value={value} style={{ fontVariantNumeric: "tabular-nums" }}>{format(shown)}</span>;
}
