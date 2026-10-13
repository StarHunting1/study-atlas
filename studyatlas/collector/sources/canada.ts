import type { CollectedRecord, Fetched, Source } from "../types";
import { sha256 } from "../util";
/*
 * Open Government Canada (CKAN Action API): https://open.canada.ca/data/api/action/package_search  (JSON, no key).
 * Docs: https://open.canada.ca/en/access-our-application-programming-interface-api
 * Collects dataset metadata (title, publisher, dates, licence, resources) — the datasets that later
 * Vancouver figures will be read from. No figures are inferred from metadata.
 */
type Query = { key: string; q: string; field: string; cityId?: string; label: { en: string; ja: string } };
export const CANADA_QUERIES: Query[] = [
  { key: "housing-vancouver", q: "rental market Vancouver", field: "dataset.housing", cityId: "vancouver", label: { en: "Housing / rental datasets (Vancouver)", ja: "住宅・家賃データセット（バンクーバー）" } },
  { key: "climate-normals", q: "Canadian Climate Normals", field: "dataset.climate", label: { en: "Climate normals datasets", ja: "気候平年値データセット" } },
];
const ROWS = 3;
type Pkg = {
  id: string; name: string; title: string; title_translated?: { en?: string; fr?: string };
  organization?: { title?: string }; metadata_created?: string; metadata_modified?: string;
  license_title?: string; license_url?: string; resources?: { format?: string; last_modified?: string | null; url?: string }[];
};

export const canada: Source = {
  id: "canada-open-gov", name: "Open Government Canada (CKAN API)", country: "CAN", access: "implemented",
  docs: "https://open.canada.ca/en/access-our-application-programming-interface-api", licence: "Per dataset (usually Open Government Licence – Canada; stored per record)",
  domains: ["open.canada.ca"], topics: ["housing", "climate"],
  note: "Public CKAN API, no key. Dataset metadata only in Ver.1.0.",
  async fetch(ctx): Promise<Fetched> {
    const records: CollectedRecord[] = []; const errors: string[] = [];
    for (const q of CANADA_QUERIES) {
      const apiUrl = `https://open.canada.ca/data/api/action/package_search?q=${encodeURIComponent(q.q)}&rows=${ROWS}`;
      try {
        const res = (await ctx.fetchJson(apiUrl)) as { success?: boolean; result?: { results?: Pkg[] } };
        if (!res?.success || !Array.isArray(res.result?.results)) throw new Error("unexpected response shape");
        res.result!.results!.forEach((p, i) => {
          const title = p.title_translated?.en ?? p.title;
          const formats = [...new Set((p.resources ?? []).map((r) => (r.format ?? "").toUpperCase()).filter(Boolean))];
          records.push({
            id: `canada-open-gov:${p.name}`, sourceId: "canada-open-gov", country: "CAN", cityId: q.cityId, field: q.field,
            label: { en: `${q.label.en}: ${title}`, ja: `${q.label.ja}：${title}` },
            value: { text: [title, p.organization?.title, formats.length ? `formats: ${formats.join(", ")}` : ""].filter(Boolean).join(" — ") },
            sourceUrl: `https://open.canada.ca/data/en/dataset/${p.id}`, apiUrl, retrievedAt: ctx.now,
            sourcePublishedAt: p.metadata_created, sourceUpdatedAt: p.metadata_modified,
            evidence: { path: `result.results[${i}].title`, quote: title },
            contentHash: sha256(JSON.stringify([title, p.metadata_modified, p.license_title, (p.resources ?? []).map((r) => [r.url, r.last_modified])])),
            licence: p.license_title, status: "unverified", review: "standard",
          });
        });
      } catch (e) { errors.push(`${q.key}: ${(e as Error).message}`); }
    }
    if (!records.length) throw new Error(errors.join("; ") || "no datasets returned");
    if (errors.length) console.warn(`[canada-open-gov] partial: ${errors.join("; ")}`);
    return { records, texts: {} };
  },
};
