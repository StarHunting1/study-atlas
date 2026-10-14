/*
 * Exchange rates (structure only). StudyAtlas shows every amount in its original currency and does not convert.
 * A future provider (e.g. a central-bank reference-rate API) implements FxProvider; the compare screen then shows a
 * converted figure next to the original, labelled with the rate, its date and its publisher. Until then `noFx`
 * returns nothing and no converted number is ever displayed.
 */
export type FxRate = { from: string; to: string; rate: number; date: string; publisher: string; url: string };
export interface FxProvider { rate(from: string, to: string): FxRate | undefined }
export const noFx: FxProvider = { rate: () => undefined };
/** Converted amount with its provenance, or undefined when no rate is available (same currency returns the amount). */
export function convert(amount: number, from: string, to: string, fx: FxProvider = noFx): { amount: number; rate?: FxRate } | undefined {
  if (from === to) return { amount };
  const r = fx.rate(from, to); return r ? { amount: Math.round(amount * r.rate * 100) / 100, rate: r } : undefined;
}
