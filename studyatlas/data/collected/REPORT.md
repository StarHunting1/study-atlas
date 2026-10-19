# StudyAtlas data collection report

- Run: 2026-10-19T17:50:48.564Z (**live API requests**)
- Compared with `main` (accepted snapshot): **2 new change(s)** in this run.
- Collected records are **unverified** candidates. Nothing here changes the published city data until a person reviews and promotes it.

## Sources

| Source | Access | This run | Last success | Records | Domains |
|---|---|---|---|---|---|
| [GOV.UK Content API](https://content-api.publishing.service.gov.uk/) | ✅ implemented (open API) | ok (2) | 2026-10-19T17:50:48.564Z | 2 | `www.gov.uk` |
| [Open Government Canada (CKAN API)](https://open.canada.ca/en/access-our-application-programming-interface-api) | ✅ implemented (open API) | ok (2) | 2026-10-19T17:50:48.564Z | 2 | `open.canada.ca` |
| [Statistics Canada WDS – CMHC average rents (table 34-10-0133-01)](https://www.statcan.gc.ca/en/developers/wds) | ✅ implemented (open API) | skipped: not due (checked every 30 days; due in 25 day(s)) | 2026-10-14T09:13:56.486Z | 4 | `www150.statcan.gc.ca` |
| [ECCC MSC GeoMet OGC API (climate normals)](https://api.weather.gc.ca/collections/climate-normals) | ✅ implemented (open API) | skipped: not due (checked every 180 days; due in 175 day(s)) | 2026-10-14T09:13:56.486Z | 4 | `api.weather.gc.ca` |
| [Met Office historical monthly station data (data.gov.uk)](https://www.data.gov.uk/dataset/17ba3bbe-0e98-4a8c-9937-bd1d50fdc3c5) | ✅ implemented (open API) | skipped: blocked by the rights review: data.gov.uk lists this dataset (publisher: Met Office) under the UK Open Government Licence, and the Met Office website terms license site content under OGL v3.0 with the attribution above. The same terms say that, “save for any APIs that we provide or expressly authorise”, no robot, spider, deep-link or page-scrape may be used to monitor or copy site content. The Ringway file is a static historical file (the station closed in 2004), so the scheduled automatic re-download is switched off: the recorded values are shown with attribution, nothing is requested again. A person can re-read the file when needed. | 2026-10-14T12:24:54.854Z | 3 | `www.metoffice.gov.uk` |
| [ONS Price Index of Private Rents (PIPR) – average monthly rent: Manchester (local authority) and London (region)](https://developer.ons.gov.uk/bots/) | ✅ implemented (open API) | skipped: not due (checked every 30 days; due in 25 day(s)) | 2026-10-14T15:27:40.929Z | 1 | `www.ons.gov.uk` |
| [Transport for Greater Manchester (Bee Network) – Bus tickets and student tickets (page check)](https://tfgm.com/tickets-and-passes/bus-tickets) | 🔎 page check (no API; robots.txt respected) | skipped: not due (checked every 30 days; due in 25 day(s)) | 2026-10-14T09:13:56.486Z | 9 | `tfgm.com` |
| [TransLink – Pricing and Fare Zones (page check)](https://www.translink.ca/transit-fares/pricing-and-fare-zones) | 🔎 page check (no API; robots.txt respected) | skipped: blocked by the rights review: The website terms name “information in all forms” as the exclusive property of TransLink: the website and its content “may not be copied, imitated, reproduced, republished, uploaded, posted, transmitted, modified or distributed in any way, in whole or in part, without the express prior written consent of TransLink”, and information may be copied “for personal, non-commercial use” only. Whether a single fare figure falls under this is a legal question. Until TransLink consents or a professional confirms that bare fares may be shown, StudyAtlas keeps the recorded figures in its data but does not display or collect them: the Vancouver transport card links to TransLink's official pages. (TransLink's separate Open API / GTFS terms licence only data obtained through an approved API key; fares are not part of it.) | 2026-10-14T09:13:56.486Z | 12 | `www.translink.ca` |
| [The University of Manchester – Cost of living (undergraduate) (page check)](https://www.manchester.ac.uk/study/undergraduate/fees-and-funding/cost-of-living/) | 🔎 page check (no API; robots.txt respected) | skipped: not due (checked every 60 days; due in 55 day(s)) | 2026-10-14T09:13:56.486Z | 10 | `www.manchester.ac.uk` |
| [The University of Manchester – University accommodation (page check)](https://www.manchester.ac.uk/study/undergraduate/fees-and-funding/cost-of-living/) | 🔎 page check (no API; robots.txt respected) | skipped: not due (checked every 60 days; due in 55 day(s)) | 2026-10-14T09:13:56.486Z | 5 | `www.manchester.ac.uk` |
| [Australian Bureau of Statistics (ABS) – 2021 Census QuickStats: median weekly rent (Greater Sydney, Greater Melbourne) (page check)](https://www.abs.gov.au/census/find-census-data/quickstats/2021/1GSYD) | 🔎 page check (no API; robots.txt respected) | ok (2) | 2026-10-19T17:50:48.564Z | 2 | `www.abs.gov.au` |
| [Met Office Weather DataHub / climate averages](https://datahub.metoffice.gov.uk/) | 🔑 needs key / registration | skipped: not implemented (needs-key) | — | 0 | `data.hub.api.metoffice.gov.uk` `www.metoffice.gov.uk` |
| [TfGM Open Data](https://developer.tfgm.com/) | 🔑 needs key / registration | skipped: not implemented (needs-key) | — | 0 | `api.tfgm.com` |
| [TransLink Open API / GTFS](https://www.translink.ca/about-us/doing-business-with-translink/app-developer-resources) | 🔑 needs key / registration | skipped: not implemented (needs-key) | — | 0 | `api.translink.ca` `gtfs-static.translink.ca` |

## New changes in this run (2)

### 🆕 Added: Median weekly rent – households that rent (2021 Census, Greater Sydney) — still on the official page
- id: `page:syd-abs-census-median-weekly-rent` · field: `official.syd-abs-census-median-weekly-rent` · city: sydney · review: **standard**
- source: https://www.abs.gov.au/census/find-census-data/quickstats/2021/1GSYD (API: https://www.abs.gov.au/census/find-census-data/quickstats/2021/1GSYD)
- retrieved: 2026-10-19T17:50:48.564Z · source updated: not stated · licence: Creative Commons Attribution 4.0 International (ABS website copyright notice)
- evidence (`page text (value-found)`): “Greater Sydney; Median weekly rent; 2021: 470”

### 🆕 Added: Median weekly rent – households that rent (2021 Census, Greater Melbourne) — still on the official page
- id: `page:mel-abs-census-median-weekly-rent` · field: `official.mel-abs-census-median-weekly-rent` · city: melbourne · review: **standard**
- source: https://www.abs.gov.au/census/find-census-data/quickstats/2021/2GMEL (API: https://www.abs.gov.au/census/find-census-data/quickstats/2021/2GMEL)
- retrieved: 2026-10-19T17:50:48.564Z · source updated: not stated · licence: Creative Commons Attribution 4.0 International (ABS website copyright notice)
- evidence (`page text (value-found)`): “Greater Melbourne; Median weekly rent; 2021: 390”

## Published official data vs. API values

⚠️ 5 of 17 published figure(s) do not match the latest API value — update `data/official/*` in a reviewed PR:

- `tor-cmhc-rent-bachelor` ← `statcan-cmhc-rents:toronto:bachelor`: not-collected
- `tor-cmhc-rent-1br` ← `statcan-cmhc-rents:toronto:1br`: not-collected
- `tor-cmhc-rent-2br` ← `statcan-cmhc-rents:toronto:2br`: not-collected
- `tor-cmhc-rent-3br` ← `statcan-cmhc-rents:toronto:3br`: not-collected
- `lon-ons-pipr-private-rent-region-month` ← `ons-private-rents:london:rental-price`: not-collected

## Review queue

2 record(s) need human approval before any use (visa / healthcare / work).

## Review checklist

- [ ] Open each source link and confirm the value, the people it applies to and the period
- [ ] Confirm the licence allows reuse with attribution
- [ ] Visa / healthcare / work items: approved by a person (not by AI)
- [ ] Promote confirmed values into `data/profiles/*` with `status: "verified"`, sources, period and checkedAt
