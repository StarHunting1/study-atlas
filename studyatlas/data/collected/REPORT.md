# StudyAtlas data collection report

- Run: 2026-10-13T18:21:23.850Z (**live API requests**)
- Collected records are **unverified** candidates. Nothing here changes the published city data until a person reviews and promotes it.

## Sources

| Source | Access | This run | Last success | Records | Domains |
|---|---|---|---|---|---|
| [GOV.UK Content API](https://content-api.publishing.service.gov.uk/) | ✅ implemented (open API) | ok (2) | 2026-10-13T18:21:23.850Z | 2 | `www.gov.uk` |
| [Open Government Canada (CKAN API)](https://open.canada.ca/en/access-our-application-programming-interface-api) | ✅ implemented (open API) | ok (2) | 2026-10-13T18:21:23.850Z | 2 | `open.canada.ca` |
| [ONS API (UK official statistics)](https://developer.ons.gov.uk/) | 🟡 open API – planned | skipped: not implemented (open-api-planned) | — | 0 | `api.beta.ons.gov.uk` |
| [Met Office Weather DataHub / climate averages](https://datahub.metoffice.gov.uk/) | 🔑 needs key / registration | skipped: not implemented (needs-key) | — | 0 | `data.hub.api.metoffice.gov.uk` `www.metoffice.gov.uk` |
| [TfGM Open Data](https://developer.tfgm.com/) | 🔑 needs key / registration | skipped: not implemented (needs-key) | — | 0 | `api.tfgm.com` |
| [ECCC MSC GeoMet OGC API (climate normals)](https://api.weather.gc.ca/) | 🟡 open API – planned | skipped: not implemented (open-api-planned) | — | 0 | `api.weather.gc.ca` |
| [CMHC Housing Market Information Portal](https://www.cmhc-schl.gc.ca/) | ⚖️ terms review needed | skipped: not implemented (needs-terms-review) | — | 0 | `www.cmhc-schl.gc.ca` |
| [TransLink Open API / GTFS](https://www.translink.ca/about-us/doing-business-with-translink/app-developer-resources) | 🔑 needs key / registration | skipped: not implemented (needs-key) | — | 0 | `api.translink.ca` `gtfs-static.translink.ca` |

## Changes (4)

### 🆕 Added: Student visa (GOV.UK)
- id: `govuk-content:/student-visa` · field: `visa.official` · review: **human approval required**
- source: https://www.gov.uk/student-visa (API: https://www.gov.uk/api/content/student-visa)
- retrieved: 2026-10-13T18:21:23.850Z · source updated: 2024-10-31T17:00:02+00:00 · licence: Open Government Licence v3.0 (GOV.UK default; confirm per page)
- evidence (`description`): “Apply for a Student visa to study in the UK if you're 16 or over - eligibility, extend or switch your visa, how much it costs and how long it takes”

### 🆕 Added: Immigration Health Surcharge (GOV.UK)
- id: `govuk-content:/healthcare-immigration-application` · field: `living.healthcare` · review: **human approval required**
- source: https://www.gov.uk/healthcare-immigration-application (API: https://www.gov.uk/api/content/healthcare-immigration-application)
- retrieved: 2026-10-13T18:21:23.850Z · source updated: 2024-11-28T10:11:14+00:00 · licence: Open Government Licence v3.0 (GOV.UK default; confirm per page)
- evidence (`description`): “Find out if you need to pay the immigration health surcharge as part of your visa or immigration application.”

### 🆕 Added: Housing data (CMHC portal, covers Vancouver): Housing Market Information Portal
- id: `canada-open-gov:c2a1fdbf-d9b7-4c84-b7eb-c845b6ffd5e6` · field: `dataset.housing` · review: **standard**
- source: https://open.canada.ca/data/en/dataset/c2a1fdbf-d9b7-4c84-b7eb-c845b6ffd5e6 (API: https://open.canada.ca/data/api/action/package_show?id=c2a1fdbf-d9b7-4c84-b7eb-c845b6ffd5e6)
- retrieved: 2026-10-13T18:21:23.850Z · source updated: 2020-07-16T19:30:58.388011 · licence: Open Government Licence - Canada
- evidence (`result.title`): “Housing Market Information Portal”

### 🆕 Added: Climate data products (ECCC): Climate Data Products
- id: `canada-open-gov:51dbf91e-509c-437b-ab9e-eca6d0bf6fa8` · field: `dataset.climate` · review: **standard**
- source: https://open.canada.ca/data/en/dataset/51dbf91e-509c-437b-ab9e-eca6d0bf6fa8 (API: https://open.canada.ca/data/api/action/package_show?id=51dbf91e-509c-437b-ab9e-eca6d0bf6fa8)
- retrieved: 2026-10-13T18:21:23.850Z · source updated: 2022-02-21T14:56:19.361658 · licence: Open Government Licence - Canada
- evidence (`result.title`): “Climate Data Products”

## Review queue

2 record(s) need human approval before any use (visa / healthcare / work).

## Review checklist

- [ ] Open each source link and confirm the value, the people it applies to and the period
- [ ] Confirm the licence allows reuse with attribution
- [ ] Visa / healthcare / work items: approved by a person (not by AI)
- [ ] Promote confirmed values into `data/profiles/*` with `status: "verified"`, sources, period and checkedAt
