import type { City, Country } from "@/data/types";
import { countries } from "@/data/cities";
import type { Localized } from "@/lib/i18n";
/** One place for country and city names shown by StudyAtlas' own UI: always the data's translations (ja: カナダ / イギリス / オーストラリア, en: Canada / United Kingdom / Australia). */
export const countryName = (code: string, L: (v: Localized) => string): string => { const c: Country | undefined = countries.find((x) => x.code === code); return c ? L(c.name) : code; };
export const cityName = (c: City, L: (v: Localized) => string): string => L(c.name);
