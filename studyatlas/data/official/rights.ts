import type { Localized } from "@/lib/i18n";
import type { ClimateNormals, DataPoint } from "./types";
/*
 * Data rights (Ver.1.2). For every information source: what it permits, how it may be accessed, when it was last read, and what
 * StudyAtlas therefore does with it. This is kept APART from the verification status of a figure (`DataPoint.status`: is the number
 * right?). A verified number from a source whose terms are not cleared is still shown only as allowed by its `reuseStatus`.
 *
 * This is a practical record of what each publisher's published terms say, not legal advice. Where wording is ambiguous the entry says
 * so and `expertReview` asks for a professional's opinion; nothing here asserts that a use is lawful or unlawful.
 *
 * reuseStatus
 *   permitted     – an open or explicit licence covers the use StudyAtlas makes (showing figures with attribution).
 *   restricted    – the terms name information / data (not just page design or text) as not to be reproduced or republished without prior
 *                   written consent, or otherwise prohibit the use. The figures are kept in the repository but not displayed or collected.
 *   needs-review  – copyright is reserved but the terms neither grant a licence nor clearly prohibit reproducing plain facts (prices).
 *                   Only the figure, our own wording and a link are shown; no text, table or database of the source is republished.
 *   unknown       – terms not read (or unreachable). Treated like needs-review for facts, and never shown as permitted.
 * display (what the public pages do)
 *   full               – shown as usual.
 *   figure-with-link   – the figure with its conditions and a link to the official page; no source text or tables.
 *   link-only          – no figure; a link to the official page (and a short reason).
 *   hold               – suspended entirely (kept for review, nothing shown).
 * automation (what the collector may do)
 *   allowed | page-check-only (only checks, once per cadence and where robots.txt allows, that a recorded figure is still on the page) | blocked.
 */
export const REUSE_STATUSES = ["permitted", "restricted", "needs-review", "unknown"] as const;
export type ReuseStatus = (typeof REUSE_STATUSES)[number];
export const DISPLAY_MODES = ["full", "figure-with-link", "link-only", "hold"] as const;
export type DisplayMode = (typeof DISPLAY_MODES)[number];
export const AUTOMATIONS = ["allowed", "page-check-only", "blocked"] as const;
export type Automation = (typeof AUTOMATIONS)[number];
export type AccessMethod = "open-api" | "open-data-file" | "page-check" | "manual-link" | "none";
export type RestrictionCode = "no-reproduction-without-consent" | "personal-noncommercial-extracts-only" | "attribution-required" | "no-official-marks" | "robots-disallows-api-path" | "crawl-delay" | "api-key-and-approval-required" | "no-commercial-redistribution-without-permission";

/** A page that was read for the review: its URL, the date, and which part of it was relevant. */
export type ReviewedPage = { url: string; reviewedAt: string; scope: string };
export type Rights = {
  sourceName: string; sourceUrl: string;
  /** The licence / terms document that governs reuse (null when none is published) */
  licenseUrl: string | null; licence?: string;
  reuseStatus: ReuseStatus; accessMethod: AccessMethod; automation: Automation;
  /** YYYY-MM-DD of the last review of the terms; null = never reviewed */
  lastReviewedAt: string | null;
  reviewNotes: Localized;
  reviewed: ReviewedPage[];
  restrictions: RestrictionCode[];
  /** Attribution the licence asks for, shown with the source (level 3) */
  attribution?: string;
  /** Stricter than the status implies (e.g. "hold" to suspend a source while it is re-checked) */
  display?: DisplayMode;
  /** A professional's opinion is recommended before relying on this reading of the terms */
  expertReview: boolean;
};

/** Rights of a figure: its source's rights, optionally overridden for a single figure (`DataPoint.rights`). */
export type RightsOverride = Partial<Pick<Rights, "reuseStatus" | "display" | "reviewNotes" | "lastReviewedAt">>;

import { RIGHTS } from "./rights.data";
export { RIGHTS };
const FALLBACK: Rights = { sourceName: "(unregistered source)", sourceUrl: "", licenseUrl: null, reuseStatus: "unknown", accessMethod: "none", automation: "blocked", lastReviewedAt: null, reviewNotes: { en: "No rights record.", ja: "利用条件の記録がありません。" }, reviewed: [], restrictions: [], expertReview: true };
export const rightsOfSource = (sourceId: string): Rights => RIGHTS[sourceId] ?? FALLBACK;
export const rightsOfPoint = (p: Pick<DataPoint, "sourceId" | "rights">): Rights => ({ ...rightsOfSource(p.sourceId), ...(p.rights ?? {}) });

const ORDER: DisplayMode[] = ["full", "figure-with-link", "link-only", "hold"];
/** The display mode a status implies, for a figure (has a number) or a text-only item. */
export function impliedDisplay(status: ReuseStatus, hasFigure: boolean): DisplayMode {
  if (status === "permitted") return "full";
  if (status === "restricted") return "link-only";
  return hasFigure ? "figure-with-link" : "link-only"; // needs-review / unknown: a bare figure may be shown, prose from the source may not
}
/** Final display mode: the stricter of the implied mode and an explicit `display` override (an override can never loosen it). */
export function displayModeOf(p: Pick<DataPoint, "sourceId" | "rights" | "value">): DisplayMode {
  const r = rightsOfPoint(p); const implied = impliedDisplay(r.reuseStatus, !!p.value);
  return r.display && ORDER.indexOf(r.display) > ORDER.indexOf(implied) ? r.display : implied;
}
export function displayModeOfClimate(c: Pick<ClimateNormals, "sourceId">): DisplayMode {
  const r = rightsOfSource(c.sourceId); const implied = impliedDisplay(r.reuseStatus, true);
  return r.display && ORDER.indexOf(r.display) > ORDER.indexOf(implied) ? r.display : implied;
}
/** Figures that may be shown, used in the planner and compared with others (full / figure-with-link). */
export const showsFigure = (m: DisplayMode) => m === "full" || m === "figure-with-link";
export const isFigureShown = (p: Pick<DataPoint, "sourceId" | "rights" | "value" | "status">) => p.status !== "pending" && showsFigure(displayModeOf(p));

/** Collector gate: may this collector source (an API id, or `page:<source id>`) be requested? A source without a rights record is blocked. */
export function automationFor(collectorSourceId: string): { automation: Automation; why: string } {
  const key = collectorSourceId.replace(/^page:/, ""); const r = RIGHTS[key];
  if (!r) return { automation: "blocked", why: "no rights record" };
  return { automation: r.automation, why: r.automation === "blocked" ? r.reviewNotes.en : r.automation };
}
