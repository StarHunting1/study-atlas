"use client";
import { createContext, useContext, useEffect, useState } from "react";
const KEY = "studyatlas.compare";
const C = createContext<{ ids: string[]; toggle: (id: string) => void; clear: () => void; has: (id: string) => boolean; full: boolean }>(null!);
export const useCompare = () => useContext(C);
export function CompareProvider({ children }: { children: React.ReactNode }) {
  const [ids, setIds] = useState<string[]>([]); const [ready, setReady] = useState(false);
  useEffect(() => { try { const s = JSON.parse(localStorage.getItem(KEY) ?? "[]"); if (Array.isArray(s)) setIds(s.slice(0, 3)); } catch {} setReady(true); }, []);
  useEffect(() => { if (ready) try { localStorage.setItem(KEY, JSON.stringify(ids)); } catch {} }, [ids, ready]);
  const toggle = (id: string) => setIds((p) => (p.includes(id) ? p.filter((x) => x !== id) : p.length >= 3 ? p : [...p, id]));
  return <C.Provider value={{ ids, toggle, clear: () => setIds([]), has: (id) => ids.includes(id), full: ids.length >= 3 }}>{children}</C.Provider>;
}
