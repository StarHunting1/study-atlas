"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { getCity } from "@/data/cities";
const KEY = "studyatlas.compare"; export const MAX_COMPARE = 3;
const C = createContext<{ ids: string[]; toggle: (id: string) => void; clear: () => void; has: (id: string) => boolean; full: boolean }>(null!);
export const useCompare = () => useContext(C);
// Selection lives in this provider (kept across page moves) and in localStorage (kept across reloads/tabs).
export function CompareProvider({ children }: { children: React.ReactNode }) {
  const [ids, setIds] = useState<string[]>([]); const [ready, setReady] = useState(false);
  const clean = (v: unknown) => (Array.isArray(v) ? [...new Set(v.filter((x): x is string => typeof x === "string" && !!getCity(x)))].slice(0, MAX_COMPARE) : []);
  useEffect(() => {
    try { setIds(clean(JSON.parse(localStorage.getItem(KEY) ?? "[]"))); } catch {} setReady(true);
    const onStorage = (e: StorageEvent) => { if (e.key === KEY) try { setIds(clean(JSON.parse(e.newValue ?? "[]"))); } catch {} };
    window.addEventListener("storage", onStorage); return () => window.removeEventListener("storage", onStorage);
  }, []);
  useEffect(() => { if (ready) try { localStorage.setItem(KEY, JSON.stringify(ids)); } catch {} }, [ids, ready]);
  const toggle = (id: string) => setIds((p) => (p.includes(id) ? p.filter((x) => x !== id) : p.length >= MAX_COMPARE || !getCity(id) ? p : [...p, id]));
  return <C.Provider value={{ ids, toggle, clear: () => setIds([]), has: (id) => ids.includes(id), full: ids.length >= MAX_COMPARE }}>{children}</C.Provider>;
}
