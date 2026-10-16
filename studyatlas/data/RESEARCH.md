# Research plan

Status on 2026-10-13: the environment used for Ver.1.3 could not reach any official website (network policy),
so **no external figure was collected or verified**. All new fields are `pending`. Nothing below has been
checked yet; it lists where to look. Only collect from pages whose terms allow reuse, record the URL, the
period the figure describes and the date you checked it, and keep the original currency/unit.

## Priority 1: Manchester (GBR) and Vancouver (CAN)

| Field | Manchester – where to look | Vancouver – where to look |
|---|---|---|
| Climate (monthly temp/precip) | Met Office UK climate averages (1991–2020), nearest station | Environment and Climate Change Canada, Canadian Climate Normals (1991–2020) |
| Crime statistics | data.police.uk / police.uk (Greater Manchester Police), ONS crime data | Statistics Canada police-reported crime; Vancouver Police Department open data |
| Safety advice | Greater Manchester Police; university security pages | Vancouver Police Department; university campus security pages |
| Rent | ONS private rental prices (Manchester local authority); university accommodation pages | CMHC Rental Market Survey (Vancouver CMA); university housing pages |
| Food / phone costs | ONS consumer price data; university cost-of-living guidance | Statistics Canada; university cost-of-living guidance |
| Transport + student discount | TfGM / Bee Network fares; Metrolink student tickets | TransLink fares; U-Pass BC (universities) |
| Universities, tuition | University of Manchester, Manchester Metropolitan University fee pages | UBC, SFU international tuition pages |
| Language schools | British Council accredited centres list | Languages Canada accredited programs list |
| Housing types | University accommodation offices; homestay providers listed by universities | UBC / SFU housing; Canada Homestay Network |
| Visa | GOV.UK Student visa page (fees, funds, Immigration Health Surcharge) | IRCC study permit pages (canada.ca) |
| Healthcare | NHS guidance for overseas students; IHS on GOV.UK | BC Medical Services Plan (gov.bc.ca) for international students |
| SIM / banking | University international-student guidance; Ofcom | University international-student guidance; CRTC / Financial Consumer Agency of Canada |

## Then: Toronto, London, Sydney, Melbourne
Same fields. Australia: Bureau of Meteorology climate statistics, ABS / state crime statistics agencies,
Department of Home Affairs (Student visa subclass 500), Transport for NSW (Opal) and PTV (myki), university fee pages.
Toronto: ECCC normals, Toronto Police Service open data, TTC fares, IRCC. London: Met Office, Metropolitan Police /
data.police.uk, TfL fares (18+ Student Oyster), GOV.UK.

## Existing content to re-check
- Ver.1.0 summaries (housing, climate, transport, student life, university names) are kept as `unverified`.
- Ver.1.0 cost numbers are `sample` and must be replaced, not promoted to verified.

## Ver.1.2.7 – language schools (Manchester, Vancouver) – 2026-10-15

Goal: a few real language schools per city so the language-study mode is not empty. Scope: name, area, main course types, accommodation arrangement, link. **No prices.**

