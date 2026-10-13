# City data

```
data/
  types.ts        shared types (City, Country, Cost, Photo, Source)
  countries.ts    supported countries (map highlight + filter buttons)
  cities.ts       registry: imports every city file, exports `cities`, `countries`, `getCity`
  city/<id>.ts    one file per city
```

## Add a city
1. Copy an existing file in `city/` to `city/<id>.ts` and edit it. `id` is used in the URL (`/city/<id>`).
2. Add the import and list entry in `cities.ts`. If it is in a new country, add the country to `countries.ts`
   (code = ISO 3166-1 alpha-3, which the map uses for highlighting) and a search alias in `lib/search.ts`.
3. Photo (optional): put a licence-checked image in `public/cities/<id>.jpg` (max ~1200px wide), fill in `photo`,
   and add a row to `public/cities/CREDITS.md`. Without a photo the card and hero fall back to a gradient based on `hue`.

## Demo vs. verified figures
`cost.isSample: true` shows a "demo sample" badge wherever the number appears (cards, detail page, compare table).
When real figures are added, set `isSample: false` **and** fill `cost.source` (`name`, `url`, `checked` date).

## Planned sections (next update)
Living cost, rent, transport, safety, climate and schools will get more detailed data. Recommended pattern, so the
UI and the compare table stay simple:
- Add one optional, typed field per section to `City` in `types.ts` (e.g. `safety?: { ...; isSample: boolean; source?: Source }`).
- Keep localized text as `Localized` (`{ en, ja }`) and numbers as plain numbers with a unit/currency field.
- Make the field optional first, fill cities one by one, and render it only when present.
