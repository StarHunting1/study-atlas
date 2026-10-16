import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { cities, countries } from "@/data/cities";
import { boundsOf, COUNTRY_SHAPES } from "@/data/countryShapes";
import { activeCountry, countryFitBounds, fitPadding, isLabelLayer, labelExpression, paintOverrides, PALETTE } from "@/lib/mapStyle";
import { countryName, cityName } from "@/lib/names";
import type { Localized } from "@/lib/i18n";
let n = 0; const t = (name: string, f: () => void) => { f(); n++; console.log("ok", name); };
const ja = (v: Localized) => v.ja, en = (v: Localized) => v.en;

t("map colours: water, land cover, borders and background get the natural palette by what they draw; labels and other layers are left alone", () => {
  assert.equal(paintOverrides({ id: "background", type: "background" })!["background-color"], PALETTE.land);
  assert.equal(paintOverrides({ id: "water", type: "fill", "source-layer": "water" })!["fill-color"], PALETTE.water);
  assert.equal(paintOverrides({ id: "x", type: "line", "source-layer": "waterway" })!["line-color"], PALETTE.water);
  assert.ok((paintOverrides({ id: "l", type: "fill", "source-layer": "landcover" })!["fill-color"] as unknown[]).includes(PALETTE.wood), "forests are green");
  const country = paintOverrides({ id: "boundary_2", type: "line", "source-layer": "boundary" })!, state = paintOverrides({ id: "boundary_3", type: "line", "source-layer": "boundary" })!;
  assert.equal(country["line-color"], PALETTE.border); assert.equal(state["line-color"], PALETTE.borderSoft); assert.notEqual(country["line-color"], state["line-color"], "country borders are stronger than regional ones");
  assert.equal(paintOverrides({ id: "boundary_disputed", type: "line", "source-layer": "boundary" })!["line-color"], PALETTE.borderSoft, "disputed lines are not drawn as country borders");
  assert.equal(paintOverrides({ id: "place_label", type: "symbol", "source-layer": "place" }), null); assert.equal(paintOverrides({ id: "road", type: "line", "source-layer": "transportation" }), null);
  assert.ok(Object.values(PALETTE).every((c) => /^#[0-9a-f]{6}$/i.test(c)), "plain hex colours, nothing garish by accident");
});
t("country fit: every registered country has an outline, and the fitted bounds contain the whole outline and all its cities", () => {
  for (const c of countries) {
    assert.ok(COUNTRY_SHAPES.some((f) => f.id === c.code), `outline for ${c.code}`); const o = boundsOf(c.code)!, list = cities.filter((x) => x.country === c.code); assert.ok(list.length > 0, c.code);
    const b = countryFitBounds(o, list.map((x) => x.coords))!; assert.ok(b[0] <= o[0] && b[1] <= o[1] && b[2] >= o[2] && b[3] >= o[3], `${c.code}: outline inside bounds`);
    for (const x of list) assert.ok(x.coords[0] >= b[0] && x.coords[0] <= b[2] && x.coords[1] >= b[1] && x.coords[1] <= b[3], `${c.code}: ${x.id} inside bounds`);
  }
  const gbr = boundsOf("GBR")!; assert.ok(gbr[0] < -5 && gbr[2] > 1 && gbr[1] < 51 && gbr[3] > 58, "the UK outline spans Cornwall to Shetland"); const can = boundsOf("CAN")!; assert.ok(can[0] < -130 && can[2] > -60 && can[3] > 70);
  assert.equal(countryFitBounds(undefined, []), undefined); assert.deepEqual(countryFitBounds(undefined, [[1, 2], [3, 5]]), [1, 2, 3, 5]);
});
t("fit padding suits each screen: never under 28px or over 110px, and a phone gets less than a wide screen but enough not to cut the outline", () => {
  const phone = fitPadding(390, 420), ipad = fitPadding(820, 520), pc = fitPadding(740, 600), huge = fitPadding(3000, 2000), tiny = fitPadding(200, 150);
  assert.ok(phone.top >= 28 && phone.top < pc.top && ipad.top <= pc.top + 20 && huge.top === 110 && tiny.top === 28); assert.deepEqual(Object.keys(phone).sort(), ["bottom", "left", "right", "top"]);
});
t("selection state: the selected city's country wins, then the selected country, then none (this decides which pins and outline are emphasised)", () => {
  assert.equal(activeCountry(cities, null, "manchester"), "GBR"); assert.equal(activeCountry(cities, "CAN", "manchester"), "GBR"); assert.equal(activeCountry(cities, "CAN", null), "CAN"); assert.equal(activeCountry(cities, null, null), ""); assert.equal(activeCountry(cities, "AUS", "nope"), "AUS");
});
t("names: country and city names come from one place (the data's translations) and read カナダ / イギリス / オーストラリア and Canada / United Kingdom / Australia", () => {
  const want = { CAN: ["カナダ", "Canada"], GBR: ["イギリス", "United Kingdom"], AUS: ["オーストラリア", "Australia"] } as const;
  for (const [code, [j, e]] of Object.entries(want)) { assert.equal(countryName(code, ja), j); assert.equal(countryName(code, en), e); }
  for (const c of cities) { assert.ok(cityName(c, ja) && cityName(c, en) && cityName(c, ja) !== cityName(c, en), c.id); }
  const src = ["components/InteractiveMap.tsx", "components/StaticWorldMap.tsx", "components/CityCard.tsx", "components/SearchBox.tsx", "app/page.tsx"].map((f) => readFileSync(f, "utf8")).join("\n");
  assert.ok(!/["'`](カナダ|イギリス|英国|オーストラリア|Canada|United Kingdom|Australia)["'`]/.test(src), "no country name is hard-coded in a component");
  assert.ok(!/“UK”/.test(readFileSync("locales/en.ts", "utf8")), "the English search hint says United Kingdom, not UK");
});
t("language: place labels on the tile map follow the page language where the tiles carry the name (ja → name:ja, en → name:en), always falling back to a name, never empty", () => {
  const j = JSON.stringify(labelExpression("ja")), e = JSON.stringify(labelExpression("en"));
  assert.ok(j.includes("name:ja") && j.endsWith('["get","name"]]') && e.includes("name:en") && e.endsWith('["get","name"]]') && !e.includes("name:ja"));
  assert.ok(isLabelLayer({ id: "p", type: "symbol", source: "openmaptiles", "source-layer": "place", layout: { "text-field": "{name}" } })); assert.ok(!isLabelLayer({ id: "r", type: "line", source: "openmaptiles", "source-layer": "place" })); assert.ok(!isLabelLayer({ id: "s", type: "symbol", source: "other", "source-layer": "place", layout: { "text-field": "x" } }));
  const src = readFileSync("components/InteractiveMap.tsx", "utf8"); assert.ok(/\[lang\]/.test(src) && /applyLabels/.test(src) && /textContent = cityName/.test(src), "the language effect updates pins and tile labels");
});
t("map wiring: country buttons fit the country (fitBounds), a city flies close, the world view returns on 'all countries', and the page has a way back and works without the map", () => {
  const m = readFileSync("components/InteractiveMap.tsx", "utf8"), p = readFileSync("app/page.tsx", "utf8");
  assert.ok(/fitBounds\(\[\[b\[0\], b\[1\]\], \[b\[2\], b\[3\]\]\]/.test(m) && /maxZoom: 6\.5/.test(m) && /flyTo\(\{ center: city\.coords, zoom: CITY_ZOOM/.test(m) && /fitBounds\(WORLD_BOUNDS/.test(m));
  assert.ok(/back-countries/.test(p) && /country-heading/.test(p) && /city-list/.test(p) && /pickCountry\(null\)/.test(p));
  assert.ok(/tiles\.openfreemap\.org\/styles\/liberty/.test(m) && !/demotiles/.test(m) && /cooperativeGestures/.test(m), "OpenFreeMap style, no demo tiles, the page can still scroll on touch screens");
});
console.log(n, "map ux tests passed");
