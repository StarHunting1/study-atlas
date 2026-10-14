# StudyAtlas Ver.1.4 (dev/test only)
Next.js (App Router) + TypeScript + Tailwind + MapLibre GL JS.
- Run locally: `npm install && npm run dev` -> http://localhost:3000 (`npm run build` to verify)
- Deploy (GitHub Private + Vercel, protected): see [DEPLOY.md](./DEPLOY.md)
- Env vars: see `.env.example` (all optional). Cost numbers are DEMO SAMPLES, not verified data.
- City photos (Ver.1.1): self-hosted in `public/cities/`, from Wikimedia Commons; licenses and authors in [public/cities/CREDITS.md](./public/cities/CREDITS.md) and on the About page.
- City data: identity in `data/city/`, researched facts (with source, period, last checked, status) in `data/profiles/`; see [data/README.md](./data/README.md) and the research plan in [data/RESEARCH.md](./data/RESEARCH.md).
- My Study (Ver.1.4): `/my` profile, `/my/budget` cost simulator, `/my/visa` visa check; `/schools` school comparison. Profile, plans and selections are stored in the browser (localStorage) only and never sent anywhere.
- Tests: `npm test` (unit tests for the budget engine, conversions and fee comparability).
- Data collector: `collector/` + `.github/workflows/collect-data.yml` (official APIs → change-candidate PRs, never auto-merged); see [collector/README.md](./collector/README.md).

## Cost planner (Ver.1.6) — `/planner`
Slider-driven study cost planner for Manchester and Vancouver (language school or university). No login or database: plans live in this browser (`localStorage`, key `studyatlas.planner.v1`).
- `lib/planner.ts` – all rules as pure functions (tested in `tests/planner.test.ts`). Unset ≠ 0; 1 month = 52/12 weeks; quantity rules for week / month / term / year / one-off; own billed period for tuition and housing; per-item currency; totals add only the display currency or currencies with a manual rate.
- `data/official/planner.ts` – starting values from verified Ver.1.5 official figures (with source, period and conditions) and, later, school fees (`schoolCandidates`: choosing a school fills tuition once verified fee data exists). Nothing new is fetched or republished.
- `lib/fx.ts` – exchange-rate provider interface; the planner uses manual rates (`manualFx`), a rate API can replace it.
- `components/planner/*`, `locales/planner.ts` (Japanese + English), slider styles in `app/globals.css` (`.sa-range`).
- Chart colours: the validated 8-slot categorical palette in its fixed order.


## Smart Study Planner (Ver.1.7)

`/planner` opens in **Easy mode**: choose departure airport, destination city, study type, length of stay, departure month, total budget and (optionally) a housing type. Three plans (Budget / Balanced / Comfort) are generated at once and update live. The per-item sliders of Ver.1.6 are in **Advanced mode** (`/planner#advanced`); every plan can be opened there with "Fine-tune in Advanced mode".

- `lib/smart.ts` – deterministic plan generator (no AI, no network). Every number is a verified official figure (Ver.1.5 data / verified school fees) that passed the eligibility and contract checks, the user's own assumption, or missing (never counted as 0). Returns structured reasons (codes) so an AI can later write explanations from the same facts.
- Verdict "within budget" only when tuition, housing, food, transport, flights, visa and insurance are all present; otherwise the plan is marked *provisional* (暫定プラン), "already over budget" is reported when the counted costs alone exceed the budget, and the remaining budget is shown.
- Over budget: Balanced/Comfort step items down one level at a time; suggestions (shorter stay, other housing type) are computed, not guessed.
- Flights (`lib/flights.ts`, `data/airports.ts`): IATA airport codes, round trip / one way with separate prices, replaceable `FlightProvider` interface (reference vs bookable quotes). No provider is connected (Skyscanner Indicative Prices is a stub that returns "not connected"); the user enters a price (their assumption) or opens an external search link.
- Currencies: budget in GBP/CAD/JPY; amounts in other currencies are converted only with a manual rate entered by the user (shown as approximate).
- Saved plans (browser only, `studyatlas.smart.v1`): rename, re-edit conditions, open in Advanced mode, compare up to 3, delete one / all.
- Tests: `tests/smart.test.ts` (25 tests, included in `npm test`).
