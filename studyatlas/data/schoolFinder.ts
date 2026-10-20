import type { CompareSchool } from "./languageSchools";
import { thirdPartyRecord } from "./languageSchools";
import type { Localized } from "@/lib/i18n";
/*
 * School discovery logic (Ver.1.6.9): search, city filter, the two-school selection and the row-by-row differences. Pure functions over the existing 13 schools:
 * nothing is fetched, ranked or estimated. A "record" filter says where a school's items come from (a register / directory entry apart from the school's own pages);
 * it is NOT a quality measure, and "unconfirmed" never means "worse".
 */
export type RecordFilter = "all" | "third" | "own";
export type Filters = { q: string; city: string; record: RecordFilter };
export const NO_FILTER: Filters = { q: "", city: "", record: "all" };
export const isFiltered = (f: Filters) => !!(f.q.trim() || f.city || f.record !== "all");
const norm = (s: string) => s.normalize("NFKC").toLowerCase().replace(/\s+/g, " ").trim();

/** Schools matching ALL given conditions (search over the display name, the registered name, the city name in both languages and the address). */
export function filterSchools(all: CompareSchool[], f: Filters, cityName: (id: string) => Localized): CompareSchool[] {
  const q = norm(f.q);
  return all.filter((s) => {
    if (f.city && s.cityId !== f.city) return false;
    if (f.record === "third" && !thirdPartyRecord(s.inst)) return false;
    if (f.record === "own" && thirdPartyRecord(s.inst)) return false;
    if (!q) return true;
    const c = cityName(s.cityId), hay = norm([s.inst.name, s.inst.officialName, c.en, c.ja, s.inst.where?.en, s.inst.where?.ja].filter(Boolean).join(" "));
    return q.split(" ").every((w) => hay.includes(w));
  });
}
export const cityCounts = (all: CompareSchool[]) => all.reduce<Record<string, number>>((m, s) => ((m[s.cityId] = (m[s.cityId] ?? 0) + 1), m), {});

/* ---------- the two-school selection: at most two, a third is never swapped in silently ---------- */
export type Sel = { a: string; b: string; /** a third school the person clicked while two were chosen: waiting for them to say which one to replace */ pending: string };
export const EMPTY_SEL: Sel = { a: "", b: "", pending: "" };
export function toggleSchool(s: Sel, id: string): Sel {
  if (s.a === id) return { ...s, a: "", pending: "" };
  if (s.b === id) return { ...s, b: "", pending: "" };
  if (!s.a) return { ...s, a: id, pending: "" };
  if (!s.b) return { ...s, b: id, pending: "" };
  return { ...s, pending: id };
}
export const replaceWithPending = (s: Sel, slot: "a" | "b"): Sel => (s.pending ? { ...s, [slot]: s.pending, pending: "" } : s);
export const dismissPending = (s: Sel): Sel => ({ ...s, pending: "" });

/* ---------- row-by-row differences between two schools (objective; no verdict) ---------- */
export type Diff = "same" | "differ" | "unconfirmed" | "incomparable";
const txt = (l?: Localized) => (l ? norm(l.en) : "");
const cmpText = (x?: Localized, y?: Localized): Diff => (!x || !y ? "incomparable" : txt(x) === txt(y) ? "same" : "differ");
const OPEN = new Set(["notConfirmed", "notChecked"]);
export type CheckKind = "provider" | "campus" | "course" | "accreditation";
export const CHECK_KINDS: CheckKind[] = ["provider", "campus", "course", "accreditation"];
/** Per item: both sides checked to the same degree = same; different degree = differ; either side not confirmed / not checked = unconfirmed; no item-by-item record on a side = incomparable. */
export function checkDiff(a: CompareSchool, b: CompareSchool, kind: CheckKind): Diff {
  const x = a.inst.checks?.find((c) => c.kind === kind)?.state, y = b.inst.checks?.find((c) => c.kind === kind)?.state;
  if (!x || !y) return "incomparable"; if (OPEN.has(x) || OPEN.has(y)) return "unconfirmed"; return x === y ? "same" : "differ";
}
export function diffRows(a: CompareSchool, b: CompareSchool) {
  const kinds = Object.fromEntries(CHECK_KINDS.map((k) => [k, checkDiff(a, b, k)])) as Record<CheckKind, Diff>; const vals = Object.values(kinds);
  const checks: Diff = vals.every((v) => v === "incomparable") ? "incomparable" : vals.includes("unconfirmed") ? "unconfirmed" : vals.includes("differ") ? "differ" : "same";
  return { where: cmpText(a.inst.where, b.inst.where), courses: cmpText(a.inst.courses, b.inst.courses), stay: cmpText(a.inst.stay, b.inst.stay),
    tuition: "incomparable" as Diff, // fees are never copied or compared here
    checks, kinds, links: (a.inst.url && b.inst.url && (!!a.inst.feesUrl === !!b.inst.feesUrl) ? "same" : "incomparable") as Diff };
}
