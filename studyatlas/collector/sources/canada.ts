import type { CollectedRecord, Fetched, Source } from "../types";
import { sha256 } from "../util";
/*
 * Open Government Canada (CKAN Action API): https://open.canada.ca/data/api/action/package_show  (JSON, no key).
 * Docs: https://open.canada.ca/en/access-our-application-programming-interface-api
 * Collects dataset metadata (title, publisher, dates, licence, resources) — the datasets that later
 * Vancouver figures will be read from. No figures are inferred from metadata.
 */
/*
 * Datasets are pinned by id. Keyword search (package_search) returned unrelated datasets in the first live run
 * (2026-10-13, e.g. trade news items for "rental market Vancouver"), which would create noisy change candidates.
 * The ids below were returned by that live run; add more after checking them on open.canada.ca.
 */
type Dataset = { id: string; field: string; cityId?: string; label: { en: string; ja: string } };
export const CANADA_DATASETS: Dataset[] = [
  { id: "c2a1fdbf-d9b7-4c84-b7eb-c845b6ffd5e6", field: "dataset.housing", label: { en: "Housing data (CMHC portal, covers Vancouver)", ja: "住宅データ（CMHCポータル、バンクーバーを含む）" } },
  { id: "51dbf91e-509c-437b-ab9e-eca6d0bf6fa8", field: "dataset.climate", label: { en: "Climate data products (ECCC)", ja: "気候データ製品（カナダ環境・気候変動省）" } },
];
type Pkg = {
  id: string; name: string; title: string; title_translated?: { en?: string; fr?: string };
  organization?: { title?: string }; metadata_created?: string; metadata_modified?: string;
  license_id?: string; license_title?: string; license_url?: string; resources?: { format?: string; last_modified?: string | null; url?: string }[];
};

/** Ver.1.2.1: only datasets that CKAN itself marks as Open Government Licence - Canada are collected; any other (or missing) licence pauses collection of that dataset only. */
export const OGL_CANADA_ID = "ca-ogl-lgo";
export const datasetLicenceOk = (p: Pick<Pkg, "license_id" | "license_title">) =>
  p.license_id === OGL_CANADA_ID || (!p.license_id && /^Open Government Licence\s*[-–]\s*Canada$/i.test((p.license_title ?? "").trim()));

export const canada: Source = {
  id: "canada-open-gov", name: "Open Government Canada (CKAN API)", country: "CAN", access: "implemented",
  docs: "https://open.canada.ca/en/access-our-application-programming-interface-api", licence: "Open Government Licence – Canada, checked per dataset (a dataset under any other licence is not collected)",
  domains: ["open.canada.ca"], topics: ["housing", "climate"],
  note: "Public CKAN API, no key. Dataset metadata only in Ver.1.0.",
  async fetch(ctx): Promise<Fetched> {
    const records: CollectedRecord[] = []; const errors: string[] = [];
    const failedIds: string[] = [];
    for (const d of CANADA_DATASETS) {
      const apiUrl = `https://open.canada.ca/data/api/action/package_show?id=${d.id}`;
      try {
        const res = (await ctx.fetchJson(apiUrl)) as { success?: boolean; result?: Pkg };
        const p = res?.result;
        if (!res?.success || !p?.id || !p.title) throw new Error("unexpected response shape");
        if (!datasetLicenceOk(p)) { errors.push(`${d.id}: licence "${p.license_id ?? p.license_title ?? "none"}" is not Open Government Licence - Canada; paused until reviewed`); continue; }
        const title = p.title_translated?.en ?? p.title;
        const formats = [...new Set((p.resources ?? []).map((r) => (r.format ?? "").toUpperCase()).filter(Boolean))];
        records.push({
          id: `canada-open-gov:${p.id}`, sourceId: "canada-open-gov", country: "CAN", cityId: d.cityId, field: d.field,
          label: { en: `${d.label.en}: ${title}`, ja: `${d.label.ja}：${title}` },
          value: { text: [title, p.organization?.title, formats.length ? `formats: ${formats.join(", ")}` : ""].filter(Boolean).join(" — ") },
          sourceUrl: `https://open.canada.ca/data/en/dataset/${p.id}`, apiUrl, retrievedAt: ctx.now,
          sourcePublishedAt: p.metadata_created, sourceUpdatedAt: p.metadata_modified,
          evidence: { path: "result.title", quote: title },
          contentHash: sha256(JSON.stringify([title, p.metadata_modified, p.license_title, (p.resources ?? []).map((r) => [r.url, r.last_modified])])),
          licence: p.license_title, status: "unverified", review: "standard",
        });
      } catch (e) { errors.push(`${d.id}: ${(e as Error).message}`); failedIds.push(`canada-open-gov:${d.id}`); }
    }
    if (!records.length) throw new Error(errors.join("; ") || "no datasets returned");
    if (errors.length) console.warn(`[canada-open-gov] partial: ${errors.join("; ")}`);
    return { records, texts: {}, failedIds };
  },
};
