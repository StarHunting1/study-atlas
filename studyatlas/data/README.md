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
