import "./_react";
// Tests for Ver.1.6.4 (Toronto climate official release): the approval record is real, the page shows the approved numbers, and nothing else changed.
import assert from "node:assert/strict";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement as h } from "react";
import { I18nProvider } from "@/lib/i18n";
import { countries, getCity } from "@/data/cities";
import { officialData } from "@/data/official";
import CityOverview from "@/components/overview/CityOverview";
import QuickCompare from "@/components/overview/QuickCompare";
import ClimateCharts from "@/components/official/ClimateCharts";
import { CLIMATE_APPROVALS, approveClimate } from "../data/approvals";
import { TORONTO_CLIMATE_CANDIDATE, approvedClimate } from "../data/official/cityClimates";
import { torontoData } from "../data/official/toronto";
import { climateCompare } from "../data/official/compare";
import { RIGHTS } from "../data/official/rights.data";
import { readFileSync } from "node:fs";
import { RENT_APPROVALS } from "../data/official/cityRents";

let n = 0; const t = (name: string, fn: () => void) => { fn(); n++; console.log("ok", name); };
const text = (s: string) => s.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
const wrap = (el: ReturnType<typeof h>) => renderToStaticMarkup(h(I18nProvider, null, el));
const page = (id: string) => wrap(h(CityOverview, { city: getCity(id)!, country: countries.find((x) => x.code === getCity(id)!.country)!, data: officialData(id) }));
const ID = "tor-climate-eccc-1991-2020";

t("approval record: StarHunting1, 2026-10-19, run 39308503517, exactly the 48 values, 4 annual values, station, period, quality codes and source", () => {
  const r = CLIMATE_APPROVALS[ID]; assert.equal(r.approval.by, "StarHunting1"); assert.equal(r.approval.at, "2026-10-19"); assert.match(r.approval.compared, /39308503517/); assert.match(r.approval.compared, /v2\.1\.1/);
  assert.deepEqual(Object.keys(CLIMATE_APPROVALS), ["van-climate-eccc-1991-2020", ID]);
  assert.equal(r.station, "TORONTO (CITY) – composite of 6158350 and 6158355"); assert.equal(r.stationId, "6158350+6158355"); assert.equal(r.period, "1991–2020");
  assert.equal(r.meanC.length + r.maxC.length + r.minC.length + r.precipMm.length, 48);
  assert.deepEqual([r.annualMeanC, r.annualMaxC, r.annualMinC, r.annualPrecipMm], [9.7, 13.4, 6.0, 822.7]); assert.equal(r.quality, "A (temperature) · C (precipitation)");
  assert.deepEqual(r.sources, ["https://climate.weather.gc.ca/climate_normals/index_e.html"]);
  const v = approvedClimate(TORONTO_CLIMATE_CANDIDATE)!; assert.equal(v.status, "verified"); assert.equal(v.approval!.by, "StarHunting1");
});

t("tamper detection after approval: any changed value, annual value, station, period, quality code or source throws", () => {
  const c = TORONTO_CLIMATE_CANDIDATE; const bad = (f: (x: typeof c) => void) => { const x = structuredClone(c); f(x); assert.throws(() => approveClimate(x), /changed after its approval/); };
  bad((x) => { x.months[0].meanC = -3.4; }); bad((x) => { x.months[6].maxC = 27.1; }); bad((x) => { x.months[11].minC = -2.6; }); bad((x) => { x.months[4].precipMm = 76.5; });
  bad((x) => { x.annual!.precipMm = 822.8; }); bad((x) => { x.annual!.meanC = 9.8; }); bad((x) => { x.annual!.maxC = 13.5; }); bad((x) => { x.annual!.minC = 6.1; });
  bad((x) => { x.station = "TORONTO INTL A"; }); bad((x) => { x.stationId = "6158731"; }); bad((x) => { x.period = "1981–2010"; }); bad((x) => { x.stationInfo!.quality = "A"; }); bad((x) => { x.evidence[0].url = "https://example.com/"; });
  assert.doesNotThrow(() => approveClimate(structuredClone(c)));
});

