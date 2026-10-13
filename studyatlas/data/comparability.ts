import type { Fact, Money } from "./schema";
import type { Price, WeeksRange } from "./schools/types";
/**
 * Whether money facts for several cities can be put next to each other as comparable numbers.
 * Only verified figures with the same currency, the same "per" unit, the same period and the same coverage qualify.
 * Anything else is still displayed, but labelled as not comparable.
 */
export type Comparability = "ok" | "notVerified" | "currency" | "basis";
export function moneyComparability(facts: Fact<Money>[]): Comparability {
  const withValue = facts.filter((f) => f.value);
  if (withValue.length < 2) return "ok"; // nothing to compare against
  if (withValue.some((f) => f.status !== "verified")) return "notVerified";
  const v = withValue.map((f) => f.value!);
  if (new Set(v.map((m) => m.currency)).size > 1) return "currency";
  const basis = (f: Fact<Money>) => [f.value!.per, f.period ?? "", f.value!.includes?.en ?? ""].join("|");
  if (new Set(withValue.map(basis)).size > 1) return "basis";
  return "ok";
}

/** Why school fees for several options cannot be compared at face value. Empty array = comparable. */
export type PriceIssue = "notVerified" | "currency" | "unit" | "feeYear" | "tax" | "applicability" | "includes" | "duration";
export function priceIssues(prices: Fact<Price>[], durations: Fact<WeeksRange>[] = []): PriceIssue[] {
  const withValue = prices.filter((f) => f.value);
  if (withValue.length < 2) return [];
  const v = withValue.map((f) => f.value!); const out: PriceIssue[] = [];
  const differs = (k: (p: Price) => string) => new Set(v.map(k)).size > 1;
  if (withValue.some((f) => f.status !== "verified")) out.push("notVerified");
  if (differs((p) => p.currency)) out.push("currency");
  if (differs((p) => p.unit)) out.push("unit");
  if (differs((p) => p.feeYear ?? "?")) out.push("feeYear");
  if (differs((p) => p.tax) || v.some((p) => p.tax === "unknown")) out.push("tax");
  if (differs((p) => p.applicability?.en ?? "?")) out.push("applicability");
  if (differs((p) => p.includes?.en ?? "?")) out.push("includes");
  const d = durations.filter((f) => f.value).map((f) => `${f.value!.minWeeks}-${f.value!.maxWeeks ?? ""}`);
  if (new Set(d).size > 1) out.push("duration");
  return out;
}
