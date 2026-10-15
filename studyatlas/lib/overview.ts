import type { City } from "@/data/cities";
import type { Fact, Institution, Money, Status } from "@/data/types";
import type { Localized } from "@/lib/i18n";
import { climateCompare } from "@/data/official/compare";
import { officialData } from "@/data/official";
import { sections } from "@/data/fields";
import { isStudentHousing } from "@/data/official/housingKind";
import type { DataPoint } from "@/data/official/types";
import { fitOf, type StudyMode } from "@/data/official/studyType";
import { displayModeOfClimate, isFigureShown } from "@/data/official/rights";
/*
 * Quick Overview (Ver.1.8, Progressive Disclosure level 1). One short "key figure" per topic, picked from what the site already
 * holds – never computed from nothing, never promoted from unverified to verified. The status travels with the figure so the
 * overview cannot mislead; everything else stays one click away (level 2) and its sources one more (level 3).
 */
export const TOPICS = ["living", "housing", "transport", "climate", "education"] as const;
export type Topic = (typeof TOPICS)[number];
export const EXTRA_TOPICS = ["safety", "visa", "medical", "daily"] as const;
export type ExtraTopic = (typeof EXTRA_TOPICS)[number];

export type Key =
  | { kind: "point"; point: DataPoint }
  | { kind: "money"; fact: Fact<Money> }
  | { kind: "text"; fact: Fact<Localized> }
  | { kind: "temp"; lo: number; hi: number; station: string; period: string; status: Status; derived: boolean }
  | { kind: "schools"; universities: number; languageSchools: number; status: Status }
  | { kind: "link"; url: string; publisher: string }  // the figure may not be shown (rights.ts): a link to the official page instead
  | { kind: "none"; /** housing: no verified per-person student price yet – "reference price in preparation", never an invented figure */ prep?: true };

const shown = (s: Status) => s !== "pending";
const has = <T,>(f: Fact<T> | undefined): f is Fact<T> & { value: T } => !!f && shown(f.status) && f.value !== undefined;
const POINT_TOPIC: Partial<Record<Topic, DataPoint["topic"]>> = { living: "living", housing: "housing", transport: "transport" };

/** The data point to show first: a highlighted verified figure, else any verified one, else any shown (its status is displayed). */
export function keyPoint(cityId: string, topic: Topic, mode?: StudyMode): DataPoint | undefined {
  // Housing leads with what a student pays per person; the whole-market rent statistic is never the key figure (it stays in the details)
  const t = POINT_TOPIC[topic]; const pts = (officialData(cityId)?.points ?? []).filter((p) => p.topic === t && p.value && shown(p.status) && isFigureShown(p) && (topic !== "housing" || isStudentHousing(p)) && (!mode || fitOf(p, mode) === "applies"));
  return pts.find((p) => p.highlight && p.status === "verified") ?? pts.find((p) => p.status === "verified") ?? pts[0];
}

/** `mode` (Ver.1.2.6): only figures that apply to that study type can be the key figure; without it nothing is filtered (compare page). */
export function keyFigure(c: City, topic: Topic, mode?: StudyMode): Key {
  const pr = c.profile;
  if (topic === "climate") {
    const k = climateCompare(c.id);
    // (climateCompare already returns nothing for a climate record whose terms do not allow showing it)
    if (k) { const r = k.mean ?? (k.tmin && k.tmax ? ([k.tmin[0], k.tmax[1]] as [number, number]) : undefined); if (r) return { kind: "temp", lo: r[0], hi: r[1], station: k.station, period: k.period, status: k.status, derived: k.derived }; }
    return has(pr.climate.overview) ? { kind: "text", fact: pr.climate.overview } : { kind: "none" };
  }
  if (topic === "education") {
    const u = pr.education.universities, l = pr.education.languageSchools; const uu = has<Institution[]>(u) ? u : undefined, ll = has<Institution[]>(l) ? l : undefined;
    if (!uu && !ll) return { kind: "none" };
    const status: Status = [uu, ll].filter(Boolean).every((f) => f!.status === "verified") ? "verified" : "unverified";
    return { kind: "schools", universities: uu?.value.length ?? 0, languageSchools: ll?.value.length ?? 0, status };
  }
  const p = keyPoint(c.id, topic, mode); if (p) return { kind: "point", point: p };
  if (topic === "housing" && officialData(c.id)) return { kind: "none", prep: true };      // official data exists but no verified student price yet: "reference price in preparation"
  // Figures exist but the publisher's terms do not allow showing them: point to the official page rather than to a profile summary
  const held = (officialData(c.id)?.points ?? []).find((x) => x.topic === POINT_TOPIC[topic] && x.value && shown(x.status) && !isFigureShown(x));
  if (held) return { kind: "link", url: held.evidence[0].url, publisher: held.evidence[0].publisher };
  if (topic === "living") return has(pr.cost.totalMonthly) ? { kind: "money", fact: pr.cost.totalMonthly } : { kind: "none" };
  if (topic === "housing") return has(pr.housing.overview) ? { kind: "text", fact: pr.housing.overview } : { kind: "none" };
  return has(pr.transport.modes) ? { kind: "text", fact: pr.transport.modes } : { kind: "none" };
}

/** Status of a key figure (only "verified" is shown without a warning). */
export const keyStatus = (k: Key): Status | undefined => (k.kind === "point" ? k.point.status : k.kind === "money" || k.kind === "text" ? k.fact.status : k.kind === "temp" || k.kind === "schools" ? k.status : undefined);

/** Quick-compare verdict for one topic across cities: same basis, differing basis, unverified or not enough data. Never fills gaps. */
export type Cmp = "same" | "differ" | "unverified" | "missing" | "n/a";
export function compareKeys(keys: Key[]): Cmp {
  const have = keys.filter((k) => k.kind !== "none" && k.kind !== "link");
  if (have.length < 2) return "missing";
  if (have.some((k) => keyStatus(k) !== "verified")) return "unverified";
  const kinds = new Set(have.map((k) => k.kind)); if (kinds.size > 1) return "differ";
  const kind = have[0].kind;
  if (kind === "point") { const p = have.map((k) => (k as { point: DataPoint }).point); return new Set(p.map((x) => x.value!.per)).size > 1 || new Set(p.map((x) => x.audience)).size > 1 ? "differ" : "same"; }
  if (kind === "money") { const f = have.map((k) => (k as { fact: Fact<Money> }).fact); return new Set(f.map((x) => `${x.value!.per}|${x.period ?? ""}`)).size > 1 ? "differ" : "same"; }
  if (kind === "temp") return new Set(have.map((k) => (k as { period: string }).period)).size > 1 ? "differ" : "same";
  return "n/a"; // free text and institution counts are shown side by side but never judged "the same basis"
}

/** Key figure for the extra compare rows (safety, visa, healthcare, student life): the first profile fact, shown with its status. */
const EXTRA_FIELD: Record<ExtraTopic, string> = { safety: "safety.crimeStats", visa: "visa.official", medical: "living.healthcare", daily: "living.studentLife" };
export function extraKey(c: City, topic: ExtraTopic): Key {
  const f = sections.flatMap((s) => s.fields).find((x) => x.id === EXTRA_FIELD[topic]); const fact = f?.get(c) as Fact<Localized> | undefined;
  return has(fact) ? { kind: "text", fact } : { kind: "none" };
}
