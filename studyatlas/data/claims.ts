import type { Claim, Fact, SourceRef } from "./schema";
import type { Localized } from "@/lib/i18n";
/*
 * Builds a Fact out of claims (Ver.1.3.6). `value` is the claims' text joined in order, so every existing consumer (overview, search, compare) keeps working.
 * `status` is derived: "verified" only if every claim is verified, otherwise "unverified". A claim never verifies itself: see validate.ts (needs an approval).
 */
export const joinText = (claims: Claim[]): Localized => ({ en: claims.map((c) => c.text.en).join(" "), ja: claims.map((c) => c.text.ja).join("") });
export function factFromClaims(claims: Claim[], note?: Localized): Fact<Localized> {
  const sources: SourceRef[] = []; for (const c of claims) for (const s of c.sources) if (!sources.some((x) => x.url === s.url)) sources.push(s);
  const dates = claims.map((c) => c.checkedAt).filter((d): d is string => !!d).sort();
  const periods = [...new Set(claims.map((c) => c.period).filter((p): p is string => !!p))];
  return { status: claims.every((c) => c.status === "verified") ? "verified" : "unverified", value: joinText(claims), sources, period: periods.length === 1 ? periods[0] : periods.sort().join(", "), checkedAt: dates[dates.length - 1], ...(note ? { note } : {}), claims };
}

/** Licence line per publisher (read on the publishers' own terms pages, 2026-10-15). Facts are paraphrased and linked; no page text, table or image is copied. */
export const terms = (url: string) => /gov\.uk/.test(url) ? "Open Government Licence v3.0 – Contains public sector information licensed under the Open Government Licence v3.0" : /canada\.ca/.test(url) ? "Government of Canada terms: non-commercial reproduction allowed, commercial reuse not confirmed – facts paraphrased, link only" : /gov\.bc\.ca/.test(url) ? "Province of British Columbia copyright: no reproduction or redistribution without prior written permission – facts paraphrased, link only" : "Reuse terms not confirmed – facts paraphrased, link only";
export const source = (url: string, publisher: string): SourceRef => ({ url, publisher, terms: terms(url) });
type Spec = { id: string; candidate: string; text: Localized; sources: SourceRef[]; conditions: Localized; where: string; verdict: Claim["review"]["verdict"]; reason: Localized };
/** An unverified claim read from the pages on 2026-10-15 (Actions runs 38787463398, 38798253317). Approval is a separate, human step (`approval`). */
export const claim = (c: Spec): Claim => ({ id: c.id, candidate: c.candidate, text: c.text, status: "unverified", sources: c.sources, period: "2026-10", checkedAt: "2026-10-15", conditions: c.conditions, where: c.where, review: { verdict: c.verdict, reason: c.reason } });
