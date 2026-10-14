# StudyAtlas data collection report

- Run: 2026-10-14T15:27:40.929Z (**live API requests**)
- Compared with `main` (accepted snapshot): **1 new change(s)** in this run.
- Collected records are **unverified** candidates. Nothing here changes the published city data until a person reviews and promotes it.

## Sources

| Source | Access | This run | Last success | Records | Domains |
|---|---|---|---|---|---|
| [GOV.UK Content API](https://content-api.publishing.service.gov.uk/) | ✅ implemented (open API) | ok (2) | 2026-10-14T15:27:40.929Z | 2 | `www.gov.uk` |
| [Open Government Canada (CKAN API)](https://open.canada.ca/en/access-our-application-programming-interface-api) | ✅ implemented (open API) | ok (2) | 2026-10-14T15:27:40.929Z | 2 | `open.canada.ca` |
| [Statistics Canada WDS – CMHC average rents (table 34-10-0133-01)](https://www.statcan.gc.ca/en/developers/wds) | ✅ implemented (open API) | skipped: not due (checked every 30 days; due in 30 day(s)) | 2026-10-14T09:13:56.486Z | 4 | `www150.statcan.gc.ca` |
| [ECCC MSC GeoMet OGC API (climate normals)](https://api.weather.gc.ca/collections/climate-normals) | ✅ implemented (open API) | skipped: not due (checked every 180 days; due in 180 day(s)) | 2026-10-14T09:13:56.486Z | 4 | `api.weather.gc.ca` |
| [Met Office historical monthly station data (data.gov.uk)](https://www.data.gov.uk/dataset/17ba3bbe-0e98-4a8c-9937-bd1d50fdc3c5) | ✅ implemented (open API) | skipped: blocked by the rights review: data.gov.uk lists this dataset (publisher: Met Office) under the UK Open Government Licence, and the Met Office website terms license site content under OGL v3.0 with the attribution above. The same terms say that, “save for any APIs that we provide or expressly authorise”, no robot, spider, deep-link or page-scrape may be used to monitor or copy site content. The Ringway file is a static historical file (the station closed in 2004), so the scheduled automatic re-download is switched off: the recorded values are shown with attribution, nothing is requested again. A person can re-read the file when needed. | 2026-10-14T12:24:54.854Z | 3 | `www.metoffice.gov.uk` |
| [ONS Price Index of Private Rents (PIPR) – Manchester average monthly rent](https://developer.ons.gov.uk/bots/) | ✅ implemented (open API) | ok (1) | 2026-10-14T15:27:40.929Z | 1 | `www.ons.gov.uk` |
| [Transport for Greater Manchester (Bee Network) – Bus tickets and student tickets (page check)](https://tfgm.com/tickets-and-passes/bus-tickets) | 🔎 page check (no API; robots.txt respected) | skipped: not due (checked every 30 days; due in 30 day(s)) | 2026-10-14T09:13:56.486Z | 9 | `tfgm.com` |
| [TransLink – Pricing and Fare Zones (page check)](https://www.translink.ca/transit-fares/pricing-and-fare-zones) | 🔎 page check (no API; robots.txt respected) | skipped: blocked by the rights review: The website terms name “information in all forms” as the exclusive property of TransLink: the website and its content “may not be copied, imitated, reproduced, republished, uploaded, posted, transmitted, modified or distributed in any way, in whole or in part, without the express prior written consent of TransLink”, and information may be copied “for personal, non-commercial use” only. Whether a single fare figure falls under this is a legal question. Until TransLink consents or a professional confirms that bare fares may be shown, StudyAtlas keeps the recorded figures in its data but does not display or collect them: the Vancouver transport card links to TransLink's official pages. (TransLink's separate Open API / GTFS terms licence only data obtained through an approved API key; fares are not part of it.) | 2026-10-14T09:13:56.486Z | 12 | `www.translink.ca` |
| [The University of Manchester – Cost of living (undergraduate) (page check)](https://www.manchester.ac.uk/study/undergraduate/fees-and-funding/cost-of-living/) | 🔎 page check (no API; robots.txt respected) | skipped: not due (checked every 60 days; due in 60 day(s)) | 2026-10-14T09:13:56.486Z | 10 | `www.manchester.ac.uk` |
| [The University of Manchester – University accommodation (page check)](https://www.manchester.ac.uk/study/undergraduate/fees-and-funding/cost-of-living/) | 🔎 page check (no API; robots.txt respected) | skipped: not due (checked every 60 days; due in 60 day(s)) | 2026-10-14T09:13:56.486Z | 5 | `www.manchester.ac.uk` |
| [Met Office Weather DataHub / climate averages](https://datahub.metoffice.gov.uk/) | 🔑 needs key / registration | skipped: not implemented (needs-key) | — | 0 | `data.hub.api.metoffice.gov.uk` `www.metoffice.gov.uk` |
| [TfGM Open Data](https://developer.tfgm.com/) | 🔑 needs key / registration | skipped: not implemented (needs-key) | — | 0 | `api.tfgm.com` |
| [TransLink Open API / GTFS](https://www.translink.ca/about-us/doing-business-with-translink/app-developer-resources) | 🔑 needs key / registration | skipped: not implemented (needs-key) | — | 0 | `api.translink.ca` `gtfs-static.translink.ca` |

## New changes in this run (1)

### 🆕 Added: Average monthly private rent, all dwellings (Manchester, ONS PIPR)
- id: `ons-private-rents:manchester:rental-price` · field: `housing.privateRentAverage` · city: manchester · review: **standard**
- source: https://www.ons.gov.uk/economy/inflationandpriceindices/datasets/priceindexofprivaterentsukmonthlypricestatistics (API: https://www.ons.gov.uk/file?uri=/economy/inflationandpriceindices/datasets/priceindexofprivaterentsukmonthlypricestatistics/16september2026/priceindexofprivaterentsukmonthlypricestatistics.xlsx)
- retrieved: 2026-10-14T15:27:40.929Z · source updated: 2026-09-16 · licence: Open Government Licence v3.0 (ONS website terms)
- evidence (`Table 1 row 34163, column H (Rental price)`): “Manchester E08000003 2026-08-01 Rental price 1373”

## Published official data vs. API values

All 11 published figure(s) backed by an API match the latest API value.

## Review queue

2 record(s) need human approval before any use (visa / healthcare / work).

## Review checklist

- [ ] Open each source link and confirm the value, the people it applies to and the period
- [ ] Confirm the licence allows reuse with attribution
- [ ] Visa / healthcare / work items: approved by a person (not by AI)
- [ ] Promote confirmed values into `data/profiles/*` with `status: "verified"`, sources, period and checkedAt