How it was gathered: the build sandbox cannot open school sites (outbound hosts refused), so entries come from public search results and accreditation directories (English UK member directory, British Council inspection summaries, Languages Canada listing, the schools' own pages as quoted in search results). Everything is therefore recorded as `unverified` with the source page and the check date `2026-10-15`; it has not been compared with each school's own site. Text is paraphrased (nothing copied); names, areas and links are facts.

| School | City (as listed) | Source pages | Gaps / changes in the final check |
|---|---|---|---|
| Express English College | Manchester | English UK member directory (id 6665: 130 Princess Road, M16 7BY, website expressenglishcollege.co.uk, homestay and residential ticked), the school's own pages (English UK North member, accreditations page), British Council 2024 inspection summary | the directory's phone differs from the school's contact page (not displayed). Address, website and accommodation agree with English UK. Current operation not confirmed directly |
| MC Academy | Manchester | englishuk.com course finder (id 228), school site themcacademy.co.uk, ISI (formerly Manchester Central School of English) | Oldham Street vs Mosley Street: which address is current is unconfirmed → no street address shown |
| Excel College (UKEC Academy) – **hidden from visitors** (`hidden: true`; data and record kept) | Manchester | Language International directory (“UKEC Academy – formerly Excel College Manchester”) | renamed according to a directory; older listing Fairfield Street vs newer Oxford Street; no official site or current accreditation confirmed → kept as a flagged, unaddressed entry |
| International House Vancouver | **New Westminster** (not the City of Vancouver) | the school's announcement (ihvancouver.com/2024/11/08/new-campus: new campus at 960 Quayside Drive, classes there from 3 Feb 2025), IH World directory, Languages Canada listing | suite number differs (103 vs 108) → not shown; older listings with Vancouver addresses (West Broadway, Pender Street, Chinatown) are outdated and removed from the display |
| Sprachcaffe Vancouver | Vancouver | sprachcaffe.com Vancouver (adults) page: 568 Seymour Street, downtown | no closure notice found, but current operation not confirmed directly; prices exist in catalogues but are not reproduced |
| EF Vancouver | Vancouver | ef.com/ca Vancouver school page: 750 Cambie Street, Suite 200; Languages Canada accreditation stated | accommodation arrangement not confirmed → not shown |

Not obtained: tuition, registration and accommodation fees (catalogue/agent prices are not reused: terms unconfirmed), school-site confirmation of every field, homestay prices. To upgrade an entry to `verified` a person must compare it with the school's own site and approve.

Housing type descriptions (homestay, shared house, halls, private rental) and their "check" lines are general explanations written by StudyAtlas; they contain no figures.

Final check (PR review, 2026-10-15): city of each school, name, website and operating status were re-checked against public listings and search results only (the sandbox cannot open the schools' sites). “Operating today” could not be confirmed directly for any school; the display therefore says so and every entry stays `unverified`.

Decision (2026-10-15): Excel College / UKEC Academy is hidden from the visitor-facing school list until its official site, operating status and accreditation are confirmed. The data entry and this record stay in the repository; remove `hidden` to show it again after a person has confirmed it. The other five schools stay shown as `unverified`.

## Ver.1.3.4 – language school fees and government conditions (2026-10-15)

Read once each via the GitHub Actions probe (run 38798253317; no retries; fee pages themselves were not read, only the sites' footers and terms):

| School | Fee information (link only) | Reuse terms found |
|---|---|---|
| Express English College | /courses/general-english/ | none stated on the site or in its terms |
| IH Manchester | /prices-and-special-offers/ | “© Copyright 2026 IH Manchester. All Rights Reserved.” |
| Kaplan International Manchester | /faq/prices-and-payment | “Without our prior written permission, you may not copy, modify, alter, publish, broadcast, distribute, sell or transfer any material on this website” |
| International House Vancouver | /ihv-price-list/ | site answered with a bot check (403): terms not read, not retried |
| EF Vancouver | /ca/ilsd/schools/vancouver/ (price quotation request) | “© Signum International AG 2026. All rights reserved.” |

Decision: no school fee figure is stored (terms unclear or reserving rights; fees vary with lessons per week, length, season and inclusions). Figures that appear in search-engine summaries of these pages were deliberately not used. Government conditions re-read: see `data/APPROVAL_CANDIDATES.md` §0 (9 recommended, 1 corrected, 0 unverifiable).

## Ver.1.3.5 – climate 1991–2020 and map (2026-10-16)

- ECCC: the 1991–2020 Canadian Climate Normals are only on the website (bulk CSV in a zip, one GET per province: `/climate_normals/download/1991_e.html?area=province&province[]=BC&product[]=data&product[]=station_inventory`); the GeoMet API collection `climate-normals` holds 1981–2010 only (checked: items for 1108447 are period 1981–2010, items for 1108395 are empty). The BC file (218,915 bytes, Actions run 38904919856) has the composite station VANCOUVER INTERNATIONAL (AIRPORT) = climate IDs 1108447 + 1108395; values are in `data/official/vancouver.ts` as the unverified candidate `climateAlt`.
- Manchester: not imported (see `data/APPROVAL_CANDIDATES.md` §−2).
- Map: `data/MAP_OPTIONS.md`.
