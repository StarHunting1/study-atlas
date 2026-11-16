# StudyAtlas data collection report

- Run: 2026-11-16T05:43:12.639Z (**live API requests**)
- Compared with the open candidate PR: **10 new change(s)** in this run.
- Collected records are **unverified** candidates. Nothing here changes the published city data until a person reviews and promotes it.

## Sources

| Source | Access | This run | Last success | Records | Domains |
|---|---|---|---|---|---|
| [GOV.UK Content API](https://content-api.publishing.service.gov.uk/) | ✅ implemented (open API) | ok (2) | 2026-11-16T05:43:12.639Z | 2 | `www.gov.uk` |
| [Open Government Canada (CKAN API)](https://open.canada.ca/en/access-our-application-programming-interface-api) | ✅ implemented (open API) | ok (2) | 2026-11-16T05:43:12.639Z | 2 | `open.canada.ca` |
| [Statistics Canada WDS – CMHC average rents (table 34-10-0133-01)](https://www.statcan.gc.ca/en/developers/wds) | ✅ implemented (open API) | ok (8) | 2026-11-16T05:43:12.639Z | 8 | `www150.statcan.gc.ca` |
| [ECCC MSC GeoMet OGC API (climate normals)](https://api.weather.gc.ca/collections/climate-normals) | ✅ implemented (open API) | skipped: not due (checked every 180 days; due in 148 day(s)) | 2026-10-14T09:13:56.486Z | 4 | `api.weather.gc.ca` |
| [Met Office historical monthly station data (data.gov.uk)](https://www.data.gov.uk/dataset/17ba3bbe-0e98-4a8c-9937-bd1d50fdc3c5) | ✅ implemented (open API) | skipped: blocked by the rights review: data.gov.uk lists this dataset (publisher: Met Office) under the UK Open Government Licence, and the Met Office website terms license site content under OGL v3.0 with the attribution above. The same terms say that, “save for any APIs that we provide or expressly authorise”, no robot, spider, deep-link or page-scrape may be used to monitor or copy site content. The Ringway file is a static historical file (the station closed in 2004), so the scheduled automatic re-download is switched off: the recorded values are shown with attribution, nothing is requested again. A person can re-read the file when needed. | 2026-10-14T12:24:54.854Z | 3 | `www.metoffice.gov.uk` |
| [ONS Price Index of Private Rents (PIPR) – average monthly rent: Manchester (local authority) and London (region)](https://developer.ons.gov.uk/bots/) | ✅ implemented (open API) | ok (2) | 2026-11-16T05:43:12.639Z | 2 | `www.ons.gov.uk` |
| [Transport for Greater Manchester (Bee Network) – Bus tickets and student tickets (page check)](https://tfgm.com/tickets-and-passes/bus-tickets) | 🔎 page check (no API; robots.txt respected) | ok (9) | 2026-11-16T05:43:12.639Z | 9 | `tfgm.com` |
| [TransLink – Pricing and Fare Zones (page check)](https://www.translink.ca/transit-fares/pricing-and-fare-zones) | 🔎 page check (no API; robots.txt respected) | skipped: blocked by the rights review: The website terms name “information in all forms” as the exclusive property of TransLink: the website and its content “may not be copied, imitated, reproduced, republished, uploaded, posted, transmitted, modified or distributed in any way, in whole or in part, without the express prior written consent of TransLink”, and information may be copied “for personal, non-commercial use” only. Whether a single fare figure falls under this is a legal question. Until TransLink consents or a professional confirms that bare fares may be shown, StudyAtlas keeps the recorded figures in its data but does not display or collect them: the Vancouver transport card links to TransLink's official pages. (TransLink's separate Open API / GTFS terms licence only data obtained through an approved API key; fares are not part of it.) Ver.1.6.5 (correction): an Actions probe on 2026-10-19 requested three TransLink pages once each although this record blocks automated requests (robots.txt did not forbid them). That was a mistake: nothing from those pages is used, and the Vancouver guide stays link-only. The pages are not requested again. | 2026-10-14T09:13:56.486Z | 12 | `www.translink.ca` |
| [The University of Manchester – Cost of living (undergraduate) (page check)](https://www.manchester.ac.uk/study/undergraduate/fees-and-funding/cost-of-living/) | 🔎 page check (no API; robots.txt respected) | skipped: not due (checked every 60 days; due in 28 day(s)) | 2026-10-14T09:13:56.486Z | 10 | `www.manchester.ac.uk` |
| [The University of Manchester – University accommodation (page check)](https://www.manchester.ac.uk/study/undergraduate/fees-and-funding/cost-of-living/) | 🔎 page check (no API; robots.txt respected) | skipped: not due (checked every 60 days; due in 28 day(s)) | 2026-10-14T09:13:56.486Z | 5 | `www.manchester.ac.uk` |
| [Australian Bureau of Statistics (ABS) – 2021 Census QuickStats: median weekly rent (Greater Sydney, Greater Melbourne) (page check)](https://www.abs.gov.au/census/find-census-data/quickstats/2021/1GSYD) | 🔎 page check (no API; robots.txt respected) | skipped: not due (checked every 180 days; due in 159 day(s)) | 2026-10-26T04:54:57.263Z | 2 | `www.abs.gov.au` |
| [Met Office Weather DataHub / climate averages](https://datahub.metoffice.gov.uk/) | 🔑 needs key / registration | skipped: not implemented (needs-key) | — | 0 | `data.hub.api.metoffice.gov.uk` `www.metoffice.gov.uk` |
| [TfGM Open Data](https://developer.tfgm.com/) | 🔑 needs key / registration | skipped: not implemented (needs-key) | — | 0 | `api.tfgm.com` |
| [TransLink Open API / GTFS](https://www.translink.ca/about-us/doing-business-with-translink/app-developer-resources) | 🔑 needs key / registration | skipped: not implemented (needs-key) | — | 0 | `api.translink.ca` `gtfs-static.translink.ca` |

## New changes in this run (10)

### ✏️ Changed: Average rent, bachelor units (Vancouver, British Columbia, CMHC)
- id: `statcan-cmhc-rents:vancouver:bachelor` · field: `housing.marketRent.bachelor` · city: vancouver · review: **standard**
- source: https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=3410013301 (API: https://www150.statcan.gc.ca/t1/wds/rest/getDataFromCubePidCoordAndLatestNPeriods)
- retrieved: 2026-11-16T05:43:12.639Z · source updated: 2025-12-17T08:30 · licence: Statistics Canada Open Licence
- evidence (`vector v3822835 (184.3.1.0.0.0.0.0.0.0) refPer 2025-01-01`): “Vancouver, British Columbia; Row and apartment structures of three units and over; Bachelor units; 2025: 1491”
- changed fields: contentHash, value
  - before: 
  - after: 

### ✏️ Changed: Average rent, one bedroom units (Vancouver, British Columbia, CMHC)
- id: `statcan-cmhc-rents:vancouver:1br` · field: `housing.marketRent.1br` · city: vancouver · review: **standard**
- source: https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=3410013301 (API: https://www150.statcan.gc.ca/t1/wds/rest/getDataFromCubePidCoordAndLatestNPeriods)
- retrieved: 2026-11-16T05:43:12.639Z · source updated: 2025-12-17T08:30 · licence: Statistics Canada Open Licence
- evidence (`vector v3822969 (184.3.2.0.0.0.0.0.0.0) refPer 2025-01-01`): “Vancouver, British Columbia; Row and apartment structures of three units and over; One bedroom units; 2025: 1761”
- changed fields: contentHash, value
  - before: 
  - after: 

### ✏️ Changed: Average rent, two bedroom units (Vancouver, British Columbia, CMHC)
- id: `statcan-cmhc-rents:vancouver:2br` · field: `housing.marketRent.2br` · city: vancouver · review: **standard**
- source: https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=3410013301 (API: https://www150.statcan.gc.ca/t1/wds/rest/getDataFromCubePidCoordAndLatestNPeriods)
- retrieved: 2026-11-16T05:43:12.639Z · source updated: 2025-12-17T08:30 · licence: Statistics Canada Open Licence
- evidence (`vector v3823103 (184.3.3.0.0.0.0.0.0.0) refPer 2025-01-01`): “Vancouver, British Columbia; Row and apartment structures of three units and over; Two bedroom units; 2025: 2045”
- changed fields: contentHash, value
  - before: 
  - after: 

### ✏️ Changed: Average rent, three bedroom units (Vancouver, British Columbia, CMHC)
- id: `statcan-cmhc-rents:vancouver:3br` · field: `housing.marketRent.3br` · city: vancouver · review: **standard**
- source: https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=3410013301 (API: https://www150.statcan.gc.ca/t1/wds/rest/getDataFromCubePidCoordAndLatestNPeriods)
- retrieved: 2026-11-16T05:43:12.639Z · source updated: 2025-12-17T08:30 · licence: Statistics Canada Open Licence
- evidence (`vector v3823237 (184.3.4.0.0.0.0.0.0.0) refPer 2025-01-01`): “Vancouver, British Columbia; Row and apartment structures of three units and over; Three bedroom units; 2025: 2294”
- changed fields: contentHash, value
  - before: 
  - after: 

### 🆕 Added: Average rent, bachelor units (Toronto, Ontario, CMHC)
- id: `statcan-cmhc-rents:toronto:bachelor` · field: `housing.marketRent.bachelor` · city: toronto · review: **standard**
- source: https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=3410013301 (API: https://www150.statcan.gc.ca/t1/wds/rest/getDataFromCubePidCoordAndLatestNPeriods)
- retrieved: 2026-11-16T05:43:12.639Z · source updated: 2025-12-17T08:30 · licence: Statistics Canada Open Licence
- evidence (`vector v3822837 (125.3.1.0.0.0.0.0.0.0) refPer 2025-01-01`): “Toronto, Ontario; Row and apartment structures of three units and over; Bachelor units; 2025: 1667”

### 🆕 Added: Average rent, one bedroom units (Toronto, Ontario, CMHC)
- id: `statcan-cmhc-rents:toronto:1br` · field: `housing.marketRent.1br` · city: toronto · review: **standard**
- source: https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=3410013301 (API: https://www150.statcan.gc.ca/t1/wds/rest/getDataFromCubePidCoordAndLatestNPeriods)
- retrieved: 2026-11-16T05:43:12.639Z · source updated: 2025-12-17T08:30 · licence: Statistics Canada Open Licence
- evidence (`vector v3822971 (125.3.2.0.0.0.0.0.0.0) refPer 2025-01-01`): “Toronto, Ontario; Row and apartment structures of three units and over; One bedroom units; 2025: 1807”

### 🆕 Added: Average rent, two bedroom units (Toronto, Ontario, CMHC)
- id: `statcan-cmhc-rents:toronto:2br` · field: `housing.marketRent.2br` · city: toronto · review: **standard**
- source: https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=3410013301 (API: https://www150.statcan.gc.ca/t1/wds/rest/getDataFromCubePidCoordAndLatestNPeriods)
- retrieved: 2026-11-16T05:43:12.639Z · source updated: 2025-12-17T08:30 · licence: Statistics Canada Open Licence
- evidence (`vector v3823105 (125.3.3.0.0.0.0.0.0.0) refPer 2025-01-01`): “Toronto, Ontario; Row and apartment structures of three units and over; Two bedroom units; 2025: 2364”

### 🆕 Added: Average rent, three bedroom units (Toronto, Ontario, CMHC)
- id: `statcan-cmhc-rents:toronto:3br` · field: `housing.marketRent.3br` · city: toronto · review: **standard**
- source: https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=3410013301 (API: https://www150.statcan.gc.ca/t1/wds/rest/getDataFromCubePidCoordAndLatestNPeriods)
- retrieved: 2026-11-16T05:43:12.639Z · source updated: 2025-12-17T08:30 · licence: Statistics Canada Open Licence
- evidence (`vector v3823239 (125.3.4.0.0.0.0.0.0.0) refPer 2025-01-01`): “Toronto, Ontario; Row and apartment structures of three units and over; Three bedroom units; 2025: 2820”

### ✏️ Changed: Average monthly private rent, all dwellings (Manchester, ONS PIPR)
- id: `ons-private-rents:manchester:rental-price` · field: `housing.privateRentAverage` · city: manchester · review: **standard**
- source: https://www.ons.gov.uk/economy/inflationandpriceindices/datasets/priceindexofprivaterentsukmonthlypricestatistics (API: https://www.ons.gov.uk/file?uri=/economy/inflationandpriceindices/datasets/priceindexofprivaterentsukmonthlypricestatistics/21october2026/priceindexofprivaterentsukmonthlypricestatistics.xlsx)
- retrieved: 2026-11-16T05:43:12.639Z · source updated: 2026-10-21 · licence: Open Government Licence v3.0 (ONS website terms)
- evidence (`Table 1 row 34407, column H (Rental price)`): “Manchester E08000003 2026-09-01 Rental price 1380”
- changed fields: contentHash, value, sourceUpdatedAt
  - before: £1,373 per month, mean rent of all privately rented dwellings in Manchester local authority (E08000003), 2026-08; new and existing tenancies. Not university halls or student housing.
  - after: £1,380 per month, mean rent of all privately rented dwellings in Manchester local authority (E08000003), 2026-09; new and existing tenancies. Not university halls or student housing.

### 🆕 Added: Average monthly private rent, all dwellings (London, ONS PIPR)
- id: `ons-private-rents:london:rental-price` · field: `housing.privateRentAverage` · city: london · review: **standard**
- source: https://www.ons.gov.uk/economy/inflationandpriceindices/datasets/priceindexofprivaterentsukmonthlypricestatistics (API: https://www.ons.gov.uk/file?uri=/economy/inflationandpriceindices/datasets/priceindexofprivaterentsukmonthlypricestatistics/21october2026/priceindexofprivaterentsukmonthlypricestatistics.xlsx)
- retrieved: 2026-11-16T05:43:12.639Z · source updated: 2026-10-21 · licence: Open Government Licence v3.0 (ONS website terms)
- evidence (`Table 1 row 1836, column H (Rental price)`): “London E12000007 2026-09-01 Rental price 2338”

## Already proposed in the open candidate PR (12) — not new in this run

Everything the open candidate PR proposes relative to `main`, including the new changes above.

### 🆕 Added: Average monthly private rent, all dwellings (London, ONS PIPR)
- id: `ons-private-rents:london:rental-price` · field: `housing.privateRentAverage` · city: london · review: **standard**
- source: https://www.ons.gov.uk/economy/inflationandpriceindices/datasets/priceindexofprivaterentsukmonthlypricestatistics (API: https://www.ons.gov.uk/file?uri=/economy/inflationandpriceindices/datasets/priceindexofprivaterentsukmonthlypricestatistics/21october2026/priceindexofprivaterentsukmonthlypricestatistics.xlsx)
- retrieved: 2026-11-16T05:43:12.639Z · source updated: 2026-10-21 · licence: Open Government Licence v3.0 (ONS website terms)
- evidence (`Table 1 row 1836, column H (Rental price)`): “London E12000007 2026-09-01 Rental price 2338”

### ✏️ Changed: Average monthly private rent, all dwellings (Manchester, ONS PIPR)
- id: `ons-private-rents:manchester:rental-price` · field: `housing.privateRentAverage` · city: manchester · review: **standard**
- source: https://www.ons.gov.uk/economy/inflationandpriceindices/datasets/priceindexofprivaterentsukmonthlypricestatistics (API: https://www.ons.gov.uk/file?uri=/economy/inflationandpriceindices/datasets/priceindexofprivaterentsukmonthlypricestatistics/21october2026/priceindexofprivaterentsukmonthlypricestatistics.xlsx)
- retrieved: 2026-11-16T05:43:12.639Z · source updated: 2026-10-21 · licence: Open Government Licence v3.0 (ONS website terms)
- evidence (`Table 1 row 34407, column H (Rental price)`): “Manchester E08000003 2026-09-01 Rental price 1380”
- changed fields: contentHash, value, sourceUpdatedAt
  - before: £1,373 per month, mean rent of all privately rented dwellings in Manchester local authority (E08000003), 2026-08; new and existing tenancies. Not university halls or student housing.
  - after: £1,380 per month, mean rent of all privately rented dwellings in Manchester local authority (E08000003), 2026-09; new and existing tenancies. Not university halls or student housing.

### 🆕 Added: Median weekly rent – households that rent (2021 Census, Greater Melbourne) — still on the official page
- id: `page:mel-abs-census-median-weekly-rent` · field: `official.mel-abs-census-median-weekly-rent` · city: melbourne · review: **standard**
- source: https://www.abs.gov.au/census/find-census-data/quickstats/2021/2GMEL (API: https://www.abs.gov.au/census/find-census-data/quickstats/2021/2GMEL)
- retrieved: 2026-10-26T04:54:57.263Z · source updated: not stated · licence: Creative Commons Attribution 4.0 International (ABS website copyright notice)
- evidence (`page text (value-found)`): “Greater Melbourne; Median weekly rent; 2021: 390”

### 🆕 Added: Median weekly rent – households that rent (2021 Census, Greater Sydney) — still on the official page
- id: `page:syd-abs-census-median-weekly-rent` · field: `official.syd-abs-census-median-weekly-rent` · city: sydney · review: **standard**
- source: https://www.abs.gov.au/census/find-census-data/quickstats/2021/1GSYD (API: https://www.abs.gov.au/census/find-census-data/quickstats/2021/1GSYD)
- retrieved: 2026-10-26T04:54:57.263Z · source updated: not stated · licence: Creative Commons Attribution 4.0 International (ABS website copyright notice)
- evidence (`page text (value-found)`): “Greater Sydney; Median weekly rent; 2021: 470”

### 🆕 Added: Average rent, one bedroom units (Toronto, Ontario, CMHC)
- id: `statcan-cmhc-rents:toronto:1br` · field: `housing.marketRent.1br` · city: toronto · review: **standard**
- source: https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=3410013301 (API: https://www150.statcan.gc.ca/t1/wds/rest/getDataFromCubePidCoordAndLatestNPeriods)
- retrieved: 2026-11-16T05:43:12.639Z · source updated: 2025-12-17T08:30 · licence: Statistics Canada Open Licence
- evidence (`vector v3822971 (125.3.2.0.0.0.0.0.0.0) refPer 2025-01-01`): “Toronto, Ontario; Row and apartment structures of three units and over; One bedroom units; 2025: 1807”

### 🆕 Added: Average rent, two bedroom units (Toronto, Ontario, CMHC)
- id: `statcan-cmhc-rents:toronto:2br` · field: `housing.marketRent.2br` · city: toronto · review: **standard**
- source: https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=3410013301 (API: https://www150.statcan.gc.ca/t1/wds/rest/getDataFromCubePidCoordAndLatestNPeriods)
- retrieved: 2026-11-16T05:43:12.639Z · source updated: 2025-12-17T08:30 · licence: Statistics Canada Open Licence
- evidence (`vector v3823105 (125.3.3.0.0.0.0.0.0.0) refPer 2025-01-01`): “Toronto, Ontario; Row and apartment structures of three units and over; Two bedroom units; 2025: 2364”

### 🆕 Added: Average rent, three bedroom units (Toronto, Ontario, CMHC)
- id: `statcan-cmhc-rents:toronto:3br` · field: `housing.marketRent.3br` · city: toronto · review: **standard**
- source: https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=3410013301 (API: https://www150.statcan.gc.ca/t1/wds/rest/getDataFromCubePidCoordAndLatestNPeriods)
- retrieved: 2026-11-16T05:43:12.639Z · source updated: 2025-12-17T08:30 · licence: Statistics Canada Open Licence
- evidence (`vector v3823239 (125.3.4.0.0.0.0.0.0.0) refPer 2025-01-01`): “Toronto, Ontario; Row and apartment structures of three units and over; Three bedroom units; 2025: 2820”

### 🆕 Added: Average rent, bachelor units (Toronto, Ontario, CMHC)
- id: `statcan-cmhc-rents:toronto:bachelor` · field: `housing.marketRent.bachelor` · city: toronto · review: **standard**
- source: https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=3410013301 (API: https://www150.statcan.gc.ca/t1/wds/rest/getDataFromCubePidCoordAndLatestNPeriods)
- retrieved: 2026-11-16T05:43:12.639Z · source updated: 2025-12-17T08:30 · licence: Statistics Canada Open Licence
- evidence (`vector v3822837 (125.3.1.0.0.0.0.0.0.0) refPer 2025-01-01`): “Toronto, Ontario; Row and apartment structures of three units and over; Bachelor units; 2025: 1667”

### ✏️ Changed: Average rent, one bedroom units (Vancouver, British Columbia, CMHC)
- id: `statcan-cmhc-rents:vancouver:1br` · field: `housing.marketRent.1br` · city: vancouver · review: **standard**
- source: https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=3410013301 (API: https://www150.statcan.gc.ca/t1/wds/rest/getDataFromCubePidCoordAndLatestNPeriods)
- retrieved: 2026-11-16T05:43:12.639Z · source updated: 2025-12-17T08:30 · licence: Statistics Canada Open Licence
- evidence (`vector v3822969 (184.3.2.0.0.0.0.0.0.0) refPer 2025-01-01`): “Vancouver, British Columbia; Row and apartment structures of three units and over; One bedroom units; 2025: 1761”
- changed fields: contentHash, value
  - before: 
  - after: 

### ✏️ Changed: Average rent, two bedroom units (Vancouver, British Columbia, CMHC)
- id: `statcan-cmhc-rents:vancouver:2br` · field: `housing.marketRent.2br` · city: vancouver · review: **standard**
- source: https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=3410013301 (API: https://www150.statcan.gc.ca/t1/wds/rest/getDataFromCubePidCoordAndLatestNPeriods)
- retrieved: 2026-11-16T05:43:12.639Z · source updated: 2025-12-17T08:30 · licence: Statistics Canada Open Licence
- evidence (`vector v3823103 (184.3.3.0.0.0.0.0.0.0) refPer 2025-01-01`): “Vancouver, British Columbia; Row and apartment structures of three units and over; Two bedroom units; 2025: 2045”
- changed fields: contentHash, value
  - before: 
  - after: 

### ✏️ Changed: Average rent, three bedroom units (Vancouver, British Columbia, CMHC)
- id: `statcan-cmhc-rents:vancouver:3br` · field: `housing.marketRent.3br` · city: vancouver · review: **standard**
- source: https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=3410013301 (API: https://www150.statcan.gc.ca/t1/wds/rest/getDataFromCubePidCoordAndLatestNPeriods)
- retrieved: 2026-11-16T05:43:12.639Z · source updated: 2025-12-17T08:30 · licence: Statistics Canada Open Licence
- evidence (`vector v3823237 (184.3.4.0.0.0.0.0.0.0) refPer 2025-01-01`): “Vancouver, British Columbia; Row and apartment structures of three units and over; Three bedroom units; 2025: 2294”
- changed fields: contentHash, value
  - before: 
  - after: 

### ✏️ Changed: Average rent, bachelor units (Vancouver, British Columbia, CMHC)
- id: `statcan-cmhc-rents:vancouver:bachelor` · field: `housing.marketRent.bachelor` · city: vancouver · review: **standard**
- source: https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=3410013301 (API: https://www150.statcan.gc.ca/t1/wds/rest/getDataFromCubePidCoordAndLatestNPeriods)
- retrieved: 2026-11-16T05:43:12.639Z · source updated: 2025-12-17T08:30 · licence: Statistics Canada Open Licence
- evidence (`vector v3822835 (184.3.1.0.0.0.0.0.0.0) refPer 2025-01-01`): “Vancouver, British Columbia; Row and apartment structures of three units and over; Bachelor units; 2025: 1491”
- changed fields: contentHash, value
  - before: 
  - after: 

## Published official data vs. API values

⚠️ 10 of 17 published figure(s) do not match the latest API value — update `data/official/*` in a reviewed PR:

- `man-ons-pipr-private-rent-month` ← `ons-private-rents:manchester:rental-price`: differs — site 1373 (2026-08 (August 2026; ONS Price Index of Private Rents, published 16 September 2026)) vs API 1380 (2026-09)
- `van-cmhc-rent-bachelor` ← `statcan-cmhc-rents:vancouver:bachelor`: differs — site 1667 (2025 (latest reference year; released by Statistics Canada 2025-12-17)) vs API 1491 (2025)
- `van-cmhc-rent-1br` ← `statcan-cmhc-rents:vancouver:1br`: differs — site 1807 (2025 (latest reference year; released by Statistics Canada 2025-12-17)) vs API 1761 (2025)
- `van-cmhc-rent-2br` ← `statcan-cmhc-rents:vancouver:2br`: differs — site 2364 (2025 (latest reference year; released by Statistics Canada 2025-12-17)) vs API 2045 (2025)
- `van-cmhc-rent-3br` ← `statcan-cmhc-rents:vancouver:3br`: differs — site 2820 (2025 (latest reference year; released by Statistics Canada 2025-12-17)) vs API 2294 (2025)
- `tor-cmhc-rent-bachelor` ← `statcan-cmhc-rents:toronto:bachelor`: differs — site 1491 (2025 (latest reference year; released by Statistics Canada 2025-12-17)) vs API 1667 (2025)
- `tor-cmhc-rent-1br` ← `statcan-cmhc-rents:toronto:1br`: differs — site 1761 (2025 (latest reference year; released by Statistics Canada 2025-12-17)) vs API 1807 (2025)
- `tor-cmhc-rent-2br` ← `statcan-cmhc-rents:toronto:2br`: differs — site 2045 (2025 (latest reference year; released by Statistics Canada 2025-12-17)) vs API 2364 (2025)
- `tor-cmhc-rent-3br` ← `statcan-cmhc-rents:toronto:3br`: differs — site 2294 (2025 (latest reference year; released by Statistics Canada 2025-12-17)) vs API 2820 (2025)
- `lon-ons-pipr-private-rent-region-month` ← `ons-private-rents:london:rental-price`: differs — site 2332 (2026-08 (August 2026; ONS Price Index of Private Rents, published 16 September 2026)) vs API 2338 (2026-09)

## Review queue

2 record(s) need human approval before any use (visa / healthcare / work).

## Review checklist

- [ ] Open each source link and confirm the value, the people it applies to and the period
- [ ] Confirm the licence allows reuse with attribution
- [ ] Visa / healthcare / work items: approved by a person (not by AI)
- [ ] Promote confirmed values into `data/profiles/*` with `status: "verified"`, sources, period and checkedAt
