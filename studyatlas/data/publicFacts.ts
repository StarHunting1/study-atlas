import type { Fact } from "./schema";
/*
 * What may be shown to visitors (Ver.1.3.1). A "sample" fact is a demo number from Ver.1.0 with no period, coverage or source.
 * It stays in the data files but is never shown as a figure: public pages treat it like "pending" (data coming soon).
 */
export const isSampleFact = (f: Pick<Fact<unknown>, "status">) => f.status === "sample";
/** The fact as a visitor may see it: a sample becomes pending (no value), everything else is unchanged. */
export function publicFact<T>(f: Fact<T>): Fact<T> { return isSampleFact(f) ? { status: "pending" } : f; }
