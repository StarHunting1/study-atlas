import type { Localized } from "@/lib/i18n";
/*
 * Official information sources for city data (Ver.1.5). One entry per publisher page or data service.
 * Data points (data/official/<city>.ts) point at a source by id; the collector checks each source on its own
 * cadence. To add a city, register its sources here and its data points in a new data/official/<city>.ts.
 *
 * method
 *   api   – documented open API / data service (JSON or CSV). Values are read by collector/sources/*.
 *   page  – public web page without an API. The collector never extracts new values from it: it only checks,
 *           at most once per cadence and only where robots.txt allows, that every recorded value is still
 *           shown on the page. A value that disappears becomes a change candidate for a person to review.
 */
export type Topic = "transport" | "housing" | "living" | "climate";
export type TermsStatus = "open-licence" | "page-check-only" | "needs-review";
export type OfficialSource = {
  id: string; publisher: string; name: Localized; country: "GBR" | "CAN"; cityIds: string[]; topic: Topic;
  method: "api" | "page";
  /** Pages a person (and the page check) reads. For api sources: the human-readable page for the data. */
  pages: string[];
  /** Days between checks. Fares and rents change at most a few times a year; climate normals once a decade. */
  cadenceDays: number;
  terms: { status: TermsStatus; licence?: string; url?: string; note: Localized };
};
