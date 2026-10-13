# StudyAtlas data collector (Ver.1.0)

Collects official information from documented public APIs, stores it with its source and retrieval date, detects
changes against the last accepted snapshot and proposes them in a pull request. **It never marks data verified and
never edits `data/profiles/*`**: a person reviews each candidate and promotes it.

```
collector/
  sources/        one module per source (govuk.ts, canada.ts) + registry of planned / blocked sources (index.ts)
  run.ts          CLI: fetch → (optional AI) → merge → report
  store.ts        merge rules (failures never delete; missing records are flagged, not removed) + change detection
  ai.ts           optional Claude extraction with grounding checks (quote must be in the page, numbers in the quote)
  report.ts       Markdown report (GitHub Actions job summary and PR body)
  toFact.ts       collected record → Ver.1.3 Fact (always "unverified")
  fixtures/       synthetic API responses for tests and `--fixtures` (marked [FIXTURE], not real data)
data/collected/
  snapshot.json   last accepted records + per-source run state (updated only through reviewed PRs)
  candidates.json changes found by the run that produced the PR
  REPORT.md       the report of that run
```

## Sources

| id | Source | Status | Domain(s) |
|---|---|---|---|
| `govuk-content` | GOV.UK Content API (`/api/content/<path>`) | implemented, open, no key | `www.gov.uk` |
| `canada-open-gov` | Open Government Canada CKAN API (`package_show`, datasets pinned by id) | implemented, open, no key | `open.canada.ca` |
| `ons-api` | ONS API (rents, prices) | open API, planned | `api.beta.ons.gov.uk` |
| `eccc-geomet` | ECCC GeoMet OGC API (climate normals) | open API, planned | `api.weather.gc.ca` |
| `met-office-datahub` | Met Office DataHub | needs registration / key | `data.hub.api.metoffice.gov.uk` |
| `tfgm-open-data` | TfGM Open Data | needs registration / key | `api.tfgm.com` |
| `translink-open-api` | TransLink Open API / GTFS | needs registration / licence | `api.translink.ca` |
| `cmhc-hmip` | CMHC Housing Market Information Portal | terms review; no documented API – do not scrape | `www.cmhc-schl.gc.ca` |

Provider details for the planned/blocked sources come from prior knowledge and are marked "(unchecked)" in
`sources/index.ts` until someone confirms the provider's current documentation and terms. Keys, when needed,
go into GitHub Secrets and are read from environment variables — never committed.

## What is stored per record
city / country, field (Ver.1.3 field path, e.g. `visa.official`, or `dataset.*`), label (ja/en), value (text / number /
unit / currency), period (when stated), source URL, exact API URL, `retrievedAt` (when this content was first
retrieved; every attempt is in `runs`), source published / updated dates, evidence (JSON path + verbatim excerpt),
content hash, licence, `status: "unverified"`, review level (`human-required` for visa, healthcare and work rules),
and optional AI output.

## Running
```bash
npm run collect -- --fixtures            # local fixtures, no network (labelled "not real data")
npm run collect -- --dry-run             # live APIs, print report, write nothing
npm run collect                          # live APIs, write data/collected/* when something changed
npm run collect -- --sources govuk-content --ai   # with AI extraction (needs ANTHROPIC_API_KEY)
npm test                                 # includes tests/collector.test.ts
```

## GitHub Actions (`.github/workflows/collect-data.yml`)
- **Schedule** (Mondays 04:23 UTC) and **manual run** (Actions → "Collect official data" → Run workflow; choose sources, AI on/off).
- One step per run, sources fetched one by one; a failing source is reported and its previous data is kept.
- When something changed, the job pushes `data-collect/<run id>` and opens a PR against `main` with the report as the
  body. **Nothing is merged automatically.**
- On pull requests that touch the collector, the same job runs as a **dry run** against the live APIs (report in the
  job summary, nothing committed) — this is how API connectivity is checked from GitHub's runners.

Repository settings needed:
1. Settings → Actions → General → Workflow permissions: allow **"Allow GitHub Actions to create and approve pull requests"**
   (required for the PR step; the workflow itself never approves or merges).
2. Optional secret `ANTHROPIC_API_KEY` for the AI step.
Note: PRs opened with the default `GITHUB_TOKEN` do not trigger other workflows (e.g. CI) automatically.

## AI extraction (optional)
`ai.ts` asks Claude (`claude-opus-5-5`, structured JSON output, server-side fallback on refusals) for ja/en summaries
and facts with verbatim quotes. A fact is kept only if its quote is found in the page text and every number in its
value appears in the quote; others are listed as rejected. AI output is shown in the PR for review and is never treated
as verified. Visa, healthcare and work items always require human approval.

## Reviewing a candidate PR
Open each source link, confirm value / who it applies to / period / licence, then promote by editing
`data/profiles/<city>.ts` (or `data/countries.ts` for visa) with `status: "verified"`, `sources`, `period` and
`checkedAt` (`toFact()` gives the starting shape). Merging the collector PR itself only updates `data/collected/`.