t("the Toronto data now carries the verified climate and the awaiting-approval notice is gone; the published annual precipitation is 822.7 (not the monthly sum)", () => {
  const d = officialData("toronto")!; assert.equal(d.climate!.status, "verified"); assert.ok(!d.notices!.some((x) => x.topic === "climate")); assert.equal(d.climate!.annual!.precipMm, 822.7);
  assert.equal(Math.round(d.climate!.months.reduce((s, m) => s + m.precipMm!, 0) * 10) / 10, 822.8, "the monthly sum differs by 0.1; ECCC's published value is used"); assert.equal(torontoData().climate!.annual!.precipMm, 822.7);
});

t("city page: first screen shows the approved range and not the 'being checked' state; the opened detail (chart component) shows annual values, station and site; no airport confusion, no claim of 2026 measurements (attribution, quality codes and licence are checked in the browser: the detail is closed in static rendering)", () => {
  const html = page("toronto"); const tx = text(html); assert.ok(tx.includes("-3.5 – 22.5 °C")); assert.ok(!tx.includes("公式の1991–2020平年値は取得済み・確認中")); assert.ok(!/2026年(の)?(観測|実測)/.test(tx));
  const c = officialData("toronto")!.climate!; const ja = wrap(h(ClimateCharts, { c })); const j = text(ja);
  assert.match(ja, /data-testid="climate-annual"/); assert.ok(j.includes("822.7 mm")); assert.ok(!j.includes("822.8")); assert.match(ja, /data-testid="climate-annual-temp"/); for (const v of ["9.7 °C", "13.4 °C", "6.0 °C"]) assert.ok(j.includes(v), v);
  assert.ok(j.includes("1991–2020")); assert.ok(j.includes("TORONTO (CITY)")); assert.ok(j.includes("6158350+6158355")); assert.match(ja, /data-testid="climate-site"/); assert.ok(j.includes("空港ではありません"));
  const src = readFileSync("components/overview/CityOverview.tsx", "utf8"); assert.ok(src.includes('data-testid="climate-quality"') && src.includes('data-testid="climate-attribution"'));
  assert.equal(c.stationInfo!.quality, "A (temperature) · C (precipitation)"); assert.equal(c.checkedAt, "2026-10-19"); assert.match(c.note!.ja, /2026年の観測値ではありません/);
});

t("comparison: Toronto (city station) vs Vancouver (airport) is 'reference only' despite the same period; Toronto has a compare record", () => {
  const c = climateCompare("toronto")!; assert.equal(c.site, "city"); assert.equal(c.period, "1991–2020"); assert.equal(climateCompare("vancouver")!.site, "airport");
  const html = wrap(h(QuickCompare, { ids: ["toronto", "vancouver"] })); const tx = text(html);
  assert.ok(tx.includes("参考値のみ")); assert.ok(!tx.includes("気候の数値は未取得"));
});

t("unapproved cities stay without climate numbers; protected data unchanged", () => {
  for (const id of ["sydney", "melbourne", "london"]) assert.equal(officialData(id)!.climate, undefined, id);
  assert.equal(RENT_APPROVALS["tor-cmhc-rent-1br"].digest, "abbbf002fa77176f0b4b2c9fc214de335c9faefd166c739b4fbf153f180185c1"); assert.equal(RENT_APPROVALS["tor-cmhc-rent-bachelor"].digest, "4a79633baf6e7b89bdd7e14393229e1674567a418856ca355e824e5739eab8cf");
  assert.equal(RENT_APPROVALS["syd-abs-census-median-weekly-rent"].digest, "506c97aa71ea3e2cdbea993353f47c6f3f099459bfdec41c6241aa2cac1c73f2"); assert.equal(RENT_APPROVALS["mel-abs-census-median-weekly-rent"].digest, "ed4c547df54b47f95701207d8f22bd2a1c01b3e89f96d022713ef353b87a7a91");
  const v = CLIMATE_APPROVALS["van-climate-eccc-1991-2020"]; assert.equal(v.approval.at, "2026-10-17"); assert.equal(v.annualPrecipMm, 1159.5); assert.equal(v.quality, undefined); assert.equal(officialData("vancouver")!.climate!.stationInfo, undefined);
  assert.equal(RIGHTS["eccc-climate-normals"].reuseStatus, "permitted");
});

console.log(n, "Ver.1.6.4 Toronto climate release tests passed");
