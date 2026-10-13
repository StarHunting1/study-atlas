"use client";
import { createContext, useContext, useEffect, useState } from "react";
import en, { Dict } from "@/locales/en";
import ja from "@/locales/ja";
// Add a language: create locales/xx.ts, register here, and add it to LOCALES.
export const DICTS: Record<string, Dict> = { en, ja };
export const LOCALES = [{ code: "ja", label: "日本語" }, { code: "en", label: "English" }];
export type Localized = Record<string, string>;
type Ctx = { lang: string; setLang: (l: string) => void; t: (k: keyof Dict) => string; L: (v: Localized) => string };
const C = createContext<Ctx>(null!);
export const useI18n = () => useContext(C);
export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState("ja");
  useEffect(() => { const s = localStorage.getItem("lang"); if (s && DICTS[s]) setLangState(s); }, []);
  useEffect(() => { document.documentElement.lang = lang; }, [lang]);
  const setLang = (l: string) => { setLangState(l); localStorage.setItem("lang", l); };
  const t = (k: keyof Dict) => DICTS[lang]?.[k] ?? en[k];
  const L = (v: Localized) => v[lang] ?? v.en;
  return <C.Provider value={{ lang, setLang, t, L }}>{children}</C.Provider>;
}
