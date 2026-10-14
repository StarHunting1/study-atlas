# StudyAtlas data collection report

- Run: 2026-10-14T09:13:56.486Z (**live API requests**)
- Compared with `main` (accepted snapshot): **44 new change(s)** in this run.
- Collected records are **unverified** candidates. Nothing here changes the published city data until a person reviews and promotes it.

## Sources

| Source | Access | This run | Last success | Records | Domains |
|---|---|---|---|---|---|
| [GOV.UK Content API](https://content-api.publishing.service.gov.uk/) | ✅ implemented (open API) | ok (2) | 2026-10-14T09:13:56.486Z | 2 | `www.gov.uk` |
| [Open Government Canada (CKAN API)](https://open.canada.ca/en/access-our-application-programming-interface-api) | ✅ implemented (open API) | ok (2) | 2026-10-14T09:13:56.486Z | 2 | `open.canada.ca` |
| [Statistics Canada WDS – CMHC average rents (table 34-10-0133-01)](https://www.statcan.gc.ca/en/developers/wds) | ✅ implemented (open API) | ok (4) | 2026-10-14T09:13:56.486Z | 4 | `www150.statcan.gc.ca` |
| [ECCC MSC GeoMet OGC API (climate normals)](https://api.weather.gc.ca/collections/climate-normals) | ✅ implemented (open API) | ok (4) | 2026-10-14T09:13:56.486Z | 4 | `api.weather.gc.ca` |
| [Transport for Greater Manchester (Bee Network) – Bus tickets and student tickets (page check)](https://tfgm.com/tickets-and-passes/bus-tickets) | 🔎 page check (no API; robots.txt respected) | ok (9) | 2026-10-14T09:13:56.486Z | 9 | `tfgm.com` |
| [TransLink – Pricing and Fare Zones (page check)](https://www.translink.ca/transit-fares/pricing-and-fare-zones) | 🔎 page check (no API; robots.txt respected) | ok (12) | 2026-10-14T09:13:56.486Z | 12 | `www.translink.ca` |
| [The University of Manchester – Cost of living (undergraduate) (page check)](https://www.manchester.ac.uk/study/undergraduate/fees-and-funding/cost-of-living/) | 🔎 page check (no API; robots.txt respected) | ok (10) | 2026-10-14T09:13:56.486Z | 10 | `www.manchester.ac.uk` |
| [The University of Manchester – University accommodation (page check)](https://www.manchester.ac.uk/study/undergraduate/fees-and-funding/cost-of-living/) | 🔎 page check (no API; robots.txt respected) | ok (5) | 2026-10-14T09:13:56.486Z | 5 | `www.manchester.ac.uk` |
| [ONS API (UK official statistics)](https://developer.ons.gov.uk/) | 🟡 open API – planned | skipped: not implemented (open-api-planned) | — | 0 | `api.beta.ons.gov.uk` |
| [Met Office Weather DataHub / climate averages](https://datahub.metoffice.gov.uk/) | 🔑 needs key / registration | skipped: not implemented (needs-key) | — | 0 | `data.hub.api.metoffice.gov.uk` `www.metoffice.gov.uk` |
| [TfGM Open Data](https://developer.tfgm.com/) | 🔑 needs key / registration | skipped: not implemented (needs-key) | — | 0 | `api.tfgm.com` |
| [TransLink Open API / GTFS](https://www.translink.ca/about-us/doing-business-with-translink/app-developer-resources) | 🔑 needs key / registration | skipped: not implemented (needs-key) | — | 0 | `api.translink.ca` `gtfs-static.translink.ca` |

## New changes in this run (44)

### 🆕 Added: Average rent, bachelor units (Vancouver, British Columbia, CMHC)
- id: `statcan-cmhc-rents:vancouver:bachelor` · field: `housing.marketRent.bachelor` · city: vancouver · review: **standard**
- source: https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=3410013301 (API: https://www150.statcan.gc.ca/t1/wds/rest/getDataFromCubePidCoordAndLatestNPeriods)
- retrieved: 2026-10-14T09:13:56.486Z · source updated: 2025-12-17T08:30 · licence: Statistics Canada Open Licence
- evidence (`vector v3822837 (184.3.1.0.0.0.0.0.0.0) refPer 2025-01-01`): “Vancouver, British Columbia; Row and apartment structures of three units and over; Bachelor units; 2025: 1667”

### 🆕 Added: Average rent, one bedroom units (Vancouver, British Columbia, CMHC)
- id: `statcan-cmhc-rents:vancouver:1br` · field: `housing.marketRent.1br` · city: vancouver · review: **standard**
- source: https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=3410013301 (API: https://www150.statcan.gc.ca/t1/wds/rest/getDataFromCubePidCoordAndLatestNPeriods)
- retrieved: 2026-10-14T09:13:56.486Z · source updated: 2025-12-17T08:30 · licence: Statistics Canada Open Licence
- evidence (`vector v3822971 (184.3.2.0.0.0.0.0.0.0) refPer 2025-01-01`): “Vancouver, British Columbia; Row and apartment structures of three units and over; One bedroom units; 2025: 1807”

### 🆕 Added: Average rent, two bedroom units (Vancouver, British Columbia, CMHC)
- id: `statcan-cmhc-rents:vancouver:2br` · field: `housing.marketRent.2br` · city: vancouver · review: **standard**
- source: https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=3410013301 (API: https://www150.statcan.gc.ca/t1/wds/rest/getDataFromCubePidCoordAndLatestNPeriods)
- retrieved: 2026-10-14T09:13:56.486Z · source updated: 2025-12-17T08:30 · licence: Statistics Canada Open Licence
- evidence (`vector v3823105 (184.3.3.0.0.0.0.0.0.0) refPer 2025-01-01`): “Vancouver, British Columbia; Row and apartment structures of three units and over; Two bedroom units; 2025: 2364”

### 🆕 Added: Average rent, three bedroom units (Vancouver, British Columbia, CMHC)
- id: `statcan-cmhc-rents:vancouver:3br` · field: `housing.marketRent.3br` · city: vancouver · review: **standard**
- source: https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=3410013301 (API: https://www150.statcan.gc.ca/t1/wds/rest/getDataFromCubePidCoordAndLatestNPeriods)
- retrieved: 2026-10-14T09:13:56.486Z · source updated: 2025-12-17T08:30 · licence: Statistics Canada Open Licence
- evidence (`vector v3823239 (184.3.4.0.0.0.0.0.0.0) refPer 2025-01-01`): “Vancouver, British Columbia; Row and apartment structures of three units and over; Three bedroom units; 2025: 2820”

### 🆕 Added: Vancouver Int'l A (ECCC climate normals): Mean daily temperature deg C
- id: `eccc-climate-normals:1108447:temp-mean` · field: `climate.temp-mean` · city: vancouver · review: **standard**
- source: https://climate.weather.gc.ca/climate_normals/ (API: https://api.weather.gc.ca/collections/climate-normals/items?f=json&CLIMATE_IDENTIFIER=1108447&NORMAL_ID=1&limit=50)
- retrieved: 2026-10-14T09:13:56.486Z · source updated: 2012-10-10 14:40:42 · licence: Environment and Climate Change Canada Data Servers End-use Licence / Open Government Licence – Canada (confirm in review)
- evidence (`features[].properties.{MONTH,VALUE}`): “VANCOUVER INT'L A Mean daily temperature deg C: 4.13, 4.9, 6.88, 9.39, 12.8, 15.66, 17.96, 18, 14.89, 10.29, 6.33, 3.57”

### 🆕 Added: Vancouver Int'l A (ECCC climate normals): Mean daily max temperature deg C
- id: `eccc-climate-normals:1108447:temp-max` · field: `climate.temp-max` · city: vancouver · review: **standard**
- source: https://climate.weather.gc.ca/climate_normals/ (API: https://api.weather.gc.ca/collections/climate-normals/items?f=json&CLIMATE_IDENTIFIER=1108447&NORMAL_ID=5&limit=50)
- retrieved: 2026-10-14T09:13:56.486Z · source updated: 2012-10-10 14:40:42 · licence: Environment and Climate Change Canada Data Servers End-use Licence / Open Government Licence – Canada (confirm in review)
- evidence (`features[].properties.{MONTH,VALUE}`): “VANCOUVER INT'L A Mean daily max temperature deg C: 6.87, 8.19, 10.34, 13.15, 16.72, 19.59, 22.15, 22.18, 18.9, 13.54, 9.15, 6.28”

### 🆕 Added: Vancouver Int'l A (ECCC climate normals): Mean daily min temperature deg C
- id: `eccc-climate-normals:1108447:temp-min` · field: `climate.temp-min` · city: vancouver · review: **standard**
- source: https://climate.weather.gc.ca/climate_normals/ (API: https://api.weather.gc.ca/collections/climate-normals/items?f=json&CLIMATE_IDENTIFIER=1108447&NORMAL_ID=8&limit=50)
- retrieved: 2026-10-14T09:13:56.486Z · source updated: 2012-10-10 14:40:42 · licence: Environment and Climate Change Canada Data Servers End-use Licence / Open Government Licence – Canada (confirm in review)
- evidence (`features[].properties.{MONTH,VALUE}`): “VANCOUVER INT'L A Mean daily min temperature deg C: 1.36, 1.58, 3.38, 5.57, 8.84, 11.67, 13.71, 13.77, 10.82, 7, 3.48, 0.83”

### 🆕 Added: Vancouver Int'l A (ECCC climate normals): Total precipitation mm
- id: `eccc-climate-normals:1108447:precip` · field: `climate.precip` · city: vancouver · review: **standard**
- source: https://climate.weather.gc.ca/climate_normals/ (API: https://api.weather.gc.ca/collections/climate-normals/items?f=json&CLIMATE_IDENTIFIER=1108447&NORMAL_ID=56&limit=50)
- retrieved: 2026-10-14T09:13:56.486Z · source updated: 2012-10-10 14:40:42 · licence: Environment and Climate Change Canada Data Servers End-use Licence / Open Government Licence – Canada (confirm in review)
- evidence (`features[].properties.{MONTH,VALUE}`): “VANCOUVER INT'L A Total precipitation mm: 168.44, 104.57, 113.86, 88.53, 65.03, 53.8, 35.58, 36.73, 50.89, 120.76, 188.89, 161.93”

### 🆕 Added: Bus single ticket (adult) — still on the official page
- id: `page:man-bus-single-adult` · field: `official.man-bus-single-adult` · city: manchester · review: **standard**
- source: https://tfgm.com/tickets-and-passes/bus-tickets (API: https://tfgm.com/tickets-and-passes/bus-tickets)
- retrieved: 2026-10-14T09:13:56.486Z · source updated: not stated · licence: not stated
- evidence (`page text (quote-found)`): “The Bee Bus single ‘hopper’ ticket costs £2 for adults and £1 for children.”

### 🆕 Added: Bus 1-day ticket (adult) — still on the official page
- id: `page:man-bus-day-adult` · field: `official.man-bus-day-adult` · city: manchester · review: **standard**
- source: https://tfgm.com/tickets-and-passes/bus-tickets (API: https://tfgm.com/tickets-and-passes/bus-tickets)
- retrieved: 2026-10-14T09:13:56.486Z · source updated: not stated · licence: not stated
- evidence (`page text (quote-found)`): “A 1-day Bee Bus ticket costs £2.50 for children and £5 for adults.”

### 🆕 Added: Bus 7-day ticket (adult) — still on the official page
- id: `page:man-bus-7day-adult` · field: `official.man-bus-7day-adult` · city: manchester · review: **standard**
- source: https://tfgm.com/tickets-and-passes/bus-tickets (API: https://tfgm.com/tickets-and-passes/bus-tickets)
- retrieved: 2026-10-14T09:13:56.486Z · source updated: not stated · licence: not stated
- evidence (`page text (quote-found)`): “A 7-day Bee Bus ticket costs £10 for children and £20 for adults.”

### 🆕 Added: Bus 28-day ticket (adult) — still on the official page
- id: `page:man-bus-28day-adult` · field: `official.man-bus-28day-adult` · city: manchester · review: **standard**
- source: https://tfgm.com/tickets-and-passes/bus-tickets (API: https://tfgm.com/tickets-and-passes/bus-tickets)
- retrieved: 2026-10-14T09:13:56.486Z · source updated: not stated · licence: not stated
- evidence (`page text (quote-found)`): “A 28-day Bee Bus ticket costs £40 for children and £80 for adults.”

### 🆕 Added: Annual Bee Bus ticket (adult) — still on the official page
- id: `page:man-bus-annual-adult` · field: `official.man-bus-annual-adult` · city: manchester · review: **standard**
- source: https://tfgm.com/tickets-and-passes/bus-tickets (API: https://tfgm.com/tickets-and-passes/bus-tickets)
- retrieved: 2026-10-14T09:13:56.486Z · source updated: not stated · licence: not stated
- evidence (`page text (quote-found)`): “The Annual Bee Bus ticket costs £800, offering savings of up to £240.”

### 🆕 Added: Bee AnyBus 28-day ticket (adult, any operator) — still on the official page
- id: `page:man-anybus-28day-adult` · field: `official.man-anybus-28day-adult` · city: manchester · review: **standard**
- source: https://tfgm.com/tickets-and-passes/bus-tickets (API: https://tfgm.com/tickets-and-passes/bus-tickets)
- retrieved: 2026-10-14T09:13:56.486Z · source updated: not stated · licence: not stated
- evidence (`page text (quote-found)`): “A 28-day Bee AnyBus ticket costs £63.30 for a young person (aged 16-21) / student (aged 16-26) and £87.40 for adults.”

### 🆕 Added: Bee AnyBus 28-day ticket (student / young person) — still on the official page
- id: `page:man-anybus-28day-student` · field: `official.man-anybus-28day-student` · city: manchester · review: **standard**
- source: https://tfgm.com/tickets-and-passes/bus-tickets (API: https://tfgm.com/tickets-and-passes/bus-tickets)
- retrieved: 2026-10-14T09:13:56.486Z · source updated: not stated · licence: not stated
- evidence (`page text (quote-found)`): “A 28-day Bee AnyBus ticket costs £63.30 for a young person (aged 16-21) / student (aged 16-26) and £87.40 for adults.”

### 🆕 Added: Bee AnyBus 7-day ticket (student / young person) — still on the official page
- id: `page:man-anybus-7day-student` · field: `official.man-anybus-7day-student` · city: manchester · review: **standard**
- source: https://tfgm.com/tickets-and-passes/bus-tickets (API: https://tfgm.com/tickets-and-passes/bus-tickets)
- retrieved: 2026-10-14T09:13:56.486Z · source updated: not stated · licence: not stated
- evidence (`page text (quote-found)`): “A 7-day Bee AnyBus ticket costs £18.60 for a young person (aged 16-21) / student (aged 16-26) and £21 for adults.”

### 🆕 Added: All Terms Bee Bus student ticket — still on the official page
- id: `page:man-bus-allterms-student` · field: `official.man-bus-allterms-student` · city: manchester · review: **standard**
- source: https://tfgm.com/tickets-and-passes/all-terms-bee-bus-student (API: https://tfgm.com/tickets-and-passes/all-terms-bee-bus-student)
- retrieved: 2026-10-14T09:13:56.486Z · source updated: not stated · licence: not stated
- evidence (`page text (quote-found)`): “The cost of an All Terms Bee Bus ticket is £330.”

### 🆕 Added: Single fare, Compass Card Stored Value (adult) – 1-Zone — still on the official page
- id: `page:van-fare-stored-adult-z1` · field: `official.van-fare-stored-adult-z1` · city: vancouver · review: **standard**
- source: https://www.translink.ca/transit-fares/pricing-and-fare-zones (API: https://www.translink.ca/transit-fares/pricing-and-fare-zones)
- retrieved: 2026-10-14T09:13:56.486Z · source updated: not stated · licence: not stated
- evidence (`page text (quote-found)`): “Stored Value Adult Fares Zone Current Fares July 1 Fares 1-Zone $2.85 $2.85 (+$0.15) 2-Zone $4.20 $4.20 (+$0.20) 3-Zone $5.40”

### 🆕 Added: Single fare, Compass Card Stored Value (adult) – 2-Zone — still on the official page
- id: `page:van-fare-stored-adult-z2` · field: `official.van-fare-stored-adult-z2` · city: vancouver · review: **standard**
- source: https://www.translink.ca/transit-fares/pricing-and-fare-zones (API: https://www.translink.ca/transit-fares/pricing-and-fare-zones)
- retrieved: 2026-10-14T09:13:56.486Z · source updated: not stated · licence: not stated
- evidence (`page text (quote-found)`): “Stored Value Adult Fares Zone Current Fares July 1 Fares 1-Zone $2.85 $2.85 (+$0.15) 2-Zone $4.20 $4.20 (+$0.20) 3-Zone $5.40”

### 🆕 Added: Single fare, Compass Card Stored Value (adult) – 3-Zone — still on the official page
- id: `page:van-fare-stored-adult-z3` · field: `official.van-fare-stored-adult-z3` · city: vancouver · review: **standard**
- source: https://www.translink.ca/transit-fares/pricing-and-fare-zones (API: https://www.translink.ca/transit-fares/pricing-and-fare-zones)
- retrieved: 2026-10-14T09:13:56.486Z · source updated: not stated · licence: not stated
- evidence (`page text (quote-found)`): “Stored Value Adult Fares Zone Current Fares July 1 Fares 1-Zone $2.85 $2.85 (+$0.15) 2-Zone $4.20 $4.20 (+$0.20) 3-Zone $5.40”

### 🆕 Added: Single fare, cash / contactless (adult) – 1-Zone — still on the official page
- id: `page:van-fare-cash-adult-z1` · field: `official.van-fare-cash-adult-z1` · city: vancouver · review: **standard**
- source: https://www.translink.ca/transit-fares/pricing-and-fare-zones (API: https://www.translink.ca/transit-fares/pricing-and-fare-zones)
- retrieved: 2026-10-14T09:13:56.486Z · source updated: not stated · licence: not stated
- evidence (`page text (quote-found)`): “Adult Cash Fares Zone Current Fares July 1 Fares 1-Zone $3.50 $3.50 (+$0.15) 2-Zone $5.10 $5.10 (+$0.25) 3-Zone $6.70”

### 🆕 Added: Single fare, cash / contactless (adult) – 2-Zone — still on the official page
- id: `page:van-fare-cash-adult-z2` · field: `official.van-fare-cash-adult-z2` · city: vancouver · review: **standard**
- source: https://www.translink.ca/transit-fares/pricing-and-fare-zones (API: https://www.translink.ca/transit-fares/pricing-and-fare-zones)
- retrieved: 2026-10-14T09:13:56.486Z · source updated: not stated · licence: not stated
- evidence (`page text (quote-found)`): “Adult Cash Fares Zone Current Fares July 1 Fares 1-Zone $3.50 $3.50 (+$0.15) 2-Zone $5.10 $5.10 (+$0.25) 3-Zone $6.70”

### 🆕 Added: Single fare, cash / contactless (adult) – 3-Zone — still on the official page
- id: `page:van-fare-cash-adult-z3` · field: `official.van-fare-cash-adult-z3` · city: vancouver · review: **standard**
- source: https://www.translink.ca/transit-fares/pricing-and-fare-zones (API: https://www.translink.ca/transit-fares/pricing-and-fare-zones)
- retrieved: 2026-10-14T09:13:56.486Z · source updated: not stated · licence: not stated
- evidence (`page text (quote-found)`): “Adult Cash Fares Zone Current Fares July 1 Fares 1-Zone $3.50 $3.50 (+$0.15) 2-Zone $5.10 $5.10 (+$0.25) 3-Zone $6.70”

### 🆕 Added: Monthly Pass (adult) – 1-Zone — still on the official page
- id: `page:van-monthly-adult-z1` · field: `official.van-monthly-adult-z1` · city: vancouver · review: **standard**
- source: https://www.translink.ca/transit-fares/pricing-and-fare-zones (API: https://www.translink.ca/transit-fares/pricing-and-fare-zones)
- retrieved: 2026-10-14T09:13:56.486Z · source updated: not stated · licence: not stated
- evidence (`page text (quote-found)`): “Adult Monthly Pass Zone Current Fares July 1 Fares 1-Zone $117.20 $117.20 (+$5.60) 2-Zone $156.70 $156.70 (+$7.45) 3-Zone $211.65”

### 🆕 Added: Monthly Pass (adult) – 2-Zone — still on the official page
- id: `page:van-monthly-adult-z2` · field: `official.van-monthly-adult-z2` · city: vancouver · review: **standard**
- source: https://www.translink.ca/transit-fares/pricing-and-fare-zones (API: https://www.translink.ca/transit-fares/pricing-and-fare-zones)
- retrieved: 2026-10-14T09:13:56.486Z · source updated: not stated · licence: not stated
- evidence (`page text (quote-found)`): “Adult Monthly Pass Zone Current Fares July 1 Fares 1-Zone $117.20 $117.20 (+$5.60) 2-Zone $156.70 $156.70 (+$7.45) 3-Zone $211.65”

### 🆕 Added: Monthly Pass (adult) – 3-Zone — still on the official page
- id: `page:van-monthly-adult-z3` · field: `official.van-monthly-adult-z3` · city: vancouver · review: **standard**
- source: https://www.translink.ca/transit-fares/pricing-and-fare-zones (API: https://www.translink.ca/transit-fares/pricing-and-fare-zones)
- retrieved: 2026-10-14T09:13:56.486Z · source updated: not stated · licence: not stated
- evidence (`page text (quote-found)`): “Adult Monthly Pass Zone Current Fares July 1 Fares 1-Zone $117.20 $117.20 (+$5.60) 2-Zone $156.70 $156.70 (+$7.45) 3-Zone $211.65”

### 🆕 Added: Concession Monthly Pass (all zones) — still on the official page
- id: `page:van-monthly-concession` · field: `official.van-monthly-concession` · city: vancouver · review: **standard**
- source: https://www.translink.ca/transit-fares/pricing-and-fare-zones (API: https://www.translink.ca/transit-fares/pricing-and-fare-zones)
- retrieved: 2026-10-14T09:13:56.486Z · source updated: not stated · licence: not stated
- evidence (`page text (quote-found)`): “Concession Monthly Pass Zone Current Fares July 1 Fares All Zones $66.95”

### 🆕 Added: DayPass (adult, all zones) — still on the official page
- id: `page:van-daypass-adult` · field: `official.van-daypass-adult` · city: vancouver · review: **standard**
- source: https://www.translink.ca/transit-fares/pricing-and-fare-zones (API: https://www.translink.ca/transit-fares/pricing-and-fare-zones)
- retrieved: 2026-10-14T09:13:56.486Z · source updated: not stated · licence: not stated
- evidence (`page text (quote-found)`): “Adult DayPass Zone Current Fares July 1 Fares All Zones $12.55”

### 🆕 Added: U-Pass BC (students of participating institutions) — still on the official page
- id: `page:van-upass` · field: `official.van-upass` · city: vancouver · review: **standard**
- source: https://www.translink.ca/transit-fares/u-pass-bc (API: https://www.translink.ca/transit-fares/u-pass-bc)
- retrieved: 2026-10-14T09:13:56.486Z · source updated: not stated · licence: not stated
- evidence (`page text (quote-found)`): “$47.85 from Sep 1 2026 to Aug 31 2027”

### 🆕 Added: Private house share incl. bills – University estimate (per month) — still on the official page
- id: `page:man-uom-est-private-share-month` · field: `official.man-uom-est-private-share-month` · city: manchester · review: **standard**
- source: https://www.manchester.ac.uk/study/undergraduate/fees-and-funding/cost-of-living/ (API: https://www.manchester.ac.uk/study/undergraduate/fees-and-funding/cost-of-living/)
- retrieved: 2026-10-14T09:13:56.486Z · source updated: not stated · licence: not stated
- evidence (`page text (quote-found)`): “Privately rented house shares (with average bills cost included) £ 645 - 710”

### 🆕 Added: Groceries – UoM undergraduate estimate — still on the official page
- id: `page:man-uom-ug-groceries` · field: `official.man-uom-ug-groceries` · city: manchester · review: **standard**
- source: https://www.manchester.ac.uk/study/undergraduate/fees-and-funding/cost-of-living/ (API: https://www.manchester.ac.uk/study/undergraduate/fees-and-funding/cost-of-living/)
- retrieved: 2026-10-14T09:13:56.486Z · source updated: not stated · licence: not stated
- evidence (`page text (quote-found)`): “Groceries** £2,500 £250”

### 🆕 Added: Takeaways – UoM undergraduate estimate — still on the official page
- id: `page:man-uom-ug-takeaways` · field: `official.man-uom-ug-takeaways` · city: manchester · review: **standard**
- source: https://www.manchester.ac.uk/study/undergraduate/fees-and-funding/cost-of-living/ (API: https://www.manchester.ac.uk/study/undergraduate/fees-and-funding/cost-of-living/)
- retrieved: 2026-10-14T09:13:56.486Z · source updated: not stated · licence: not stated
- evidence (`page text (quote-found)`): “Takeaways £510 £51”

### 🆕 Added: Transport (local and travel elsewhere) – UoM undergraduate estimate — still on the official page
- id: `page:man-uom-ug-transport` · field: `official.man-uom-ug-transport` · city: manchester · review: **standard**
- source: https://www.manchester.ac.uk/study/undergraduate/fees-and-funding/cost-of-living/ (API: https://www.manchester.ac.uk/study/undergraduate/fees-and-funding/cost-of-living/)
- retrieved: 2026-10-14T09:13:56.486Z · source updated: not stated · licence: not stated
- evidence (`page text (quote-found)`): “Transport (including local transport and travelling elsewhere) £700 £70”

### 🆕 Added: Mobile phone – UoM undergraduate estimate — still on the official page
- id: `page:man-uom-ug-phone` · field: `official.man-uom-ug-phone` · city: manchester · review: **standard**
- source: https://www.manchester.ac.uk/study/undergraduate/fees-and-funding/cost-of-living/ (API: https://www.manchester.ac.uk/study/undergraduate/fees-and-funding/cost-of-living/)
- retrieved: 2026-10-14T09:13:56.486Z · source updated: not stated · licence: not stated
- evidence (`page text (quote-found)`): “Mobile phone contract/payments £350 £35”

### 🆕 Added: Going out and socialising – UoM undergraduate estimate — still on the official page
- id: `page:man-uom-ug-social` · field: `official.man-uom-ug-social` · city: manchester · review: **standard**
- source: https://www.manchester.ac.uk/study/undergraduate/fees-and-funding/cost-of-living/ (API: https://www.manchester.ac.uk/study/undergraduate/fees-and-funding/cost-of-living/)
- retrieved: 2026-10-14T09:13:56.486Z · source updated: not stated · licence: not stated
- evidence (`page text (quote-found)`): “Going out and socialising £1,100 £110”

### 🆕 Added: Clothes – UoM undergraduate estimate — still on the official page
- id: `page:man-uom-ug-clothes` · field: `official.man-uom-ug-clothes` · city: manchester · review: **standard**
- source: https://www.manchester.ac.uk/study/undergraduate/fees-and-funding/cost-of-living/ (API: https://www.manchester.ac.uk/study/undergraduate/fees-and-funding/cost-of-living/)
- retrieved: 2026-10-14T09:13:56.486Z · source updated: not stated · licence: not stated
- evidence (`page text (quote-found)`): “Clothes £420 £42”

### 🆕 Added: Health and wellbeing – UoM undergraduate estimate — still on the official page
- id: `page:man-uom-ug-health` · field: `official.man-uom-ug-health` · city: manchester · review: **standard**
- source: https://www.manchester.ac.uk/study/undergraduate/fees-and-funding/cost-of-living/ (API: https://www.manchester.ac.uk/study/undergraduate/fees-and-funding/cost-of-living/)
- retrieved: 2026-10-14T09:13:56.486Z · source updated: not stated · licence: not stated
- evidence (`page text (quote-found)`): “Health and wellbeing £250 £25”

### 🆕 Added: Course materials – UoM undergraduate estimate — still on the official page
- id: `page:man-uom-ug-course` · field: `official.man-uom-ug-course` · city: manchester · review: **standard**
- source: https://www.manchester.ac.uk/study/undergraduate/fees-and-funding/cost-of-living/ (API: https://www.manchester.ac.uk/study/undergraduate/fees-and-funding/cost-of-living/)
- retrieved: 2026-10-14T09:13:56.486Z · source updated: not stated · licence: not stated
- evidence (`page text (quote-found)`): “Course materials £210 £21”

### 🆕 Added: Total (catered; self-catered £1,503) – UoM undergraduate estimate — still on the official page
- id: `page:man-uom-ug-total` · field: `official.man-uom-ug-total` · city: manchester · review: **standard**
- source: https://www.manchester.ac.uk/study/undergraduate/fees-and-funding/cost-of-living/ (API: https://www.manchester.ac.uk/study/undergraduate/fees-and-funding/cost-of-living/)
- retrieved: 2026-10-14T09:13:56.486Z · source updated: not stated · licence: not stated
- evidence (`page text (quote-found)`): “Total* £14,840 (£15,030 if self-catered) £1,484 (£1,503 if self-catered)”

### 🆕 Added: University of Manchester halls, self-catered (per year) — still on the official page
- id: `page:man-uom-halls-selfcatered-year` · field: `official.man-uom-halls-selfcatered-year` · city: manchester · review: **standard**
- source: https://www.manchester.ac.uk/study/undergraduate/fees-and-funding/cost-of-living/ (API: https://www.manchester.ac.uk/study/undergraduate/fees-and-funding/cost-of-living/)
- retrieved: 2026-10-14T09:13:56.486Z · source updated: not stated · licence: not stated
- evidence (`page text (quote-found)`): “The University of Manchester self-catered accommodation can range in price from £4,853 to £12,096 a year.”

### 🆕 Added: University of Manchester halls, catered (per month) — still on the official page
- id: `page:man-uom-halls-catered-month` · field: `official.man-uom-halls-catered-month` · city: manchester · review: **standard**
- source: https://www.manchester.ac.uk/study/undergraduate/fees-and-funding/cost-of-living/ (API: https://www.manchester.ac.uk/study/undergraduate/fees-and-funding/cost-of-living/)
- retrieved: 2026-10-14T09:13:56.486Z · source updated: not stated · licence: not stated
- evidence (`page text (quote-found)`): “The University of Manchester halls of residence (catered) £555-£982 (includes cost of catering)”

### 🆕 Added: University of Manchester: single self-catering room, shared facilities (from) — still on the official page
- id: `page:man-uom-intl-selfcatered-shared-week` · field: `official.man-uom-intl-selfcatered-shared-week` · city: manchester · review: **standard**
- source: https://www.manchester.ac.uk/study/international/accommodation/ (API: https://www.manchester.ac.uk/study/international/accommodation/)
- retrieved: 2026-10-14T09:13:56.486Z · source updated: not stated · licence: not stated
- evidence (`page text (quote-found)`): “from £119 per week for a single self-catering room with shared facilities;”

### 🆕 Added: University of Manchester: single self-catering en-suite room (from) — still on the official page
- id: `page:man-uom-intl-selfcatered-ensuite-week` · field: `official.man-uom-intl-selfcatered-ensuite-week` · city: manchester · review: **standard**
- source: https://www.manchester.ac.uk/study/international/accommodation/ (API: https://www.manchester.ac.uk/study/international/accommodation/)
- retrieved: 2026-10-14T09:13:56.486Z · source updated: not stated · licence: not stated
- evidence (`page text (quote-found)`): “from £175 per week for a single self-catering room with en-suite facilities;”

### 🆕 Added: University of Manchester: single room, catered hall (from) — still on the official page
- id: `page:man-uom-intl-catered-week` · field: `official.man-uom-intl-catered-week` · city: manchester · review: **standard**
- source: https://www.manchester.ac.uk/study/international/accommodation/ (API: https://www.manchester.ac.uk/study/international/accommodation/)
- retrieved: 2026-10-14T09:13:56.486Z · source updated: not stated · licence: not stated
- evidence (`page text (quote-found)`): “from £184 per week for a single room with shared facilities in a catered hall.”

## Published official data vs. API values

All 8 published figure(s) backed by an API match the latest API value.

## Review queue

2 record(s) need human approval before any use (visa / healthcare / work).

## Review checklist

- [ ] Open each source link and confirm the value, the people it applies to and the period
- [ ] Confirm the licence allows reuse with attribution
- [ ] Visa / healthcare / work items: approved by a person (not by AI)
- [ ] Promote confirmed values into `data/profiles/*` with `status: "verified"`, sources, period and checkedAt
