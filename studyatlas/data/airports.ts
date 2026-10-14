import type { Localized } from "@/lib/i18n";
/*
 * Airports the smart planner can use (IATA codes are kept here, never typed into free text by default).
 * A departure airport outside this list can be entered as a 3-letter IATA code. Destinations are the airports of the supported cities.
 */
export type Airport = { code: string; country: string; city: Localized; name: Localized };
export const COUNTRIES: { code: string; name: Localized }[] = [
  { code: "JP", name: { en: "Japan", ja: "日本" } }, { code: "KR", name: { en: "South Korea", ja: "韓国" } },
  { code: "TW", name: { en: "Taiwan", ja: "台湾" } }, { code: "SG", name: { en: "Singapore", ja: "シンガポール" } },
];
export const ORIGINS: Airport[] = [
  { code: "HND", country: "JP", city: { en: "Tokyo", ja: "東京" }, name: { en: "Haneda", ja: "羽田" } },
  { code: "NRT", country: "JP", city: { en: "Tokyo", ja: "東京" }, name: { en: "Narita", ja: "成田" } },
  { code: "KIX", country: "JP", city: { en: "Osaka", ja: "大阪" }, name: { en: "Kansai", ja: "関西" } },
  { code: "ITM", country: "JP", city: { en: "Osaka", ja: "大阪" }, name: { en: "Itami", ja: "伊丹" } },
  { code: "NGO", country: "JP", city: { en: "Nagoya", ja: "名古屋" }, name: { en: "Chubu Centrair", ja: "中部国際" } },
  { code: "FUK", country: "JP", city: { en: "Fukuoka", ja: "福岡" }, name: { en: "Fukuoka", ja: "福岡" } },
  { code: "CTS", country: "JP", city: { en: "Sapporo", ja: "札幌" }, name: { en: "New Chitose", ja: "新千歳" } },
  { code: "OKA", country: "JP", city: { en: "Okinawa", ja: "沖縄" }, name: { en: "Naha", ja: "那覇" } },
  { code: "ICN", country: "KR", city: { en: "Seoul", ja: "ソウル" }, name: { en: "Incheon", ja: "仁川" } },
  { code: "GMP", country: "KR", city: { en: "Seoul", ja: "ソウル" }, name: { en: "Gimpo", ja: "金浦" } },
  { code: "TPE", country: "TW", city: { en: "Taipei", ja: "台北" }, name: { en: "Taoyuan", ja: "桃園" } },
  { code: "SIN", country: "SG", city: { en: "Singapore", ja: "シンガポール" }, name: { en: "Changi", ja: "チャンギ" } },
];
export const DESTINATIONS: Record<string, Airport> = {
  manchester: { code: "MAN", country: "GB", city: { en: "Manchester", ja: "マンチェスター" }, name: { en: "Manchester Airport", ja: "マンチェスター空港" } },
  vancouver: { code: "YVR", country: "CA", city: { en: "Vancouver", ja: "バンクーバー" }, name: { en: "Vancouver International", ja: "バンクーバー国際空港" } },
};
export const OTHER_AIRPORT = "OTHER";
export const isIata = (s: string) => /^[A-Z]{3}$/.test(s);
export const airportsIn = (country: string) => ORIGINS.filter((a) => a.country === country);
export const findOrigin = (code: string) => ORIGINS.find((a) => a.code === code);
