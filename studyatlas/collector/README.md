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
| `ons-private-rents` | ONS Price Index of Private Rents (official Excel; the ONS API does not carry PIPR) | implemented | `www.ons.gov.uk` |
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
npm run collect -- --fixtures            # local fixtures, no network (labelled "not real data"), writes nothing
npm run collect -- --fixtures --data-dir /tmp/x   # same, but reads/writes a scratch snapshot (used by tests)
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
- **One open candidate PR at a time.** While a `data-collect/*` PR is open, each run is compared against that PR's
  snapshot (`--pending`): fetching the same data again changes nothing (no duplicate PR); real new changes are added as a
  new commit to the same PR and its description is refreshed; a source that fails keeps the records already proposed.
  After the PR is merged (or closed), the next run compares against `main` again.
- The report has **New changes in this run** (compared with `main`, or with the open candidate PR) and, while a
  candidate PR is open, **Already proposed in the open candidate PR** (what that PR adds to `main`; not new).
  Retrieval times are never compared, so re-fetching unchanged content is never a change.
- `--ai` without the `ANTHROPIC_API_KEY` secret no longer fails the run: data is collected and the report notes that
  the AI step was skipped.
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

## Ver.1.5 additions
- **API sources**: `statcan.ts` (CMHC average rents via Statistics Canada WDS, table 34-10-0133-01) and `eccc.ts` (ECCC climate normals, OGC API).
- **Page check** (`sources/pages.ts`): for official pages without an API, re-reads each page (only where `robots.txt` allows, one request at a time) and
  checks that every figure recorded in `data/official/*` is still shown. It never extracts new values; a figure that disappeared becomes a change candidate marked human-required.
- **Cadence**: `cadenceDays` per source (fares/rents 30, university pages 60, climate normals 180). A source that is not due is skipped
  ("not due" in the report); `--force` (used on pull-request dry runs) ignores it. Unchanged content never creates a PR.
- **Consistency**: the report lists published figures that no longer match the latest API value.
- `collector/probe.ts` (runs on pull requests): reviewer aid that prints robots verdict, HTTP status, money lines and links of pages to be added. Nothing is stored.
- `collector/aia-chain.sh`: completes a TLS chain for a host that omits its intermediate certificate (verified against system roots; verification stays on).

## Ver.1.5.1 additions
- `sources/metoffice.ts`: Met Office historical monthly station data (UK OGL v3.0). Derives calendar-month means for fixed 30-year periods
  (`MET_PERIODS`); a period with any missing month is not derived (reported as incomplete, old records kept).
- The page check only covers sources that have data points; a source marked `needs-review` (UBC) is not fetched.
- The consistency report also checks derived climate series against the collected records.

## Ver.1.2.2 additions (ONS private rents)
- `sources/onsrent.ts`: reads the newest official PIPR workbook (found on the dataset page; no JSON endpoint is used) and keeps ONE number: the
  average monthly private rent of all dwellings in Manchester (E08000003), from "Table 1", newest month. Stored with period, publication date,
  retrieval date, area code, source URL, licence and scope in `meta` (always `unverified`). Not a student-housing figure.
- `sources/xlsx.ts`: a small streaming .xlsx reader on `node:zlib` (no new dependency). The workbook is never written to disk or committed.
- A missing value (`[x]`, `[z]`), a non-whole-pound or implausible price, a date that is not the first of a month, a changed header or area name, or an
  edition/cover date mismatch stops the import; the earlier record is kept (the newest month is never replaced by an older one).
- Rate and identification rules (developer.ons.gov.uk/bots, ons.gov.uk/help/fairusepolicy): two requests a month, one second apart, the User-Agent in
  `util.ts` (name/version/URL, no personal data), HTTP 429 → wait for `Retry-After` (at most 60 s) once, then give up for this run.
