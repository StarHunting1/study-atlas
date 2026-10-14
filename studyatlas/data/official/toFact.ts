import type { Localized } from "@/lib/i18n";
import type { Fact, Money, MonthlyClimate } from "../schema";
import type { ClimateNormals, DataPoint } from "./types";
/*
 * Bridges official data points into the Ver.1.3 profile Facts, so the existing summary fields and the compare
 * table show the same verified figure (one source of truth: data/official/*). The coverage text (`includes`)
 * says exactly what the number is, so moneyComparability() keeps different kinds of figures apart.
 */
const PER: Partial<Record<string, Money["per"]>> = { week: "week", month: "month", year: "year" };

export function moneyFact(p: DataPoint | undefined, includes: Localized): Fact<Money> {
  if (!p?.value || !PER[p.value.per]) return { status: "pending" };
  return {
    status: p.status, value: { amount: p.value.amount, ...(p.value.max !== undefined ? { max: p.value.max } : {}), currency: p.value.currency, per: PER[p.value.per]!, includes },
    sources: p.evidence.map((e) => ({ url: e.url, publisher: e.publisher, ...(e.terms ? { terms: e.terms } : {}) })).filter((s, i, a) => a.findIndex((x) => x.url === s.url) === i),
    period: p.validFor, checkedAt: p.checkedAt, note: p.conditions,
  };
}

export function textFact(points: DataPoint[], text: Localized): Fact<Localized> {
  const ps = points.filter(Boolean);
  if (!ps.length) return { status: "pending" };
  return {
    status: ps.every((p) => p.status === "verified") ? "verified" : "unverified", value: text,
    sources: ps.flatMap((p) => p.evidence.map((e) => ({ url: e.url, publisher: e.publisher }))).filter((s, i, a) => a.findIndex((x) => x.url === s.url) === i),
    period: [...new Set(ps.map((p) => p.validFor))].join("; "), checkedAt: ps.map((p) => p.checkedAt ?? "").sort()[0] || undefined,
  };
}

export function climateFact(c: ClimateNormals | undefined): Fact<MonthlyClimate> {
  if (!c || c.months.some((m) => m.meanC === undefined || m.precipMm === undefined)) return { status: "pending" };
  return {
    status: c.status, value: { station: `${c.station}${c.stationId ? ` (${c.stationId})` : ""}`, meanTempC: c.months.map((m) => m.meanC!), precipMm: c.months.map((m) => m.precipMm!) },
    sources: c.evidence.map((e) => ({ url: e.url, publisher: e.publisher })), period: c.period, checkedAt: c.checkedAt, note: c.note,
  };
}

export const pointById = (points: DataPoint[], id: string) => points.find((p) => p.id === id);
