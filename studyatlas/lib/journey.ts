import { getCity } from "@/data/cities";
import { getCompareSchool } from "@/data/languageSchools";
/*
 * Student journey state carried between pages (Ver.1.7.0): ONLY ids of schools and cities, in the URL. No cost, name, profile or any personal input is ever put in a URL,
 * and nothing here reads or writes the planner's data. Every parameter is validated; an unknown or repeated id is dropped, never trusted.
 */
export type SchoolView = { a: string; b: string; /** a city id the school list is narrowed to */ city: string; /** true = the list is shown (changing the selection); false with two schools = the comparison itself */ pick: boolean };
const LAST_KEY = "studyatlas.schoolcompare.last";
export function parseSchoolView(search: string): SchoolView {
  const q = new URLSearchParams(search); const a = getCompareSchool(q.get("a"))?.id ?? ""; const b0 = getCompareSchool(q.get("b"))?.id ?? ""; const b = b0 && b0 !== a ? b0 : "";
  const city = getCity(q.get("city") ?? "") ? q.get("city")! : ""; return { a, b, city, pick: q.get("pick") === "1" || !(a && b) };
}
export function schoolViewUrl(v: Partial<SchoolView>): string {
  const q = new URLSearchParams(); if (v.a) q.set("a", v.a); if (v.b) q.set("b", v.b); if (v.city) q.set("city", v.city); if (v.pick) q.set("pick", "1"); const s = q.toString(); return s ? `?${s}` : "";
}
/** Internal links that carry the candidates. Only ids. */
export const schoolsCompareHref = (v: { a?: string; b?: string; city?: string; pick?: boolean }) => `/schools/compare${schoolViewUrl(v)}`;
export function plannerHref(ref: { schools?: string[]; cities?: string[] }): string {
  const q = new URLSearchParams(); const s = (ref.schools ?? []).filter((x) => getCompareSchool(x)).slice(0, 2), c = (ref.cities ?? []).filter((x) => getCity(x)).slice(0, 3);
  if (s.length) q.set("schools", s.join(",")); if (c.length) q.set("cities", c.join(",")); return `/planner${q.toString() ? `?${q}` : ""}`;
}
/** What the planner may show as reference: valid candidate ids from the URL. */
export function parsePlannerRef(search: string): { schools: string[]; cities: string[] } {
  const q = new URLSearchParams(search); const list = (k: string) => [...new Set((q.get(k) ?? "").split(",").map((x) => x.trim()).filter(Boolean))];
  return { schools: list("schools").filter((x) => getCompareSchool(x)).slice(0, 2), cities: list("cities").filter((x) => getCity(x)).slice(0, 3) };
}
/** Last school pair, kept only as ids so that leaving the comparison does not lose it. */
export function saveLastPair(a: string, b: string) { try { if (a || b) localStorage.setItem(LAST_KEY, JSON.stringify({ a, b })); else localStorage.removeItem(LAST_KEY); } catch { /* storage unavailable */ } }
export function loadLastPair(): { a: string; b: string } {
  try { const v = JSON.parse(localStorage.getItem(LAST_KEY) ?? "null") as { a?: unknown; b?: unknown } | null; const a = typeof v?.a === "string" ? getCompareSchool(v.a)?.id ?? "" : "", b0 = typeof v?.b === "string" ? getCompareSchool(v.b)?.id ?? "" : ""; return { a, b: b0 && b0 !== a ? b0 : "" }; } catch { return { a: "", b: "" }; }
}
