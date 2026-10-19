import type { Localized } from "@/lib/i18n";
/*
 * Automated collection of official information (Collector Ver.1.0).
 * A collector NEVER marks anything verified and never writes to data/profiles/*: it only proposes
 * change candidates, which a person reviews in a pull request before they are promoted.
 */

/** How a source can be used, as far as known. */
export type Access =
  | "implemented"        // open API, no key, implemented in collector/sources
  | "page-check"         // public page without an API: only checks that recorded figures are still shown (robots.txt respected)
  | "open-api-planned"   // open API documented, not implemented yet
  | "needs-key"          // requires registration / API key (store it in GitHub Secrets)
  | "needs-terms-review" // no documented API, or terms not yet reviewed: do not scrape
export type SourceInfo = {
  id: string; name: string; country: "GBR" | "CAN" | "AUS"; access: Access;
  /** Minimum days between fetches (scheduled runs skip a source that is not due; --force ignores this) */
  cadenceDays?: number;
  /** Developer documentation / terms to read before enabling */
  docs: string;
  /** Licence for reuse of the content, when known from the API response or docs */
  licence?: string;
  /** Domains the collector must be allowed to reach */
  domains: string[];
  topics: string[];
  /** Why the source is in its current access state. Facts about the provider that have not been checked are marked so. */
  note: string;
};

/** Visa, healthcare and work rules always need a human sign-off before use. */
export type Review = "human-required" | "standard";

export type CollectedRecord = {
  /** Stable id: `${sourceId}:${key}` */
  id: string;
  sourceId: string;
  country: "GBR" | "CAN" | "AUS";
  /** City the record is about; omitted for national information (e.g. visa rules) */
  cityId?: string;
  /** Ver.1.3 field path it would update (e.g. "visa.official", "living.healthcare") or a dataset topic ("dataset.housing") */
  field: string;
  label: Localized;
  value: { text?: string; number?: number; unit?: string; currency?: string; /** e.g. 12 monthly climate normals, Jan..Dec */ series?: (number | null)[] };
  /** Period the value describes, when the source states one */
  period?: string;
  /** Human-readable page */
  sourceUrl: string;
  /** Exact API request used */
  apiUrl: string;
  retrievedAt: string;          // ISO timestamp of this fetch
  sourcePublishedAt?: string;   // as stated by the source
  sourceUpdatedAt?: string;     // as stated by the source
  /** Where in the response the value came from (JSON path) and/or a verbatim excerpt */
  evidence: { path: string; quote?: string };
  /** Hash of the content that matters for change detection */
  contentHash: string;
  licence?: string;
  /** Always "unverified": collected ≠ checked */
  status: "unverified";
  review: Review;
  /** Set when a later successful run no longer returned this record (kept, never deleted automatically) */
  missingSince?: string;
  /** Optional AI extraction. Never makes the record verified. */
  ai?: AiExtraction;
  /** Source-specific facts that belong with the value (area code, scope, which checks passed, what is still unconfirmed) */
  meta?: Record<string, unknown>;
};

export type AiFact = { name: string; value: string; unit?: string; currency?: string; appliesTo?: string; quote: string };
export type AiExtraction = {
  model: string; generatedAt: string;
  summary: Localized;
  facts: AiFact[];
  /** Facts dropped because their quote or number could not be found in the source text */
  rejected: { fact: AiFact; reason: string }[];
};

/** Raw text kept in memory for AI extraction (not stored in the repo). */
export type Fetched = { records: CollectedRecord[]; texts: Record<string, string>; /** ids that could not be fetched this time (kept as they were, not marked missing) */ failedIds?: string[] };
export type Source = SourceInfo & { fetch?: (ctx: FetchContext) => Promise<Fetched> };
export type FetchContext = {
  fetchJson: (url: string) => Promise<unknown>;
  postJson: (url: string, body: unknown) => Promise<unknown>;
  /** Raw page text (HTML/CSV). Page sources must call `robots` first. */
  fetchText: (url: string) => Promise<{ status: number; url: string; body: string }>;
  /** Raw bytes (a data workbook). Callers must have checked `robots` first. */
  fetchBinary: (url: string) => Promise<{ status: number; url: string; body: Buffer }>;
  robots: (url: string) => Promise<{ allowed: boolean; reason: string }>;
  /** Minimum gap in ms between two requests of one source (0 in tests) */
  paceMs?: number;
  now: string;
};

export type SourceRun = { sourceId: string; ok: boolean; attemptedAt: string; records: number; error?: string; skipped?: string };
export type Change =
  | { type: "added"; id: string; record: CollectedRecord }
  | { type: "changed"; id: string; before: CollectedRecord; after: CollectedRecord; fields: string[] }
  | { type: "missing"; id: string; record: CollectedRecord };
export type Snapshot = { updatedAt: string | null; records: Record<string, CollectedRecord>; runs: Record<string, SourceRun & { lastSuccessAt?: string }> };
