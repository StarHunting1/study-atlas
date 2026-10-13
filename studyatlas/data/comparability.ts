import type { Fact, Money } from "./schema";
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
