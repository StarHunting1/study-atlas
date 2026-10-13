"use client";
import { useEffect, useState } from "react";
import { REGION_CODES, regionName } from "./profile";
/**
 * Country options localized with Intl.DisplayNames. Built after mount only: the server's and the browser's
 * ICU data can name a few countries differently, which would cause a hydration mismatch.
 */
export function useRegions(lang: string) {
  const [opts, setOpts] = useState<{ value: string; label: string }[]>([]);
  useEffect(() => { setOpts(REGION_CODES.map((c) => ({ value: c, label: regionName(c, lang) })).sort((a, b) => a.label.localeCompare(b.label, lang))); }, [lang]);
  return opts;
}
