# City data (Ver.1.3)

```
data/
  schema.ts        Fact<T>, Money, MonthlyClimate, CityProfile, CountryProfile, Status
  validate.ts      rules every Fact must pass (run at load time, so `next build` fails on bad data)
  repository.ts    the read API (CityRepository). Swap this for a database-backed version later
  cities.ts        facade over the repository (`import { cities, getCity } from "@/data/cities"`)
  registry.ts      raw list of city files (do not import directly from UI code)
  countries.ts     countries + national info (visa)
  city/<id>.ts     identity/display data: name, coords, photo, blurb, search areas
  profiles/<id>.ts researched information for that city (CityProfile)
  fields.ts        field registry used by BOTH the city page and the compare table
  comparability.ts when money values may be compared
  RESEARCH.md      what to research per city, with the sources to use
```

## Facts and statuses
Every item is a `Fact` with a `status`:

| status | meaning | shown as |
|---|---|---|
| `verified` | checked against the cited source | value + "Verified", period, last checked, source link |
| `unverified` | written without a checked source (e.g. Ver.1.0 summaries) | value + "Unverified" |
| `sample` | demo placeholder number | value + "Demo sample – not verified" |
| `pending` | not researched | "Data coming soon" (no value allowed) |

`validate.ts` rejects a `verified` fact unless it has at least one `sources[]` entry (https URL + publisher),
a `period` and a `checkedAt` date, and rejects values on `pending` facts. Never mark a fact verified
unless you opened the source and the value matches it.

Each fact stores: source URL(s) and publisher (`sources`), the period the value describes (`period`),
last checked date (`checkedAt`), original currency/unit (`Money.currency`/`per`, `°C`/`mm` for climate),
a ja/en explanation (`note`), and the reliability (`status`).

## Money
Amounts stay in the source's currency and unit (`per: "month" | "week" | "year" | "once"`), with `includes`
describing what is covered. Nothing is converted. The compare table marks a row "not comparable" unless all
values are verified **and** share currency, `per`, `period` and `includes` (`comparability.ts`).

## Add or research a field for a city
1. Open `profiles/<id>.ts`, replace `pending()` with
   `{ status: "verified", value: …, sources: [{ url, publisher }], period: "2025", checkedAt: "2026-10-13", note: { en, ja } }`.
2. `npm run build` — validation fails if something required is missing.

## Add a new field
Add it to `CityProfile` in `schema.ts` (start every city as `pending()`), then one entry in `fields.ts`.
Both the city page and (with `compare: true`) the compare table show it.

## Add a city
Create `city/<id>.ts` and `profiles/<id>.ts` (copy an existing pair), register it in `registry.ts`.
New country: add it to `countries.ts` (ISO alpha-3 code) and a search alias in `lib/search.ts`.

## Moving to a database later
`CityRepository` (repository.ts) is the only read path. A Supabase version could store
`cities` (city/<id>.ts fields), `facts` (city_id, field path e.g. `cost.rent`, status, value JSON, period,
checked_at, note_en, note_ja) and `fact_sources` (fact_id, url, publisher, terms), then build the same
`City` objects. AI search can index the same facts and must only cite `verified` ones as facts.

## Schools (Ver.1.4)
```
data/schools/types.ts         LanguageSchool / University, LanguageCourse / UniversityProgram, Price
data/schools/universities.ts  real universities from Ver.1.0 summaries: names & links "unverified", everything else "pending"
data/schools/samples.ts       FICTIONAL sample schools (demo: true, status "sample") for testing only
data/schools/index.ts         read API: listSchools(kind, { includeSamples }), getSchool, optionsOf (+ validation)
```
`Price` records amount, `currency`, billing `unit` (week / month / term / year / course / once), `feeYear`,
`applicability` (nationality / residence / fee category), `tax` (included / excluded / notApplicable / unknown)
and `includes`. The UI shows an amount only for `verified` fees, or for fictional `sample` fees when
"Show sample data" is on; anything else is "data coming soon". `priceIssues()` (comparability.ts) lists why
fees cannot be compared at face value (unverified, currency, unit, fee year, tax, applicability, includes, course length).
No real language schools are registered yet.

## Budget simulator
`lib/budget.ts` is pure: items left empty are "missing" (never 0), each item keeps its currency and unit
(week / month / year / once, or % for contingency) and is scaled to the stay (month = 52/12 weeks). Foreign
currencies need a manual rate with the date it was entered. Items linked to a school fee (`SchoolLink`) read the
fee from school data on every calculation, so official fees registered later flow in automatically.

## Visa and AI search (structure only)
- `data/visa.ts`: `VisaFactors` (destination, nationality, residence, purpose, length, age, entry date) and a
  `VisaRule` shape keyed on all of them. `visaRules` is empty on purpose: no automatic decisions. `visaLinks`
  holds official pages per country, marked "unverified" until checked.
- `data/knowledge.ts`: `KnowledgeDocument` (url, publisher, source language, jurisdiction, topics, status,
  checkedAt, retrievedAt, terms) and `knowledgeDocuments()`, which collects every source referenced by the data.
  A future multilingual AI search indexes these and may state as fact only what comes from verified documents.

## Official city data (Ver.1.5)
```
data/official/sources.ts    registry of official sources (publisher, pages, method api|page, cadenceDays, terms)
data/official/types.ts      DataPoint (amount + currency + per + audience + conditions + validFor + evidence), ClimateNormals
data/official/<city>.ts     the figures for one city (Manchester, Vancouver so far)
data/official/validate.ts   load-time checks: evidence quote must contain the amount, https source in the registry, dates, ja+en text
data/official/toFact.ts     bridges a data point into the Ver.1.3 profile Fact (one source of truth)
data/official/compare.ts    comparison rows + compareIssues(): comparable only if verified, same period unit, same audience
data/official/validFor.ts   Japanese wording of validFor strings (falls back to English)
```
- Every figure keeps its original currency and period (`per`), who it applies to (`audience`, `conditions`), what it is valid for
  (`validFor`: fare year, academic year, survey year), the page section and a verbatim quote (`evidence`), `retrievedAt` and `checkedAt`.
- University hall prices carry `housing` (school, room type, contract, inclusions) and are never mixed with city rent
  (`audience: "renter"`, CMHC whole-market averages). A university's cost estimate is `audience: "undergraduate"`, not "all students".
- Cities with a `data/official/<city>.ts` file get the tabbed detail page (Overview / Living Costs / Housing / Transport / Climate /
  Education / Visa & Healthcare); other cities keep the Ver.1.3 layout.
- Exchange rates: `lib/fx.ts` defines `FxProvider`; no provider is wired in, so no converted number is ever shown.

### Add a city
1. Register its sources in `data/official/sources.ts` (method, pages, cadence, terms).
2. Create `data/official/<city>.ts` (copy an existing one); register it in `data/official/index.ts`.
3. For API sources add a collector in `collector/sources/` (see statcan.ts / eccc.ts); for pages the generic page check
   (`collector/sources/pages.ts`) picks the points up automatically.
4. `npm test && npm run build`.
