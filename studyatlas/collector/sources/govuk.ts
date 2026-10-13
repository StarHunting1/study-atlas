import type { CollectedRecord, Fetched, Source } from "../types";
import { htmlToText, sha256 } from "../util";
/*
 * GOV.UK Content API: https://www.gov.uk/api/content/<path>  (JSON, no key).
 * Docs: https://content-api.publishing.service.gov.uk/  — content is published under the Open Government Licence v3.0
 * unless stated otherwise (licence to be confirmed per page during review).
 * National information (UK-wide), used for Manchester.
 */
type Page = { path: string; field: string; label: { en: string; ja: string }; review: CollectedRecord["review"] };
export const GOVUK_PAGES: Page[] = [
  { path: "/student-visa", field: "visa.official", label: { en: "Student visa (GOV.UK)", ja: "学生ビザ（GOV.UK）" }, review: "human-required" },
  { path: "/healthcare-immigration-application", field: "living.healthcare", label: { en: "Immigration Health Surcharge (GOV.UK)", ja: "移民医療付加金（GOV.UK）" }, review: "human-required" },
];
type ContentItem = {
  base_path: string; title: string; description?: string; document_type?: string;
  public_updated_at?: string; first_published_at?: string; updated_at?: string;
  details?: { body?: string; introductory_paragraph?: string; more_information?: string; parts?: { title: string; slug: string; body: string }[] };
};
/** Plain text of a content item: description + all body parts. Used for hashing and AI extraction. */
export function contentText(c: ContentItem) {
  const d = c.details ?? {};
  const parts = (d.parts ?? []).map((p) => `## ${p.title}\n${htmlToText(p.body)}`);
  return [c.title, c.description ?? "", htmlToText(d.introductory_paragraph ?? ""), htmlToText(d.body ?? ""), ...parts, htmlToText(d.more_information ?? "")].filter(Boolean).join("\n\n");
}

export const govuk: Source = {
  id: "govuk-content", name: "GOV.UK Content API", country: "GBR", access: "implemented",
  docs: "https://content-api.publishing.service.gov.uk/", licence: "Open Government Licence v3.0 (GOV.UK default; confirm per page)",
  domains: ["www.gov.uk"], topics: ["visa", "healthcare"],
  note: "Public JSON API for GOV.UK pages, no key. Requests are made one at a time.",
  async fetch(ctx): Promise<Fetched> {
    const records: CollectedRecord[] = []; const texts: Record<string, string> = {}; const errors: string[] = []; const failedIds: string[] = [];
    for (const p of GOVUK_PAGES) {
      const apiUrl = `https://www.gov.uk/api/content${p.path}`;
      try {
        const c = (await ctx.fetchJson(apiUrl)) as ContentItem;
        if (!c?.base_path || !c.title) throw new Error("unexpected response shape");
        const text = contentText(c); const id = `govuk-content:${p.path}`;
        records.push({
          id, sourceId: "govuk-content", country: "GBR", field: p.field, label: p.label,
          value: { text: c.description ?? c.title },
          sourceUrl: `https://www.gov.uk${c.base_path}`, apiUrl, retrievedAt: ctx.now,
          sourcePublishedAt: c.first_published_at, sourceUpdatedAt: c.public_updated_at,
          evidence: { path: c.description ? "description" : "title", quote: c.description ?? c.title },
          contentHash: sha256(text), licence: govuk.licence, status: "unverified", review: p.review,
        });
        texts[id] = text;
      } catch (e) { errors.push(`${p.path}: ${(e as Error).message}`); failedIds.push(`govuk-content:${p.path}`); }
    }
    if (!records.length) throw new Error(errors.join("; ") || "no pages fetched");
    if (errors.length) console.warn(`[govuk-content] partial: ${errors.join("; ")}`);
    return { records, texts, failedIds };
  },
};
