import type { Rights } from "./rights";
// Work in progress (Ver.1.2): provisional records, refined once the terms-probe detail output has been read.
const D = "2026-10-14";
export const RIGHTS: Record<string, Rights> = {
  "tfgm-fares": { sourceName: "Transport for Greater Manchester (Bee Network)", sourceUrl: "https://tfgm.com/tickets-and-passes/bus-tickets", licenseUrl: "https://tfgm.com/disclaimer", reuseStatus: "needs-review", accessMethod: "page-check", automation: "page-check-only", lastReviewedAt: D,
    reviewNotes: { en: "Provisional.", ja: "暫定。" }, reviewed: [{ url: "https://tfgm.com/disclaimer", reviewedAt: D, scope: "disclaimer page" }], restrictions: [], expertReview: true },
  "translink-fares": { sourceName: "TransLink", sourceUrl: "https://www.translink.ca/transit-fares/pricing-and-fare-zones", licenseUrl: "https://www.translink.ca/terms-and-conditions", reuseStatus: "restricted", accessMethod: "manual-link", automation: "blocked", lastReviewedAt: D,
    reviewNotes: { en: "Provisional.", ja: "暫定。" }, reviewed: [{ url: "https://www.translink.ca/terms-and-conditions", reviewedAt: D, scope: "website terms, copyright clause" }], restrictions: ["no-reproduction-without-consent"], expertReview: true },
  "uom-cost-of-living": { sourceName: "The University of Manchester", sourceUrl: "https://www.manchester.ac.uk/study/undergraduate/fees-and-funding/cost-of-living/", licenseUrl: "https://www.manchester.ac.uk/copyright/", reuseStatus: "needs-review", accessMethod: "page-check", automation: "page-check-only", lastReviewedAt: D,
    reviewNotes: { en: "Provisional.", ja: "暫定。" }, reviewed: [{ url: "https://www.manchester.ac.uk/copyright/", reviewedAt: D, scope: "copyright notice" }], restrictions: ["no-reproduction-without-consent"], expertReview: true },
  "uom-accommodation": { sourceName: "The University of Manchester", sourceUrl: "https://www.manchester.ac.uk/study/international/accommodation/", licenseUrl: "https://www.manchester.ac.uk/copyright/", reuseStatus: "needs-review", accessMethod: "page-check", automation: "page-check-only", lastReviewedAt: D,
    reviewNotes: { en: "Provisional.", ja: "暫定。" }, reviewed: [{ url: "https://www.manchester.ac.uk/copyright/", reviewedAt: D, scope: "copyright notice" }], restrictions: ["no-reproduction-without-consent"], expertReview: true },
  "statcan-cmhc-rents": { sourceName: "Statistics Canada / CMHC", sourceUrl: "https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=3410013301", licenseUrl: "https://www.cmhc-schl.gc.ca/about-us/terms-conditions/hmip-terms-conditions", reuseStatus: "permitted", accessMethod: "open-api", automation: "allowed", lastReviewedAt: D,
    reviewNotes: { en: "Provisional.", ja: "暫定。" }, reviewed: [], restrictions: ["attribution-required", "crawl-delay"], expertReview: false },
  "eccc-climate-normals": { sourceName: "Environment and Climate Change Canada", sourceUrl: "https://api.weather.gc.ca/", licenseUrl: "https://eccc-msc.github.io/open-data/licence/readme_en/", reuseStatus: "permitted", accessMethod: "open-api", automation: "blocked", lastReviewedAt: D,
    reviewNotes: { en: "Provisional.", ja: "暫定。" }, reviewed: [], restrictions: ["attribution-required", "robots-disallows-api-path"], expertReview: false },
  "metoffice-station-data": { sourceName: "Met Office", sourceUrl: "https://www.metoffice.gov.uk/pub/data/weather/uk/climate/stationdata/ringwaydata.txt", licenseUrl: "https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/", reuseStatus: "permitted", accessMethod: "open-data-file", automation: "allowed", lastReviewedAt: D,
    reviewNotes: { en: "Provisional.", ja: "暫定。" }, reviewed: [], restrictions: ["attribution-required"], expertReview: false },
  "ubc-housing-fees": { sourceName: "UBC Student Housing and Community Services", sourceUrl: "https://vancouver.housing.ubc.ca/applications/fees-payments/", licenseUrl: "https://www.ubc.ca/site/legal.html", reuseStatus: "restricted", accessMethod: "manual-link", automation: "blocked", lastReviewedAt: D,
    reviewNotes: { en: "Provisional.", ja: "暫定。" }, reviewed: [{ url: "https://www.ubc.ca/site/legal.html", reviewedAt: D, scope: "terms of use" }], restrictions: ["personal-noncommercial-extracts-only", "no-reproduction-without-consent"], expertReview: true },
  "govuk-content": { sourceName: "GOV.UK", sourceUrl: "https://www.gov.uk/", licenseUrl: "https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/", reuseStatus: "unknown", accessMethod: "open-api", automation: "allowed", lastReviewedAt: null,
    reviewNotes: { en: "Not reviewed yet.", ja: "未確認。" }, reviewed: [], restrictions: [], expertReview: false },
  "canada-open-gov": { sourceName: "Open Government Canada", sourceUrl: "https://open.canada.ca/", licenseUrl: null, reuseStatus: "unknown", accessMethod: "open-api", automation: "allowed", lastReviewedAt: null,
    reviewNotes: { en: "Not reviewed yet.", ja: "未確認。" }, reviewed: [], restrictions: [], expertReview: false },
};
