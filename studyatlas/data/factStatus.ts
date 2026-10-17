import type { Claim, Status } from "./schema";
/**
 * Display-only status of a group of statements (Ver.1.4.1). It never changes the stored `status` of a Fact or a claim and is never used for any decision:
 * all statements verified -> "verified"; some -> "partial" (shown as "一部確認済み"); none -> the stored status (normally "unverified").
 * A partly verified group is never treated as verified.
 */
export type DisplayStatus = Status | "partial";
export function claimsStatus(claims: Pick<Claim, "status">[] | undefined, stored: Status = "unverified"): DisplayStatus {
  if (!claims?.length) return stored;
  const v = claims.filter((c) => c.status === "verified").length;
  return v === 0 ? stored : v === claims.length ? "verified" : "partial";
}
export const displayStatus = (f: { status: Status; claims?: Pick<Claim, "status">[] }): DisplayStatus => claimsStatus(f.claims, f.status);
